// Search Suggestions API
import { NextRequest, NextResponse } from 'next/server'
import { customerSearchService } from '@/lib/elasticsearch/services/customer-search'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q') || ''
    const type = searchParams.get('type') || 'customers'
    const centerId = searchParams.get('centerId') || searchParams.get('centerId')
    
    if (!centerId) {
      return NextResponse.json(
        { error: 'centerId is required' },
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
      case 'customers':
      case 'clients':
        suggestions = await customerSearchService.getCustomerSuggestions(query, centerId)
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
