from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import cv2
import numpy as np
from deepface import DeepFace
import base64
import io
from PIL import Image
import logging
import time
import os
from typing import Dict, List, Optional
import asyncio
from concurrent.futures import ThreadPoolExecutor
import redis
import json

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="Beauty AI DeepFace Service",
    description="Advanced facial analysis service for Beauty with AI Precision",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Redis for caching
try:
    redis_client = redis.Redis(host='localhost', port=6379, db=0)
    redis_client.ping()
    logger.info("✅ Redis connected for caching")
except:
    redis_client = None
    logger.warning("⚠️ Redis not available, caching disabled")

# Thread pool for concurrent processing
executor = ThreadPoolExecutor(max_workers=4)

# Model configuration
MODEL_CONFIG = {
    'detector_backend': 'retinaface',
    'recognizer_model': 'VGG-Face',
    'similarity_metric': 'cosine'
}

# Analysis models
ANALYSIS_MODELS = {
    'age': 'Age',
    'gender': 'Gender',
    'race': 'Race',
    'emotion': 'Emotion'
}

class FaceAnalysisResult:
    def __init__(self):
        self.face_detected = False
        self.confidence = 0.0
        self.age = None
        self.gender = None
        self.race = None
        self.emotion = None
        self.face_coordinates = None
        self.skin_analysis = {}
        self.beauty_metrics = {}
        self.processing_time = 0.0

def decode_image(image_data: bytes) -> np.ndarray:
    """Decode image bytes to numpy array"""
    try:
        # Convert bytes to numpy array
        nparr = np.frombuffer(image_data, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        return img
    except Exception as e:
        logger.error(f"Image decode error: {e}")
        raise HTTPException(status_code=400, detail="Invalid image format")

def analyze_skin_quality(face_img: np.ndarray) -> Dict:
    """Analyze skin quality metrics"""
    try:
        # Convert to different color spaces for analysis
        gray = cv2.cvtColor(face_img, cv2.COLOR_BGR2GRAY)
        hsv = cv2.cvtColor(face_img, cv2.COLOR_BGR2HSV)
        
        # Skin texture analysis
        texture_score = np.std(gray)
        
        # Skin tone analysis (HSV)
        mean_hsv = np.mean(hsv, axis=(0, 1))
        
        # Skin smoothness (edge detection)
        edges = cv2.Canny(gray, 50, 150)
        smoothness = 1.0 - (np.sum(edges > 0) / edges.size)
        
        # Skin brightness
        brightness = np.mean(gray) / 255.0
        
        return {
            'texture_score': float(texture_score),
            'skin_tone': {
                'hue': float(mean_hsv[0]),
                'saturation': float(mean_hsv[1]),
                'value': float(mean_hsv[2])
            },
            'smoothness': float(smoothness),
            'brightness': float(brightness)
        }
    except Exception as e:
        logger.error(f"Skin analysis error: {e}")
        return {}

def calculate_beauty_metrics(analysis_result: Dict) -> Dict:
    """Calculate beauty metrics based on facial analysis"""
    try:
        metrics = {}
        
        # Age-based beauty score
        if analysis_result.get('age'):
            age = analysis_result['age']
            if 20 <= age <= 30:
                metrics['age_score'] = 0.9
            elif 31 <= age <= 40:
                metrics['age_score'] = 0.8
            elif 41 <= age <= 50:
                metrics['age_score'] = 0.7
            else:
                metrics['age_score'] = 0.6
        
        # Symmetry estimation (based on face detection confidence)
        if analysis_result.get('confidence'):
            metrics['symmetry_score'] = min(analysis_result['confidence'], 0.95)
        
        # Skin quality score
        skin_analysis = analysis_result.get('skin_analysis', {})
        if skin_analysis.get('smoothness'):
            metrics['skin_quality'] = skin_analysis['smoothness']
        
        # Overall beauty score
        if metrics:
            metrics['overall_score'] = np.mean(list(metrics.values()))
        
        return metrics
    except Exception as e:
        logger.error(f"Beauty metrics calculation error: {e}")
        return {}

async def analyze_face_image(image: np.ndarray, cache_key: str = None) -> FaceAnalysisResult:
    """Analyze face using DeepFace with caching"""
    result = FaceAnalysisResult()
    start_time = time.time()
    
    # Check cache first
    if redis_client and cache_key:
        cached_result = redis_client.get(cache_key)
        if cached_result:
            logger.info("📋 Retrieved from cache")
            cached_data = json.loads(cached_result)
            result.__dict__.update(cached_data)
            return result
    
    try:
        # Detect faces
        faces = DeepFace.extract_faces(
            image,
            detector_backend=MODEL_CONFIG['detector_backend'],
            enforce_detection=False
        )
        
        if not faces:
            logger.warning("No face detected")
            return result
        
        # Get the first face
        face_obj = faces[0]
        face_img = face_obj['face']
        result.face_detected = True
        result.confidence = face_obj.get('confidence', 0.0)
        result.face_coordinates = face_obj.get('facial_area', {})
        
        # Analyze face attributes
        analysis = DeepFace.analyze(
            face_img,
            actions=list(ANALYSIS_MODELS.keys()),
            detector_backend='skip',
            enforce_detection=False
        )
        
        if isinstance(analysis, list) and analysis:
            analysis = analysis[0]
        
        # Extract results
        for key, model_name in ANALYSIS_MODELS.items():
            if key in analysis:
                if key == 'emotion':
                    # Get dominant emotion
                    emotion_dict = analysis[key]
                    result.emotion = max(emotion_dict.items(), key=lambda x: x[1])[0]
                else:
                    setattr(result, key, analysis[key])
        
        # Additional skin analysis
        result.skin_analysis = analyze_skin_quality(face_img)
        
        # Calculate beauty metrics
        result.beauty_metrics = calculate_beauty_metrics(result.__dict__)
        
        # Cache result
        if redis_client and cache_key:
            redis_client.setex(
                cache_key, 
                3600,  # 1 hour cache
                json.dumps(result.__dict__, default=str)
            )
        
    except Exception as e:
        logger.error(f"Face analysis error: {e}")
        result.face_detected = False
    
    result.processing_time = time.time() - start_time
    return result

@app.get("/")
async def root():
    return {"message": "Beauty AI DeepFace Service", "status": "running"}

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "models_loaded": True,
        "redis_connected": redis_client is not None
    }

@app.post("/analyze")
async def analyze_face(file: UploadFile = File(...)):
    """Analyze uploaded face image"""
    
    if not file.content_type.startswith('image/'):
        raise HTTPException(status_code=400, detail="File must be an image")
    
    try:
        # Read image
        image_data = await file.read()
        image = decode_image(image_data)
        
        # Generate cache key
        cache_key = f"face_analysis_{hash(image_data.tobytes())}"
        
        # Analyze face
        result = await analyze_face_image(image, cache_key)
        
        return {
            "success": True,
            "data": {
                "face_detected": result.face_detected,
                "confidence": result.confidence,
                "age": result.age,
                "gender": result.gender,
                "race": result.race,
                "emotion": result.emotion,
                "face_coordinates": result.face_coordinates,
                "skin_analysis": result.skin_analysis,
                "beauty_metrics": result.beauty_metrics,
                "processing_time": result.processing_time
            }
        }
        
    except Exception as e:
        logger.error(f"Analysis endpoint error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/analyze-batch")
async def analyze_batch(files: List[UploadFile] = File(...)):
    """Analyze multiple face images"""
    
    if len(files) > 10:
        raise HTTPException(status_code=400, detail="Maximum 10 files allowed")
    
    results = []
    
    async def process_single_file(file):
        try:
            image_data = await file.read()
            image = decode_image(image_data)
            cache_key = f"face_analysis_{hash(image_data.tobytes())}"
            result = await analyze_face_image(image, cache_key)
            
            return {
                "filename": file.filename,
                "success": True,
                "data": result.__dict__
            }
        except Exception as e:
            return {
                "filename": file.filename,
                "success": False,
                "error": str(e)
            }
    
    # Process files concurrently
    tasks = [process_single_file(file) for file in files]
    results = await asyncio.gather(*tasks)
    
    return {"results": results}

@app.post("/compare-faces")
async def compare_faces(file1: UploadFile = File(...), file2: UploadFile = File(...)):
    """Compare two face images for similarity"""
    
    try:
        # Read images
        img1_data = await file1.read()
        img2_data = await file2.read()
        
        img1 = decode_image(img1_data)
        img2 = decode_image(img2_data)
        
        # Compare faces
        result = DeepFace.verify(
            img1_path=img1,
            img2_path=img2,
            detector_backend=MODEL_CONFIG['detector_backend'],
            recognizer_model=MODEL_CONFIG['recognizer_model'],
            similarity_metric=MODEL_CONFIG['similarity_metric']
        )
        
        return {
            "success": True,
            "data": {
                "verified": result['verified'],
                "distance": result['distance'],
                "threshold": result['threshold'],
                "model": MODEL_CONFIG['recognizer_model'],
                "similarity_metric": MODEL_CONFIG['similarity_metric']
            }
        }
        
    except Exception as e:
        logger.error(f"Face comparison error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
