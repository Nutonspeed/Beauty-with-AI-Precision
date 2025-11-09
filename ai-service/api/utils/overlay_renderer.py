"""
Professional Overlay Rendering for 8-Mode Analysis
Creates VISIA-style visualizations with colored markers, lines, and heatmaps
"""
import cv2
import numpy as np
from typing import List, Dict, Any, Tuple, Optional
import logging

logger = logging.getLogger(__name__)


class OverlayRenderer:
    """
    Renders professional-grade analysis overlays matching VISIA equipment
    
    Features:
    - Colored dots for spots (yellow=UV, brown=surface, red=inflammation, orange=bacteria)
    - Lines for wrinkles with thickness indicating depth
    - Heatmaps for texture and redness
    - Detection numbering and confidence indicators
    - Professional color schemes and styling
    """
    
    # Color schemes (BGR format for OpenCV)
    COLORS = {
        'spots': (147, 20, 255),        # Pink/Magenta for general spots
        'uv_spots': (0, 255, 255),      # Yellow for UV spots (subsurface)
        'brown_spots': (42, 42, 165),   # Brown for surface pigmentation
        'red_areas': (0, 0, 255),       # Red for inflammation
        'porphyrins': (0, 165, 255),    # Orange for bacterial fluorescence
        'wrinkles': (255, 0, 255),      # Magenta for wrinkles
        'pores': (255, 255, 0),         # Cyan for pores
        'text': (255, 255, 255),        # White for text
        'text_bg': (0, 0, 0),           # Black for text background
        'marker_border': (255, 255, 255), # White border for markers
    }
    
    def __init__(self, image: np.ndarray):
        """
        Initialize renderer with base image
        
        Args:
            image: Base image (RGB format)
        """
        # Convert RGB to BGR for OpenCV
        self.image = cv2.cvtColor(image, cv2.COLOR_RGB2BGR)
        self.height, self.width = self.image.shape[:2]
        self.overlay = self.image.copy()
        
    def draw_spots(
        self, 
        detections: List[Dict[str, Any]], 
        spot_type: str = 'spots',
        show_numbers: bool = True,
        show_confidence: bool = False
    ) -> 'OverlayRenderer':
        """
        Draw spot detections with colored circular markers
        
        Args:
            detections: List of detection dicts with 'bbox' and 'confidence'
            spot_type: Type of spots ('spots', 'uv_spots', 'brown_spots', 'porphyrins')
            show_numbers: Show detection numbers
            show_confidence: Show confidence scores
            
        Returns:
            Self for method chaining
        """
        color = self.COLORS.get(spot_type, self.COLORS['spots'])
        
        for i, det in enumerate(detections, 1):
            bbox = det['bbox']
            confidence = det.get('confidence', 0)
            
            # Calculate center point
            x, y, w, h = bbox
            center_x = int(x + w / 2)
            center_y = int(y + h / 2)
            
            # Calculate radius based on size (with minimum and maximum)
            radius = int(max(min(w, h) / 2, 3))
            radius = min(radius, 20)  # Cap at 20 pixels
            
            # Draw outer white border
            cv2.circle(self.overlay, (center_x, center_y), radius + 2, 
                      self.COLORS['marker_border'], 2)
            
            # Draw filled circle with transparency
            overlay_temp = self.overlay.copy()
            cv2.circle(overlay_temp, (center_x, center_y), radius, color, -1)
            cv2.addWeighted(overlay_temp, 0.6, self.overlay, 0.4, 0, self.overlay)
            
            # Draw circle outline
            cv2.circle(self.overlay, (center_x, center_y), radius, color, 2)
            
            # Add small center dot for precision
            cv2.circle(self.overlay, (center_x, center_y), 2, 
                      self.COLORS['marker_border'], -1)
            
            # Draw detection number
            if show_numbers:
                self._draw_label(center_x, center_y - radius - 8, str(i), 
                               bg_color=color, font_scale=0.4)
            
            # Draw confidence badge (optional)
            if show_confidence:
                conf_text = f"{confidence:.0%}"
                self._draw_label(center_x, center_y + radius + 12, conf_text,
                               bg_color=color, font_scale=0.3)
        
        return self
    
    def draw_wrinkles(
        self, 
        detections: List[Dict[str, Any]],
        show_numbers: bool = True
    ) -> 'OverlayRenderer':
        """
        Draw wrinkle detections as lines with varying thickness
        
        Args:
            detections: List of wrinkle detections with 'points' or 'bbox'
            show_numbers: Show detection numbers
            
        Returns:
            Self for method chaining
        """
        color = self.COLORS['wrinkles']
        
        for i, det in enumerate(detections, 1):
            confidence = det.get('confidence', 0)
            
            # Get line coordinates
            if 'points' in det:
                # Use actual line points if available
                points = det['points']
                pts = np.array(points, dtype=np.int32)
            else:
                # Fallback: draw line across bbox
                bbox = det['bbox']
                x, y, w, h = bbox
                pts = np.array([[x, y + h//2], [x + w, y + h//2]], dtype=np.int32)
            
            # Determine line thickness based on confidence or severity
            thickness = max(1, int(confidence * 4)) if confidence > 0 else 2
            
            # Draw white outline
            cv2.polylines(self.overlay, [pts], False, 
                         self.COLORS['marker_border'], thickness + 2)
            
            # Draw magenta line
            cv2.polylines(self.overlay, [pts], False, color, thickness)
            
            # Draw small circles at line ends
            if len(pts) > 0:
                cv2.circle(self.overlay, tuple(pts[0]), 3, color, -1)
                cv2.circle(self.overlay, tuple(pts[-1]), 3, color, -1)
            
            # Add detection number near midpoint
            if show_numbers and len(pts) > 0:
                mid_idx = len(pts) // 2
                mid_x, mid_y = pts[mid_idx]
                self._draw_label(mid_x, mid_y - 10, str(i), 
                               bg_color=color, font_scale=0.4)
        
        return self
    
    def draw_pores(
        self, 
        detections: List[Dict[str, Any]],
        show_numbers: bool = False  # Usually too many to number
    ) -> 'OverlayRenderer':
        """
        Draw pore detections as small circular markers
        
        Args:
            detections: List of pore detections
            show_numbers: Show detection numbers (usually False for pores)
            
        Returns:
            Self for method chaining
        """
        color = self.COLORS['pores']
        
        for i, det in enumerate(detections, 1):
            bbox = det['bbox']
            
            # Calculate center point
            x, y, w, h = bbox
            center_x = int(x + w / 2)
            center_y = int(y + h / 2)
            
            # Small radius for pores (2-4 pixels)
            radius = max(2, int(min(w, h) / 3))
            
            # Draw small circle with slight transparency
            overlay_temp = self.overlay.copy()
            cv2.circle(overlay_temp, (center_x, center_y), radius, color, -1)
            cv2.addWeighted(overlay_temp, 0.5, self.overlay, 0.5, 0, self.overlay)
            
            # Draw outline
            cv2.circle(self.overlay, (center_x, center_y), radius, color, 1)
        
        return self
    
    def draw_heatmap_overlay(
        self, 
        heatmap: np.ndarray,
        alpha: float = 0.5,
        colormap: int = cv2.COLORMAP_JET
    ) -> 'OverlayRenderer':
        """
        Overlay heatmap (for texture or redness analysis)
        
        Args:
            heatmap: Grayscale heatmap (0-255)
            alpha: Transparency (0=invisible, 1=opaque)
            colormap: OpenCV colormap (COLORMAP_JET for red->yellow->green)
            
        Returns:
            Self for method chaining
        """
        if heatmap is None or heatmap.size == 0:
            return self
        
        # Ensure heatmap matches overlay size
        if heatmap.shape[:2] != (self.height, self.width):
            heatmap = cv2.resize(heatmap, (self.width, self.height))
        
        # Convert to uint8 if needed
        if heatmap.dtype != np.uint8:
            heatmap = np.clip(heatmap * 255, 0, 255).astype(np.uint8)
        
        # Apply colormap
        colored_heatmap = cv2.applyColorMap(heatmap, colormap)
        
        # Blend with overlay
        cv2.addWeighted(colored_heatmap, alpha, self.overlay, 1 - alpha, 0, self.overlay)
        
        return self
    
    def draw_bounding_boxes(
        self,
        detections: List[Dict[str, Any]],
        color: Tuple[int, int, int] = None,
        label_key: str = 'type',
        show_confidence: bool = True
    ) -> 'OverlayRenderer':
        """
        Draw simple bounding boxes (generic utility)
        
        Args:
            detections: List of detections with 'bbox'
            color: Box color (BGR), None for auto
            label_key: Key for label text
            show_confidence: Show confidence scores
            
        Returns:
            Self for method chaining
        """
        if color is None:
            color = self.COLORS['spots']
        
        for det in detections:
            bbox = det['bbox']
            x, y, w, h = [int(v) for v in bbox]
            
            # Draw rectangle
            cv2.rectangle(self.overlay, (x, y), (x + w, y + h), color, 2)
            
            # Draw label
            label = det.get(label_key, '')
            if show_confidence and 'confidence' in det:
                label = f"{label} {det['confidence']:.0%}"
            
            if label:
                self._draw_label(x, y - 5, label, bg_color=color)
        
        return self
    
    def draw_legend(
        self,
        modes: List[str],
        counts: Dict[str, int],
        position: str = 'top-right'
    ) -> 'OverlayRenderer':
        """
        Draw legend showing detection counts for each mode
        
        Args:
            modes: List of mode names
            counts: Dictionary of mode -> count
            position: 'top-right', 'top-left', 'bottom-right', 'bottom-left'
            
        Returns:
            Self for method chaining
        """
        padding = 10
        line_height = 25
        box_width = 180
        box_height = len(modes) * line_height + 2 * padding
        
        # Determine position
        if position == 'top-right':
            x, y = self.width - box_width - 10, 10
        elif position == 'top-left':
            x, y = 10, 10
        elif position == 'bottom-right':
            x, y = self.width - box_width - 10, self.height - box_height - 10
        else:  # bottom-left
            x, y = 10, self.height - box_height - 10
        
        # Draw semi-transparent background
        overlay_temp = self.overlay.copy()
        cv2.rectangle(overlay_temp, (x, y), (x + box_width, y + box_height),
                     (0, 0, 0), -1)
        cv2.addWeighted(overlay_temp, 0.7, self.overlay, 0.3, 0, self.overlay)
        
        # Draw border
        cv2.rectangle(self.overlay, (x, y), (x + box_width, y + box_height),
                     (255, 255, 255), 2)
        
        # Draw legend items
        for i, mode in enumerate(modes):
            item_y = y + padding + i * line_height + 15
            
            # Draw colored circle
            color = self.COLORS.get(mode, self.COLORS['spots'])
            cv2.circle(self.overlay, (x + 15, item_y - 5), 6, color, -1)
            cv2.circle(self.overlay, (x + 15, item_y - 5), 6, (255, 255, 255), 1)
            
            # Draw text
            count = counts.get(mode, 0)
            text = f"{mode.replace('_', ' ').title()}: {count}"
            cv2.putText(self.overlay, text, (x + 30, item_y),
                       cv2.FONT_HERSHEY_SIMPLEX, 0.4, (255, 255, 255), 1)
        
        return self
    
    def draw_stats_panel(
        self,
        stats: Dict[str, Any],
        position: str = 'top-left'
    ) -> 'OverlayRenderer':
        """
        Draw statistics panel with overall scores
        
        Args:
            stats: Dictionary of statistics to display
            position: Panel position
            
        Returns:
            Self for method chaining
        """
        padding = 15
        line_height = 30
        box_width = 250
        title_height = 40
        box_height = len(stats) * line_height + title_height + 2 * padding
        
        # Determine position
        if position == 'top-left':
            x, y = 10, 10
        elif position == 'top-right':
            x, y = self.width - box_width - 10, 10
        elif position == 'bottom-left':
            x, y = 10, self.height - box_height - 10
        else:  # bottom-right
            x, y = self.width - box_width - 10, self.height - box_height - 10
        
        # Draw background
        overlay_temp = self.overlay.copy()
        cv2.rectangle(overlay_temp, (x, y), (x + box_width, y + box_height),
                     (30, 30, 30), -1)
        cv2.addWeighted(overlay_temp, 0.85, self.overlay, 0.15, 0, self.overlay)
        
        # Draw border
        cv2.rectangle(self.overlay, (x, y), (x + box_width, y + box_height),
                     (100, 200, 255), 3)
        
        # Draw title
        title_y = y + padding + 25
        cv2.putText(self.overlay, "ANALYSIS RESULTS", 
                   (x + padding, title_y),
                   cv2.FONT_HERSHEY_SIMPLEX, 0.6, (100, 200, 255), 2)
        
        # Draw stats
        for i, (key, value) in enumerate(stats.items()):
            stat_y = y + title_height + padding + i * line_height + 18
            
            # Format key and value
            key_text = key.replace('_', ' ').title()
            if isinstance(value, float):
                value_text = f"{value:.1f}"
            else:
                value_text = str(value)
            
            # Draw key
            cv2.putText(self.overlay, f"{key_text}:", 
                       (x + padding, stat_y),
                       cv2.FONT_HERSHEY_SIMPLEX, 0.45, (200, 200, 200), 1)
            
            # Draw value (aligned right)
            value_size = cv2.getTextSize(value_text, cv2.FONT_HERSHEY_SIMPLEX, 
                                        0.5, 2)[0]
            value_x = x + box_width - padding - value_size[0]
            cv2.putText(self.overlay, value_text, 
                       (value_x, stat_y),
                       cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 2)
        
        return self
    
    def _draw_label(
        self,
        x: int,
        y: int,
        text: str,
        bg_color: Tuple[int, int, int],
        font_scale: float = 0.4,
        thickness: int = 1
    ) -> None:
        """
        Draw text label with background
        
        Args:
            x, y: Position
            text: Label text
            bg_color: Background color (BGR)
            font_scale: Font size multiplier
            thickness: Text thickness
        """
        font = cv2.FONT_HERSHEY_SIMPLEX
        
        # Get text size
        (text_width, text_height), baseline = cv2.getTextSize(
            text, font, font_scale, thickness
        )
        
        # Draw background rectangle
        padding = 3
        cv2.rectangle(
            self.overlay,
            (x - padding, y - text_height - padding),
            (x + text_width + padding, y + baseline + padding),
            bg_color,
            -1
        )
        
        # Draw text
        cv2.putText(
            self.overlay,
            text,
            (x, y),
            font,
            font_scale,
            self.COLORS['text'],
            thickness,
            cv2.LINE_AA
        )
    
    def get_result(self, format: str = 'RGB') -> np.ndarray:
        """
        Get final rendered overlay image
        
        Args:
            format: Output format ('RGB' or 'BGR')
            
        Returns:
            Rendered image
        """
        if format == 'RGB':
            return cv2.cvtColor(self.overlay, cv2.COLOR_BGR2RGB)
        return self.overlay


def create_multimode_visualization(
    image: np.ndarray,
    results: Dict[str, Any],
    show_legend: bool = True,
    show_stats: bool = True
) -> np.ndarray:
    """
    Create comprehensive visualization for multi-mode analysis
    
    Args:
        image: Original image (RGB)
        results: Multi-mode analysis results
        show_legend: Show detection count legend
        show_stats: Show statistics panel
        
    Returns:
        Annotated image (RGB)
    """
    renderer = OverlayRenderer(image)
    
    # Draw each mode's detections
    if 'spots' in results and results['spots'].get('detections'):
        renderer.draw_spots(results['spots']['detections'], 'spots', show_numbers=True)
    
    if 'uv_spots' in results and results['uv_spots']:
        uv_dets = results['uv_spots'].get('detections', [])
        if uv_dets:
            renderer.draw_spots(uv_dets, 'uv_spots', show_numbers=True)
    
    if 'brown_spots' in results and results['brown_spots']:
        brown_dets = results['brown_spots'].get('detections', [])
        if brown_dets:
            renderer.draw_spots(brown_dets, 'brown_spots', show_numbers=True)
    
    if 'porphyrins' in results and results['porphyrins']:
        porph_dets = results['porphyrins'].get('detections', [])
        if porph_dets:
            renderer.draw_spots(porph_dets, 'porphyrins', show_numbers=True)
    
    if 'wrinkles' in results and results['wrinkles'].get('detections'):
        renderer.draw_wrinkles(results['wrinkles']['detections'], show_numbers=True)
    
    if 'pores' in results and results['pores'].get('detections'):
        renderer.draw_pores(results['pores']['detections'], show_numbers=False)
    
    # Draw heatmap for red areas (if available)
    if 'red_areas' in results and results['red_areas']:
        if 'heatmap_base64' in results['red_areas'] and results['red_areas']['heatmap_base64']:
            # Heatmap already included in red_areas response
            pass
    
    # Draw legend
    if show_legend:
        counts = {}
        modes = []
        
        if 'spots' in results:
            modes.append('spots')
            counts['spots'] = results['spots']['statistics']['total_count']
        if 'uv_spots' in results and results['uv_spots']:
            modes.append('uv_spots')
            counts['uv_spots'] = results['uv_spots']['statistics']['total_count']
        if 'brown_spots' in results and results['brown_spots']:
            modes.append('brown_spots')
            counts['brown_spots'] = results['brown_spots']['statistics']['total_count']
        if 'wrinkles' in results:
            modes.append('wrinkles')
            counts['wrinkles'] = results['wrinkles']['statistics']['total_count']
        if 'pores' in results:
            modes.append('pores')
            counts['pores'] = results['pores']['statistics']['total_count']
        if 'porphyrins' in results and results['porphyrins']:
            modes.append('porphyrins')
            counts['porphyrins'] = results['porphyrins']['statistics']['total_count']
        
        if modes:
            renderer.draw_legend(modes, counts, position='top-right')
    
    # Draw stats panel
    if show_stats and 'overall_score' in results:
        stats = {
            'Overall Score': results['overall_score'],
            'Processing Time': f"{results.get('processing_time_ms', 0):.0f}ms"
        }
        renderer.draw_stats_panel(stats, position='bottom-left')
    
    return renderer.get_result('RGB')
