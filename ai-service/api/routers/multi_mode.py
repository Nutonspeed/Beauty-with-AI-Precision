"""
Multi-Mode Analysis API Router
Runs all 8 analysis modes in parallel
"""
from fastapi import APIRouter, File, UploadFile, HTTPException
import asyncio
import time
import logging

from api.schemas import MultiModeAnalysisResponse
from api.utils import decode_image, preprocess_image

router = APIRouter()
logger = logging.getLogger(__name__)

model_loader = None

def set_model_loader(loader):
    global model_loader
    model_loader = loader


@router.post("/multi-mode", response_model=MultiModeAnalysisResponse)
async def analyze_multi_mode(file: UploadFile = File(...)):
    """
    🎯 Multi-Mode Analysis - Run all 8 skin analysis modes
    
    Analyzes:
    1. Spots (hyperpigmentation)
    2. Wrinkles (fine lines, deep wrinkles)
    3. Texture (smoothness, roughness)
    4. Pores (size, density)
    5. UV Spots (future: requires UV imaging)
    6. Brown Spots (age spots, sun damage)
    7. Red Areas (inflammation, redness)
    8. Porphyrins (bacteria, acne)
    
    - **file**: Image file (JPG, PNG)
    
    Returns comprehensive analysis across all modes
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
        logger.info(f"🎯 Multi-mode analysis starting for {original_width}x{original_height} image")
        
        processed = preprocess_image(image)
        
        if not model_loader:
            raise HTTPException(500, "Model loader not initialized")
        
        # Get all 8 models
        spot_model = model_loader.get_spot_model()
        wrinkle_model = model_loader.get_wrinkle_model()
        texture_model = model_loader.get_texture_model()
        pores_model = model_loader.get_pores_model()
        uv_spots_model = model_loader.get_uv_spots_model()
        brown_spots_model = model_loader.get_brown_spots_model()
        red_areas_model = model_loader.get_red_areas_model()
        porphyrins_model = model_loader.get_porphyrins_model()
        
        # Execute all 8 analyses in parallel
        spots_task = spot_model.detect(processed, 0.5)
        wrinkles_task = wrinkle_model.detect(processed, 0.5)
        texture_task = texture_model.analyze(processed)
        pores_task = pores_model.detect(processed, 0.5)
        uv_spots_task = uv_spots_model.detect(processed, 0.5)
        brown_spots_task = brown_spots_model.detect(processed, 0.5)
        red_areas_task = red_areas_model.detect(processed, 0.5)
        porphyrins_task = porphyrins_model.detect(processed, 0.5)
        
        results = await asyncio.gather(
            spots_task, wrinkles_task, texture_task, pores_task,
            uv_spots_task, brown_spots_task, red_areas_task, porphyrins_task
        )
        
        spots_detections = results[0]
        wrinkles_detections = results[1]
        texture_metrics = results[2]
        pores_detections = results[3]
        uv_spots_detections = results[4]
        brown_spots_detections = results[5]
        red_areas_result = results[6]  # Returns tuple (detections, heatmap)
        porphyrins_detections = results[7]
        
        # Extract red areas detections and heatmap
        red_areas_detections = red_areas_result[0] if isinstance(red_areas_result, tuple) else red_areas_result
        red_areas_heatmap = red_areas_result[1] if isinstance(red_areas_result, tuple) else None
        
        # Build individual responses
        # (Simplified - in production, call the individual endpoints)
        from api.schemas import SpotsAnalysisResponse, WrinklesAnalysisResponse, TextureAnalysisResponse, PoresAnalysisResponse, AnalysisStatistics, SeverityLevel
        import numpy as np
        
        # Spots
        spots_count = len(spots_detections)
        spots_avg_conf = float(np.mean([d['confidence'] for d in spots_detections])) if spots_detections else 0.0
        spots_severity = min(100, spots_count * 1.5) if spots_detections else 0.0
        spots_level = SeverityLevel.SEVERE if spots_severity >= 60 else (SeverityLevel.MODERATE if spots_severity >= 30 else SeverityLevel.MILD)
        
        spots_response = SpotsAnalysisResponse(
            success=True,
            detections=[{"id": i, "type": "spot", "bbox": d['bbox'], "confidence": d['confidence'], "size_mm": d.get('size_mm', 0), "melanin_density": d.get('melanin_density', 0)} for i, d in enumerate(spots_detections)],
            statistics=AnalysisStatistics(total_count=spots_count, average_confidence=round(spots_avg_conf, 3), severity_score=round(spots_severity, 1), severity_level=spots_level),
            image_dimensions={"width": original_width, "height": original_height}
        )
        
        # Wrinkles
        wrinkles_count = len(wrinkles_detections)
        wrinkles_avg_conf = float(np.mean([d['confidence'] for d in wrinkles_detections])) if wrinkles_detections else 0.0
        wrinkles_severity = min(100, wrinkles_count * 3) if wrinkles_detections else 0.0
        wrinkles_level = SeverityLevel.SEVERE if wrinkles_severity >= 60 else (SeverityLevel.MODERATE if wrinkles_severity >= 30 else SeverityLevel.MILD)
        
        wrinkles_response = WrinklesAnalysisResponse(
            success=True,
            detections=wrinkles_detections,
            statistics=AnalysisStatistics(total_count=wrinkles_count, average_confidence=round(wrinkles_avg_conf, 3), severity_score=round(wrinkles_severity, 1), severity_level=wrinkles_level),
            image_dimensions={"width": original_width, "height": original_height}
        )
        
        # Texture
        texture_response = TextureAnalysisResponse(
            success=True,
            metrics=texture_metrics,
            smoothness_score=round(texture_metrics['smoothness_score'], 1),
            roughness_score=round(texture_metrics['roughness_score'], 1),
            image_dimensions={"width": original_width, "height": original_height}
        )
        
        # Pores
        pores_count = len(pores_detections)
        pores_avg_conf = float(np.mean([d['confidence'] for d in pores_detections])) if pores_detections else 0.0
        pores_severity = min(100, pores_count / 2) if pores_detections else 0.0
        pores_level = SeverityLevel.SEVERE if pores_severity >= 60 else (SeverityLevel.MODERATE if pores_severity >= 30 else SeverityLevel.MILD)
        
        pores_response = PoresAnalysisResponse(
            success=True,
            detections=[{"id": i, "type": "pore", "bbox": d['bbox'], "confidence": d['confidence'], "size_mm": d.get('size_mm', 0), "melanin_density": 0} for i, d in enumerate(pores_detections)],
            statistics=AnalysisStatistics(total_count=pores_count, average_confidence=round(pores_avg_conf, 3), severity_score=round(pores_severity, 1), severity_level=pores_level),
            image_dimensions={"width": original_width, "height": original_height}
        )
        
        # UV Spots
        uv_spots_count = len(uv_spots_detections)
        uv_spots_avg_conf = float(np.mean([d['confidence'] for d in uv_spots_detections])) if uv_spots_detections else 0.0
        uv_spots_severity = min(100, uv_spots_count * 2) if uv_spots_detections else 0.0
        uv_spots_level = SeverityLevel.SEVERE if uv_spots_severity >= 60 else (SeverityLevel.MODERATE if uv_spots_severity >= 30 else SeverityLevel.MILD)
        
        uv_spots_response = SpotsAnalysisResponse(
            success=True,
            detections=[{"id": i, "type": "uv_spot", "bbox": d['bbox'], "confidence": d['confidence'], "size_mm": d.get('size_mm', 0), "melanin_density": d.get('depth_score', 0)} for i, d in enumerate(uv_spots_detections)],
            statistics=AnalysisStatistics(total_count=uv_spots_count, average_confidence=round(uv_spots_avg_conf, 3), severity_score=round(uv_spots_severity, 1), severity_level=uv_spots_level),
            image_dimensions={"width": original_width, "height": original_height}
        )
        
        # Brown Spots
        brown_spots_count = len(brown_spots_detections)
        brown_spots_avg_conf = float(np.mean([d['confidence'] for d in brown_spots_detections])) if brown_spots_detections else 0.0
        brown_spots_severity = min(100, brown_spots_count * 1.8) if brown_spots_detections else 0.0
        brown_spots_level = SeverityLevel.SEVERE if brown_spots_severity >= 60 else (SeverityLevel.MODERATE if brown_spots_severity >= 30 else SeverityLevel.MILD)
        
        brown_spots_response = SpotsAnalysisResponse(
            success=True,
            detections=[{"id": i, "type": "brown_spot", "bbox": d['bbox'], "confidence": d['confidence'], "size_mm": d.get('size_mm', 0), "melanin_density": d.get('melanin_intensity', 0)} for i, d in enumerate(brown_spots_detections)],
            statistics=AnalysisStatistics(total_count=brown_spots_count, average_confidence=round(brown_spots_avg_conf, 3), severity_score=round(brown_spots_severity, 1), severity_level=brown_spots_level),
            image_dimensions={"width": original_width, "height": original_height}
        )
        
        # Red Areas
        red_areas_count = len(red_areas_detections)
        red_areas_avg_conf = float(np.mean([d['confidence'] for d in red_areas_detections])) if red_areas_detections else 0.0
        red_areas_severity = min(100, red_areas_count * 4) if red_areas_detections else 0.0
        red_areas_level = SeverityLevel.SEVERE if red_areas_severity >= 60 else (SeverityLevel.MODERATE if red_areas_severity >= 30 else SeverityLevel.MILD)
        
        red_areas_response = SpotsAnalysisResponse(
            success=True,
            detections=[{"id": i, "type": "red_area", "bbox": d['bbox'], "confidence": d['confidence'], "size_mm": 0, "melanin_density": d.get('redness_intensity', 0)} for i, d in enumerate(red_areas_detections)],
            statistics=AnalysisStatistics(total_count=red_areas_count, average_confidence=round(red_areas_avg_conf, 3), severity_score=round(red_areas_severity, 1), severity_level=red_areas_level),
            image_dimensions={"width": original_width, "height": original_height}
        )
        
        # Porphyrins
        porphyrins_count = len(porphyrins_detections)
        porphyrins_avg_conf = float(np.mean([d['confidence'] for d in porphyrins_detections])) if porphyrins_detections else 0.0
        porphyrins_severity = min(100, porphyrins_count * 3) if porphyrins_detections else 0.0
        porphyrins_level = SeverityLevel.SEVERE if porphyrins_severity >= 60 else (SeverityLevel.MODERATE if porphyrins_severity >= 30 else SeverityLevel.MILD)
        
        porphyrins_response = SpotsAnalysisResponse(
            success=True,
            detections=[{"id": i, "type": "porphyrin", "bbox": d['bbox'], "confidence": d['confidence'], "size_mm": d.get('size_mm', 0), "melanin_density": d.get('fluorescence_intensity', 0)} for i, d in enumerate(porphyrins_detections)],
            statistics=AnalysisStatistics(total_count=porphyrins_count, average_confidence=round(porphyrins_avg_conf, 3), severity_score=round(porphyrins_severity, 1), severity_level=porphyrins_level),
            image_dimensions={"width": original_width, "height": original_height}
        )
        
        # Calculate overall score (0-100, higher = better skin health)
        # Weight all 8 modes equally
        overall_score = (
            max(0, 100 - spots_severity) * 0.125 +
            max(0, 100 - wrinkles_severity) * 0.125 +
            texture_metrics['overall_score'] * 0.125 +
            max(0, 100 - pores_severity) * 0.125 +
            max(0, 100 - uv_spots_severity) * 0.125 +
            max(0, 100 - brown_spots_severity) * 0.125 +
            max(0, 100 - red_areas_severity) * 0.125 +
            max(0, 100 - porphyrins_severity) * 0.125
        )
        
        processing_time = (time.time() - start_time) * 1000
        
        response = MultiModeAnalysisResponse(
            success=True,
            spots=spots_response,
            wrinkles=wrinkles_response,
            texture=texture_response,
            pores=pores_response,
            uv_spots=uv_spots_response,
            brown_spots=brown_spots_response,
            red_areas=red_areas_response.dict(),
            porphyrins=porphyrins_response.dict(),
            overall_score=round(overall_score, 1),
            processing_time_ms=round(processing_time, 2)
        )
        
        logger.info(f"✅ Multi-mode analysis complete: overall {overall_score:.1f}/100, {processing_time:.0f}ms")
        return response
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Error: {e}", exc_info=True)
        raise HTTPException(500, f"Analysis failed: {str(e)}")
