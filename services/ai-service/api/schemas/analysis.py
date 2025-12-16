"""
Pydantic schemas for API requests and responses
"""
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from enum import Enum

class SeverityLevel(str, Enum):
    """Severity levels for skin conditions"""
    MILD = "mild"
    MODERATE = "moderate"
    SEVERE = "severe"


class DetectionBox(BaseModel):
    """Single detection bounding box"""
    id: int
    type: str
    bbox: List[float] = Field(..., description="[x, y, width, height] in pixels")
    confidence: float = Field(..., ge=0.0, le=1.0)
    size_mm: Optional[float] = Field(None, description="Estimated size in millimeters")
    melanin_density: Optional[float] = Field(None, ge=0.0, le=1.0)


class AnalysisStatistics(BaseModel):
    """Statistical summary of analysis"""
    total_count: int
    average_confidence: float = Field(..., ge=0.0, le=1.0)
    severity_score: float = Field(..., ge=0.0, le=100.0)
    severity_level: SeverityLevel


class ImageDimensions(BaseModel):
    """Image dimensions"""
    width: int
    height: int


class SpotsAnalysisResponse(BaseModel):
    """Response for spots detection analysis"""
    success: bool
    analysis_type: str = "spots"
    detections: List[DetectionBox]
    statistics: AnalysisStatistics
    image_dimensions: ImageDimensions
    processing_time_ms: Optional[float] = None


class WrinklesAnalysisResponse(BaseModel):
    """Response for wrinkles detection analysis"""
    success: bool
    analysis_type: str = "wrinkles"
    detections: List[Dict[str, Any]]
    statistics: AnalysisStatistics
    image_dimensions: ImageDimensions
    processing_time_ms: Optional[float] = None


class TextureAnalysisResponse(BaseModel):
    """Response for texture analysis"""
    success: bool
    analysis_type: str = "texture"
    metrics: Dict[str, float]
    smoothness_score: float = Field(..., ge=0.0, le=100.0)
    roughness_score: float = Field(..., ge=0.0, le=100.0)
    image_dimensions: ImageDimensions
    processing_time_ms: Optional[float] = None


class PoresAnalysisResponse(BaseModel):
    """Response for pores detection analysis"""
    success: bool
    analysis_type: str = "pores"
    detections: List[DetectionBox]
    statistics: AnalysisStatistics
    density_map: Optional[str] = Field(None, description="Base64 encoded heatmap")
    image_dimensions: ImageDimensions
    processing_time_ms: Optional[float] = None


class MultiModeAnalysisResponse(BaseModel):
    """Response for multi-mode analysis (all 8 modes)"""
    success: bool
    analysis_type: str = "multi_mode"
    spots: SpotsAnalysisResponse
    wrinkles: WrinklesAnalysisResponse
    texture: TextureAnalysisResponse
    pores: PoresAnalysisResponse
    uv_spots: Optional[SpotsAnalysisResponse] = None
    brown_spots: Optional[SpotsAnalysisResponse] = None
    red_areas: Optional[Dict[str, Any]] = None
    porphyrins: Optional[Dict[str, Any]] = None
    overall_score: float = Field(..., ge=0.0, le=100.0)
    processing_time_ms: float


class ErrorResponse(BaseModel):
    """Error response"""
    success: bool = False
    error: str
    detail: Optional[str] = None
