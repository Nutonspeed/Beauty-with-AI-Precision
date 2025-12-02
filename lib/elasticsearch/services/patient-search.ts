// Patient Search Service
import { elasticsearchManager } from './client'
import { SearchResult, PatientFilters } from '@/types/elasticsearch'

export interface PatientSearchDocument {
  id: string
  clinicId: string
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
  medicalHistory: Array<{
    condition: string
    medications: string
    allergies: string
    surgeries: string
  }>
  treatments: Array<{
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

export class PatientSearchService {
  private indexName = 'patients'

  // Index patient data
  async indexPatient(patient: PatientSearchDocument): Promise<string> {
    return await (elasticsearchManager as any).indexDocument(this.indexName, patient, patient.id)
  }

  // Update patient data
  async updatePatient(id: string, updates: Partial<PatientSearchDocument>): Promise<void> {
    await (elasticsearchManager as any).updateDocument(this.indexName, id, updates)
  }

  // Delete patient from search index
  async deletePatient(id: string): Promise<void> {
    await (elasticsearchManager as any).deleteDocument(this.indexName, id)
  }

  // Search patients
  async searchPatients(query: string, filters: PatientFilters = { clinicId: '' }, options: {
    from?: number
    size?: number
    sort?: string
  } = {}): Promise<SearchResult<PatientSearchDocument>> {
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
          'medicalHistory.condition': {},
          'medicalHistory.medications': {},
          'treatments.type': {}
        }
      }
    })

    return {
      hits: response.hits.hits.map((hit: any) => ({
        id: hit._id,
        score: hit._score,
        source: hit._source as PatientSearchDocument,
        highlight: hit.highlight
      })),
      total: response.hits.total.value,
      aggregations: response.aggregations
    }
  }

  // Advanced patient search
  async advancedSearch(criteria: {
    basic?: string
    demographics?: {
      ageRange?: [number, number]
      gender?: string
      location?: string
    }
    medical?: {
      conditions?: string[]
      medications?: string[]
      allergies?: string[]
    }
    treatments?: {
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
  } = {}): Promise<SearchResult<PatientSearchDocument>> {
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
        source: hit._source as PatientSearchDocument,
        highlight: hit.highlight
      })),
      total: response.hits.total.value,
      aggregations: response.aggregations
    }
  }

  // Get patient suggestions
  async getPatientSuggestions(query: string, clinicId: string): Promise<Array<{
    id: string
    name: string
    email: string
    phone: string
  }>> {
    const searchQuery = {
      bool: {
        must: [
          { term: { clinicId } },
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

  // Get similar patients
  async getSimilarPatients(patientId: string, options: {
    size?: number
    excludeSelf?: boolean
  } = {}): Promise<SearchResult<PatientSearchDocument>> {
    const patient = await (elasticsearchManager as any).getDocument(this.indexName, patientId)
    
    const searchQuery = {
      more_like_this: {
        fields: ['medicalHistory', 'treatments', 'skinAnalysis'],
        like: [{ _index: 'patients', _id: patientId }],
        min_term_freq: 1,
        max_query_terms: 12,
        min_doc_freq: 1
      }
    }

    if (options.excludeSelf) {
      (searchQuery as any).bool = {
        must_not: [{ term: { _id: patientId } }]
      }
    }

    const response = await (elasticsearchManager as any).search(this.indexName, searchQuery, {
      size: options.size || 10
    })

    return {
      hits: response.hits.hits.map((hit: any) => ({
        id: hit._id,
        score: hit._score,
        source: hit._source as PatientSearchDocument
      })),
      total: response.hits.total.value
    }
  }

  // Build search query
  private buildSearchQuery(query: string, filters: PatientFilters): any {
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
            'medicalHistory.condition',
            'medicalHistory.medications',
            'treatments.type',
            'treatments.practitioner'
          ],
          type: 'best_fields',
          fuzziness: 'AUTO'
        }
      })
    }

    // Clinic filter
    if (filters.clinicId) {
      filter.push({ term: { clinicId: filters.clinicId } })
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

    // Treatment type filter
    if (filters.treatmentTypes && filters.treatmentTypes.length > 0) {
      filter.push({
        nested: {
          path: 'treatments',
          query: {
            terms: { 'treatments.type': filters.treatmentTypes }
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

    // Medical history filters
    if (criteria.medical) {
      if (criteria.medical.conditions && criteria.medical.conditions.length > 0) {
        filter.push({
          nested: {
            path: 'medicalHistory',
            query: {
              terms: { 'medicalHistory.condition': criteria.medical.conditions }
            }
          }
        })
      }

      if (criteria.medical.medications && criteria.medical.medications.length > 0) {
        filter.push({
          nested: {
            path: 'medicalHistory',
            query: {
              terms: { 'medicalHistory.medications': criteria.medical.medications }
            }
          }
        })
      }
    }

    // Treatment filters
    if (criteria.treatments) {
      if (criteria.treatments.types && criteria.treatments.types.length > 0) {
        filter.push({
          nested: {
            path: 'treatments',
            query: {
              terms: { 'treatments.type': criteria.treatments.types }
            }
          }
        })
      }

      if (criteria.treatments.dateRange) {
        filter.push({
          nested: {
            path: 'treatments',
            query: {
              range: {
                'treatments.date': {
                  gte: criteria.treatments.dateRange[0],
                  lte: criteria.treatments.dateRange[1]
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

  // Get patient analytics
  async getPatientAnalytics(clinicId: string, dateRange?: [string, string]) {
    const searchQuery = {
      bool: {
        must: [{ term: { clinicId } }],
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
        treatment_types: {
          nested: { path: 'treatments' },
          aggregations: {
            types: {
              terms: { field: 'treatments.type' }
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

export const patientSearchService = new PatientSearchService()
export default PatientSearchService
