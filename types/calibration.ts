/**
 * Calibration Dataset Types
 * For expert-annotated ground truth data
 */

/**
 * Severity levels based on number of concerns detected
 */
export enum SeverityLevel {
  CLEAR = 'clear',       // 0-5 concerns
  MILD = 'mild',         // 6-15 concerns
  MODERATE = 'moderate', // 16-30 concerns
  SEVERE = 'severe',     // 31+ concerns
}

/**
 * Types of skin concerns that can be detected
 */
export enum ConcernType {
  // Acne-related
  ACNE = 'acne',
  BLACKHEAD = 'blackhead',
  WHITEHEAD = 'whitehead',
  
  // Pigmentation
  DARK_SPOT = 'dark_spot',
  HYPERPIGMENTATION = 'hyperpigmentation',
  MELASMA = 'melasma',
  
  // Texture
  ROUGH_TEXTURE = 'rough_texture',
  ENLARGED_PORES = 'enlarged_pores',
  UNEVEN_TEXTURE = 'uneven_texture',
  
  // Lines & Wrinkles
  FINE_LINES = 'fine_lines',
  WRINKLES = 'wrinkles',
  CROW_FEET = 'crow_feet',
  
  // Other
  REDNESS = 'redness',
  DRYNESS = 'dryness',
  OILINESS = 'oiliness',
  DARK_CIRCLES = 'dark_circles',
}

/**
 * Individual concern detected by expert
 */
export interface GroundTruthConcern {
  type: ConcernType;
  
  /** Location on face (normalized 0-1 coordinates) */
  location: {
    x: number;
    y: number;
    width?: number;
    height?: number;
  };
  
  /** Expert's confidence (0-100) */
  confidence: number;
  
  /** Severity of this specific concern (1-10) */
  severity: number;
  
  /** Additional notes from expert */
  notes?: string;
}

/**
 * Expert annotator information
 */
export interface AnnotatorInfo {
  /** Unique annotator ID (anonymized) */
  id: string;
  
  /** Qualification level */
  qualification: 'dermatologist' | 'certified_aesthetician' | 'medical_student';
  
  /** Years of experience */
  yearsExperience: number;
  
  /** Annotation date */
  annotatedAt: string; // ISO 8601 timestamp
}

/**
 * Complete ground truth annotation for one image
 */
export interface GroundTruthAnnotation {
  /** Unique annotation ID */
  annotationId: string;
  
  /** Image filename (relative to calibration directory) */
  imageFile: string;
  
  /** Overall severity level */
  severityLevel: SeverityLevel;
  
  /** List of all concerns detected */
  concerns: GroundTruthConcern[];
  
  /** Total concern count */
  totalConcerns: number;
  
  /** Expert who annotated this image */
  annotator: AnnotatorInfo;
  
  /** Multi-angle set information (if applicable) */
  angleSet?: {
    setId: string;
    angle: 'front' | 'left' | 'right';
    otherAngles: string[]; // filenames of other angles
  };
  
  /** Image metadata */
  metadata: {
    width: number;
    height: number;
    format: string;
    capturedAt?: string;
  };
  
  /** Quality control flags */
  qualityControl: {
    /** Is this annotation verified by a second expert? */
    verified: boolean;
    
    /** Second annotator (if verified) */
    verifiedBy?: string;
    
    /** Any issues with image quality */
    imageQualityIssues?: string[];
    
    /** Inter-rater reliability score (if verified) */
    agreementScore?: number;
  };
  
  /** Version of annotation schema */
  schemaVersion: string;
  
  /** Creation and update timestamps */
  createdAt: string;
  updatedAt: string;
}

/**
 * Calibration dataset metadata
 */
export interface CalibrationDatasetMeta {
  /** Dataset version */
  version: string;
  
  /** Total number of images */
  totalImages: number;
  
  /** Breakdown by severity */
  severityBreakdown: {
    clear: number;
    mild: number;
    moderate: number;
    severe: number;
  };
  
  /** List of all annotators */
  annotators: AnnotatorInfo[];
  
  /** Dataset statistics */
  statistics: {
    avgConcernsPerImage: number;
    mostCommonConcern: ConcernType;
    totalConcerns: number;
    verificationRate: number; // % of images verified by 2nd expert
  };
  
  /** When dataset was last updated */
  lastUpdated: string;
  
  /** Purpose and usage notes */
  notes?: string;
}

/**
 * AI prediction comparison (for validation)
 */
export interface AIPredictionComparison {
  /** Reference to ground truth annotation */
  annotationId: string;
  
  /** AI prediction results */
  aiPrediction: {
    /** Predicted severity */
    severityLevel: SeverityLevel;
    
    /** AI-detected concerns */
    concerns: Array<{
      type: ConcernType;
      confidence: number;
      location: { x: number; y: number };
    }>;
    
    /** Model used */
    model: 'mediapipe' | 'tensorflow' | 'huggingface' | 'ensemble';
    
    /** Prediction timestamp */
    predictedAt: string;
  };
  
  /** Comparison metrics */
  metrics: {
    /** Did severity level match? */
    severityMatch: boolean;
    
    /** Precision: TP / (TP + FP) */
    precision: number;
    
    /** Recall: TP / (TP + FN) */
    recall: number;
    
    /** F1 Score: 2 * (precision * recall) / (precision + recall) */
    f1Score: number;
    
    /** True positives */
    truePositives: number;
    
    /** False positives */
    falsePositives: number;
    
    /** False negatives */
    falseNegatives: number;
    
    /** IoU (Intersection over Union) for location accuracy */
    averageIoU?: number;
  };
}

/**
 * Validation report for entire calibration dataset
 */
export interface ValidationReport {
  /** Report ID */
  reportId: string;
  
  /** Model being evaluated */
  model: 'mediapipe' | 'tensorflow' | 'huggingface' | 'ensemble';
  
  /** Report generation date */
  generatedAt: string;
  
  /** Overall metrics */
  overallMetrics: {
    /** Overall accuracy (% correct severity predictions) */
    accuracy: number;
    
    /** Average precision across all images */
    avgPrecision: number;
    
    /** Average recall across all images */
    avgRecall: number;
    
    /** Average F1 score */
    avgF1Score: number;
    
    /** Total images evaluated */
    totalImages: number;
  };
  
  /** Breakdown by severity level */
  severityBreakdown: {
    [key in SeverityLevel]: {
      accuracy: number;
      precision: number;
      recall: number;
      f1Score: number;
      sampleCount: number;
    };
  };
  
  /** Confusion matrix */
  confusionMatrix: {
    predicted: SeverityLevel;
    actual: SeverityLevel;
    count: number;
  }[];
  
  /** Per-concern type accuracy */
  concernTypeMetrics: {
    [key in ConcernType]?: {
      precision: number;
      recall: number;
      f1Score: number;
      sampleCount: number;
    };
  };
  
  /** Recommendations for improvement */
  recommendations: string[];
  
  /** Threshold suggestions (if applicable) */
  thresholdSuggestions?: {
    currentThreshold: number;
    suggestedThreshold: number;
    expectedImprovement: number;
  };
}
