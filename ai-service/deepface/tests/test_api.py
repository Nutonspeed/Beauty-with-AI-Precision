import pytest
import asyncio
import httpx
import base64
import io
from PIL import Image
import numpy as np
import cv2

BASE_URL = "http://localhost:8001"

def create_test_image():
    """Create a simple test image"""
    # Create a simple colored image
    img = Image.new('RGB', (200, 200), color='red')
    img_bytes = io.BytesIO()
    img.save(img_bytes, format='JPEG')
    img_bytes.seek(0)
    return img_bytes

@pytest.mark.asyncio
async def test_health_check():
    """Test health check endpoint"""
    async with httpx.AsyncClient() as client:
        response = await client.get(f"{BASE_URL}/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"

@pytest.mark.asyncio
async def test_analyze_face():
    """Test face analysis endpoint"""
    img_bytes = create_test_image()
    
    async with httpx.AsyncClient() as client:
        files = {'file': ('test.jpg', img_bytes, 'image/jpeg')}
        response = await client.post(f"{BASE_URL}/analyze", files=files)
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert "data" in data

@pytest.mark.asyncio
async def test_analyze_batch():
    """Test batch analysis endpoint"""
    img_bytes = create_test_image()
    
    async with httpx.AsyncClient() as client:
        files = [('files', ('test1.jpg', img_bytes, 'image/jpeg')),
                ('files', ('test2.jpg', img_bytes, 'image/jpeg'))]
        response = await client.post(f"{BASE_URL}/analyze-batch", files=files)
        assert response.status_code == 200
        data = response.json()
        assert "results" in data
        assert len(data["results"]) == 2

@pytest.mark.asyncio
async def test_compare_faces():
    """Test face comparison endpoint"""
    img_bytes = create_test_image()
    
    async with httpx.AsyncClient() as client:
        files = {'file1': ('test1.jpg', img_bytes, 'image/jpeg'),
                'file2': ('test2.jpg', img_bytes, 'image/jpeg')}
        response = await client.post(f"{BASE_URL}/compare-faces", files=files)
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True

@pytest.mark.asyncio
async def test_invalid_file():
    """Test invalid file handling"""
    async with httpx.AsyncClient() as client:
        files = {'file': ('test.txt', b'not an image', 'text/plain')}
        response = await client.post(f"{BASE_URL}/analyze", files=files)
        assert response.status_code == 400

if __name__ == "__main__":
    pytest.main([__file__, "-v"])
