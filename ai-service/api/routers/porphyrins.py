"""
Porphyrins Detection API Router
Analyzes bacterial fluorescence (P. acnes detection)
"""
from fastapi import APIRouter, File, UploadFile, HTTPException
import numpy as np
import time
import logging

from api.schemas import AnalysisStatistics, SeverityLevel
from api.utils import decode_image, preprocess_image
from pydantic import BaseModel
from typing import List, Dict, Any

router = APIRouter()
logger = logging.getLogger(__name__)

model_loader = None

def set_model_loader(loader):
    """Set global model loader (called from main.py)"""
    global model_loader
    model_loader = loader


class PorphyrinsDetection(BaseModel):
    id: int
    type: str
    bbox: List[int]
    confidence: float
    fluorescence_intensity: float
    bacterial_load: float
    activity: str
    location_type: str


class PorphyrinsAnalysisResponse(BaseModel):
    success: bool
    detections: List[PorphyrinsDetection]
    statistics: AnalysisStatistics
    image_dimensions: Dict[str, int]
    overall_bacterial_load: float
    processing_time_ms: float | None = None


@router.post("/porphyrins", response_model=PorphyrinsAnalysisResponse)
async def analyze_porphyrins(
    file: UploadFile = File(...),
    confidence_threshold: float = 0.5
):
    """
    💡 Analyze porphyrins (bacterial fluorescence, P. acnes detection)
    
    Simulates Woods lamp UV fluorescence to detect bacterial activity
    
    - **file**: Image file (JPG, PNG)
    - **confidence_threshold**: Minimum confidence score (0.0-1.0)
    
    Returns detection boxes with bacterial load and activity classification
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
        logger.info(f"💡 Porphyrins analysis: {original_width}x{original_height}")
        
        processed = preprocess_image(image, target_size=1024, normalize=True)
        
        if not model_loader:
            raise HTTPException(500, "Model loader not initialized")
        
        porphyrin_model = model_loader.get_porphyrins_model()
        detections = await porphyrin_model.detect(processed, confidence_threshold)
        
        # Calculate statistics
        total_colonies = len(detections)
        avg_confidence = float(np.mean([d['confidence'] for d in detections])) if detections else 0.0
        
        # Calculate overall bacterial load
        bacterial_load = detections[0].get('overall_bacterial_load', 0.0) if detections else 0.0
        
        # Severity based on: colony count, fluorescence intensity, bacterial load
        if detections:
            avg_fluorescence = np.mean([d['fluorescence_intensity'] for d in detections])
            severity_score = min(100, total_colonies * 3 + avg_fluorescence * 40 + bacterial_load * 8)
        else:
            severity_score = 0.0
        
        severity_level = (
            SeverityLevel.SEVERE if severity_score >= 60 else
            SeverityLevel.MODERATE if severity_score >= 30 else
            SeverityLevel.MILD
        )
        
        formatted_detections = [
            PorphyrinsDetection(
                id=i,
                type="porphyrin",
                bbox=d['bbox'],
                confidence=d['confidence'],
                fluorescence_intensity=d.get('fluorescence_intensity', 0),
                bacterial_load=d.get('bacterial_load', 0),
                activity=d.get('activity', 'unknown'),
                location_type=d.get('location_type', 'unknown')
            )
            for i, d in enumerate(detections)
        ]
        
        processing_time = (time.time() - start_time) * 1000
        
        response = PorphyrinsAnalysisResponse(
            success=True,
            detections=formatted_detections,
            statistics=AnalysisStatistics(
                total_count=total_colonies,
                average_confidence=round(avg_confidence, 3),
                severity_score=round(severity_score, 1),
                severity_level=severity_level
            ),
            image_dimensions={"width": original_width, "height": original_height},
            overall_bacterial_load=round(bacterial_load, 2),
            processing_time_ms=round(processing_time, 2)
        )
        
        logger.info(f"✅ Porphyrins: {total_colonies} colonies, load {bacterial_load:.1f}/10, {processing_time:.0f}ms")
        return response
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Porphyrins error: {e}", exc_info=True)
        raise HTTPException(500, f"Analysis failed: {str(e)}")
