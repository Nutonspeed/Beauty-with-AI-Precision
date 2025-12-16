"""
Beauty AI Analysis Service
FastAPI backend for skin analysis using computer vision and ML
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
import logging
import uvicorn

from api.routers import spots, wrinkles, texture, pores, multi_mode, uv_spots, brown_spots, red_areas, porphyrins, visualize
from api.core.config import settings
from api.core.model_loader import ModelLoader

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Global model loader
model_loader = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Load ML models on startup, cleanup on shutdown"""
    global model_loader
    
    logger.info("🚀 Starting Beauty AI Analysis Service...")
    logger.info(f"📝 Version: {settings.API_VERSION}")
    logger.info(f"🔧 Environment: {'Production' if settings.USE_GPU else 'Development (CPU)'}")
    
    # Load all ML models
    try:
        model_loader = ModelLoader()
        await model_loader.load_all_models()
        
        # Inject model loader into routers
        spots.set_model_loader(model_loader)
        wrinkles.set_model_loader(model_loader)
        texture.set_model_loader(model_loader)
        pores.set_model_loader(model_loader)
        uv_spots.set_model_loader(model_loader)
        brown_spots.set_model_loader(model_loader)
        red_areas.set_model_loader(model_loader)
        porphyrins.set_model_loader(model_loader)
        multi_mode.set_model_loader(model_loader)
        visualize.set_model_loader(model_loader)
        
        logger.info("✅ All models loaded successfully!")
        logger.info(f"🌐 Server ready at http://0.0.0.0:8000")
        logger.info(f"📚 API docs at http://0.0.0.0:8000/docs")
        
    except Exception as e:
        logger.error(f"❌ Failed to load models: {e}")
        raise
    
    yield
    
    # Cleanup
    logger.info("🛑 Shutting down Beauty AI Analysis Service...")


# Initialize FastAPI app
app = FastAPI(
    title=settings.API_TITLE,
    description="""
    🔬 Beauty AI Analysis Service
    
    Professional-grade 8-mode skin analysis using advanced computer vision.
    
    **8 Analysis Modes:**
    1. 🔵 Spots Detection - Surface hyperpigmentation, dark spots
    2. 📏 Wrinkles Analysis - Fine lines, deep wrinkles, aging signs
    3. 🎨 Texture Analysis - Smoothness, roughness, skin quality
    4. ⚫ Pores Detection - Enlarged pores, density mapping
    5. 🔦 UV Spots - Subsurface pigmentation (Woods lamp simulation)
    6. 🟤 Brown Spots - Sun damage, age spots, melasma
    7. 🔴 Red Areas - Inflammation, rosacea, blood vessels (with Erythema Index)
    8. 💡 Porphyrins - Bacterial fluorescence (P. acnes detection)
    
    **Multi-Mode Analysis** - Run all 8 modes in parallel for comprehensive assessment
    
    **Technologies:**
    - FastAPI for high-performance API
    - OpenCV 4.x with multi-spectral color space analysis (LAB, HSV, YCrCb)
    - Advanced CV algorithms: morphological operations, contour detection, spectral unmixing
    - Real-time processing with parallel execution
    """,
    version=settings.API_VERSION,
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Root endpoint
@app.get("/", tags=["Health"])
async def root():
    """API root - service information"""
    return {
        "service": "Beauty AI Analysis Service",
        "version": settings.API_VERSION,
        "status": "running",
        "models_loaded": model_loader.is_loaded if model_loader else False,
        "endpoints": {
            "docs": "/docs",
            "health": "/health",
            "spots": "/api/analyze/spots",
            "wrinkles": "/api/analyze/wrinkles",
            "texture": "/api/analyze/texture",
            "pores": "/api/analyze/pores",
            "uv_spots": "/api/analyze/uv-spots",
            "brown_spots": "/api/analyze/brown-spots",
            "red_areas": "/api/analyze/red-areas",
            "porphyrins": "/api/analyze/porphyrins",
            "multi_mode": "/api/analyze/multi-mode",
            "visualize_multi": "/api/visualize/multi-mode",
            "visualize_single": "/api/visualize/single-mode/{mode}"
        }
    }


@app.get("/health", tags=["Health"])
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "version": settings.API_VERSION,
        "models": {
            "spots": model_loader.spots_model is not None if model_loader else False,
            "wrinkles": model_loader.wrinkles_model is not None if model_loader else False,
            "texture": model_loader.texture_model is not None if model_loader else False,
            "pores": model_loader.pores_model is not None if model_loader else False,
            "uv_spots": model_loader.uv_spots_model is not None if model_loader else False,
            "brown_spots": model_loader.brown_spots_model is not None if model_loader else False,
            "red_areas": model_loader.red_areas_model is not None if model_loader else False,
            "porphyrins": model_loader.porphyrins_model is not None if model_loader else False,
        } if model_loader else {},
        "device": model_loader.device if model_loader else "unknown"
    }


# Include routers
app.include_router(
    spots.router, 
    prefix="/api/analyze", 
    tags=["Spots Detection"]
)
app.include_router(
    wrinkles.router, 
    prefix="/api/analyze", 
    tags=["Wrinkles Detection"]
)
app.include_router(
    texture.router, 
    prefix="/api/analyze", 
    tags=["Texture Analysis"]
)
app.include_router(
    pores.router, 
    prefix="/api/analyze", 
    tags=["Pores Detection"]
)
app.include_router(
    uv_spots.router, 
    prefix="/api/analyze", 
    tags=["UV Spots Detection"]
)
app.include_router(
    brown_spots.router, 
    prefix="/api/analyze", 
    tags=["Brown Spots Detection"]
)
app.include_router(
    red_areas.router, 
    prefix="/api/analyze", 
    tags=["Red Areas Detection"]
)
app.include_router(
    porphyrins.router, 
    prefix="/api/analyze", 
    tags=["Porphyrins Detection"]
)
app.include_router(
    multi_mode.router, 
    prefix="/api/analyze", 
    tags=["Multi-Mode Analysis"]
)
app.include_router(
    visualize.router, 
    prefix="/api", 
    tags=["Visualization"]
)


# Error handlers
@app.exception_handler(404)
async def not_found_handler(request, exc):
    return JSONResponse(
        status_code=404,
        content={"error": "Endpoint not found", "detail": str(exc)}
    )


@app.exception_handler(500)
async def internal_error_handler(request, exc):
    logger.error(f"Internal error: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"error": "Internal server error", "detail": str(exc)}
    )


if __name__ == "__main__":
    # Run with: python main.py
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
