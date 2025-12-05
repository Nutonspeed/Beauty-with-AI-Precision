import argparse
import logging
from pathlib import Path

import albumentations as A
import cv2
from tqdm import tqdm

LOGGER = logging.getLogger(__name__)


def build_transforms(is_training: bool):
    base = [
        A.Normalize(mean=(0.485, 0.456, 0.406), std=(0.229, 0.224, 0.225)),
    ]

    if is_training:
        augmentation = [
            A.HorizontalFlip(p=0.5),
            A.Rotate(limit=30, p=0.5),
            A.RandomBrightnessContrast(p=0.2),
            A.GaussianBlur(blur_limit=3, p=0.1),
            A.CoarseDropout(max_holes=8, max_height=32, max_width=32, p=0.2),
        ]
        base = augmentation + base

    base.append(A.pytorch.ToTensorV2())
    return A.Compose(base)


def write_image(target_path: Path, image):
    target_path.parent.mkdir(parents=True, exist_ok=True)
    cv2.imwrite(str(target_path), image)


def process_split(image_paths, mask_paths, output_dir, is_training):
    transforms = build_transforms(is_training)

    for image_path, mask_path in tqdm(
        zip(image_paths, mask_paths), total=len(image_paths), desc=f"Processing {output_dir.name}"
    ):
        image = cv2.cvtColor(cv2.imread(str(image_path)), cv2.COLOR_BGR2RGB)
        mask = cv2.cvtColor(cv2.imread(str(mask_path)), cv2.COLOR_BGR2GRAY)
        augmentation = transforms(image=image, mask=mask)
        image_tensor = augmentation["image"].permute(1, 2, 0).numpy()
        mask_tensor = augmentation["mask"]

        image_target = output_dir / "images" / image_path.name
        mask_target = output_dir / "masks" / f"{image_path.stem}_mask.png"

        write_image(image_target, (image_tensor * 255).astype("uint8"))
        write_image(mask_target, (mask_tensor.numpy() * 255).astype("uint8"))


def split_dataset(input_dir: Path, output_dir: Path, ratios):
    images = sorted((input_dir / "images").glob("*.jpg"))
    masks = [input_dir / "masks" / f"{img.stem}_mask.png" for img in images]
    valid_pairs = [(img, msk) for img, msk in zip(images, masks) if msk.exists()]

    if not valid_pairs:
        raise FileNotFoundError("No image/mask pairs found in input directory")

    total = len(valid_pairs)
    train_end = int(ratios[0] * total)
    val_end = train_end + int(ratios[1] * total)

    splits = {
        "train": valid_pairs[:train_end],
        "val": valid_pairs[train_end:val_end],
        "test": valid_pairs[val_end:],
    }

    for split_name, pairs in splits.items():
        split_dir = output_dir / split_name
        split_dir.mkdir(parents=True, exist_ok=True)
        image_paths, mask_paths = zip(*pairs) if pairs else ([], [])
        process_split(image_paths, mask_paths, split_dir, split_name == "train")


def main():
    parser = argparse.ArgumentParser(description="Prepare skin dataset for training")
    parser.add_argument("--input", type=Path, default=Path("data/raw"), help="raw dataset root")
    parser.add_argument("--output", type=Path, default=Path("data/processed"), help="destination root")
    parser.add_argument("--train-ratio", type=float, default=0.7)
    parser.add_argument("--val-ratio", type=float, default=0.15)
    args = parser.parse_args()

    ratios = (args.train_ratio, args.val_ratio, 1 - args.train_ratio - args.val_ratio)
    split_dataset(args.input, args.output, ratios)


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    main()
