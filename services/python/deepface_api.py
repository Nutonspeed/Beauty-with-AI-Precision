"""
DeepFace API Service
====================

FastAPI service for face analysis using DeepFace library.
Provides age, gender, emotion, and race detection.

Install requirements:
    pip install fastapi uvicorn deepface python-multipart pillow

Run server:
    uvicorn deepface_api:app --host 0.0.0.0 --port 5000 --reload

Docker:
    docker build -t deepface-api -f docker/deepface.Dockerfile .
    docker run -p 5000:5000 deepface-api
"""

import os
import io
import base64
import logging
from typing import List, Optional
from contextlib import asynccontextmanager

from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import numpy as np
from PIL import Image

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# DeepFace import with lazy loading
deepface_loaded = False
DeepFace = None

def load_deepface():
    """Lazy load DeepFace to speed up startup"""
    global deepface_loaded, DeepFace
    if not deepface_loaded:
        logger.info("Loading DeepFace library...")
        from deepface import DeepFace as DF
        DeepFace = DF
        deepface_loaded = True
        logger.info("DeepFace loaded successfully")
    return DeepFace


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown events"""
    # Startup: preload models
    logger.info("Starting DeepFace API service...")
    try:
        df = load_deepface()
        # Warm up models by analyzing a dummy image
        dummy_img = np.zeros((224, 224, 3), dtype=np.uint8)
        dummy_img[:] = [128, 128, 128]  # Gray image
        try:
            df.analyze(dummy_img, actions=['age'], enforce_detection=False, silent=True)
            logger.info("Models preloaded successfully")
        except Exception as e:
            logger.warning(f"Model preload warning: {e}")
    except Exception as e:
        logger.error(f"Failed to load DeepFace: {e}")
    
    yield
    
    # Shutdown
    logger.info("Shutting down DeepFace API service...")


app = FastAPI(
    title="DeepFace API",
    description="Face analysis API for age, gender, emotion, and race detection",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class AnalysisRequest(BaseModel):
    """Request model for URL-based analysis"""
    image_url: Optional[str] = None
    image_base64: Optional[str] = None
    actions: List[str] = ["age", "gender", "emotion"]


class AnalysisResponse(BaseModel):
    """Response model for analysis results"""
    success: bool
    data: Optional[dict] = None
    error: Optional[str] = None


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "deepface-api",
        "deepface_loaded": deepface_loaded
    }


@app.get("/models")
async def list_models():
    """List available face recognition models"""
    return {
        "face_recognition": [
            "VGG-Face",
            "Facenet",
            "Facenet512",
            "OpenFace",
            "DeepFace",
            "DeepID",
            "ArcFace",
            "Dlib",
            "SFace",
            "GhostFaceNet"
        ],
        "face_detection": [
            "opencv",
            "ssd",
            "dlib",
            "mtcnn",
            "retinaface",
            "mediapipe",
            "yolov8",
            "yunet"
        ],
        "analysis_actions": [
            "age",
            "gender",
            "emotion",
            "race"
        ]
    }


@app.post("/analyze", response_model=AnalysisResponse)
async def analyze_face(
    image: Optional[UploadFile] = File(None),
    image_url: Optional[str] = Form(None),
    image_base64: Optional[str] = Form(None),
    actions: str = Form('["age", "gender", "emotion"]')
):
    """
    Analyze face for age, gender, emotion, and/or race.
    
    Accepts:
    - Uploaded image file
    - Image URL
    - Base64 encoded image
    
    Returns analysis results including:
    - Age (±4.65 years accuracy)
    - Gender (97.44% accuracy)
    - Emotion (angry, disgust, fear, happy, sad, surprise, neutral)
    - Race (asian, indian, black, white, middle_eastern, latino_hispanic)
    """
    try:
        df = load_deepface()
        
        # Parse actions
        import json
        try:
            action_list = json.loads(actions)
        except:
            action_list = ["age", "gender", "emotion"]
        
        # Get image data
        img_array = None
        
        if image:
            # Read uploaded file
            contents = await image.read()
            img = Image.open(io.BytesIO(contents))
            img_array = np.array(img.convert('RGB'))
            
        elif image_base64:
            # Decode base64
            if ',' in image_base64:
                image_base64 = image_base64.split(',')[1]
            img_bytes = base64.b64decode(image_base64)
            img = Image.open(io.BytesIO(img_bytes))
            img_array = np.array(img.convert('RGB'))
            
        elif image_url:
            # Download from URL
            import httpx
            async with httpx.AsyncClient() as client:
                response = await client.get(image_url)
                img = Image.open(io.BytesIO(response.content))
                img_array = np.array(img.convert('RGB'))
        else:
            raise HTTPException(status_code=400, detail="No image provided")
        
        # Run DeepFace analysis
        logger.info(f"Analyzing image with actions: {action_list}")
        
        results = df.analyze(
            img_path=img_array,
            actions=action_list,
            enforce_detection=False,
            detector_backend='retinaface',  # Best accuracy
            silent=True
        )
        
        # DeepFace returns list for multiple faces
        if isinstance(results, list):
            result = results[0] if results else {}
        else:
            result = results
        
        logger.info(f"Analysis complete: age={result.get('age')}, gender={result.get('dominant_gender')}")
        
        return AnalysisResponse(
            success=True,
            data=result
        )
        
    except Exception as e:
        logger.error(f"Analysis failed: {str(e)}")
        return AnalysisResponse(
            success=False,
            error=str(e)
        )


@app.post("/verify")
async def verify_faces(
    image1: UploadFile = File(...),
    image2: UploadFile = File(...),
    model_name: str = Form("ArcFace")
):
    """
    Verify if two faces belong to the same person.
    
    Returns:
    - verified: True/False
    - distance: similarity distance
    - threshold: verification threshold
    - model: model used
    """
    try:
        df = load_deepface()
        
        # Read images
        contents1 = await image1.read()
        contents2 = await image2.read()
        
        img1 = np.array(Image.open(io.BytesIO(contents1)).convert('RGB'))
        img2 = np.array(Image.open(io.BytesIO(contents2)).convert('RGB'))
        
        # Verify
        result = df.verify(
            img1_path=img1,
            img2_path=img2,
            model_name=model_name,
            enforce_detection=False
        )
        
        return {
            "success": True,
            "verified": result.get("verified", False),
            "distance": result.get("distance", 0),
            "threshold": result.get("threshold", 0),
            "model": model_name
        }
        
    except Exception as e:
        logger.error(f"Verification failed: {str(e)}")
        return {
            "success": False,
            "error": str(e)
        }


@app.post("/represent")
async def get_face_embedding(
    image: UploadFile = File(...),
    model_name: str = Form("Facenet512")
):
    """
    Get face embedding vector for face recognition.
    
    Returns 512-dimensional embedding vector.
    """
    try:
        df = load_deepface()
        
        contents = await image.read()
        img = np.array(Image.open(io.BytesIO(contents)).convert('RGB'))
        
        # Get embedding
        embedding = df.represent(
            img_path=img,
            model_name=model_name,
            enforce_detection=False
        )
        
        return {
            "success": True,
            "embedding": embedding[0]["embedding"] if embedding else [],
            "model": model_name
        }
        
    except Exception as e:
        logger.error(f"Embedding failed: {str(e)}")
        return {
            "success": False,
            "error": str(e)
        }


if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 5000))
    uvicorn.run(app, host="0.0.0.0", port=port)
