// Generate Report API
import { NextRequest, NextResponse } from 'next/server'
import { AnalyticsReportGenerator } from '@/lib/reports/generators/analytics-generator'
import { FinancialReportGenerator } from '@/lib/reports/generators/financial-generator'
import { PatientReportGenerator } from '@/lib/reports/generators/patient-generator'
import { ReportConfig } from '@/types/reports'

const generators = {
  analytics: new AnalyticsReportGenerator(),
  financial: new FinancialReportGenerator(),
  patient: new PatientReportGenerator()
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, config } = body

    if (!type || !config) {
      return NextResponse.json(
        { error: 'Report type and config are required' },
        { status: 400 }
      )
    }

    const generator = generators[type as keyof typeof generators]
    if (!generator) {
      return NextResponse.json(
        { error: 'Invalid report type' },
        { status: 400 }
      )
    }

    // Validate config
    const validatedConfig = validateReportConfig(config)
    
    // Generate report
    const reportData = await generator.generate(validatedConfig)

    return NextResponse.json({
      success: true,
      data: reportData
    })

  } catch (error) {
    console.error('Report generation failed:', error)
    return NextResponse.json(
      { error: 'Failed to generate report' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const type = searchParams.get('type')

  if (!type) {
    return NextResponse.json({
      availableTypes: Object.keys(generators),
      schemas: {
        analytics: getAnalyticsSchema(),
        financial: getFinancialSchema(),
        patient: getPatientSchema()
      }
    })
  }

  const generator = generators[type as keyof typeof generators]
  if (!generator) {
    return NextResponse.json(
      { error: 'Invalid report type' },
      { status: 400 }
    )
  }

  return NextResponse.json({
    type,
    schema: getReportSchema(type)
  })
}

function validateReportConfig(config: any): ReportConfig {
  // Basic validation
  if (!config.title || typeof config.title !== 'string') {
    throw new Error('Title is required and must be a string')
  }

  if (!config.dateRange || !config.dateRange.startDate || !config.dateRange.endDate) {
    throw new Error('Date range with start and end dates is required')
  }

  if (!config.metrics || !Array.isArray(config.metrics) || config.metrics.length === 0) {
    throw new Error('At least one metric is required')
  }

  return {
    title: config.title,
    dateRange: {
      startDate: new Date(config.dateRange.startDate),
      endDate: new Date(config.dateRange.endDate)
    },
    filters: config.filters || {},
    metrics: config.metrics
  }
}

function getAnalyticsSchema() {
  return {
    title: 'Analytics Report',
    description: 'Comprehensive analytics and user behavior report',
    metrics: ['users', 'sessions', 'features'],
    filters: {
      clinic_id: 'string',
      user_type: 'string',
      date_range: 'object'
    }
  }
}

function getFinancialSchema() {
  return {
    title: 'Financial Report',
    description: 'Revenue, expenses, and profit analysis',
    metrics: ['revenue', 'expenses', 'profit'],
    filters: {
      clinic_id: 'string',
      category: 'string',
      date_range: 'object'
    }
  }
}

function getPatientSchema() {
  return {
    title: 'Patient Report',
    description: 'Patient demographics, treatments, and outcomes',
    metrics: ['demographics', 'treatments', 'analyses', 'appointments'],
    filters: {
      clinic_id: 'string',
      age_range: 'object',
      gender: 'string',
      date_range: 'object'
    }
  }
}

function getReportSchema(type: string) {
  const schemas = {
    analytics: getAnalyticsSchema(),
    financial: getFinancialSchema(),
    patient: getPatientSchema()
  }
  return schemas[type as keyof typeof schemas]
}
