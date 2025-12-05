import os
import urllib.request
import zipfile
from pathlib import Path

def download_file(url, destination):
    print(f"กำลังดาวน์โหลด {url}...")
    Path(destination).parent.mkdir(parents=True, exist_ok=True)
    urllib.request.urlretrieve(url, destination)
    print("ดาวน์โหลดเสร็จสิ้น!")

def extract_zip(zip_path, extract_to):
    print(f"กำลังแตกไฟล์ {zip_path}...")
    with zipfile.ZipFile(zip_path, 'r') as zip_ref:
        zip_ref.extractall(extract_to)
    print("แตกไฟล์เสร็จสิ้น!")

def main():
    # สร้างโฟลเดอร์เก็บข้อมูล
    data_dir = Path("data/raw/skin_lesions")
    data_dir.mkdir(parents=True, exist_ok=True)
    
    # ดาวน์โหลดข้อมูลตัวอย่าง (ขนาดเล็กกว่า)
    dataset_url = "https://github.com/udacity/dermatologist-ai/raw/master/data/skin-cancer-mnist-ham10000.zip"
    zip_path = data_dir / "skin_lesions.zip"
    
    print("เริ่มต้นการดาวน์โหลดข้อมูล...")
    try:
        if not zip_path.exists():
            download_file(dataset_url, zip_path)
            extract_zip(zip_path, data_dir)
        
        print("\n✅ ดาวน์โหลดข้อมูลสำเร็จ!")
        print(f"ที่อยู่ข้อมูล: {data_dir.absolute()}")
        print("\nคุณสามารถใช้ข้อมูลนี้สำหรับการฝึกโมเดลได้แล้ว")
        
    except Exception as e:
        print(f"\n❌ เกิดข้อผิดพลาด: {e}")
        print("\nกรุณาลองดาวน์โหลดด้วยตัวเองที่:")
        print("https://www.kaggle.com/datasets/kmader/skin-cancer-mnist-ham10000")
        print("จากนั้นนำมาไว้ในโฟลเดอร์ data/raw/ham10000")

if __name__ == "__main__":
    main()
