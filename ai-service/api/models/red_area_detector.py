"""
Red Areas Detection (Redness/Inflammation Mapping)
Detects rosacea, inflammation, blood vessel visibility
"""
import numpy as np
import cv2
from typing import List, Dict, Any, Tuple
import logging

logger = logging.getLogger(__name__)

class RedAreaDetector:
    """
    Red areas detection - identifies inflammation, redness, rosacea
    Creates heatmap-style visualization like VISIA
    """
    
    def __init__(self, device='cpu'):
        self.device = device
        self.model = None
        self.is_loaded = False
        
    async def load_model(self, model_path: str):
        """Load pre-trained model weights"""
        try:
            logger.info("✅ Red Areas detection model loaded (CV-based)")
            self.is_loaded = True
        except Exception as e:
            logger.error(f"Failed to load red areas model: {e}")
            raise
    
    def _calculate_redness_index(self, image: np.ndarray) -> np.ndarray:
        """
        Calculate redness index for each pixel
        Uses erythema index: EI = (R - G) / sqrt(G)
        """
        r = image[:, :, 0].astype(np.float32)
        g = image[:, :, 1].astype(np.float32)
        
        # Avoid division by zero
        g_safe = np.where(g < 1, 1, g)
        
        # Erythema Index
        ei = (r - g) / np.sqrt(g_safe)
        
        # Normalize to 0-1 range
        ei_min, ei_max = np.min(ei), np.max(ei)
        if ei_max > ei_min:
            ei_norm = (ei - ei_min) / (ei_max - ei_min)
        else:
            ei_norm = np.zeros_like(ei)
        
        return ei_norm
    
    async def detect(
        self, 
        image: np.ndarray, 
        confidence_threshold: float = 0.5
    ) -> Tuple[List[Dict[str, Any]], np.ndarray]:
        """
        Detect red areas and generate heatmap
        
        Returns:
            (detections, heatmap): List of red area boxes and redness heatmap
        """
        try:
            # Denormalize if needed
            if image.dtype in [np.float32, np.float64]:
                mean = np.array([0.485, 0.456, 0.406])
                std = np.array([0.229, 0.224, 0.225])
                image = image * std + mean
                image = (image * 255).astype(np.uint8)
            
            # Calculate redness index
            redness_map = self._calculate_redness_index(image)
            
            # Convert to multiple color spaces
            hsv = cv2.cvtColor(image, cv2.COLOR_RGB2HSV)
            lab = cv2.cvtColor(image, cv2.COLOR_RGB2LAB)
            
            h_channel, s_channel, v_channel = cv2.split(hsv)
            l_channel, a_channel, b_channel = cv2.split(lab)
            
            # Red detection in HSV space
            # Red hue: 0-10 and 160-180 in OpenCV HSV (0-180 range)
            lower_red1 = np.array([0, 40, 40])
            upper_red1 = np.array([10, 255, 255])
            mask_red1 = cv2.inRange(hsv, lower_red1, upper_red1)
            
            lower_red2 = np.array([160, 40, 40])
            upper_red2 = np.array([180, 255, 255])
            mask_red2 = cv2.inRange(hsv, lower_red2, upper_red2)
            
            red_mask = cv2.bitwise_or(mask_red1, mask_red2)
            
            # Also use a* channel in LAB (positive a* = redness)
            a_norm = cv2.normalize(a_channel, None, 0, 255, cv2.NORM_MINMAX)
            _, a_mask = cv2.threshold(a_norm, 140, 255, cv2.THRESH_BINARY)
            
            # Combine redness from different methods
            # Method 1: HSV red hue
            # Method 2: LAB a* channel
            # Method 3: Erythema Index
            redness_threshold = 0.3  # Adjust sensitivity
            _, ei_mask = cv2.threshold(
                (redness_map * 255).astype(np.uint8), 
                int(redness_threshold * 255), 
                255, 
                cv2.THRESH_BINARY
            )
            
            # Combine all masks
            combined_mask = cv2.bitwise_or(red_mask, a_mask)
            combined_mask = cv2.bitwise_or(combined_mask, ei_mask)
            
            # Remove noise and small artifacts
            kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (7, 7))
            combined_mask = cv2.morphologyEx(combined_mask, cv2.MORPH_OPEN, kernel)
            combined_mask = cv2.morphologyEx(combined_mask, cv2.MORPH_CLOSE, kernel, iterations=2)
            
            # Generate smooth heatmap
            redness_heatmap = cv2.GaussianBlur(
                (redness_map * 255).astype(np.uint8), 
                (21, 21), 
                0
            )
            
            # Apply colormap for visualization (like VISIA)
            heatmap_colored = cv2.applyColorMap(redness_heatmap, cv2.COLORMAP_JET)
            
            # Find contours for discrete areas
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
                
                # Filter by size (red areas: 5-50mm diameter)
                min_area = 250   # ~5mm diameter
                max_area = 20000  # ~50mm diameter (large patches)
                
                if area < min_area or area > max_area:
                    continue
                
                # Analyze ROI
                roi_redness = redness_map[y:y+bh, x:x+bw]
                roi_h = h_channel[y:y+bh, x:x+bw]
                roi_s = s_channel[y:y+bh, x:x+bw]
                roi_a = a_channel[y:y+bh, x:x+bw]
                
                # Calculate redness intensity
                mean_redness = np.mean(roi_redness)
                max_redness = np.max(roi_redness)
                
                # Calculate red color purity
                mean_h = np.mean(roi_h)
                mean_s = np.mean(roi_s)
                mean_a = np.mean(roi_a)
                
                # Red hue score (0-10 or 170-180 is red)
                if mean_h <= 10:
                    hue_score = 1.0 - (mean_h / 10.0)
                elif mean_h >= 170:
                    hue_score = (mean_h - 170) / 10.0
                else:
                    hue_score = 0.0
                
                # Saturation score
                saturation_score = min(mean_s / 150.0, 1.0)
                
                # a* score (redness in LAB)
                a_score = (mean_a - 128) / 127.0  # Normalize to 0-1
                a_score = max(0, min(1, a_score))
                
                # Combined confidence
                confidence = (
                    mean_redness * 0.40 + 
                    hue_score * 0.25 + 
                    saturation_score * 0.20 + 
                    a_score * 0.15
                )
                
                if confidence < confidence_threshold:
                    continue
                
                # Size estimation
                diameter_px = np.sqrt(area / np.pi) * 2
                size_mm = diameter_px / 10.0
                
                # Severity classification
                if mean_redness > 0.7:
                    severity = 'severe'
                    severity_score = 8.0 + (mean_redness - 0.7) * 6.67
                elif mean_redness > 0.5:
                    severity = 'moderate'
                    severity_score = 5.0 + (mean_redness - 0.5) * 15.0
                else:
                    severity = 'mild'
                    severity_score = mean_redness * 10.0
                
                # Type classification
                if area > 5000:
                    area_type = 'rosacea'  # Large diffuse area
                elif saturation_score > 0.6:
                    area_type = 'inflammation'  # Intense red
                else:
                    area_type = 'capillary'  # Blood vessels
                
                detections.append({
                    'bbox': [int(x), int(y), int(bw), int(bh)],
                    'confidence': float(min(confidence, 1.0)),
                    'size_mm': float(size_mm),
                    'redness_intensity': float(mean_redness),
                    'max_redness': float(max_redness),
                    'severity': severity,
                    'severity_score': float(severity_score),
                    'area_type': area_type,
                    'area_px': float(area)
                })
            
            # Sort by redness intensity
            detections.sort(key=lambda x: x['redness_intensity'], reverse=True)
            
            # Calculate overall redness statistics
            total_red_pixels = np.sum(combined_mask > 0)
            total_pixels = w * h
            coverage_percentage = (total_red_pixels / total_pixels) * 100
            
            logger.info(f"✅ Detected {len(detections)} red areas, {coverage_percentage:.1f}% coverage")
            
            # Return detections and heatmap
            return detections, heatmap_colored
            
        except Exception as e:
            logger.error(f"Error in red area detection: {e}")
            raise
