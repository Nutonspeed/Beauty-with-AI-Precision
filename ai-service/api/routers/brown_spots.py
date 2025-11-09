"""
Brown Spots Detection API Router
Analyzes surface-level brown pigmentation (sun damage, age spots, freckles)
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


@router.post("/brown-spots", response_model=SpotsAnalysisResponse)
async def analyze_brown_spots(
    file: UploadFile = File(...),
    confidence_threshold: float = 0.5
):
    """
    🟤 Analyze brown spots (sun damage, age spots, freckles, melasma)
    
    Detects surface-level brown/tan pigmentation using multi-spectral analysis
    
    - **file**: Image file (JPG, PNG)
    - **confidence_threshold**: Minimum confidence score (0.0-1.0)
    
    Returns detection boxes with melanin intensity and spot type classification
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
        logger.info(f"🟤 Brown spots analysis: {original_width}x{original_height}")
        
        processed = preprocess_image(image, target_size=1024, normalize=True)
        
        if not model_loader:
            raise HTTPException(500, "Model loader not initialized")
        
        brown_model = model_loader.get_brown_spots_model()
        detections = await brown_model.detect(processed, confidence_threshold)
        
        # Calculate statistics
        total_spots = len(detections)
        avg_confidence = float(np.mean([d['confidence'] for d in detections])) if detections else 0.0
        
        # Severity based on: count, melanin intensity, spot size
        if detections:
            avg_melanin = np.mean([d['melanin_intensity'] for d in detections])
            avg_size = np.mean([d['size_mm'] for d in detections])
            severity_score = min(100, total_spots * 1.8 + avg_melanin * 35 + avg_size * 4)
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
                "type": "brown_spot",
                "bbox": d['bbox'],
                "confidence": d['confidence'],
                "size_mm": d.get('size_mm', 0),
                "melanin_intensity": d.get('melanin_intensity', 0),
                "spot_type": d.get('spot_type', 'unknown'),
                "hue": d.get('hue', 0)
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
        
        logger.info(f"✅ Brown spots: {total_spots} detections, {severity_level.value}, {processing_time:.0f}ms")
        return response
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Brown spots error: {e}", exc_info=True)
        raise HTTPException(500, f"Analysis failed: {str(e)}")
