/**
 * Ground Truth API - Load expert annotations from calibration dataset
 * 
 * GET /api/validation/ground-truth
 * Returns all ground truth annotations from calibration dataset
 */

import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import type { GroundTruthAnnotation } from '@/types/calibration';

const CALIBRATION_DIR = path.join(process.cwd(), 'test-images', 'calibration', 'annotations');

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const severity = searchParams.get('severity'); // Filter by severity level
    const annotatorId = searchParams.get('annotatorId'); // Filter by annotator

    // Read all JSON files from annotations directory
    let files: string[];
    try {
      files = await fs.readdir(CALIBRATION_DIR);
    } catch (error) {
      return NextResponse.json(
        {
          success: false,
          error: 'Calibration dataset not found',
          message: 'No annotations directory exists. Create ground truth annotations first.',
        },
        { status: 404 }
      );
    }

    const jsonFiles = files.filter(
      (file) => file.endsWith('.json') && file !== 'template.json'
    );

    if (jsonFiles.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'No annotations found',
          message: 'The annotations directory is empty. Add ground truth annotations.',
          annotationsDir: CALIBRATION_DIR,
        },
        { status: 404 }
      );
    }

    // Load and parse all annotations
    const annotations: GroundTruthAnnotation[] = [];
    const errors: Array<{ file: string; error: string }> = [];

    for (const file of jsonFiles) {
      try {
        const filePath = path.join(CALIBRATION_DIR, file);
        const content = await fs.readFile(filePath, 'utf-8');
        const annotation: GroundTruthAnnotation = JSON.parse(content);

        // Apply filters
        if (severity && annotation.severityLevel !== severity) continue;
        if (annotatorId && annotation.annotator.id !== annotatorId) continue;

        annotations.push(annotation);
      } catch (error) {
        errors.push({
          file,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    // Calculate statistics
    const stats = {
      total: annotations.length,
      bySeverity: {
        clear: annotations.filter((a) => a.severityLevel === 'clear').length,
        mild: annotations.filter((a) => a.severityLevel === 'mild').length,
        moderate: annotations.filter((a) => a.severityLevel === 'moderate').length,
        severe: annotations.filter((a) => a.severityLevel === 'severe').length,
      },
      byAnnotator: annotations.reduce((acc, a) => {
        acc[a.annotator.id] = (acc[a.annotator.id] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      totalConcerns: annotations.reduce((sum, a) => sum + a.totalConcerns, 0),
      avgConcernsPerImage: annotations.length > 0
        ? annotations.reduce((sum, a) => sum + a.totalConcerns, 0) / annotations.length
        : 0,
      verified: annotations.filter((a) => a.qualityControl.verified).length,
      verificationRate: annotations.length > 0
        ? annotations.filter((a) => a.qualityControl.verified).length / annotations.length
        : 0,
    };

    return NextResponse.json({
      success: true,
      annotations,
      stats,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error('Error loading ground truth:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to load ground truth annotations',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/validation/ground-truth
 * Add or update a ground truth annotation
 */
export async function POST(request: NextRequest) {
  try {
    const annotation: GroundTruthAnnotation = await request.json();

    // Validate annotation structure
    if (!annotation.annotationId || !annotation.imageFile || !annotation.severityLevel) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid annotation structure',
          message: 'Required fields: annotationId, imageFile, severityLevel',
        },
        { status: 400 }
      );
    }

    // Validate annotation ID format
    if (!/^GT-[0-9]{8}-[A-Z0-9]{8}$/.test(annotation.annotationId)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid annotationId format',
          message: 'Format must be: GT-YYYYMMDD-XXXXXXXX',
        },
        { status: 400 }
      );
    }

    // Ensure annotations directory exists
    await fs.mkdir(CALIBRATION_DIR, { recursive: true });

    // Write annotation file
    const filename = `${annotation.annotationId}.json`;
    const filePath = path.join(CALIBRATION_DIR, filename);

    await fs.writeFile(filePath, JSON.stringify(annotation, null, 2), 'utf-8');

    return NextResponse.json({
      success: true,
      message: 'Annotation saved successfully',
      filename,
      annotationId: annotation.annotationId,
    });
  } catch (error) {
    console.error('Error saving annotation:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to save annotation',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
