"""
Test script for Beauty AI Analysis Service
Run this after starting the server: python main.py
"""

import requests
import json
from pathlib import Path

BASE_URL = "http://localhost:8000"

def test_health():
    """Test health endpoint"""
    print("\n🔍 Testing Health Endpoint...")
    response = requests.get(f"{BASE_URL}/health")
    print(f"Status: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
    return response.status_code == 200

def test_spots_analysis(image_path: str):
    """Test spots detection"""
    print("\n🔍 Testing Spots Detection...")
    
    with open(image_path, 'rb') as f:
        files = {'file': f}
        response = requests.post(f"{BASE_URL}/api/analyze/spots", files=files)
    
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print(f"Processing Time: {data['processing_time_ms']}ms")
        print(f"Detections: {data['statistics']['total_count']}")
        print(f"Severity: {data['statistics']['severity']}")
        print(f"Average Confidence: {data['statistics']['average_confidence']:.2f}")
        if data['detections']:
            print(f"First Detection: {json.dumps(data['detections'][0], indent=2)}")
    else:
        print(f"Error: {response.text}")
    
    return response.status_code == 200

def test_wrinkles_analysis(image_path: str):
    """Test wrinkles detection"""
    print("\n🔍 Testing Wrinkles Detection...")
    
    with open(image_path, 'rb') as f:
        files = {'file': f}
        response = requests.post(f"{BASE_URL}/api/analyze/wrinkles", files=files)
    
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print(f"Processing Time: {data['processing_time_ms']}ms")
        print(f"Detections: {data['statistics']['total_count']}")
        print(f"Severity: {data['statistics']['severity']}")
    else:
        print(f"Error: {response.text}")
    
    return response.status_code == 200

def test_texture_analysis(image_path: str):
    """Test texture analysis"""
    print("\n🔍 Testing Texture Analysis...")
    
    with open(image_path, 'rb') as f:
        files = {'file': f}
        response = requests.post(f"{BASE_URL}/api/analyze/texture", files=files)
    
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print(f"Processing Time: {data['processing_time_ms']}ms")
        print(f"Smoothness Score: {data['metrics']['smoothness_score']:.2f}")
        print(f"Roughness Score: {data['metrics']['roughness_score']:.2f}")
        print(f"Overall Score: {data['metrics']['overall_score']:.2f}")
    else:
        print(f"Error: {response.text}")
    
    return response.status_code == 200

def test_pores_analysis(image_path: str):
    """Test pores detection"""
    print("\n🔍 Testing Pores Detection...")
    
    with open(image_path, 'rb') as f:
        files = {'file': f}
        response = requests.post(f"{BASE_URL}/api/analyze/pores", files=files)
    
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print(f"Processing Time: {data['processing_time_ms']}ms")
        print(f"Detections: {data['statistics']['total_count']}")
        print(f"Pore Density: {data['statistics']['average_confidence']:.2f}")
    else:
        print(f"Error: {response.text}")
    
    return response.status_code == 200

def test_multi_mode_analysis(image_path: str):
    """Test multi-mode analysis (all modes at once)"""
    print("\n🔍 Testing Multi-Mode Analysis...")
    
    with open(image_path, 'rb') as f:
        files = {'file': f}
        response = requests.post(f"{BASE_URL}/api/analyze/multi-mode", files=files)
    
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print(f"Processing Time: {data['processing_time_ms']}ms")
        print(f"Overall Score: {data['overall_score']:.2f}")
        print(f"\nSpots: {data['spots']['statistics']['total_count']} detections")
        print(f"Wrinkles: {data['wrinkles']['statistics']['total_count']} detections")
        print(f"Texture: {data['texture']['metrics']['overall_score']:.2f} score")
        print(f"Pores: {data['pores']['statistics']['total_count']} detections")
    else:
        print(f"Error: {response.text}")
    
    return response.status_code == 200

def main():
    """Run all tests"""
    print("=" * 60)
    print("🧪 Beauty AI Analysis Service - API Tests")
    print("=" * 60)
    
    # Test health first
    if not test_health():
        print("\n❌ Health check failed! Make sure server is running.")
        print("Start server with: python main.py")
        return
    
    print("\n✅ Server is healthy!")
    
    # Check for test image
    test_image = Path("test_image.jpg")
    if not test_image.exists():
        print(f"\n⚠️  Test image not found: {test_image}")
        print("Please provide a test image named 'test_image.jpg' in the ai-service folder")
        print("You can use any face/skin image for testing")
        return
    
    print(f"\n📷 Using test image: {test_image}")
    
    # Run all analysis tests
    results = []
    results.append(("Spots Detection", test_spots_analysis(str(test_image))))
    results.append(("Wrinkles Detection", test_wrinkles_analysis(str(test_image))))
    results.append(("Texture Analysis", test_texture_analysis(str(test_image))))
    results.append(("Pores Detection", test_pores_analysis(str(test_image))))
    results.append(("Multi-Mode Analysis", test_multi_mode_analysis(str(test_image))))
    
    # Summary
    print("\n" + "=" * 60)
    print("📊 Test Results Summary")
    print("=" * 60)
    for name, success in results:
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} - {name}")
    
    passed = sum(1 for _, success in results if success)
    total = len(results)
    print(f"\nTotal: {passed}/{total} tests passed")
    
    if passed == total:
        print("\n🎉 All tests passed!")
    else:
        print(f"\n⚠️  {total - passed} test(s) failed")

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n⏸️  Tests interrupted by user")
    except Exception as e:
        print(f"\n\n❌ Error running tests: {str(e)}")
