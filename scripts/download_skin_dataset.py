import os
import urllib.request
import zipfile
from pathlib import Path
import pandas as pd
from tqdm import tqdm

def download_file(url, destination):
    """Download a file with progress bar"""
    print(f"Downloading {url}...")
    os.makedirs(os.path.dirname(destination), exist_ok=True)
    
    class DownloadProgressBar(tqdm):
        def update_to(self, b=1, bsize=1, tsize=None):
            if tsize is not None:
                self.total = tsize
            self.update(b * bsize - self.n)
    
    with DownloadProgressBar(unit='B', unit_scale=True, miniters=1, desc=url.split('/')[-1]) as t:
        urllib.request.urlretrieve(url, filename=destination, reporthook=t.update_to)

def main():
    # Base directories
    base_dir = Path(__file__).parent.parent
    data_dir = base_dir / "data"
    raw_dir = data_dir / "raw"
    processed_dir = data_dir / "processed"
    
    # Create necessary directories
    raw_dir.mkdir(parents=True, exist_ok=True)
    processed_dir.mkdir(parents=True, exist_ok=True)
    
    # HAM10000 dataset URLs
    dataset_urls = [
        "https://dataverse.harvard.edu/api/access/datafile/4313341",  # HAM10000 images part 1
        "https://dataverse.harvard.edu/api/access/datafile/4313342",  # HAM10000 images part 2
        "https://dataverse.harvard.edu/api/access/datafile/4313343",  # HAM10000 metadata
    ]
    
    # Download files
    zip_files = []
    for url in dataset_urls:
        filename = url.split("/")[-1] + ".zip" if "431334" in url else url.split("/")[-1]
        dest = raw_dir / filename
        if not dest.exists():
            download_file(url, dest)
        if dest.suffix == '.zip':
            zip_files.append(dest)
    
    # Extract zip files
    for zip_file in zip_files:
        print(f"Extracting {zip_file}...")
        with zipfile.ZipFile(zip_file, 'r') as zip_ref:
            zip_ref.extractall(raw_dir / "ham10000")
    
    print("Dataset downloaded and extracted successfully!")
    print(f"Raw data location: {raw_dir / 'ham10000'}")
    
    # Prepare the dataset structure for training
    prepare_dataset(raw_dir / "ham10000", processed_dir)

def prepare_dataset(source_dir, target_dir):
    """Prepare the dataset for training"""
    print("Preparing dataset for training...")
    
    # Create train/val/test directories
    splits = ['train', 'val', 'test']
    for split in splits:
        for folder in ['images', 'masks']:
            (target_dir / split / folder).mkdir(parents=True, exist_ok=True)
    
    # TODO: Add dataset splitting and preprocessing logic here
    # This is a placeholder - you'll need to implement the actual splitting
    # based on your requirements (e.g., 70% train, 15% val, 15% test)
    
    print(f"Dataset prepared at: {target_dir}")

if __name__ == "__main__":
    main()
