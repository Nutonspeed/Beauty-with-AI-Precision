// Search Suggestions API
import { NextRequest, NextResponse } from 'next/server'
import { patientSearchService } from '@/lib/elasticsearch/services/patient-search'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q') || ''
    const type = searchParams.get('type') || 'patients'
    const clinicId = searchParams.get('clinicId')
    
    if (!clinicId) {
      return NextResponse.json(
        { error: 'clinicId is required' },
        { status: 400 }
      )
    }

    if (query.length < 2) {
      return NextResponse.json({
        success: true,
        suggestions: []
      })
    }

    let suggestions

    switch (type) {
      case 'patients':
        suggestions = await patientSearchService.getPatientSuggestions(query, clinicId)
        break
      
      default:
        return NextResponse.json(
          { error: 'Invalid suggestion type' },
          { status: 400 }
        )
    }

    return NextResponse.json({
      success: true,
      suggestions
    })

  } catch (error) {
    console.error('Suggestions API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
