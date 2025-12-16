"""
Visualization API Router
Generate annotated images with professional overlays
"""
from fastapi import APIRouter, File, UploadFile, HTTPException, Query
from fastapi.responses import Response
import cv2
import time
import logging
from typing import Optional

from api.utils import decode_image, preprocess_image, OverlayRenderer, create_multimode_visualization
from api.core.model_loader import ModelLoader
import asyncio

router = APIRouter()
logger = logging.getLogger(__name__)

model_loader = None

def set_model_loader(loader):
    """Set global model loader (called from main.py)"""
    global model_loader
    model_loader = loader


@router.post("/visualize/multi-mode")
async def visualize_multi_mode(
    file: UploadFile = File(...),
    show_legend: bool = Query(True, description="Show detection count legend"),
    show_stats: bool = Query(True, description="Show statistics panel"),
    show_numbers: bool = Query(True, description="Show detection numbers on markers"),
    include_heatmap: bool = Query(True, description="Include red areas heatmap"),
):
    """
    🎨 Generate Annotated Image - Professional 8-Mode Visualization
    
    Creates VISIA-style visualization with colored markers and overlays:
    - 🔵 Pink dots for general spots
    - 🔦 Yellow dots for UV spots (subsurface)
    - 🟤 Brown dots for surface pigmentation
    - 🔴 Red areas heatmap for inflammation
    - 💡 Orange dots for bacterial fluorescence
    - 📏 Magenta lines for wrinkles
    - ⚫ Cyan dots for pores
    
    Returns annotated image as PNG
    """
    start_time = time.time()
    
    try:
        if file.content_type not in ["image/jpeg", "image/png", "image/jpg"]:
            raise HTTPException(400, "Invalid file type. Only JPG/PNG allowed.")
        
        contents = await file.read()
        image = decode_image(contents)
        
        if image is None:
            raise HTTPException(400, "Failed to decode image")
        
        original_image = image.copy()
        logger.info(f"🎨 Visualization: {image.shape[1]}x{image.shape[0]}")
        
        processed = preprocess_image(image, target_size=1024, normalize=True)
        
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
        
        # Run all analyses in parallel
        results = await asyncio.gather(
            spot_model.detect(processed, 0.5),
            wrinkle_model.detect(processed, 0.5),
            texture_model.analyze(processed),
            pores_model.detect(processed, 0.5),
            uv_spots_model.detect(processed, 0.5),
            brown_spots_model.detect(processed, 0.5),
            red_areas_model.detect(processed, 0.5),
            porphyrins_model.detect(processed, 0.5)
        )
        
        spots_detections = results[0]
        wrinkles_detections = results[1]
        texture_metrics = results[2]
        pores_detections = results[3]
        uv_spots_detections = results[4]
        brown_spots_detections = results[5]
        red_areas_result = results[6]
        porphyrins_detections = results[7]
        
        # Extract red areas data
        red_areas_detections = red_areas_result[0] if isinstance(red_areas_result, tuple) else red_areas_result
        red_areas_heatmap = red_areas_result[1] if isinstance(red_areas_result, tuple) else None
        
        # Create overlay renderer
        renderer = OverlayRenderer(original_image)
        
        # Draw spots (general surface spots)
        if spots_detections:
            renderer.draw_spots(spots_detections, 'spots', show_numbers=show_numbers)
        
        # Draw UV spots (subsurface pigmentation)
        if uv_spots_detections:
            renderer.draw_spots(uv_spots_detections, 'uv_spots', show_numbers=show_numbers)
        
        # Draw brown spots (sun damage, age spots)
        if brown_spots_detections:
            renderer.draw_spots(brown_spots_detections, 'brown_spots', show_numbers=show_numbers)
        
        # Draw porphyrins (bacterial fluorescence)
        if porphyrins_detections:
            renderer.draw_spots(porphyrins_detections, 'porphyrins', show_numbers=show_numbers)
        
        # Draw wrinkles
        if wrinkles_detections:
            renderer.draw_wrinkles(wrinkles_detections, show_numbers=show_numbers)
        
        # Draw pores (usually without numbers due to high count)
        if pores_detections:
            renderer.draw_pores(pores_detections, show_numbers=False)
        
        # Draw red areas heatmap
        if include_heatmap and red_areas_heatmap is not None:
            renderer.draw_heatmap_overlay(red_areas_heatmap, alpha=0.4, colormap=cv2.COLORMAP_JET)
        
        # Draw legend
        if show_legend:
            counts = {
                'spots': len(spots_detections),
                'uv_spots': len(uv_spots_detections),
                'brown_spots': len(brown_spots_detections),
                'porphyrins': len(porphyrins_detections),
                'wrinkles': len(wrinkles_detections),
                'pores': len(pores_detections),
            }
            modes = [k for k, v in counts.items() if v > 0]
            if modes:
                renderer.draw_legend(modes, counts, position='top-right')
        
        # Draw stats panel
        if show_stats:
            processing_time = (time.time() - start_time) * 1000
            total_detections = (
                len(spots_detections) + len(uv_spots_detections) + 
                len(brown_spots_detections) + len(porphyrins_detections) +
                len(wrinkles_detections) + len(pores_detections)
            )
            stats = {
                'Total Detections': total_detections,
                'Processing Time': f"{processing_time:.0f}ms"
            }
            renderer.draw_stats_panel(stats, position='bottom-left')
        
        # Get final annotated image
        annotated = renderer.get_result('RGB')
        
        # Convert to BGR for OpenCV encoding
        annotated_bgr = cv2.cvtColor(annotated, cv2.COLOR_RGB2BGR)
        
        # Encode as PNG
        success, buffer = cv2.imencode('.png', annotated_bgr)
        if not success:
            raise HTTPException(500, "Failed to encode image")
        
        processing_time = (time.time() - start_time) * 1000
        logger.info(f"✅ Visualization complete: {processing_time:.0f}ms")
        
        # Return image as PNG
        return Response(
            content=buffer.tobytes(),
            media_type="image/png",
            headers={
                "X-Processing-Time": f"{processing_time:.2f}ms",
                "X-Total-Detections": str(total_detections)
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Visualization error: {e}", exc_info=True)
        raise HTTPException(500, f"Visualization failed: {str(e)}")


@router.post("/visualize/single-mode/{mode}")
async def visualize_single_mode(
    mode: str,
    file: UploadFile = File(...),
    show_numbers: bool = Query(True, description="Show detection numbers"),
    show_confidence: bool = Query(False, description="Show confidence scores")
):
    """
    🎨 Generate Single-Mode Annotated Image
    
    Visualize results for a single analysis mode:
    - spots, uv_spots, brown_spots, porphyrins: Colored dots
    - wrinkles: Lines
    - pores: Small dots
    - red_areas: Heatmap
    - texture: Heatmap
    
    Returns annotated image as PNG
    """
    start_time = time.time()
    
    valid_modes = ['spots', 'uv_spots', 'brown_spots', 'porphyrins', 
                   'wrinkles', 'pores', 'red_areas', 'texture']
    
    if mode not in valid_modes:
        raise HTTPException(400, f"Invalid mode. Must be one of: {', '.join(valid_modes)}")
    
    try:
        if file.content_type not in ["image/jpeg", "image/png", "image/jpg"]:
            raise HTTPException(400, "Invalid file type. Only JPG/PNG allowed.")
        
        contents = await file.read()
        image = decode_image(contents)
        
        if image is None:
            raise HTTPException(400, "Failed to decode image")
        
        original_image = image.copy()
        processed = preprocess_image(image, target_size=1024, normalize=True)
        
        if not model_loader:
            raise HTTPException(500, "Model loader not initialized")
        
        # Get specific model and run analysis
        if mode == 'spots':
            model = model_loader.get_spot_model()
            detections = await model.detect(processed, 0.5)
        elif mode == 'uv_spots':
            model = model_loader.get_uv_spots_model()
            detections = await model.detect(processed, 0.5)
        elif mode == 'brown_spots':
            model = model_loader.get_brown_spots_model()
            detections = await model.detect(processed, 0.5)
        elif mode == 'porphyrins':
            model = model_loader.get_porphyrins_model()
            detections = await model.detect(processed, 0.5)
        elif mode == 'wrinkles':
            model = model_loader.get_wrinkle_model()
            detections = await model.detect(processed, 0.5)
        elif mode == 'pores':
            model = model_loader.get_pores_model()
            detections = await model.detect(processed, 0.5)
        elif mode == 'red_areas':
            model = model_loader.get_red_areas_model()
            result = await model.detect(processed, 0.5)
            detections = result[0] if isinstance(result, tuple) else result
            heatmap = result[1] if isinstance(result, tuple) else None
        else:  # texture
            model = model_loader.get_texture_model()
            metrics = await model.analyze(processed)
            detections = []
        
        # Create overlay
        renderer = OverlayRenderer(original_image)
        
        if mode in ['spots', 'uv_spots', 'brown_spots', 'porphyrins']:
            renderer.draw_spots(detections, mode, show_numbers=show_numbers, 
                              show_confidence=show_confidence)
        elif mode == 'wrinkles':
            renderer.draw_wrinkles(detections, show_numbers=show_numbers)
        elif mode == 'pores':
            renderer.draw_pores(detections, show_numbers=show_numbers)
        elif mode == 'red_areas' and heatmap is not None:
            renderer.draw_heatmap_overlay(heatmap, alpha=0.5, colormap=cv2.COLORMAP_JET)
        
        # Get result
        annotated = renderer.get_result('RGB')
        annotated_bgr = cv2.cvtColor(annotated, cv2.COLOR_RGB2BGR)
        
        # Encode as PNG
        success, buffer = cv2.imencode('.png', annotated_bgr)
        if not success:
            raise HTTPException(500, "Failed to encode image")
        
        processing_time = (time.time() - start_time) * 1000
        logger.info(f"✅ {mode} visualization: {len(detections) if isinstance(detections, list) else 0} detections, {processing_time:.0f}ms")
        
        return Response(
            content=buffer.tobytes(),
            media_type="image/png",
            headers={
                "X-Processing-Time": f"{processing_time:.2f}ms",
                "X-Mode": mode,
                "X-Detection-Count": str(len(detections) if isinstance(detections, list) else 0)
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ {mode} visualization error: {e}", exc_info=True)
        raise HTTPException(500, f"Visualization failed: {str(e)}")
