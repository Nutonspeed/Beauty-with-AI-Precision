"""
Image processing utilities
"""
import cv2
import numpy as np
from typing import Optional, Tuple
import logging

logger = logging.getLogger(__name__)

def decode_image(contents: bytes) -> Optional[np.ndarray]:
    """
    Decode image from bytes
    
    Args:
        contents: Image file bytes
        
    Returns:
        numpy array (RGB) or None if failed
    """
    try:
        nparr = np.frombuffer(contents, np.uint8)
        image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if image is None:
            return None
        
        # Convert BGR to RGB
        image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        return image
        
    except Exception as e:
        logger.error(f"Error decoding image: {e}")
        return None


def preprocess_image(
    image: np.ndarray,
    target_size: int = 1024,
    normalize: bool = True
) -> np.ndarray:
    """
    Preprocess image for ML model inference
    - Resize to target size while maintaining aspect ratio
    - Pad to square
    - Normalize pixel values (ImageNet normalization)
    
    Args:
        image: Input image (RGB)
        target_size: Target size for the longest side
        normalize: Whether to apply ImageNet normalization
        
    Returns:
        Preprocessed image ready for model input
    """
    h, w = image.shape[:2]
    
    # Maintain aspect ratio
    if h > w:
        new_h = target_size
        new_w = int(w * (target_size / h))
    else:
        new_w = target_size
        new_h = int(h * (target_size / w))
    
    # Resize
    resized = cv2.resize(image, (new_w, new_h), interpolation=cv2.INTER_LINEAR)
    
    # Pad to square
    delta_h = target_size - new_h
    delta_w = target_size - new_w
    top = delta_h // 2
    bottom = delta_h - top
    left = delta_w // 2
    right = delta_w - left
    
    padded = cv2.copyMakeBorder(
        resized, top, bottom, left, right,
        cv2.BORDER_CONSTANT, value=[0, 0, 0]
    )
    
    # Normalize
    if normalize:
        padded = padded.astype(np.float32) / 255.0
        # ImageNet mean and std
        mean = np.array([0.485, 0.456, 0.406])
        std = np.array([0.229, 0.224, 0.225])
        padded = (padded - mean) / std
    
    return padded


def enhance_contrast(image: np.ndarray) -> np.ndarray:
    """
    Apply CLAHE (Contrast Limited Adaptive Histogram Equalization)
    for better feature visibility
    
    Args:
        image: Input image (RGB)
        
    Returns:
        Contrast-enhanced image
    """
    # Convert to LAB color space
    lab = cv2.cvtColor(image, cv2.COLOR_RGB2LAB)
    l, a, b = cv2.split(lab)
    
    # Apply CLAHE to L channel
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
    l = clahe.apply(l)
    
    # Merge back
    enhanced = cv2.merge([l, a, b])
    enhanced = cv2.cvtColor(enhanced, cv2.COLOR_LAB2RGB)
    
    return enhanced


def apply_face_alignment(image: np.ndarray) -> Tuple[np.ndarray, bool]:
    """
    Detect face and align for consistent analysis
    (Placeholder - requires face detection library like dlib or MediaPipe)
    
    Args:
        image: Input image (RGB)
        
    Returns:
        (aligned_image, face_detected)
    """
    # TODO: Implement face detection and alignment
    # For now, return original image
    return image, False


def calculate_skin_mask(image: np.ndarray) -> np.ndarray:
    """
    Create skin color mask using HSV color space
    
    Args:
        image: Input image (RGB)
        
    Returns:
        Binary mask where 1 = skin, 0 = non-skin
    """
    # Convert to HSV
    hsv = cv2.cvtColor(image, cv2.COLOR_RGB2HSV)
    
    # Define skin color range in HSV
    # These values work for most skin tones
    lower_skin = np.array([0, 20, 70], dtype=np.uint8)
    upper_skin = np.array([20, 255, 255], dtype=np.uint8)
    
    # Create mask
    mask = cv2.inRange(hsv, lower_skin, upper_skin)
    
    # Apply morphological operations to clean up mask
    kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5))
    mask = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, kernel)
    mask = cv2.morphologyEx(mask, cv2.MORPH_OPEN, kernel)
    
    # Normalize to 0-1
    mask = mask.astype(np.float32) / 255.0
    
    return mask
