"""
ML Model Loader - Manages all detection models
"""
import logging
from typing import Optional

from api.models import (
    SpotDetector, 
    WrinkleDetector, 
    TextureAnalyzer, 
    PoresDetector,
    UVSpotDetector,
    BrownSpotDetector,
    RedAreaDetector,
    PorphyrinDetector
)
from api.core.config import settings

logger = logging.getLogger(__name__)

class ModelLoader:
    """Load and manage all ML models"""
    
    def __init__(self):
        self.device = 'cpu'  # Will be updated based on GPU availability
        
        # Original 4 models
        self.spots_model: Optional[SpotDetector] = None
        self.wrinkles_model: Optional[WrinkleDetector] = None
        self.texture_model: Optional[TextureAnalyzer] = None
        self.pores_model: Optional[PoresDetector] = None
        
        # New 4 models for complete 8-mode analysis
        self.uv_spots_model: Optional[UVSpotDetector] = None
        self.brown_spots_model: Optional[BrownSpotDetector] = None
        self.red_areas_model: Optional[RedAreaDetector] = None
        self.porphyrins_model: Optional[PorphyrinDetector] = None
        
        self.is_loaded = False
    
    async def load_all_models(self):
        """Load all models on startup"""
        try:
            logger.info("📦 Loading AI models...")
            
            # Determine device
            if settings.USE_GPU:
                try:
                    import torch
                    if torch.cuda.is_available():
                        self.device = f'cuda:{settings.GPU_DEVICE}'
                        logger.info(f"🎮 Using GPU: {torch.cuda.get_device_name(0)}")
                    else:
                        self.device = 'cpu'
                        logger.info("🖥️ GPU requested but not available, using CPU")
                except ImportError:
                    self.device = 'cpu'
                    logger.info("🖥️ PyTorch not installed, using CPU")
            else:
                logger.info("🖥️ Using CPU (GPU disabled in settings)")
            
            # Load Spots Detection model
            logger.info("📦 Loading Spots Detection model...")
            self.spots_model = SpotDetector(self.device)
            await self.spots_model.load_model(
                f"{settings.MODELS_DIR}/{settings.SPOT_MODEL_PATH}"
            )
            
            # Load Wrinkles Detection model
            logger.info("📦 Loading Wrinkles Detection model...")
            self.wrinkles_model = WrinkleDetector(self.device)
            await self.wrinkles_model.load_model(
                f"{settings.MODELS_DIR}/{settings.WRINKLE_MODEL_PATH}"
            )
            
            # Load Texture Analysis model
            logger.info("📦 Loading Texture Analysis model...")
            self.texture_model = TextureAnalyzer(self.device)
            await self.texture_model.load_model(
                f"{settings.MODELS_DIR}/{settings.TEXTURE_MODEL_PATH}"
            )
            
            # Load Pores Detection model
            logger.info("📦 Loading Pores Detection model...")
            self.pores_model = PoresDetector(self.device)
            await self.pores_model.load_model(
                f"{settings.MODELS_DIR}/{settings.PORES_MODEL_PATH}"
            )
            
            # Load UV Spots Detection model
            logger.info("📦 Loading UV Spots Detection model...")
            self.uv_spots_model = UVSpotDetector(self.device)
            await self.uv_spots_model.load_model(
                f"{settings.MODELS_DIR}/uv_spots_model.pth"
            )
            
            # Load Brown Spots Detection model
            logger.info("📦 Loading Brown Spots Detection model...")
            self.brown_spots_model = BrownSpotDetector(self.device)
            await self.brown_spots_model.load_model(
                f"{settings.MODELS_DIR}/brown_spots_model.pth"
            )
            
            # Load Red Areas Detection model
            logger.info("📦 Loading Red Areas Detection model...")
            self.red_areas_model = RedAreaDetector(self.device)
            await self.red_areas_model.load_model(
                f"{settings.MODELS_DIR}/red_areas_model.pth"
            )
            
            # Load Porphyrins Detection model
            logger.info("📦 Loading Porphyrins Detection model...")
            self.porphyrins_model = PorphyrinDetector(self.device)
            await self.porphyrins_model.load_model(
                f"{settings.MODELS_DIR}/porphyrins_model.pth"
            )
            
            self.is_loaded = True
            logger.info("✅ All 8 models loaded successfully!")
            
        except Exception as e:
            logger.error(f"❌ Error loading models: {e}")
            raise
    
    def get_spot_model(self) -> SpotDetector:
        """Get spots detection model"""
        if not self.spots_model:
            raise RuntimeError("Spots model not loaded")
        return self.spots_model
    
    def get_wrinkle_model(self) -> WrinkleDetector:
        """Get wrinkles detection model"""
        if not self.wrinkles_model:
            raise RuntimeError("Wrinkles model not loaded")
        return self.wrinkles_model
    
    def get_texture_model(self) -> TextureAnalyzer:
        """Get texture analysis model"""
        if not self.texture_model:
            raise RuntimeError("Texture model not loaded")
        return self.texture_model
    
    def get_pores_model(self) -> PoresDetector:
        """Get pores detection model"""
        if not self.pores_model:
            raise RuntimeError("Pores model not loaded")
        return self.pores_model
    
    def get_uv_spots_model(self) -> UVSpotDetector:
        """Get UV spots detection model"""
        if not self.uv_spots_model:
            raise RuntimeError("UV spots model not loaded")
        return self.uv_spots_model
    
    def get_brown_spots_model(self) -> BrownSpotDetector:
        """Get brown spots detection model"""
        if not self.brown_spots_model:
            raise RuntimeError("Brown spots model not loaded")
        return self.brown_spots_model
    
    def get_red_areas_model(self) -> RedAreaDetector:
        """Get red areas detection model"""
        if not self.red_areas_model:
            raise RuntimeError("Red areas model not loaded")
        return self.red_areas_model
    
    def get_porphyrins_model(self) -> PorphyrinDetector:
        """Get porphyrins detection model"""
        if not self.porphyrins_model:
            raise RuntimeError("Porphyrins model not loaded")
        return self.porphyrins_model
