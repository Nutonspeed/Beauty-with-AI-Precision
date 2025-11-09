"""
Spots Detection API Router
"""
from fastapi import APIRouter, File, UploadFile, HTTPException
import numpy as np
import time
import logging

from api.schemas import SpotsAnalysisResponse, AnalysisStatistics, SeverityLevel
from api.utils import decode_image, preprocess_image

router = APIRouter()
logger = logging.getLogger(__name__)

# Global model loader will be injected from main.py
model_loader = None

def set_model_loader(loader):
    """Set global model loader (called from main.py)"""
    global model_loader
    model_loader = loader


@router.post("/spots", response_model=SpotsAnalysisResponse)
async def analyze_spots(
    file: UploadFile = File(...),
    confidence_threshold: float = 0.5
):
    """
    🔍 Analyze skin spots (hyperpigmentation, dark spots, age spots, melasma)
    
    - **file**: Image file (JPG, PNG)
    - **confidence_threshold**: Minimum confidence score (0.0-1.0)
    
    Returns detection boxes with confidence scores and statistics
    """
    start_time = time.time()
    
    try:
        # Validate file type
        if file.content_type not in ["image/jpeg", "image/png", "image/jpg"]:
            raise HTTPException(
                status_code=400, 
                detail="Invalid file type. Only JPG/PNG allowed."
            )
        
        # Read and decode image
        contents = await file.read()
        image = decode_image(contents)
        
        if image is None:
            raise HTTPException(status_code=400, detail="Failed to decode image")
        
        original_height, original_width = image.shape[:2]
        logger.info(f"📸 Processing image: {original_width}x{original_height}")
        
        # Preprocess
        processed = preprocess_image(image, target_size=1024, normalize=True)
        
        # Get model
        if not model_loader:
            raise HTTPException(status_code=500, detail="Model loader not initialized")
        
        spot_model = model_loader.get_spot_model()
        
        # Run inference
        detections = await spot_model.detect(processed, confidence_threshold)
        
        # Calculate statistics
        total_spots = len(detections)
        avg_confidence = (
            float(np.mean([d['confidence'] for d in detections]))
            if detections else 0.0
        )
        
        # Calculate severity score (0-100)
        # Based on: count, average melanin density, average size
        if detections:
            avg_melanin = np.mean([d['melanin_density'] for d in detections])
            avg_size = np.mean([d['size_mm'] for d in detections])
            severity_score = min(
                100,
                total_spots * 1.5 + avg_melanin * 30 + avg_size * 5
            )
        else:
            severity_score = 0.0
        
        # Determine severity level
        if severity_score < 30:
            severity_level = SeverityLevel.MILD
        elif severity_score < 60:
            severity_level = SeverityLevel.MODERATE
        else:
            severity_level = SeverityLevel.SEVERE
        
        # Format detections for response
        formatted_detections = [
            {
                "id": i,
                "type": "spot",
                "bbox": d['bbox'],
                "confidence": d['confidence'],
                "size_mm": d.get('size_mm', 0),
                "melanin_density": d.get('melanin_density', 0)
            }
            for i, d in enumerate(detections)
        ]
        
        processing_time = (time.time() - start_time) * 1000  # Convert to ms
        
        response = SpotsAnalysisResponse(
            success=True,
            detections=formatted_detections,
            statistics=AnalysisStatistics(
                total_count=total_spots,
                average_confidence=round(avg_confidence, 3),
                severity_score=round(severity_score, 1),
                severity_level=severity_level
            ),
            image_dimensions={
                "width": original_width,
                "height": original_height
            },
            processing_time_ms=round(processing_time, 2)
        )
        
        logger.info(
            f"✅ Spots analysis complete: {total_spots} spots, "
            f"{severity_level.value} severity, {processing_time:.0f}ms"
        )
        
        return response
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Error in spots analysis: {e}", exc_info=True)
        raise HTTPException(
            status_code=500, 
            detail=f"Analysis failed: {str(e)}"
        )
