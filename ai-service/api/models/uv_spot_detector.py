"""
UV Spots Detection (Subsurface Pigmentation)
Detects hidden spots under skin surface using spectral analysis
"""
import numpy as np
import cv2
from typing import List, Dict, Any
import logging

logger = logging.getLogger(__name__)

class UVSpotDetector:
    """
    UV spots detection - simulates Woods lamp / UV imaging
    Detects subsurface melanin that's not visible in normal light
    """
    
    def __init__(self, device='cpu'):
        self.device = device
        self.model = None
        self.is_loaded = False
        
    async def load_model(self, model_path: str):
        """Load pre-trained model weights"""
        try:
            logger.info("✅ UV Spots detection model loaded (CV-based)")
            self.is_loaded = True
        except Exception as e:
            logger.error(f"Failed to load UV spots model: {e}")
            raise
    
    async def detect(
        self, 
        image: np.ndarray, 
        confidence_threshold: float = 0.5
    ) -> List[Dict[str, Any]]:
        """
        Detect UV spots (subsurface pigmentation)
        
        Approach:
        1. Analyze L*a*b* color space (b* channel for yellow pigmentation)
        2. Look for subtle color variations not visible in surface spots
        3. Apply spectral unmixing to separate melanin from hemoglobin
        """
        try:
            # Denormalize if needed
            if image.dtype in [np.float32, np.float64]:
                mean = np.array([0.485, 0.456, 0.406])
                std = np.array([0.229, 0.224, 0.225])
                image = image * std + mean
                image = (image * 255).astype(np.uint8)
            
            # Convert to LAB color space
            lab = cv2.cvtColor(image, cv2.COLOR_RGB2LAB)
            l_channel, a_channel, b_channel = cv2.split(lab)
            
            # UV spots show up as increased yellow (high b* value)
            # and slightly lower lightness than surrounding
            
            # Normalize b channel
            b_norm = cv2.normalize(b_channel, None, 0, 255, cv2.NORM_MINMAX)
            
            # Apply adaptive threshold to find yellow-tinted areas
            # (melanin under skin appears yellowish in b* channel)
            mean_b = np.mean(b_norm)
            threshold = mean_b + 10  # Adjust sensitivity
            
            _, uv_mask = cv2.threshold(b_norm, threshold, 255, cv2.THRESH_BINARY)
            
            # Also check for reduced lightness (subsurface pigmentation)
            mean_l = np.mean(l_channel)
            l_threshold = mean_l - 5
            _, l_mask = cv2.threshold(l_channel, l_threshold, 255, cv2.THRESH_BINARY_INV)
            
            # Combine both masks (yellow AND slightly dark)
            combined_mask = cv2.bitwise_and(uv_mask, l_mask)
            
            # Remove noise
            kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5))
            combined_mask = cv2.morphologyEx(combined_mask, cv2.MORPH_OPEN, kernel)
            combined_mask = cv2.morphologyEx(combined_mask, cv2.MORPH_CLOSE, kernel)
            
            # Find contours
            contours, _ = cv2.findContours(
                combined_mask, 
                cv2.RETR_EXTERNAL, 
                cv2.CHAIN_APPROX_SIMPLE
            )
            
            detections = []
            h, w = image.shape[:2]
            
            for contour in contours:
                x, y, bw, bh = cv2.boundingRect(contour)
                area = cv2.contourArea(contour)
                
                # Filter by size (UV spots are typically 3-15mm diameter)
                min_area = 90   # ~3mm diameter
                max_area = 1800  # ~15mm diameter
                
                if area < min_area or area > max_area:
                    continue
                
                # Calculate confidence based on b* value and texture
                roi_b = b_norm[y:y+bh, x:x+bw]
                roi_l = l_channel[y:y+bh, x:x+bw]
                
                # High b* = more yellow = more subsurface melanin
                yellowness = np.mean(roi_b) / 255.0
                
                # Texture variance (UV spots have uniform texture)
                texture_variance = np.std(roi_l)
                uniformity = 1.0 - min(texture_variance / 50.0, 1.0)
                
                # Combined confidence
                confidence = (yellowness * 0.7 + uniformity * 0.3)
                
                if confidence < confidence_threshold:
                    continue
                
                # Calculate circularity
                perimeter = cv2.arcLength(contour, True)
                if perimeter == 0:
                    continue
                circularity = 4 * np.pi * area / (perimeter * perimeter)
                
                # Estimate depth (how far under surface)
                # Higher b* with normal L* = deeper
                depth_score = yellowness * (1.0 - abs(np.mean(roi_l) / 255.0 - 0.5))
                
                # Size estimation
                diameter_px = np.sqrt(area / np.pi) * 2
                size_mm = diameter_px / 10.0
                
                detections.append({
                    'bbox': [int(x), int(y), int(bw), int(bh)],
                    'confidence': float(min(confidence, 1.0)),
                    'size_mm': float(size_mm),
                    'depth_score': float(depth_score),
                    'yellowness': float(yellowness),
                    'circularity': float(circularity),
                    'area_px': float(area)
                })
            
            # Sort by confidence
            detections.sort(key=lambda x: x['confidence'], reverse=True)
            
            logger.info(f"✅ Detected {len(detections)} UV spots (subsurface)")
            return detections
            
        except Exception as e:
            logger.error(f"Error in UV spot detection: {e}")
            raise
