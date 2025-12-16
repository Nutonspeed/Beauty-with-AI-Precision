"""
Schemas module initialization
"""
from .analysis import (
    SeverityLevel,
    DetectionBox,
    AnalysisStatistics,
    ImageDimensions,
    SpotsAnalysisResponse,
    WrinklesAnalysisResponse,
    TextureAnalysisResponse,
    PoresAnalysisResponse,
    MultiModeAnalysisResponse,
    ErrorResponse
)

__all__ = [
    'SeverityLevel',
    'DetectionBox',
    'AnalysisStatistics',
    'ImageDimensions',
    'SpotsAnalysisResponse',
    'WrinklesAnalysisResponse',
    'TextureAnalysisResponse',
    'PoresAnalysisResponse',
    'MultiModeAnalysisResponse',
    'ErrorResponse'
]
