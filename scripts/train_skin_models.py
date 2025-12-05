import argparse
from pathlib import Path
import sys

import torch
import torch.nn as nn
import torch.nn.functional as F
from torch.utils.data import DataLoader
from tqdm import tqdm

# Ensure project root is on sys.path so we can import data_loader
PROJECT_ROOT = Path(__file__).resolve().parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from data_loader import SkinDataset


class SimpleUNet(nn.Module):
    def __init__(self, in_channels=3, base_filters=32):
        super().__init__()
        self.encoder1 = self._block(in_channels, base_filters)
        self.encoder2 = self._block(base_filters, base_filters * 2)
        self.encoder3 = self._block(base_filters * 2, base_filters * 4)
        self.decoder1 = self._block(base_filters * 4, base_filters * 2)
        self.decoder2 = self._block(base_filters * 2, base_filters)
        self.conv_last = nn.Conv2d(base_filters, 1, kernel_size=1)
        self.pool = nn.MaxPool2d(2)
        self.up = nn.ConvTranspose2d(base_filters * 4, base_filters * 4, kernel_size=2, stride=2)

    def _block(self, in_channels, out_channels):
        return nn.Sequential(
            nn.Conv2d(in_channels, out_channels, kernel_size=3, padding=1),
            nn.BatchNorm2d(out_channels),
            nn.ReLU(inplace=True),
            nn.Conv2d(out_channels, out_channels, kernel_size=3, padding=1),
            nn.BatchNorm2d(out_channels),
            nn.ReLU(inplace=True),
        )

    def forward(self, x):
        # Simple encoder-decoder without skip connections to avoid
        # channel-size mismatches for now
        e1 = self.encoder1(x)
        e2 = self.encoder2(self.pool(e1))
        e3 = self.encoder3(self.pool(e2))

        d1 = self.up(e3)
        d1 = self.decoder1(d1)
        d2 = self.decoder2(d1)
        return torch.sigmoid(self.conv_last(d2))


def train(model, loader, optimizer, criterion, device):
    model.train()
    total = 0
    for batch in tqdm(loader, desc="train"):
        imgs = batch["image"].to(device)
        masks = batch["mask"].to(device)
        optimizer.zero_grad()
        preds = model(imgs)
        # resize preds to match masks spatial size
        if preds.shape[-2:] != masks.shape[-2:]:
            preds = F.interpolate(preds, size=masks.shape[-2:], mode="bilinear", align_corners=False)
        loss = criterion(preds, masks)
        loss.backward()
        optimizer.step()
        total += loss.item()
    return total / len(loader)


def evaluate(model, loader, criterion, device):
    model.eval()
    total = 0
    with torch.no_grad():
        for batch in tqdm(loader, desc="eval"):
            imgs = batch["image"].to(device)
            masks = batch["mask"].to(device)
            preds = model(imgs)
            if preds.shape[-2:] != masks.shape[-2:]:
                preds = F.interpolate(preds, size=masks.shape[-2:], mode="bilinear", align_corners=False)
            loss = criterion(preds, masks)
            total += loss.item()
    return total / len(loader)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--data", type=Path, default=Path("data/processed"))
    parser.add_argument("--epochs", type=int, default=20)
    parser.add_argument("--batch", type=int, default=8)
    parser.add_argument("--out", type=Path, default=Path("ml_models/weights"))
    args = parser.parse_args()

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    model = SimpleUNet().to(device)
    criterion = nn.BCELoss()
    optimizer = torch.optim.AdamW(model.parameters(), lr=1e-4)

    # Use 128x128 so that targets match model output spatial size
    train_dataset = SkinDataset(args.data, "train", image_size=128)
    val_dataset = SkinDataset(args.data, "val", image_size=128)

    train_loader = DataLoader(train_dataset, batch_size=args.batch, shuffle=True, num_workers=4)
    val_loader = DataLoader(val_dataset, batch_size=args.batch, shuffle=False, num_workers=2)

    args.out.mkdir(parents=True, exist_ok=True)
    best_loss = float("inf")

    for epoch in range(1, args.epochs + 1):
        train_loss = train(model, train_loader, optimizer, criterion, device)
        val_loss = evaluate(model, val_loader, criterion, device)
        print(f"Epoch {epoch}/{args.epochs} - train: {train_loss:.4f} | val: {val_loss:.4f}")
        if val_loss < best_loss:
            best_loss = val_loss
            torch.save(model.state_dict(), args.out / "skin_concern.pth")


if __name__ == "__main__":
    main()
