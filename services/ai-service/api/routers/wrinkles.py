"""
Wrinkles Detection API Router
"""
from fastapi import APIRouter, File, UploadFile, HTTPException
import numpy as np
import time
import logging

from api.schemas import WrinklesAnalysisResponse, AnalysisStatistics, SeverityLevel
from api.utils import decode_image, preprocess_image

router = APIRouter()
logger = logging.getLogger(__name__)

model_loader = None

def set_model_loader(loader):
    global model_loader
    model_loader = loader


@router.post("/wrinkles", response_model=WrinklesAnalysisResponse)
async def analyze_wrinkles(
    file: UploadFile = File(...),
    confidence_threshold: float = 0.5
):
    """
    📏 Analyze skin wrinkles and fine lines
    
    - **file**: Image file (JPG, PNG)
    - **confidence_threshold**: Minimum confidence score (0.0-1.0)
    
    Returns wrinkle line detections with depth scores
    """
    start_time = time.time()
    
    try:
        if file.content_type not in ["image/jpeg", "image/png", "image/jpg"]:
            raise HTTPException(400, "Invalid file type")
        
        contents = await file.read()
        image = decode_image(contents)
        
        if image is None:
            raise HTTPException(400, "Failed to decode image")
        
        original_height, original_width = image.shape[:2]
        processed = preprocess_image(image)
        
        if not model_loader:
            raise HTTPException(500, "Model loader not initialized")
        
        wrinkle_model = model_loader.get_wrinkle_model()
        detections = await wrinkle_model.detect(processed, confidence_threshold)
        
        total_wrinkles = len(detections)
        avg_confidence = float(np.mean([d['confidence'] for d in detections])) if detections else 0.0
        
        # Calculate severity
        if detections:
            avg_depth = np.mean([d['depth_score'] for d in detections])
            avg_length = np.mean([d['length_px'] for d in detections])
            severity_score = min(100, total_wrinkles * 3 + avg_depth * 50 + avg_length / 20)
        else:
            severity_score = 0.0
        
        if severity_score < 30:
            severity_level = SeverityLevel.MILD
        elif severity_score < 60:
            severity_level = SeverityLevel.MODERATE
        else:
            severity_level = SeverityLevel.SEVERE
        
        processing_time = (time.time() - start_time) * 1000
        
        response = WrinklesAnalysisResponse(
            success=True,
            detections=detections,
            statistics=AnalysisStatistics(
                total_count=total_wrinkles,
                average_confidence=round(avg_confidence, 3),
                severity_score=round(severity_score, 1),
                severity_level=severity_level
            ),
            image_dimensions={"width": original_width, "height": original_height},
            processing_time_ms=round(processing_time, 2)
        )
        
        logger.info(f"✅ Wrinkles analysis: {total_wrinkles} lines, {processing_time:.0f}ms")
        return response
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Error: {e}", exc_info=True)
        raise HTTPException(500, f"Analysis failed: {str(e)}")
