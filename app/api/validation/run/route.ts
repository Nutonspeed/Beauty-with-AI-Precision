/**
 * Validation Run API - Execute AI predictions on calibration dataset
 * 
 * POST /api/validation/run
 * Runs AI model on calibration images and returns predictions
 */

import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import type { SeverityLevel, ConcernType } from '@/types/calibration';

// Import AI analysis functions
// TODO: Implement these analyzers or use existing HybridAnalyzer
// import { analyzeImageWithMediaPipe } from '@/lib/ai/mediapipe-analyzer';
// import { analyzeImageWithTensorFlow } from '@/lib/ai/tensorflow-analyzer';
// import { analyzeImageWithHuggingFace } from '@/lib/ai/huggingface-analyzer';
import { HybridAnalyzer } from '@/lib/ai/hybrid-analyzer';

const CALIBRATION_DIR = path.join(process.cwd(), 'test-images', 'calibration');

interface ValidationRequest {
  model: 'mediapipe' | 'tensorflow' | 'huggingface' | 'ensemble';
  severity?: SeverityLevel; // Optional: only run on specific severity level
  imageIds?: string[]; // Optional: specific annotation IDs to run
}

interface Prediction {
  annotationId: string;
  imageFile: string;
  model: string;
  severityLevel: SeverityLevel;
  concerns: Array<{
    type: ConcernType;
    confidence: number;
    location: { x: number; y: number; width?: number; height?: number };
  }>;
  processingTime: number;
  predictedAt: string;
}

/**
 * Run AI model on a single image
 */
async function runPredictionOnImage(
  imagePath: string,
  model: string
): Promise<{
  concerns: Array<{
    type: ConcernType;
    confidence: number;
    location: { x: number; y: number; width?: number; height?: number };
  }>;
  processingTime: number;
}> {
  const startTime = Date.now();

  try {
    // Read image file
    const imageBuffer = await fs.readFile(imagePath);
    const base64Image = imageBuffer.toString('base64');
    const imageUrl = `data:image/jpeg;base64,${base64Image}`;

    let results: any;

    // Run appropriate model
    // TODO: Implement individual analyzers or route all to HybridAnalyzer
    const analyzer = new HybridAnalyzer();
    
    switch (model) {
      case 'mediapipe':
      case 'tensorflow':
      case 'huggingface':
      case 'ensemble':
        // For now, use HybridAnalyzer for all models
        results = await analyzer.analyzeSkin(imageUrl);
        break;
      default:
        throw new Error(`Unknown model: ${model}`);
    }

    const processingTime = Date.now() - startTime;

    // Convert results to standard format
    const concerns = results.concerns.map((concern: any) => ({
      type: concern.type as ConcernType,
      confidence: concern.confidence,
      location: concern.location || { x: 0.5, y: 0.5 },
    }));

    return { concerns, processingTime };
  } catch (error) {
    console.error(`Error running prediction on ${imagePath}:`, error);
    throw error;
  }
}

/**
 * Calculate severity level based on concern count
 */
function calculateSeverityLevel(concernCount: number): SeverityLevel {
  if (concernCount <= 5) return 'clear';
  if (concernCount <= 15) return 'mild';
  if (concernCount <= 30) return 'moderate';
  return 'severe';
}

/**
 * Find all images in calibration dataset
 */
async function findCalibrationImages(
  severityFilter?: SeverityLevel
): Promise<Array<{ file: string; severity: SeverityLevel }>> {
  const images: Array<{ file: string; severity: SeverityLevel }> = [];
  const severityLevels: SeverityLevel[] = severityFilter 
    ? [severityFilter] 
    : ['clear', 'mild', 'moderate', 'severe'];

  for (const severity of severityLevels) {
    const dirPath = path.join(CALIBRATION_DIR, severity);
    
    try {
      const files = await fs.readdir(dirPath);
      const imageFiles = files.filter((file) =>
        /\.(jpg|jpeg|png|webp)$/i.test(file)
      );

      for (const file of imageFiles) {
        images.push({
          file: `${severity}/${file}`,
          severity,
        });
      }
    } catch (error) {
      // Directory might not exist or be empty
      console.warn(`No images found in ${severity} directory`);
    }
  }

  return images;
}

export async function POST(request: NextRequest) {
  try {
    const body: ValidationRequest = await request.json();
    const { model, severity, imageIds } = body;

    if (!model) {
      return NextResponse.json(
        { success: false, error: 'Model parameter is required' },
        { status: 400 }
      );
    }

    // Find images to process
    const images = await findCalibrationImages(severity);

    if (images.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'No images found in calibration dataset',
          message: severity
            ? `No images found for severity level: ${severity}`
            : 'Add images to test-images/calibration/{clear,mild,moderate,severe}/',
        },
        { status: 404 }
      );
    }

    // Filter by imageIds if provided
    let imagesToProcess = images;
    if (imageIds && imageIds.length > 0) {
      imagesToProcess = images.filter((img) =>
        imageIds.some((id) => img.file.includes(id))
      );
    }

    console.log(`Running ${model} on ${imagesToProcess.length} images...`);

    // Run predictions
    const predictions: Prediction[] = [];
    const errors: Array<{ file: string; error: string }> = [];

    for (const image of imagesToProcess) {
      try {
        const imagePath = path.join(CALIBRATION_DIR, image.file);
        const result = await runPredictionOnImage(imagePath, model);

        const concernCount = result.concerns.length;
        const predictedSeverity = calculateSeverityLevel(concernCount);

        // Generate annotation ID from filename
        const filename = path.basename(image.file, path.extname(image.file));
        const annotationId = `GT-${filename}`;

        predictions.push({
          annotationId,
          imageFile: image.file,
          model,
          severityLevel: predictedSeverity,
          concerns: result.concerns,
          processingTime: result.processingTime,
          predictedAt: new Date().toISOString(),
        });

        console.log(
          `✓ ${image.file}: ${concernCount} concerns, ${predictedSeverity} (${result.processingTime}ms)`
        );
      } catch (error) {
        errors.push({
          file: image.file,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
        console.error(`✗ ${image.file}: ${error}`);
      }
    }

    // Calculate summary statistics
    const stats = {
      totalImages: imagesToProcess.length,
      successful: predictions.length,
      failed: errors.length,
      avgProcessingTime: predictions.length > 0
        ? predictions.reduce((sum, p) => sum + p.processingTime, 0) / predictions.length
        : 0,
      totalConcerns: predictions.reduce((sum, p) => sum + p.concerns.length, 0),
      avgConcernsPerImage: predictions.length > 0
        ? predictions.reduce((sum, p) => sum + p.concerns.length, 0) / predictions.length
        : 0,
      severityDistribution: {
        clear: predictions.filter((p) => p.severityLevel === 'clear').length,
        mild: predictions.filter((p) => p.severityLevel === 'mild').length,
        moderate: predictions.filter((p) => p.severityLevel === 'moderate').length,
        severe: predictions.filter((p) => p.severityLevel === 'severe').length,
      },
    };

    return NextResponse.json({
      success: true,
      model,
      predictions,
      stats,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error('Validation run error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Validation run failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
