"""
Brown Spots Detection (Surface Pigmentation)
Detects brown/tan spots, sun damage, age spots, freckles
"""
import numpy as np
import cv2
from typing import List, Dict, Any
import logging

logger = logging.getLogger(__name__)

class BrownSpotDetector:
    """
    Brown spots detection - focuses on surface-level pigmentation
    Differentiates from red areas and regular dark spots
    """
    
    def __init__(self, device='cpu'):
        self.device = device
        self.model = None
        self.is_loaded = False
        
    async def load_model(self, model_path: str):
        """Load pre-trained model weights"""
        try:
            logger.info("✅ Brown Spots detection model loaded (CV-based)")
            self.is_loaded = True
        except Exception as e:
            logger.error(f"Failed to load brown spots model: {e}")
            raise
    
    async def detect(
        self, 
        image: np.ndarray, 
        confidence_threshold: float = 0.5
    ) -> List[Dict[str, Any]]:
        """
        Detect brown spots (surface pigmentation with brown/tan color)
        
        Approach:
        1. HSV color space for brown/tan hue detection
        2. LAB color space for melanin analysis
        3. Filter out red (inflammation) and pure dark (hair/shadows)
        """
        try:
            # Denormalize if needed
            if image.dtype in [np.float32, np.float64]:
                mean = np.array([0.485, 0.456, 0.406])
                std = np.array([0.229, 0.224, 0.225])
                image = image * std + mean
                image = (image * 255).astype(np.uint8)
            
            # Convert to multiple color spaces for better analysis
            hsv = cv2.cvtColor(image, cv2.COLOR_RGB2HSV)
            lab = cv2.cvtColor(image, cv2.COLOR_RGB2LAB)
            ycrcb = cv2.cvtColor(image, cv2.COLOR_RGB2YCrCb)
            
            # Extract channels
            h_channel, s_channel, v_channel = cv2.split(hsv)
            l_channel, a_channel, b_channel = cv2.split(lab)
            y_channel, cr_channel, cb_channel = cv2.split(ycrcb)
            
            # Brown spots characteristics:
            # 1. Hue: 10-30 (orange-brown range in OpenCV HSV where range is 0-180)
            # 2. Lower value (darker)
            # 3. Higher b* in LAB (yellow component)
            # 4. Low a* (not red, not green)
            
            # Create brown color mask
            # Brown hue range in HSV
            lower_brown = np.array([5, 20, 20])    # Light brown
            upper_brown = np.array([25, 255, 200])  # Dark brown
            brown_mask = cv2.inRange(hsv, lower_brown, upper_brown)
            
            # Also include darker areas with brown tint
            lower_dark_brown = np.array([8, 15, 15])
            upper_dark_brown = np.array([28, 255, 150])
            dark_brown_mask = cv2.inRange(hsv, lower_dark_brown, upper_dark_brown)
            
            # Combine masks
            combined_mask = cv2.bitwise_or(brown_mask, dark_brown_mask)
            
            # Exclude red areas (inflammation, not brown spots)
            # Red in HSV: 0-10 or 170-180
            lower_red1 = np.array([0, 50, 50])
            upper_red1 = np.array([10, 255, 255])
            lower_red2 = np.array([160, 50, 50])
            upper_red2 = np.array([180, 255, 255])
            red_mask1 = cv2.inRange(hsv, lower_red1, upper_red1)
            red_mask2 = cv2.inRange(hsv, lower_red2, upper_red2)
            red_mask = cv2.bitwise_or(red_mask1, red_mask2)
            
            # Remove red areas from brown mask
            combined_mask = cv2.bitwise_and(combined_mask, cv2.bitwise_not(red_mask))
            
            # Clean up mask
            kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (3, 3))
            combined_mask = cv2.morphologyEx(combined_mask, cv2.MORPH_OPEN, kernel, iterations=2)
            combined_mask = cv2.morphologyEx(combined_mask, cv2.MORPH_CLOSE, kernel, iterations=2)
            
            # Find contours
            contours, _ = cv2.findContours(
                combined_mask, 
                cv2.RETR_EXTERNAL, 
                cv2.CHAIN_APPROX_SIMPLE
            )
            
            detections = []
            
            for contour in contours:
                x, y, bw, bh = cv2.boundingRect(contour)
                area = cv2.contourArea(contour)
                
                # Filter by size (brown spots: 1-12mm diameter)
                min_area = 10    # ~1mm diameter
                max_area = 1150  # ~12mm diameter
                
                if area < min_area or area > max_area:
                    continue
                
                # Analyze ROI
                roi_hsv = hsv[y:y+bh, x:x+bw]
                roi_lab = lab[y:y+bh, x:x+bw]
                roi_h = h_channel[y:y+bh, x:x+bw]
                roi_s = s_channel[y:y+bh, x:x+bw]
                roi_l = l_channel[y:y+bh, x:x+bw]
                roi_b = b_channel[y:y+bh, x:x+bw]
                
                # Calculate brown color confidence
                mean_h = np.mean(roi_h)
                mean_s = np.mean(roi_s)
                mean_l = np.mean(roi_l)
                mean_b = np.mean(roi_b)
                
                # Brown hue score (10-25 is ideal brown)
                hue_score = 1.0 - min(abs(mean_h - 17.5) / 20.0, 1.0)
                
                # Saturation score (brown spots are moderately saturated)
                saturation_score = min(mean_s / 100.0, 1.0)
                
                # Melanin score (darker L*, higher b*)
                darkness = 1.0 - (mean_l / 255.0)
                yellowness = mean_b / 255.0
                melanin_score = (darkness * 0.5 + yellowness * 0.5)
                
                # Calculate circularity (spots are usually round/oval)
                perimeter = cv2.arcLength(contour, True)
                if perimeter == 0:
                    continue
                circularity = 4 * np.pi * area / (perimeter * perimeter)
                
                # Combined confidence
                confidence = (
                    hue_score * 0.35 + 
                    saturation_score * 0.20 + 
                    melanin_score * 0.30 + 
                    circularity * 0.15
                )
                
                if confidence < confidence_threshold:
                    continue
                
                # Size estimation
                diameter_px = np.sqrt(area / np.pi) * 2
                size_mm = diameter_px / 10.0
                
                # Melanin intensity
                melanin_intensity = darkness * 10.0  # Scale 0-10
                
                # Spot type classification
                if mean_l > 150:
                    spot_type = 'freckle'  # Light brown
                elif mean_l > 100:
                    spot_type = 'age_spot'  # Medium brown
                else:
                    spot_type = 'sun_damage'  # Dark brown
                
                detections.append({
                    'bbox': [int(x), int(y), int(bw), int(bh)],
                    'confidence': float(min(confidence, 1.0)),
                    'size_mm': float(size_mm),
                    'melanin_intensity': float(melanin_intensity),
                    'spot_type': spot_type,
                    'circularity': float(circularity),
                    'hue': float(mean_h),
                    'area_px': float(area)
                })
            
            # Sort by confidence
            detections.sort(key=lambda x: x['confidence'], reverse=True)
            
            logger.info(f"✅ Detected {len(detections)} brown spots")
            return detections
            
        except Exception as e:
            logger.error(f"Error in brown spot detection: {e}")
            raise
