"""
Simple visualization test using urllib (built-in)
"""
import urllib.request
import urllib.parse
import os
import mimetypes

def test_visualization():
    """Test multi-mode visualization endpoint"""
    print("🧪 Testing Multi-Mode Visualization...")
    print()
    
    # Check if test image exists
    image_path = "test_images/face_sample.jpg"
    if not os.path.exists(image_path):
        print(f"❌ Image not found: {image_path}")
        return False
    
    # Prepare multipart form data
    boundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW'
    
    with open(image_path, 'rb') as f:
        image_data = f.read()
    
    # Build multipart body
    body = []
    body.append(f'--{boundary}'.encode())
    body.append(b'Content-Disposition: form-data; name="file"; filename="face_sample.jpg"')
    body.append(b'Content-Type: image/jpeg')
    body.append(b'')
    body.append(image_data)
    body.append(f'--{boundary}--'.encode())
    body.append(b'')
    
    body_bytes = b'\r\n'.join(body)
    
    # Prepare request
    url = "http://localhost:8000/api/visualize/multi-mode?show_legend=true&show_stats=true&show_numbers=true&include_heatmap=true"
    
    headers = {
        'Content-Type': f'multipart/form-data; boundary={boundary}',
        'Content-Length': str(len(body_bytes))
    }
    
    req = urllib.request.Request(url, data=body_bytes, headers=headers, method='POST')
    
    try:
        print("📤 Sending request to server...")
        with urllib.request.urlopen(req, timeout=30) as response:
            if response.status == 200:
                # Save result
                output_path = "test_visualization_multimode.png"
                with open(output_path, 'wb') as f:
                    result_data = response.read()
                    f.write(result_data)
                
                # Get headers
                processing_time = response.headers.get('X-Processing-Time', 'N/A')
                total_detections = response.headers.get('X-Total-Detections', 'N/A')
                
                print("✅ Multi-mode visualization SUCCESS")
                print(f"   Status: {response.status}")
                print(f"   Processing time: {processing_time}")
                print(f"   Total detections: {total_detections}")
                print(f"   Output saved: {output_path}")
                print(f"   File size: {len(result_data) / 1024:.1f} KB")
                print()
                print(f"👁️  View result: {os.path.abspath(output_path)}")
                return True
            else:
                print(f"❌ FAILED: Status {response.status}")
                return False
                
    except urllib.error.HTTPError as e:
        print(f"❌ HTTP Error {e.code}: {e.reason}")
        print(f"   Response: {e.read().decode()}")
        return False
    except urllib.error.URLError as e:
        print(f"❌ URL Error: {e.reason}")
        print("   Is the server running? Check http://localhost:8000/")
        return False
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    print("=" * 60)
    print("VISUALIZATION ENDPOINT TEST")
    print("=" * 60)
    print()
    
    # Test server connectivity first
    try:
        req = urllib.request.Request("http://localhost:8000/")
        with urllib.request.urlopen(req, timeout=5) as response:
            print(f"✅ Server is running: http://localhost:8000")
            print()
    except Exception as e:
        print(f"❌ Server is NOT running: {e}")
        print("   Please start the server first")
        exit(1)
    
    # Run test
    success = test_visualization()
    
    print()
    print("=" * 60)
    if success:
        print("✅ TEST PASSED - Visualization working!")
    else:
        print("❌ TEST FAILED - Check logs above")
    print("=" * 60)
