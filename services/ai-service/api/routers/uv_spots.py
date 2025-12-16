"""
UV Spots Detection API Router
Analyzes subsurface pigmentation (hidden spots under skin)
"""
from fastapi import APIRouter, File, UploadFile, HTTPException
import numpy as np
import time
import logging

from api.schemas import SpotsAnalysisResponse, AnalysisStatistics, SeverityLevel
from api.utils import decode_image, preprocess_image

router = APIRouter()
logger = logging.getLogger(__name__)

model_loader = None

def set_model_loader(loader):
    """Set global model loader (called from main.py)"""
    global model_loader
    model_loader = loader


@router.post("/uv-spots", response_model=SpotsAnalysisResponse)
async def analyze_uv_spots(
    file: UploadFile = File(...),
    confidence_threshold: float = 0.5
):
    """
    🔦 Analyze UV spots (subsurface pigmentation, hidden melanin)
    
    Simulates Woods lamp/UV imaging to detect spots beneath skin surface
    
    - **file**: Image file (JPG, PNG)
    - **confidence_threshold**: Minimum confidence score (0.0-1.0)
    
    Returns detection boxes with depth scores and statistics
    """
    start_time = time.time()
    
    try:
        if file.content_type not in ["image/jpeg", "image/png", "image/jpg"]:
            raise HTTPException(400, "Invalid file type. Only JPG/PNG allowed.")
        
        contents = await file.read()
        image = decode_image(contents)
        
        if image is None:
            raise HTTPException(400, "Failed to decode image")
        
        original_height, original_width = image.shape[:2]
        logger.info(f"🔦 UV spots analysis: {original_width}x{original_height}")
        
        processed = preprocess_image(image, target_size=1024, normalize=True)
        
        if not model_loader:
            raise HTTPException(500, "Model loader not initialized")
        
        uv_model = model_loader.get_uv_spots_model()
        detections = await uv_model.detect(processed, confidence_threshold)
        
        # Calculate statistics
        total_spots = len(detections)
        avg_confidence = float(np.mean([d['confidence'] for d in detections])) if detections else 0.0
        
        # Severity based on: count, depth scores, yellowness
        if detections:
            avg_depth = np.mean([d['depth_score'] for d in detections])
            avg_yellowness = np.mean([d['yellowness'] for d in detections])
            severity_score = min(100, total_spots * 2 + avg_depth * 40 + avg_yellowness * 30)
        else:
            severity_score = 0.0
        
        severity_level = (
            SeverityLevel.SEVERE if severity_score >= 60 else
            SeverityLevel.MODERATE if severity_score >= 30 else
            SeverityLevel.MILD
        )
        
        formatted_detections = [
            {
                "id": i,
                "type": "uv_spot",
                "bbox": d['bbox'],
                "confidence": d['confidence'],
                "size_mm": d.get('size_mm', 0),
                "depth_score": d.get('depth_score', 0),
                "yellowness": d.get('yellowness', 0),
                "circularity": d.get('circularity', 0)
            }
            for i, d in enumerate(detections)
        ]
        
        processing_time = (time.time() - start_time) * 1000
        
        response = SpotsAnalysisResponse(
            success=True,
            detections=formatted_detections,
            statistics=AnalysisStatistics(
                total_count=total_spots,
                average_confidence=round(avg_confidence, 3),
                severity_score=round(severity_score, 1),
                severity_level=severity_level
            ),
            image_dimensions={"width": original_width, "height": original_height},
            processing_time_ms=round(processing_time, 2)
        )
        
        logger.info(f"✅ UV spots: {total_spots} detections, {severity_level.value}, {processing_time:.0f}ms")
        return response
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ UV spots error: {e}", exc_info=True)
        raise HTTPException(500, f"Analysis failed: {str(e)}")
