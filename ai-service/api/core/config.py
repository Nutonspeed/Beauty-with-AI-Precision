"""
Configuration settings for AI Analysis Service
"""
from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    """Application settings"""
    
    # API Settings
    API_TITLE: str = "Beauty AI Analysis Service"
    API_VERSION: str = "1.0.0"
    
    # CORS
    ALLOWED_ORIGINS: str = "http://localhost:3000,http://localhost:3001"
    
    @property
    def allowed_origins_list(self) -> List[str]:
        """Parse ALLOWED_ORIGINS string to list"""
        return [origin.strip() for origin in self.ALLOWED_ORIGINS.split(',')]
    
    # Model Paths
    MODELS_DIR: str = "./ml_models/weights"
    SPOT_MODEL_PATH: str = "spot_detector.pth"
    WRINKLE_MODEL_PATH: str = "wrinkle_detector.pth"
    TEXTURE_MODEL_PATH: str = "texture_analyzer.pth"
    PORES_MODEL_PATH: str = "pores_detector.pth"
    
    # Processing
    MAX_IMAGE_SIZE: int = 2048
    MIN_IMAGE_SIZE: int = 512
    CONFIDENCE_THRESHOLD: float = 0.5
    
    # GPU
    USE_GPU: bool = False
    GPU_DEVICE: int = 0
    
    class Config:
        env_file = ".env"
        case_sensitive = True
        extra = "ignore"  # Ignore extra fields from .env

settings = Settings()
