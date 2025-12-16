"""
Test script for visualization endpoints
"""
import requests
import os
import time

API_URL = "http://localhost:8000"

def test_multi_mode_visualization():
    """Test multi-mode visualization with all features"""
    print("🧪 Testing Multi-Mode Visualization...")
    
    # Read test image
    image_path = "test_images/face_sample.jpg"
    if not os.path.exists(image_path):
        print(f"❌ Image not found: {image_path}")
        return False
    
    with open(image_path, "rb") as f:
        files = {"file": ("face_sample.jpg", f, "image/jpeg")}
        params = {
            "show_legend": "true",
            "show_stats": "true", 
            "show_numbers": "true",
            "include_heatmap": "true"
        }
        
        start_time = time.time()
        response = requests.post(
            f"{API_URL}/api/visualize/multi-mode",
            files=files,
            params=params
        )
        elapsed = time.time() - start_time
    
    if response.status_code == 200:
        # Save result
        output_path = "test_visualization_multimode.png"
        with open(output_path, "wb") as f:
            f.write(response.content)
        
        print(f"✅ Multi-mode visualization SUCCESS")
        print(f"   Processing time: {elapsed:.2f}s")
        print(f"   Server time: {response.headers.get('X-Processing-Time', 'N/A')}")
        print(f"   Total detections: {response.headers.get('X-Total-Detections', 'N/A')}")
        print(f"   Output saved: {output_path}")
        print(f"   File size: {len(response.content) / 1024:.1f} KB")
        return True
    else:
        print(f"❌ FAILED: {response.status_code}")
        print(f"   Response: {response.text}")
        return False

def test_single_mode_visualization(mode: str):
    """Test single mode visualization"""
    print(f"\n🧪 Testing Single-Mode Visualization: {mode}")
    
    image_path = "test_images/face_sample.jpg"
    with open(image_path, "rb") as f:
        files = {"file": ("face_sample.jpg", f, "image/jpeg")}
        params = {
            "show_numbers": "true",
            "show_confidence": "true"
        }
        
        start_time = time.time()
        response = requests.post(
            f"{API_URL}/api/visualize/single-mode/{mode}",
            files=files,
            params=params
        )
        elapsed = time.time() - start_time
    
    if response.status_code == 200:
        # Save result
        output_path = f"test_visualization_{mode}.png"
        with open(output_path, "wb") as f:
            f.write(response.content)
        
        print(f"✅ {mode} visualization SUCCESS")
        print(f"   Processing time: {elapsed:.2f}s")
        print(f"   Output saved: {output_path}")
        return True
    else:
        print(f"❌ FAILED: {response.status_code}")
        print(f"   Response: {response.text}")
        return False

if __name__ == "__main__":
    print("=" * 60)
    print("VISUALIZATION ENDPOINT TEST")
    print("=" * 60)
    
    # Check if server is running
    try:
        response = requests.get(f"{API_URL}/")
        print(f"✅ Server is running: {API_URL}")
    except requests.exceptions.ConnectionError:
        print(f"❌ Server is NOT running at {API_URL}")
        print("   Please start the server first:")
        print("   cd ai-service && python -m uvicorn main:app --host 0.0.0.0 --port 8000")
        exit(1)
    
    print()
    
    # Test multi-mode
    success_multi = test_multi_mode_visualization()
    
    # Test individual modes
    modes_to_test = ["spots", "wrinkles", "pores", "uv_spots", "brown_spots"]
    results = {}
    for mode in modes_to_test:
        results[mode] = test_single_mode_visualization(mode)
    
    # Summary
    print("\n" + "=" * 60)
    print("TEST SUMMARY")
    print("=" * 60)
    print(f"Multi-mode: {'✅ PASS' if success_multi else '❌ FAIL'}")
    for mode, success in results.items():
        print(f"{mode}: {'✅ PASS' if success else '❌ FAIL'}")
