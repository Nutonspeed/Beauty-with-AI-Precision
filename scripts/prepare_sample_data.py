import numpy as np
from pathlib import Path

import cv2
from PIL import Image
from tqdm import tqdm


def create_sample_data() -> bool:
    print("🛠️ Preparing synthetic sample data for training...")

    base_dir = Path("data")
    processed_dir = base_dir / "processed"

    # create train/val folders that match SkinDataset(root, split)
    for split in ["train", "val"]:
        (processed_dir / split / "images").mkdir(parents=True, exist_ok=True)
        (processed_dir / split / "masks").mkdir(parents=True, exist_ok=True)

    img_size = (256, 256)
    num_train = 32
    num_val = 8

    def _make_sample(idx: int, split: str):
        # random skin-like background
        skin_color = np.random.randint(170, 230, size=(*img_size, 3), dtype=np.uint8)

        has_lesion = (idx % 2 == 0)
        mask = np.zeros(img_size, dtype=np.uint8)

        if has_lesion:
            center = np.random.randint(40, img_size[0] - 40, size=2)
            radius = np.random.randint(10, 40)
            cv2.circle(skin_color, tuple(center), radius, (40, 40, 40), -1)
            cv2.circle(mask, tuple(center), radius, 255, -1)

        img = Image.fromarray(skin_color)
        mask_img = Image.fromarray(mask)

        img.save(processed_dir / split / "images" / f"sample_{idx:03d}.jpg")
        mask_img.save(processed_dir / split / "masks" / f"sample_{idx:03d}_mask.png")

    print("Creating train samples...")
    for i in tqdm(range(num_train)):
        _make_sample(i, "train")

    print("Creating val samples...")
    for i in tqdm(range(num_val)):
        _make_sample(i, "val")

    print("✅ Synthetic dataset created at:", processed_dir.resolve())
    print("   - train/images, train/masks")
    print("   - val/images, val/masks")
    return True


if __name__ == "__main__":
    ok = create_sample_data()
    if not ok:
        raise SystemExit(1)
