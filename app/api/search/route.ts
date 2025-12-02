// Universal Search API
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

    // Parse filters
    const filters: any = { clinicId }
    
    // Gender filter
    const gender = searchParams.get('gender')
    if (gender) filters.gender = gender

    // Age range filter
    const minAge = searchParams.get('minAge')
    const maxAge = searchParams.get('maxAge')
    if (minAge && maxAge) {
      filters.ageRange = [parseInt(minAge), parseInt(maxAge)]
    }

    // Tags filter
    const tags = searchParams.get('tags')
    if (tags) {
      filters.tags = tags.split(',')
    }

    // Treatment types filter
    const treatmentTypes = searchParams.get('treatmentTypes')
    if (treatmentTypes) {
      filters.treatmentTypes = treatmentTypes.split(',')
    }

    // Score range filter
    const minScore = searchParams.get('minScore')
    const maxScore = searchParams.get('maxScore')
    if (minScore && maxScore) {
      filters.scoreRange = [parseInt(minScore), parseInt(maxScore)]
    }

    // Pagination
    const from = parseInt(searchParams.get('from') || '0')
    const size = Math.min(parseInt(searchParams.get('size') || '10'), 100)
    const sort = searchParams.get('sort')

    let results

    switch (type) {
      case 'patients':
        results = await patientSearchService.searchPatients(query, filters, {
          from,
          size,
          sort: sort || undefined
        })
        break
      
      default:
        return NextResponse.json(
          { error: 'Invalid search type' },
          { status: 400 }
        )
    }

    return NextResponse.json({
      success: true,
      data: results,
      query: {
        q: query,
        type,
        filters,
        from,
        size,
        sort
      }
    })

  } catch (error) {
    console.error('Search API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { query, type, filters, options } = body

    if (!type) {
      return NextResponse.json(
        { error: 'Search type is required' },
        { status: 400 }
      )
    }

    let results

    switch (type) {
      case 'patients':
        results = await patientSearchService.advancedSearch(query || {}, filters || {})
        break
      
      default:
        return NextResponse.json(
          { error: 'Invalid search type' },
          { status: 400 }
        )
    }

    return NextResponse.json({
      success: true,
      data: results
    })

  } catch (error) {
    console.error('Advanced search API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
