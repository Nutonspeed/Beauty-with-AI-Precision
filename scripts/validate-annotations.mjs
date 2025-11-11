#!/usr/bin/env node
/**
 * Ground Truth Annotation Validator
 * 
 * Validates annotation JSON files against the schema
 * Usage: node scripts/validate-annotations.mjs [annotation-file.json]
 */

import { readFileSync, readdirSync, statSync } from 'fs';
import { join, dirname, relative } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PROJECT_ROOT = join(__dirname, '..');

// Load schema
const SCHEMA_PATH = join(PROJECT_ROOT, 'test-images/calibration/ground-truth-schema.json');
const schema = JSON.parse(readFileSync(SCHEMA_PATH, 'utf-8'));

// Validation results
let totalFiles = 0;
let validFiles = 0;
let invalidFiles = 0;
const errors = [];

/**
 * Validate a single annotation file
 */
function validateAnnotation(filePath) {
  totalFiles++;
  
  const fileName = relative(PROJECT_ROOT, filePath);
  console.log(`\n📄 Validating: ${fileName}`);
  
  try {
    // Read file
    const content = readFileSync(filePath, 'utf-8');
    const annotation = JSON.parse(content);
    
    // Basic structure validation
    const issues = [];
    
    // Required fields
    const requiredFields = [
      'annotationId', 'imageFile', 'severityLevel', 'concerns',
      'totalConcerns', 'annotator', 'metadata', 'qualityControl',
      'schemaVersion', 'createdAt', 'updatedAt'
    ];
    
    for (const field of requiredFields) {
      if (!(field in annotation)) {
        issues.push(`Missing required field: ${field}`);
      }
    }
    
    // Validate annotationId format
    if (annotation.annotationId && !/^GT-[0-9]{8}-[A-Z0-9]{8}$/.test(annotation.annotationId)) {
      issues.push(`Invalid annotationId format: ${annotation.annotationId} (expected GT-YYYYMMDD-XXXXXXXX)`);
    }
    
    // Validate imageFile format
    if (annotation.imageFile && !/^(clear|mild|moderate|severe)\/.*\.(jpg|jpeg|png|webp)$/.test(annotation.imageFile)) {
      issues.push(`Invalid imageFile format: ${annotation.imageFile} (expected severity-level/filename.ext)`);
    }
    
    // Validate severityLevel
    const validSeverities = ['clear', 'mild', 'moderate', 'severe'];
    if (annotation.severityLevel && !validSeverities.includes(annotation.severityLevel)) {
      issues.push(`Invalid severityLevel: ${annotation.severityLevel} (expected: ${validSeverities.join(', ')})`);
    }
    
    // Validate concerns array
    if (annotation.concerns) {
      if (!Array.isArray(annotation.concerns)) {
        issues.push(`concerns must be an array`);
      } else {
        // Validate concern count matches totalConcerns
        if (annotation.totalConcerns !== annotation.concerns.length) {
          issues.push(`totalConcerns (${annotation.totalConcerns}) doesn't match concerns array length (${annotation.concerns.length})`);
        }
        
        // Validate severity level matches concern count
        const count = annotation.concerns.length;
        let expectedSeverity;
        if (count <= 5) expectedSeverity = 'clear';
        else if (count <= 15) expectedSeverity = 'mild';
        else if (count <= 30) expectedSeverity = 'moderate';
        else expectedSeverity = 'severe';
        
        if (annotation.severityLevel !== expectedSeverity) {
          issues.push(`severityLevel "${annotation.severityLevel}" doesn't match concern count ${count} (expected "${expectedSeverity}")`);
        }
        
        // Validate each concern
        annotation.concerns.forEach((concern, index) => {
          const concernIssues = validateConcern(concern, index);
          issues.push(...concernIssues);
        });
      }
    }
    
    // Validate annotator
    if (annotation.annotator) {
      const annotatorIssues = validateAnnotator(annotation.annotator);
      issues.push(...annotatorIssues);
    }
    
    // Validate metadata
    if (annotation.metadata) {
      const metadataIssues = validateMetadata(annotation.metadata);
      issues.push(...metadataIssues);
    }
    
    // Validate qualityControl
    if (annotation.qualityControl) {
      const qcIssues = validateQualityControl(annotation.qualityControl);
      issues.push(...qcIssues);
    }
    
    // Validate schema version
    if (annotation.schemaVersion && !/^[0-9]+\.[0-9]+\.[0-9]+$/.test(annotation.schemaVersion)) {
      issues.push(`Invalid schemaVersion format: ${annotation.schemaVersion} (expected X.Y.Z)`);
    }
    
    // Validate timestamps
    if (annotation.createdAt && !isValidISODate(annotation.createdAt)) {
      issues.push(`Invalid createdAt timestamp: ${annotation.createdAt}`);
    }
    if (annotation.updatedAt && !isValidISODate(annotation.updatedAt)) {
      issues.push(`Invalid updatedAt timestamp: ${annotation.updatedAt}`);
    }
    
    // Report results
    if (issues.length === 0) {
      console.log(`✅ Valid - ${annotation.totalConcerns} concerns, severity: ${annotation.severityLevel}`);
      validFiles++;
    } else {
      console.log(`❌ Invalid - ${issues.length} issue(s):`);
      issues.forEach(issue => console.log(`   • ${issue}`));
      invalidFiles++;
      errors.push({ file: fileName, issues });
    }
    
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
    invalidFiles++;
    errors.push({ file: fileName, issues: [error.message] });
  }
}

/**
 * Validate individual concern
 */
function validateConcern(concern, index) {
  const issues = [];
  const prefix = `Concern ${index + 1}:`;
  
  // Required fields
  if (!concern.type) issues.push(`${prefix} Missing type`);
  if (!concern.location) issues.push(`${prefix} Missing location`);
  if (concern.confidence === undefined) issues.push(`${prefix} Missing confidence`);
  if (concern.severity === undefined) issues.push(`${prefix} Missing severity`);
  
  // Validate type
  const validTypes = [
    'acne', 'blackhead', 'whitehead',
    'dark_spot', 'hyperpigmentation', 'melasma',
    'rough_texture', 'enlarged_pores', 'uneven_texture',
    'fine_lines', 'wrinkles', 'crow_feet',
    'redness', 'dryness', 'oiliness', 'dark_circles'
  ];
  if (concern.type && !validTypes.includes(concern.type)) {
    issues.push(`${prefix} Invalid type "${concern.type}"`);
  }
  
  // Validate location
  if (concern.location) {
    if (concern.location.x === undefined || concern.location.y === undefined) {
      issues.push(`${prefix} location must have x and y coordinates`);
    }
    if (concern.location.x < 0 || concern.location.x > 1) {
      issues.push(`${prefix} location.x must be 0-1 (got ${concern.location.x})`);
    }
    if (concern.location.y < 0 || concern.location.y > 1) {
      issues.push(`${prefix} location.y must be 0-1 (got ${concern.location.y})`);
    }
    if (concern.location.width !== undefined && (concern.location.width < 0 || concern.location.width > 1)) {
      issues.push(`${prefix} location.width must be 0-1 (got ${concern.location.width})`);
    }
    if (concern.location.height !== undefined && (concern.location.height < 0 || concern.location.height > 1)) {
      issues.push(`${prefix} location.height must be 0-1 (got ${concern.location.height})`);
    }
  }
  
  // Validate confidence
  if (concern.confidence !== undefined && (concern.confidence < 0 || concern.confidence > 100)) {
    issues.push(`${prefix} confidence must be 0-100 (got ${concern.confidence})`);
  }
  
  // Validate severity
  if (concern.severity !== undefined && (concern.severity < 1 || concern.severity > 10)) {
    issues.push(`${prefix} severity must be 1-10 (got ${concern.severity})`);
  }
  
  return issues;
}

/**
 * Validate annotator information
 */
function validateAnnotator(annotator) {
  const issues = [];
  
  if (!annotator.id) issues.push('Annotator: Missing id');
  if (annotator.id && !/^ANN-[0-9]{4}$/.test(annotator.id)) {
    issues.push(`Annotator: Invalid id format "${annotator.id}" (expected ANN-####)`);
  }
  
  if (!annotator.qualification) issues.push('Annotator: Missing qualification');
  const validQualifications = ['dermatologist', 'certified_aesthetician', 'medical_student'];
  if (annotator.qualification && !validQualifications.includes(annotator.qualification)) {
    issues.push(`Annotator: Invalid qualification "${annotator.qualification}"`);
  }
  
  if (annotator.yearsExperience === undefined) issues.push('Annotator: Missing yearsExperience');
  if (annotator.yearsExperience < 0 || annotator.yearsExperience > 50) {
    issues.push(`Annotator: yearsExperience must be 0-50 (got ${annotator.yearsExperience})`);
  }
  
  if (!annotator.annotatedAt) issues.push('Annotator: Missing annotatedAt');
  if (annotator.annotatedAt && !isValidISODate(annotator.annotatedAt)) {
    issues.push(`Annotator: Invalid annotatedAt timestamp "${annotator.annotatedAt}"`);
  }
  
  return issues;
}

/**
 * Validate metadata
 */
function validateMetadata(metadata) {
  const issues = [];
  
  if (!metadata.width) issues.push('Metadata: Missing width');
  if (metadata.width && metadata.width < 1) issues.push('Metadata: width must be >= 1');
  
  if (!metadata.height) issues.push('Metadata: Missing height');
  if (metadata.height && metadata.height < 1) issues.push('Metadata: height must be >= 1');
  
  if (!metadata.format) issues.push('Metadata: Missing format');
  const validFormats = ['jpg', 'jpeg', 'png', 'webp'];
  if (metadata.format && !validFormats.includes(metadata.format)) {
    issues.push(`Metadata: Invalid format "${metadata.format}" (expected: ${validFormats.join(', ')})`);
  }
  
  if (metadata.capturedAt && !isValidISODate(metadata.capturedAt)) {
    issues.push(`Metadata: Invalid capturedAt timestamp "${metadata.capturedAt}"`);
  }
  
  return issues;
}

/**
 * Validate quality control
 */
function validateQualityControl(qc) {
  const issues = [];
  
  if (qc.verified === undefined) issues.push('QualityControl: Missing verified field');
  
  if (qc.verified && !qc.verifiedBy) {
    issues.push('QualityControl: If verified=true, verifiedBy is required');
  }
  
  if (qc.verifiedBy && !/^ANN-[0-9]{4}$/.test(qc.verifiedBy)) {
    issues.push(`QualityControl: Invalid verifiedBy format "${qc.verifiedBy}" (expected ANN-####)`);
  }
  
  if (qc.imageQualityIssues && !Array.isArray(qc.imageQualityIssues)) {
    issues.push('QualityControl: imageQualityIssues must be an array');
  }
  
  if (qc.agreementScore !== undefined && (qc.agreementScore < 0 || qc.agreementScore > 1)) {
    issues.push(`QualityControl: agreementScore must be 0-1 (got ${qc.agreementScore})`);
  }
  
  return issues;
}

/**
 * Check if string is valid ISO 8601 date
 */
function isValidISODate(dateString) {
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date) && date.toISOString() === dateString;
}

/**
 * Recursively find all JSON files in directory
 */
function findAnnotationFiles(dir) {
  const files = [];
  const entries = readdirSync(dir);
  
  for (const entry of entries) {
    const fullPath = join(dir, entry);
    const stat = statSync(fullPath);
    
    if (stat.isDirectory()) {
      files.push(...findAnnotationFiles(fullPath));
    } else if (entry.endsWith('.json') && entry !== 'ground-truth-schema.json' && entry !== 'template.json') {
      files.push(fullPath);
    }
  }
  
  return files;
}

/**
 * Main validation function
 */
function main() {
  console.log('🔍 Ground Truth Annotation Validator\n');
  console.log('=' .repeat(60));
  
  const args = process.argv.slice(2);
  
  let filesToValidate = [];
  
  if (args.length > 0) {
    // Validate specific file
    filesToValidate = args;
  } else {
    // Validate all annotation files
    const annotationsDir = join(PROJECT_ROOT, 'test-images/calibration/annotations');
    filesToValidate = findAnnotationFiles(annotationsDir);
    
    if (filesToValidate.length === 0) {
      console.log('\n⚠️  No annotation files found in test-images/calibration/annotations/');
      console.log('   Create annotations following the template.json example.');
      process.exit(0);
    }
  }
  
  console.log(`\nFound ${filesToValidate.length} file(s) to validate\n`);
  
  // Validate each file
  for (const file of filesToValidate) {
    validateAnnotation(file);
  }
  
  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('\n📊 Validation Summary:\n');
  console.log(`Total files:   ${totalFiles}`);
  console.log(`✅ Valid:      ${validFiles}`);
  console.log(`❌ Invalid:    ${invalidFiles}`);
  
  if (invalidFiles > 0) {
    console.log('\n❌ Validation Failed\n');
    console.log('Errors found:');
    errors.forEach(({ file, issues }) => {
      console.log(`\n📄 ${file}:`);
      issues.forEach(issue => console.log(`   • ${issue}`));
    });
    process.exit(1);
  } else {
    console.log('\n✅ All annotations valid!\n');
    process.exit(0);
  }
}

// Run validator
main();
