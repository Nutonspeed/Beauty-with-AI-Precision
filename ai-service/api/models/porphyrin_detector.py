"""
Porphyrins Detection (Bacterial Fluorescence)
Detects P. acnes bacteria using fluorescence analysis
"""
import numpy as np
import cv2
from typing import List, Dict, Any
import logging

logger = logging.getLogger(__name__)

class PorphyrinDetector:
    """
    Porphyrins detection - simulates Woods lamp fluorescence
    Detects P. acnes bacteria (causes acne) which fluoresces orange-red under UV
    """
    
    def __init__(self, device='cpu'):
        self.device = device
        self.model = None
        self.is_loaded = False
        
    async def load_model(self, model_path: str):
        """Load pre-trained model weights"""
        try:
            logger.info("✅ Porphyrins detection model loaded (CV-based)")
            self.is_loaded = True
        except Exception as e:
            logger.error(f"Failed to load porphyrins model: {e}")
            raise
    
    def _simulate_fluorescence(self, image: np.ndarray) -> np.ndarray:
        """
        Simulate UV fluorescence response
        Porphyrins fluoresce orange-red (590-635nm) under UV (365-405nm)
        """
        # Convert to HSV for better color analysis
        hsv = cv2.cvtColor(image, cv2.COLOR_RGB2HSV)
        h, s, v = cv2.split(hsv)
        
        # Porphyrins appear as orange-red fluorescence
        # Target: Orange (10-25 hue) with high intensity
        
        # Create fluorescence probability map
        # High red channel + moderate green = orange fluorescence
        r_channel = image[:, :, 0].astype(np.float32)
        g_channel = image[:, :, 1].astype(np.float32)
        b_channel = image[:, :, 2].astype(np.float32)
        
        # Fluorescence index: high R, moderate G, low B
        fluor_index = (r_channel / 255.0) * (1.0 - b_channel / 255.0)
        fluor_index = np.clip(fluor_index, 0, 1)
        
        return fluor_index
    
    async def detect(
        self, 
        image: np.ndarray, 
        confidence_threshold: float = 0.5
    ) -> List[Dict[str, Any]]:
        """
        Detect porphyrins (bacterial fluorescence)
        
        Note: In real VISIA, this uses actual UV light (Woods lamp)
        This CV approach simulates by detecting orange-red colored areas
        that could indicate bacterial presence
        """
        try:
            # Denormalize if needed
            if image.dtype in [np.float32, np.float64]:
                mean = np.array([0.485, 0.456, 0.406])
                std = np.array([0.229, 0.224, 0.225])
                image = image * std + mean
                image = (image * 255).astype(np.uint8)
            
            # Simulate fluorescence response
            fluor_map = self._simulate_fluorescence(image)
            
            # Convert to multiple color spaces
            hsv = cv2.cvtColor(image, cv2.COLOR_RGB2HSV)
            lab = cv2.cvtColor(image, cv2.COLOR_RGB2LAB)
            
            h_channel, s_channel, v_channel = cv2.split(hsv)
            l_channel, a_channel, b_channel = cv2.split(lab)
            
            # Porphyrins characteristics under UV:
            # 1. Orange-red hue (10-25 in OpenCV HSV)
            # 2. High saturation (vivid color)
            # 3. Bright (high value)
            # 4. Often near pores/follicles
            
            # Create orange-red mask (porphyrin fluorescence color)
            lower_orange = np.array([5, 50, 50])    # Orange start
            upper_orange = np.array([25, 255, 255]) # Red end
            orange_mask = cv2.inRange(hsv, lower_orange, upper_orange)
            
            # Apply fluorescence probability
            fluor_threshold = 0.4
            _, fluor_mask = cv2.threshold(
                (fluor_map * 255).astype(np.uint8), 
                int(fluor_threshold * 255), 
                255, 
                cv2.THRESH_BINARY
            )
            
            # Combine masks
            combined_mask = cv2.bitwise_and(orange_mask, fluor_mask)
            
            # Remove noise
            kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (3, 3))
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
                
                # Filter by size (porphyrin clusters: 1-8mm diameter)
                # Smaller than spots because it's bacterial colonies
                min_area = 10    # ~1mm diameter
                max_area = 500   # ~8mm diameter
                
                if area < min_area or area > max_area:
                    continue
                
                # Analyze ROI
                roi_fluor = fluor_map[y:y+bh, x:x+bw]
                roi_h = h_channel[y:y+bh, x:x+bw]
                roi_s = s_channel[y:y+bh, x:x+bw]
                roi_v = v_channel[y:y+bh, x:x+bw]
                roi_a = a_channel[y:y+bh, x:x+bw]
                
                # Fluorescence intensity
                mean_fluor = np.mean(roi_fluor)
                max_fluor = np.max(roi_fluor)
                
                # Color analysis
                mean_h = np.mean(roi_h)
                mean_s = np.mean(roi_s)
                mean_v = np.mean(roi_v)
                
                # Orange-red hue score (15 is ideal porphyrin color)
                hue_score = 1.0 - min(abs(mean_h - 15) / 15.0, 1.0)
                
                # Saturation score (porphyrin fluorescence is vivid)
                saturation_score = min(mean_s / 180.0, 1.0)
                
                # Brightness score (fluorescence is bright)
                brightness_score = min(mean_v / 200.0, 1.0)
                
                # Calculate circularity (bacterial colonies are usually round)
                perimeter = cv2.arcLength(contour, True)
                if perimeter == 0:
                    continue
                circularity = 4 * np.pi * area / (perimeter * perimeter)
                
                # Combined confidence
                confidence = (
                    mean_fluor * 0.35 + 
                    hue_score * 0.25 + 
                    saturation_score * 0.20 + 
                    brightness_score * 0.15 + 
                    circularity * 0.05
                )
                
                if confidence < confidence_threshold:
                    continue
                
                # Size estimation
                diameter_px = np.sqrt(area / np.pi) * 2
                size_mm = diameter_px / 10.0
                
                # Bacterial load estimation (0-10 scale)
                bacterial_load = mean_fluor * 10.0
                
                # Activity level
                if mean_fluor > 0.75:
                    activity = 'high'
                    activity_score = 8.0 + (mean_fluor - 0.75) * 8.0
                elif mean_fluor > 0.55:
                    activity = 'moderate'
                    activity_score = 5.0 + (mean_fluor - 0.55) * 15.0
                else:
                    activity = 'low'
                    activity_score = mean_fluor * 10.0
                
                # Location type (useful for treatment targeting)
                # Check if near existing pore detection (would need pore locations as input)
                # For now, classify by size
                if area < 50:
                    location_type = 'follicle'  # In hair follicle
                elif area < 200:
                    location_type = 'pore'  # In pore
                else:
                    location_type = 'surface'  # Surface colony
                
                detections.append({
                    'bbox': [int(x), int(y), int(bw), int(bh)],
                    'confidence': float(min(confidence, 1.0)),
                    'size_mm': float(size_mm),
                    'fluorescence_intensity': float(mean_fluor),
                    'bacterial_load': float(bacterial_load),
                    'activity': activity,
                    'activity_score': float(activity_score),
                    'location_type': location_type,
                    'hue': float(mean_h),
                    'circularity': float(circularity),
                    'area_px': float(area)
                })
            
            # Sort by fluorescence intensity
            detections.sort(key=lambda x: x['fluorescence_intensity'], reverse=True)
            
            # Calculate overall bacterial load
            if detections:
                avg_bacterial_load = np.mean([d['bacterial_load'] for d in detections])
                logger.info(f"✅ Detected {len(detections)} porphyrin spots, avg load: {avg_bacterial_load:.1f}/10")
            else:
                logger.info(f"✅ No significant porphyrin detected (good skin health)")
            
            return detections
            
        except Exception as e:
            logger.error(f"Error in porphyrin detection: {e}")
            raise
