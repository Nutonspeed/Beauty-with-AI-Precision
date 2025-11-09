"""
Texture Analysis API Router
"""
from fastapi import APIRouter, File, UploadFile, HTTPException
import time
import logging

from api.schemas import TextureAnalysisResponse
from api.utils import decode_image, preprocess_image

router = APIRouter()
logger = logging.getLogger(__name__)

model_loader = None

def set_model_loader(loader):
    global model_loader
    model_loader = loader


@router.post("/texture", response_model=TextureAnalysisResponse)
async def analyze_texture(file: UploadFile = File(...)):
    """
    🔬 Analyze skin texture, smoothness, and roughness
    
    - **file**: Image file (JPG, PNG)
    
    Returns texture metrics and scores
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
        
        texture_model = model_loader.get_texture_model()
        metrics = await texture_model.analyze(processed)
        
        processing_time = (time.time() - start_time) * 1000
        
        response = TextureAnalysisResponse(
            success=True,
            metrics=metrics,
            smoothness_score=round(metrics['smoothness_score'], 1),
            roughness_score=round(metrics['roughness_score'], 1),
            image_dimensions={"width": original_width, "height": original_height},
            processing_time_ms=round(processing_time, 2)
        )
        
        logger.info(f"✅ Texture analysis: {metrics['overall_score']:.1f}/100, {processing_time:.0f}ms")
        return response
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Error: {e}", exc_info=True)
        raise HTTPException(500, f"Analysis failed: {str(e)}")
