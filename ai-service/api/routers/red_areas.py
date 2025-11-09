"""
Red Areas Detection API Router
Analyzes redness, inflammation, rosacea, blood vessel visibility
"""
from fastapi import APIRouter, File, UploadFile, HTTPException
import numpy as np
import time
import logging
import cv2
import base64

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


class RedAreasDetection(BaseModel):
    id: int
    type: str
    bbox: List[int]
    confidence: float
    redness_intensity: float
    severity_score: float
    area_type: str


class RedAreasAnalysisResponse(BaseModel):
    success: bool
    detections: List[RedAreasDetection]
    statistics: AnalysisStatistics
    image_dimensions: Dict[str, int]
    heatmap_base64: str | None = None
    coverage_percentage: float
    processing_time_ms: float | None = None


@router.post("/red-areas", response_model=RedAreasAnalysisResponse)
async def analyze_red_areas(
    file: UploadFile = File(...),
    confidence_threshold: float = 0.5,
    include_heatmap: bool = True
):
    """
    🔴 Analyze red areas (inflammation, redness, rosacea, blood vessels)
    
    Calculates Erythema Index and generates heatmap visualization
    
    - **file**: Image file (JPG, PNG)
    - **confidence_threshold**: Minimum confidence score (0.0-1.0)
    - **include_heatmap**: Return base64-encoded heatmap image
    
    Returns detection boxes, heatmap, and coverage percentage
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
        logger.info(f"🔴 Red areas analysis: {original_width}x{original_height}")
        
        processed = preprocess_image(image, target_size=1024, normalize=True)
        
        if not model_loader:
            raise HTTPException(500, "Model loader not initialized")
        
        red_model = model_loader.get_red_areas_model()
        detections, heatmap_colored = await red_model.detect(processed, confidence_threshold)
        
        # Calculate statistics
        total_areas = len(detections)
        avg_confidence = float(np.mean([d['confidence'] for d in detections])) if detections else 0.0
        
        # Calculate coverage percentage
        coverage = detections[0].get('coverage_percentage', 0.0) if detections else 0.0
        
        # Severity based on: count, redness intensity, coverage
        if detections:
            avg_intensity = np.mean([d['redness_intensity'] for d in detections])
            severity_score = min(100, total_areas * 4 + avg_intensity * 50 + coverage * 2)
        else:
            severity_score = 0.0
        
        severity_level = (
            SeverityLevel.SEVERE if severity_score >= 60 else
            SeverityLevel.MODERATE if severity_score >= 30 else
            SeverityLevel.MILD
        )
        
        formatted_detections = [
            RedAreasDetection(
                id=i,
                type="red_area",
                bbox=d['bbox'],
                confidence=d['confidence'],
                redness_intensity=d.get('redness_intensity', 0),
                severity_score=d.get('severity_score', 0),
                area_type=d.get('area_type', 'unknown')
            )
            for i, d in enumerate(detections)
        ]
        
        # Encode heatmap as base64
        heatmap_base64 = None
        if include_heatmap and heatmap_colored is not None:
            _, buffer = cv2.imencode('.png', heatmap_colored)
            heatmap_base64 = base64.b64encode(buffer).decode('utf-8')
        
        processing_time = (time.time() - start_time) * 1000
        
        response = RedAreasAnalysisResponse(
            success=True,
            detections=formatted_detections,
            statistics=AnalysisStatistics(
                total_count=total_areas,
                average_confidence=round(avg_confidence, 3),
                severity_score=round(severity_score, 1),
                severity_level=severity_level
            ),
            image_dimensions={"width": original_width, "height": original_height},
            heatmap_base64=heatmap_base64,
            coverage_percentage=round(coverage, 2),
            processing_time_ms=round(processing_time, 2)
        )
        
        logger.info(f"✅ Red areas: {total_areas} detections, {coverage:.1f}% coverage, {processing_time:.0f}ms")
        return response
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Red areas error: {e}", exc_info=True)
        raise HTTPException(500, f"Analysis failed: {str(e)}")
