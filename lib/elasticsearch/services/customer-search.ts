// Customer Search Service
import { elasticsearchManager } from './client'
import { SearchResult, ClientFilters as CustomerFilters } from '@/types/elasticsearch'

export interface CustomerSearchDocument {
  id: string
  centerId: string
  firstName: string
  lastName: string
  email: string
  phone: string
  dateOfBirth: string
  gender: string
  address: {
    street: string
    city: string
    state: string
    zipCode: string
    country: string
  }
  aestheticHistory: Array<{
    condition: string
    medications: string
    allergies: string
    surgeries: string
  }>
  programs: Array<{
    type: string
    date: string
    results: string
    practitioner: string
  }>
  skinAnalysis: {
    overallScore: number
    spots: number
    wrinkles: number
    texture: number
    pores: number
    redness: number
    uvDamage: number
    acne: number
  }
  tags: string[]
  notes: string
  createdAt: string
  updatedAt: string
}

export class CustomerSearchService {
  private indexName = 'customers'

  // Index customer data
  async indexCustomer(customer: CustomerSearchDocument): Promise<string> {
    return await (elasticsearchManager as any).indexDocument(this.indexName, customer, customer.id)
  }

  // Update customer data
  async updateCustomer(id: string, updates: Partial<CustomerSearchDocument>): Promise<void> {
    await (elasticsearchManager as any).updateDocument(this.indexName, id, updates)
  }

  // Delete customer from search index
  async deleteCustomer(id: string): Promise<void> {
    await (elasticsearchManager as any).deleteDocument(this.indexName, id)
  }

  // Search customers
  async searchCustomers(query: string, filters: CustomerFilters = { centerId: '' }, options: {
    from?: number
    size?: number
    sort?: string
  } = {}): Promise<SearchResult<CustomerSearchDocument>> {
    const searchQuery = this.buildSearchQuery(query, filters)
    const sortOptions = this.buildSortOptions(options.sort)

    const response = await (elasticsearchManager as any).search(this.indexName, searchQuery, {
      from: options.from,
      size: options.size,
      sort: sortOptions,
      highlight: {
        fields: {
          firstName: {},
          lastName: {},
          notes: {},
          'aestheticHistory.condition': {},
          'aestheticHistory.medications': {},
          'programs.type': {}
        }
      }
    })

    return {
      hits: response.hits.hits.map((hit: any) => ({
        id: hit._id,
        score: hit._score,
        source: hit._source as CustomerSearchDocument,
        highlight: hit.highlight
      })),
      total: response.hits.total.value,
      aggregations: response.aggregations
    }
  }

  // Advanced customer search
  async advancedSearch(criteria: {
    basic?: string
    demographics?: {
      ageRange?: [number, number]
      gender?: string
      location?: string
    }
    aesthetic?: {
      conditions?: string[]
      medications?: string[]
      allergies?: string[]
    }
    programs?: {
      types?: string[]
      dateRange?: [string, string]
      practitioners?: string[]
    }
    skinAnalysis?: {
      scoreRange?: [number, number]
      concerns?: string[]
    }
  }, options: {
    from?: number
    size?: number
    sort?: string
  } = {}): Promise<SearchResult<CustomerSearchDocument>> {
    const searchQuery = this.buildAdvancedQuery(criteria)
    const sortOptions = this.buildSortOptions(options.sort)

    const response = await (elasticsearchManager as any).search(this.indexName, searchQuery, {
      from: options.from,
      size: options.size,
      sort: sortOptions
    })

    return {
      hits: response.hits.hits.map((hit: any) => ({
        id: hit._id,
        score: hit._score,
        source: hit._source as CustomerSearchDocument,
        highlight: hit.highlight
      })),
      total: response.hits.total.value,
      aggregations: response.aggregations
    }
  }

  // Get customer suggestions
  async getCustomerSuggestions(query: string, centerId: string): Promise<Array<{
    id: string
    name: string
    email: string
    phone: string
  }>> {
    const searchQuery = {
      bool: {
        must: [
          { term: { centerId } },
          {
            multi_match: {
              query,
              fields: ['firstName^3', 'lastName^3', 'email^2', 'phone'],
              type: 'best_fields',
              fuzziness: 'AUTO'
            }
          }
        ]
      }
    }

    const response = await (elasticsearchManager as any).search(this.indexName, searchQuery, {
      size: 10,
      _source: ['id', 'firstName', 'lastName', 'email', 'phone']
    })

    return response.hits.hits.map((hit: any) => ({
      id: hit._source.id,
      name: `${hit._source.firstName} ${hit._source.lastName}`,
      email: hit._source.email,
      phone: hit._source.phone
    }))
  }

  // Get similar customers
  async getSimilarCustomers(customerId: string, options: {
    size?: number
    excludeSelf?: boolean
  } = {}): Promise<SearchResult<CustomerSearchDocument>> {
    const _customer = await (elasticsearchManager as any).getDocument(this.indexName, customerId)
    
    const searchQuery = {
      more_like_this: {
        fields: ['aestheticHistory', 'programs', 'skinAnalysis'],
        like: [{ _index: 'customers', _id: customerId }],
        min_term_freq: 1,
        max_query_terms: 12,
        min_doc_freq: 1
      }
    }

    if (options.excludeSelf) {
      (searchQuery as any).bool = {
        must_not: [{ term: { _id: customerId } }]
      }
    }

    const response = await (elasticsearchManager as any).search(this.indexName, searchQuery, {
      size: options.size || 10
    })

    return {
      hits: response.hits.hits.map((hit: any) => ({
        id: hit._id,
        score: hit._score,
        source: hit._source as CustomerSearchDocument
      })),
      total: response.hits.total.value
    }
  }

  // Build search query
  private buildSearchQuery(query: string, filters: CustomerFilters): any {
    const must: any[] = []
    const filter: any[] = []

    // Text search
    if (query) {
      must.push({
        multi_match: {
          query,
          fields: [
            'firstName^3',
            'lastName^3',
            'email^2',
            'phone^2',
            'notes',
            'aestheticHistory.condition',
            'aestheticHistory.medications',
            'programs.type',
            'programs.practitioner'
          ],
          type: 'best_fields',
          fuzziness: 'AUTO'
        }
      })
    }

    // Center filter
    if (filters.centerId) {
      filter.push({ term: { centerId: filters.centerId } })
    }

    // Gender filter
    if (filters.gender) {
      filter.push({ term: { gender: filters.gender } })
    }

    // Age range filter
    if (filters.ageRange) {
      const now = new Date()
      const minDate = new Date(now.getFullYear() - filters.ageRange[1], now.getMonth(), now.getDate())
      const maxDate = new Date(now.getFullYear() - filters.ageRange[0], now.getMonth(), now.getDate())
      
      filter.push({
        range: {
          dateOfBirth: {
            gte: minDate.toISOString(),
            lte: maxDate.toISOString()
          }
        }
      })
    }

    // Tags filter
    if (filters.tags && filters.tags.length > 0) {
      filter.push({ terms: { tags: filters.tags } })
    }

    // Program type filter
    if (filters.programTypes && filters.programTypes.length > 0) {
      filter.push({
        nested: {
          path: 'programs',
          query: {
            terms: { 'programs.type': filters.programTypes }
          }
        }
      })
    }

    // Skin analysis score range
    if (filters.scoreRange) {
      filter.push({
        range: {
          'skinAnalysis.overallScore': {
            gte: filters.scoreRange[0],
            lte: filters.scoreRange[1]
          }
        }
      })
    }

    return {
      bool: {
        must: must.length > 0 ? must : [{ match_all: {} }],
        filter
      }
    }
  }

  // Build advanced search query
  private buildAdvancedQuery(criteria: any): any {
    const must: any[] = []
    const filter: any[] = []

    // Basic text search
    if (criteria.basic) {
      must.push({
        multi_match: {
          query: criteria.basic,
          fields: ['firstName', 'lastName', 'email', 'phone', 'notes'],
          fuzziness: 'AUTO'
        }
      })
    }

    // Demographics filters
    if (criteria.demographics) {
      if (criteria.demographics.gender) {
        filter.push({ term: { gender: criteria.demographics.gender } })
      }

      if (criteria.demographics.ageRange) {
        const now = new Date()
        const minDate = new Date(now.getFullYear() - criteria.demographics.ageRange[1], now.getMonth(), now.getDate())
        const maxDate = new Date(now.getFullYear() - criteria.demographics.ageRange[0], now.getMonth(), now.getDate())
        
        filter.push({
          range: {
            dateOfBirth: {
              gte: minDate.toISOString(),
              lte: maxDate.toISOString()
            }
          }
        })
      }

      if (criteria.demographics.location) {
        must.push({
          multi_match: {
            query: criteria.demographics.location,
            fields: ['address.city', 'address.state', 'address.country'],
            fuzziness: 'AUTO'
          }
        })
      }
    }

    // Aesthetic history filters
    if (criteria.aesthetic) {
      if (criteria.aesthetic.conditions && criteria.aesthetic.conditions.length > 0) {
        filter.push({
          nested: {
            path: 'aestheticHistory',
            query: {
              terms: { 'aestheticHistory.condition': criteria.aesthetic.conditions }
            }
          }
        })
      }

      if (criteria.aesthetic.medications && criteria.aesthetic.medications.length > 0) {
        filter.push({
          nested: {
            path: 'aestheticHistory',
            query: {
              terms: { 'aestheticHistory.medications': criteria.aesthetic.medications }
            }
          }
        })
      }
    }

    // Program filters
    if (criteria.programs) {
      if (criteria.programs.types && criteria.programs.types.length > 0) {
        filter.push({
          nested: {
            path: 'programs',
            query: {
              terms: { 'programs.type': criteria.programs.types }
            }
          }
        })
      }

      if (criteria.programs.dateRange) {
        filter.push({
          nested: {
            path: 'programs',
            query: {
              range: {
                'programs.date': {
                  gte: criteria.programs.dateRange[0],
                  lte: criteria.programs.dateRange[1]
                }
              }
            }
          }
        })
      }
    }

    return {
      bool: {
        must: must.length > 0 ? must : [{ match_all: {} }],
        filter
      }
    }
  }

  // Build sort options
  private buildSortOptions(sort?: string): any[] {
    if (!sort) return [{ createdAt: { order: 'desc' } }]

    const sortFields = sort.split(',').map(field => {
      const [name, order] = field.split(':')
      return { [name]: { order: order || 'asc' } }
    })

    return sortFields
  }

  // Get customer analytics
  async getCustomerAnalytics(centerId: string, dateRange?: [string, string]) {
    const searchQuery = {
      bool: {
        must: [{ term: { centerId } }],
        filter: dateRange ? [{
          range: {
            createdAt: {
              gte: dateRange[0],
              lte: dateRange[1]
            }
          }
        }] : []
      }
    }

    const response = await (elasticsearchManager as any).search(this.indexName, searchQuery, {
      size: 0,
      aggregations: {
        gender_distribution: {
          terms: { field: 'gender' }
        },
        age_distribution: {
          date_range: {
            field: 'dateOfBirth',
            ranges: [
              { key: '18-25', from: '1998-01-01', to: '2005-12-31' },
              { key: '26-35', from: '1988-01-01', to: '1997-12-31' },
              { key: '36-45', from: '1978-01-01', to: '1987-12-31' },
              { key: '46-55', from: '1968-01-01', to: '1977-12-31' },
              { key: '56+', to: '1967-12-31' }
            ]
          }
        },
        program_types: {
          nested: { path: 'programs' },
          aggregations: {
            types: {
              terms: { field: 'programs.type' }
            }
          }
        },
        skin_analysis_scores: {
          stats: { field: 'skinAnalysis.overallScore' }
        }
      }
    })

    return response.aggregations
  }
}

export const customerSearchService = new CustomerSearchService()
export default CustomerSearchService
