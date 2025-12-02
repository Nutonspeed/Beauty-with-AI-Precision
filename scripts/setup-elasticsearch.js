#!/usr/bin/env node

/**
 * Advanced Search with Elasticsearch Setup Script
 * Implements comprehensive search functionality with Elasticsearch
 * for Beauty with AI Precision platform
 */

const fs = require('fs')
const path = require('path')

// ANSI color codes for better output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
}

function colorLog(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

// Create Elasticsearch directories
function createElasticsearchDirectories() {
  colorLog('\n📁 Creating Elasticsearch directories...', 'cyan')
  
  const directories = [
    'lib/elasticsearch',
    'lib/elasticsearch/indices',
    'lib/elasticsearch/mappings',
    'lib/elasticsearch/analyzers',
    'lib/elasticsearch/queries',
    'lib/elasticsearch/aggregations',
    'components/search',
    'components/search/filters',
    'components/search/results',
    'components/search/suggestions',
    'app/api/search',
    'app/api/search/patients',
    'app/api/search/treatments',
    'app/api/search/analytics',
    'app/api/search/suggestions',
    'scripts/elasticsearch',
    'scripts/elasticsearch/setup',
    'scripts/elasticsearch/migration',
    'scripts/elasticsearch/indexing',
    'config/elasticsearch',
    'types/elasticsearch'
  ]
  
  directories.forEach(dir => {
    const fullPath = path.join(process.cwd(), dir)
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true })
      colorLog(`  ✅ Created ${dir}`, 'green')
    } else {
      colorLog(`  ✅ ${dir} exists`, 'blue')
    }
  })
}

// Create Elasticsearch client and configuration
function createElasticsearchClient() {
  colorLog('\n🔌 Creating Elasticsearch client...', 'cyan')
  
  const esClient = `// Elasticsearch Client Configuration
import { Client } from '@elastic/elasticsearch'
import { monitoringConfig } from '@/config/monitoring'

export interface ElasticsearchConfig {
  node: string
  auth?: {
    username: string
    password: string
  }
  maxRetries: number
  requestTimeout: number
  sniffOnStart: boolean
  sniffInterval: number
  pingTimeout: number
  resurrectStrategy: 'ping' | 'optimistic'
}

export interface SearchIndex {
  name: string
  pattern: string
  mappings: Record<string, any>
  settings: Record<string, any>
}

class ElasticsearchManager {
  private client: Client
  private config: ElasticsearchConfig
  private indices: Map<string, SearchIndex> = new Map()

  constructor() {
    this.config = this.getConfig()
    this.client = new Client(this.config)
    this.initializeIndices()
  }

  private getConfig(): ElasticsearchConfig {
    return {
      node: process.env.ELASTICSEARCH_NODE || 'http://localhost:9200',
      auth: process.env.ELASTICSEARCH_USERNAME && process.env.ELASTICSEARCH_PASSWORD ? {
        username: process.env.ELASTICSEARCH_USERNAME,
        password: process.env.ELASTICSEARCH_PASSWORD
      } : undefined,
      maxRetries: parseInt(process.env.ELASTICSEARCH_MAX_RETRIES || '3'),
      requestTimeout: parseInt(process.env.ELASTICSEARCH_REQUEST_TIMEOUT || '30000'),
      sniffOnStart: process.env.ELASTICSEARCH_SNIFF_ON_START === 'true',
      sniffInterval: parseInt(process.env.ELASTICSEARCH_SNIFF_INTERVAL || '300000'),
      pingTimeout: parseInt(process.env.ELASTICSEARCH_PING_TIMEOUT || '3000'),
      resurrectStrategy: (process.env.ELASTICSEARCH_RESURRECT_STRATEGY as 'ping' | 'optimistic') || 'ping'
    }
  }

  private initializeIndices() {
    // Patient Search Index
    this.indices.set('patients', {
      name: 'patients',
      pattern: 'patients-*',
      mappings: {
        properties: {
          id: { type: 'keyword' },
          clinicId: { type: 'keyword' },
          firstName: {
            type: 'text',
            analyzer: 'standard',
            fields: {
              keyword: { type: 'keyword' },
              suggest: {
                type: 'completion',
                analyzer: 'simple'
              }
            }
          },
          lastName: {
            type: 'text',
            analyzer: 'standard',
            fields: {
              keyword: { type: 'keyword' },
              suggest: {
                type: 'completion',
                analyzer: 'simple'
              }
            }
          },
          email: { type: 'keyword' },
          phone: { type: 'keyword' },
          dateOfBirth: { type: 'date' },
          gender: { type: 'keyword' },
          address: {
            type: 'object',
            properties: {
              street: { type: 'text' },
              city: { type: 'text' },
              state: { type: 'keyword' },
              zipCode: { type: 'keyword' },
              country: { type: 'keyword' }
            }
          },
          medicalHistory: {
            type: 'nested',
            properties: {
              condition: { type: 'text' },
              medications: { type: 'text' },
              allergies: { type: 'text' },
              surgeries: { type: 'text' }
            }
          },
          treatments: {
            type: 'nested',
            properties: {
              type: { type: 'keyword' },
              date: { type: 'date' },
              results: { type: 'text' },
              practitioner: { type: 'text' }
            }
          },
          skinAnalysis: {
            type: 'object',
            properties: {
              overallScore: { type: 'integer' },
              spots: { type: 'integer' },
              wrinkles: { type: 'integer' },
              texture: { type: 'integer' },
              pores: { type: 'integer' },
              redness: { type: 'integer' },
              uvDamage: { type: 'integer' },
              acne: { type: 'integer' }
            }
          },
          tags: { type: 'keyword' },
          notes: { type: 'text' },
          createdAt: { type: 'date' },
          updatedAt: { type: 'date' }
        }
      },
      settings: {
        number_of_shards: 1,
        number_of_replicas: 1,
        analysis: {
          analyzer: {
            name_analyzer: {
              type: 'custom',
              tokenizer: 'standard',
              filter: ['lowercase', 'asciifolding']
            }
          }
        }
      }
    })

    // Treatment Search Index
    this.indices.set('treatments', {
      name: 'treatments',
      pattern: 'treatments-*',
      mappings: {
        properties: {
          id: { type: 'keyword' },
          clinicId: { type: 'keyword' },
          patientId: { type: 'keyword' },
          type: { type: 'keyword' },
          name: {
            type: 'text',
            analyzer: 'standard',
            fields: {
              keyword: { type: 'keyword' },
              suggest: {
                type: 'completion',
                analyzer: 'simple'
              }
            }
          },
          description: { type: 'text' },
          category: { type: 'keyword' },
          subcategory: { type: 'keyword' },
          price: { type: 'float' },
          duration: { type: 'integer' },
          practitioner: {
            type: 'object',
            properties: {
              id: { type: 'keyword' },
              name: { type: 'text' },
              specialty: { type: 'keyword' }
            }
          },
          results: {
            type: 'object',
            properties: {
              beforeAfter: { type: 'boolean' },
              satisfaction: { type: 'integer' },
              notes: { type: 'text' }
            }
          },
          products: {
            type: 'nested',
            properties: {
              name: { type: 'text' },
              brand: { type: 'keyword' },
              quantity: { type: 'integer' }
            }
          },
          date: { type: 'date' },
          status: { type: 'keyword' },
          tags: { type: 'keyword' },
          createdAt: { type: 'date' },
          updatedAt: { type: 'date' }
        }
      },
      settings: {
        number_of_shards: 1,
        number_of_replicas: 1
      }
    })

    // Analytics Search Index
    this.indices.set('analytics', {
      name: 'analytics',
      pattern: 'analytics-*',
      mappings: {
        properties: {
          id: { type: 'keyword' },
          clinicId: { type: 'keyword' },
          type: { type: 'keyword' },
          event: { type: 'keyword' },
          data: { type: 'object' },
          timestamp: { type: 'date' },
          userId: { type: 'keyword' },
          sessionId: { type: 'keyword' },
          metadata: { type: 'object' }
        }
      },
      settings: {
        number_of_shards: 1,
        number_of_replicas: 1
      }
    })
  }

  // Get Elasticsearch client
  getClient(): Client {
    return this.client
  }

  // Create index
  async createIndex(indexName: string): Promise<void> {
    try {
      const index = this.indices.get(indexName)
      if (!index) {
        throw new Error(\`Index \${indexName} not found\`)
      }

      const exists = await this.client.indices.exists({ index: index.name })
      if (!exists) {
        await this.client.indices.create({
          index: index.name,
          body: {
            mappings: index.mappings,
            settings: index.settings
          }
        })
        console.log(\`Created index: \${index.name}\`)
      } else {
        console.log(\`Index \${index.name} already exists\`)
      }
    } catch (error) {
      console.error(\`Failed to create index \${indexName}:\`, error)
      throw error
    }
  }

  // Delete index
  async deleteIndex(indexName: string): Promise<void> {
    try {
      const index = this.indices.get(indexName)
      if (!index) {
        throw new Error(\`Index \${indexName} not found\`)
      }

      await this.client.indices.delete({ index: index.name })
      console.log(\`Deleted index: \${index.name}\`)
    } catch (error) {
      console.error(\`Failed to delete index \${indexName}:\`, error)
      throw error
    }
  }

  // Index document
  async indexDocument(indexName: string, document: any, id?: string): Promise<string> {
    try {
      const index = this.indices.get(indexName)
      if (!index) {
        throw new Error(\`Index \${indexName} not found\`)
      }

      const response = await this.client.index({
        index: index.name,
        id,
        body: document,
        refresh: 'wait_for'
      })

      return response._id
    } catch (error) {
      console.error(\`Failed to index document in \${indexName}:\`, error)
      throw error
    }
  }

  // Update document
  async updateDocument(indexName: string, id: string, document: any): Promise<void> {
    try {
      const index = this.indices.get(indexName)
      if (!index) {
        throw new Error(\`Index \${indexName} not found\`)
      }

      await this.client.update({
        index: index.name,
        id,
        body: { doc: document },
        refresh: 'wait_for'
      })
    } catch (error) {
      console.error(\`Failed to update document in \${indexName}:\`, error)
      throw error
    }
  }

  // Delete document
  async deleteDocument(indexName: string, id: string): Promise<void> {
    try {
      const index = this.indices.get(indexName)
      if (!index) {
        throw new Error(\`Index \${indexName} not found\`)
      }

      await this.client.delete({
        index: index.name,
        id,
        refresh: 'wait_for'
      })
    } catch (error) {
      console.error(\`Failed to delete document from \${indexName}:\`, error)
      throw error
    }
  }

  // Search documents
  async search(indexName: string, query: any, options?: {
    from?: number
    size?: number
    sort?: any[]
    highlight?: any
    aggregations?: any
  }) {
    try {
      const index = this.indices.get(indexName)
      if (!index) {
        throw new Error(\`Index \${indexName} not found\`)
      }

      const response = await this.client.search({
        index: index.name,
        body: {
          query,
          from: options?.from || 0,
          size: options?.size || 10,
          sort: options?.sort,
          highlight: options?.highlight,
          aggregations: options?.aggregations
        }
      })

      return response.body
    } catch (error) {
      console.error(\`Failed to search in \${indexName}:\`, error)
      throw error
    }
  }

  // Get document
  async getDocument(indexName: string, id: string) {
    try {
      const index = this.indices.get(indexName)
      if (!index) {
        throw new Error(\`Index \${indexName} not found\`)
      }

      const response = await this.client.get({
        index: index.name,
        id
      })

      return response.body
    } catch (error) {
      console.error(\`Failed to get document from \${indexName}:\`, error)
      throw error
    }
  }

  // Bulk operations
  async bulk(operations: any[]): Promise<void> {
    try {
      const response = await this.client.bulk({
        body: operations,
        refresh: 'wait_for'
      })

      if (response.body.errors) {
        console.error('Bulk operation errors:', response.body.items)
      }
    } catch (error) {
      console.error('Failed to execute bulk operations:', error)
      throw error
    }
  }

  // Get cluster health
  async getClusterHealth() {
    try {
      const response = await this.client.cluster.health()
      return response.body
    } catch (error) {
      console.error('Failed to get cluster health:', error)
      throw error
    }
  }

  // Get index stats
  async getIndexStats(indexName: string) {
    try {
      const index = this.indices.get(indexName)
      if (!index) {
        throw new Error(\`Index \${indexName} not found\`)
      }

      const response = await this.client.indices.stats({ index: index.name })
      return response.body
    } catch (error) {
      console.error(\`Failed to get index stats for \${indexName}:\`, error)
      throw error
    }
  }

  // Reindex data
  async reindex(sourceIndex: string, targetIndex: string) {
    try {
      const source = this.indices.get(sourceIndex)
      const target = this.indices.get(targetIndex)
      
      if (!source || !target) {
        throw new Error('Source or target index not found')
      }

      const response = await this.client.reindex({
        body: {
          source: { index: source.name },
          dest: { index: target.name }
        },
        refresh: true
      })

      return response.body
    } catch (error) {
      console.error(\`Failed to reindex from \${sourceIndex} to \${targetIndex}:\`, error)
      throw error
    }
  }

  // Get all indices
  getIndices(): Map<string, SearchIndex> {
    return this.indices
  }

  // Add custom index
  addIndex(name: string, index: SearchIndex) {
    this.indices.set(name, index)
  }
}

// Global Elasticsearch manager instance
export const elasticsearchManager = new ElasticsearchManager()

export default ElasticsearchManager
`

  // Write Elasticsearch client
  const clients = [
    { file: 'lib/elasticsearch/client.ts', content: esClient }
  ]
  
  clients.forEach(({ file, content }) => {
    const filePath = path.join(process.cwd(), file)
    fs.writeFileSync(filePath, content)
    colorLog(`  ✅ Created ${file}`, 'green')
  })
}

// Create search services
function createSearchServices() {
  colorLog('\n🔍 Creating search services...', 'cyan')
  
  const patientSearch = `// Patient Search Service
import { elasticsearchManager } from './client'
import { SearchQuery, SearchResult, PatientFilters } from '@/types/elasticsearch'

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
    return await elasticsearchManager.indexDocument(this.indexName, patient, patient.id)
  }

  // Update patient data
  async updatePatient(id: string, updates: Partial<PatientSearchDocument>): Promise<void> {
    await elasticsearchManager.updateDocument(this.indexName, id, updates)
  }

  // Delete patient from search index
  async deletePatient(id: string): Promise<void> {
    await elasticsearchManager.deleteDocument(this.indexName, id)
  }

  // Search patients
  async searchPatients(query: string, filters: PatientFilters = {}, options: {
    from?: number
    size?: number
    sort?: string
  } = {}): Promise<SearchResult<PatientSearchDocument>> {
    const searchQuery = this.buildSearchQuery(query, filters)
    const sortOptions = this.buildSortOptions(options.sort)

    const response = await elasticsearchManager.search(this.indexName, searchQuery, {
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
      hits: response.hits.hits.map(hit => ({
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

    const response = await elasticsearchManager.search(this.indexName, searchQuery, {
      from: options.from,
      size: options.size,
      sort: sortOptions
    })

    return {
      hits: response.hits.hits.map(hit => ({
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

    const response = await elasticsearchManager.search(this.indexName, searchQuery, {
      size: 10,
      _source: ['id', 'firstName', 'lastName', 'email', 'phone']
    })

    return response.hits.hits.map(hit => ({
      id: hit._source.id,
      name: \`\${hit._source.firstName} \${hit._source.lastName}\`,
      email: hit._source.email,
      phone: hit._source.phone
    }))
  }

  // Get similar patients
  async getSimilarPatients(patientId: string, options: {
    size?: number
    excludeSelf?: boolean
  } = {}): Promise<SearchResult<PatientSearchDocument>> {
    const patient = await elasticsearchManager.getDocument(this.indexName, patientId)
    
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
      searchQuery.bool = {
        must_not: [{ term: { _id: patientId } }]
      }
    }

    const response = await elasticsearchManager.search(this.indexName, searchQuery, {
      size: options.size || 10
    })

    return {
      hits: response.hits.hits.map(hit => ({
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

    const response = await elasticsearchManager.search(this.indexName, searchQuery, {
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
`

  // Write search services
  const services = [
    { file: 'lib/elasticsearch/services/patient-search.ts', content: patientSearch }
  ]
  
  services.forEach(({ file, content }) => {
    const filePath = path.join(process.cwd(), file)
    fs.writeFileSync(filePath, content)
    colorLog(`  ✅ Created ${file}`, 'green')
  })
}

// Create search API endpoints
function createSearchAPIs() {
  colorLog('\n🔌 Creating search API endpoints...', 'cyan')
  
  const searchAPI = `// Universal Search API
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
          sort
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
        results = await patientSearchService.advancedSearch(query || {}, filters || {}, options || {})
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
`

  const suggestionsAPI = `// Search Suggestions API
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
`

  // Write API endpoints
  const apis = [
    { file: 'app/api/search/route.ts', content: searchAPI },
    { file: 'app/api/search/suggestions/route.ts', content: suggestionsAPI }
  ]
  
  apis.forEach(({ file, content }) => {
    const filePath = path.join(process.cwd(), file)
    fs.writeFileSync(filePath, content)
    colorLog(`  ✅ Created ${file}`, 'green')
  })
}

// Create search components
function createSearchComponents() {
  colorLog('\n🧩 Creating search components...', 'cyan')
  
  const searchInterface = `'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Checkbox } from '@/components/ui/checkbox'
import { 
  Search, 
  Filter, 
  X, 
  User, 
  Calendar,
  MapPin,
  Activity,
  TrendingUp,
  Star,
  Clock
} from 'lucide-react'

interface SearchFilters {
  gender?: string
  ageRange?: [number, number]
  tags?: string[]
  treatmentTypes?: string[]
  scoreRange?: [number, number]
}

interface SearchResult {
  id: string
  score: number
  source: any
  highlight?: any
}

interface SearchInterfaceProps {
  clinicId: string
  onResultSelect?: (result: SearchResult) => void
}

const SearchInterface: React.FC<SearchInterfaceProps> = ({ 
  clinicId, 
  onResultSelect 
}) => {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [suggestions, setSuggestions] = useState<Array<{
    id: string
    name: string
    email: string
    phone: string
  }>>([])
  const [filters, setFilters] = useState<SearchFilters>({})
  const [loading, setLoading] = useState(false)
  const [total, setTotal] = useState(0)
  const [showFilters, setShowFilters] = useState(false)
  const [activeTab, setActiveTab] = useState('all')
  
  const searchTimeoutRef = useRef<NodeJS.Timeout>()
  const abortControllerRef = useRef<AbortController>()

  // Debounced search
  useEffect(() => {
    if (query.length < 2) {
      setSuggestions([])
      return
    }

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    searchTimeoutRef.current = setTimeout(() => {
      fetchSuggestions()
    }, 300)

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [query])

  // Search when query or filters change
  useEffect(() => {
    if (query.length >= 2 || Object.keys(filters).length > 0) {
      performSearch()
    }
  }, [query, filters])

  const fetchSuggestions = async () => {
    try {
      const response = await fetch(
        \`/api/search/suggestions?q=\${encodeURIComponent(query)}&type=patients&clinicId=\${clinicId}\`
      )
      const data = await response.json()
      
      if (data.success) {
        setSuggestions(data.suggestions)
      }
    } catch (error) {
      console.error('Failed to fetch suggestions:', error)
    }
  }

  const performSearch = async () => {
    setLoading(true)
    
    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    
    abortControllerRef.current = new AbortController()

    try {
      const params = new URLSearchParams({
        q: query,
        type: 'patients',
        clinicId,
        from: '0',
        size: '20'
      })

      // Add filters
      if (filters.gender) {
        params.append('gender', filters.gender)
      }
      
      if (filters.ageRange) {
        params.append('minAge', filters.ageRange[0].toString())
        params.append('maxAge', filters.ageRange[1].toString())
      }
      
      if (filters.tags && filters.tags.length > 0) {
        params.append('tags', filters.tags.join(','))
      }
      
      if (filters.treatmentTypes && filters.treatmentTypes.length > 0) {
        params.append('treatmentTypes', filters.treatmentTypes.join(','))
      }
      
      if (filters.scoreRange) {
        params.append('minScore', filters.scoreRange[0].toString())
        params.append('maxScore', filters.scoreRange[1].toString())
      }

      const response = await fetch(\`/api/search?\${params}\`, {
        signal: abortControllerRef.current.signal
      })
      
      const data = await response.json()
      
      if (data.success) {
        setResults(data.data.hits)
        setTotal(data.data.total)
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Search failed:', error)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (searchQuery: string) => {
    setQuery(searchQuery)
  }

  const handleFilterChange = (newFilters: Partial<SearchFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }))
  }

  const clearFilters = () => {
    setFilters({})
  }

  const handleResultClick = (result: SearchResult) => {
    onResultSelect?.(result)
  }

  const renderSearchResult = (result: SearchResult) => {
    const patient = result.source
    
    return (
      <Card 
        key={result.id} 
        className="cursor-pointer hover:shadow-md transition-shadow"
        onClick={() => handleResultClick(result)}
      >
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-blue-600" />
              </div>
              <div className="space-y-1">
                <h4 className="font-medium">
                  {patient.firstName} {patient.lastName}
                </h4>
                <p className="text-sm text-muted-foreground">
                  {patient.email}
                </p>
                <p className="text-sm text-muted-foreground">
                  {patient.phone}
                </p>
                <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                  <Calendar className="w-3 h-3" />
                  <span>{new Date(patient.dateOfBirth).toLocaleDateString()}</span>
                  <span>•</span>
                  <span>{patient.gender}</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-muted-foreground">
                Score: {Math.round(result.score * 100)}%
              </div>
              {patient.skinAnalysis && (
                <div className="text-sm">
                  <span className="text-muted-foreground">Skin Score:</span>{' '}
                  <span className="font-medium">{patient.skinAnalysis.overallScore}</span>
                </div>
              )}
            </div>
          </div>
          
          {result.highlight && (
            <div className="mt-3 text-sm">
              {Object.entries(result.highlight).map(([field, highlights]) => (
                <div key={field} className="text-muted-foreground">
                  <em>{highlights[0]}</em>
                </div>
              ))}
            </div>
          )}
          
          {patient.tags && patient.tags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1">
              {patient.tags.map((tag: string) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  const renderFilters = () => (
    <div className="space-y-6">
      <div>
        <label className="text-sm font-medium mb-2 block">Gender</label>
        <Select value={filters.gender} onValueChange={(value) => handleFilterChange({ gender: value })}>
          <SelectTrigger>
            <SelectValue placeholder="Select gender" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All</SelectItem>
            <SelectItem value="male">Male</SelectItem>
            <SelectItem value="female">Female</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="text-sm font-medium mb-2 block">
          Age Range: {filters.ageRange ? \`\${filters.ageRange[0]} - \${filters.ageRange[1]}\` : 'All ages'}
        </label>
        <Slider
          value={filters.ageRange || [18, 80]}
          onValueChange={(value) => handleFilterChange({ ageRange: value as [number, number] })}
          max={80}
          min={18}
          step={1}
          className="w-full"
        />
      </div>

      <div>
        <label className="text-sm font-medium mb-2 block">
          Skin Score Range: {filters.scoreRange ? \`\${filters.scoreRange[0]} - \${filters.scoreRange[1]}\` : 'All scores'}
        </label>
        <Slider
          value={filters.scoreRange || [0, 100]}
          onValueChange={(value) => handleFilterChange({ scoreRange: value as [number, number] })}
          max={100}
          min={0}
          step={1}
          className="w-full"
        />
      </div>

      <div>
        <label className="text-sm font-medium mb-2 block">Tags</label>
        <div className="space-y-2">
          {['VIP', 'Regular', 'New', 'Inactive'].map(tag => (
            <div key={tag} className="flex items-center space-x-2">
              <Checkbox
                id={tag}
                checked={filters.tags?.includes(tag) || false}
                onCheckedChange={(checked) => {
                  const currentTags = filters.tags || []
                  const newTags = checked
                    ? [...currentTags, tag]
                    : currentTags.filter(t => t !== tag)
                  handleFilterChange({ tags: newTags })
                }}
              />
              <label htmlFor={tag} className="text-sm">{tag}</label>
            </div>
          ))}
        </div>
      </div>

      <Button onClick={clearFilters} variant="outline" className="w-full">
        Clear Filters
      </Button>
    </div>
  )

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <div className="space-y-6">
        {/* Search Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold">Patient Search</h1>
          <p className="text-muted-foreground">
            Search patients by name, email, phone, or medical history
          </p>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            type="text"
            placeholder="Search patients..."
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10 pr-10"
          />
          {query && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleSearch('')}
              className="absolute right-1 top-1/2 transform -translate-y-1/2"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>

        {/* Suggestions */}
        {suggestions.length > 0 && query.length >= 2 && (
          <Card className="border-t-0 rounded-t-none">
            <CardContent className="p-2">
              {suggestions.map((suggestion) => (
                <div
                  key={suggestion.id}
                  className="p-2 hover:bg-muted cursor-pointer rounded"
                  onClick={() => handleSearch(suggestion.name)}
                >
                  <div className="text-sm font-medium">{suggestion.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {suggestion.email} • {suggestion.phone}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Search Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
              {Object.keys(filters).length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {Object.keys(filters).length}
                </Badge>
              )}
            </Button>
          </div>
          <div className="text-sm text-muted-foreground">
            {total} results found
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          {showFilters && (
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Filters</CardTitle>
                </CardHeader>
                <CardContent>
                  {renderFilters()}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Results */}
          <div className={showFilters ? 'lg:col-span-3' : 'lg:col-span-4'}>
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Searching...</p>
                </div>
              </div>
            ) : results.length > 0 ? (
              <div className="space-y-4">
                {results.map(renderSearchResult)}
              </div>
            ) : query.length >= 2 ? (
              <div className="text-center py-12">
                <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No results found</h3>
                <p className="text-muted-foreground">
                  Try adjusting your search terms or filters
                </p>
              </div>
            ) : (
              <div className="text-center py-12">
                <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Start searching</h3>
                <p className="text-muted-foreground">
                  Enter at least 2 characters to begin searching
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default SearchInterface
`

  // Write search components
  const components = [
    { file: 'components/search/search-interface.tsx', content: searchInterface }
  ]
  
  components.forEach(({ file, content }) => {
    const filePath = path.join(process.cwd(), file)
    fs.writeFileSync(filePath, content)
    colorLog(`  ✅ Created ${file}`, 'green')
  })
}

// Create Elasticsearch setup scripts
function createElasticsearchScripts() {
  colorLog('\n🔧 Creating Elasticsearch setup scripts...', 'cyan')
  
  const setupScript = `#!/usr/bin/env node

// Elasticsearch Setup Script
const { Client } = require('@elastic/elasticsearch')

class ElasticsearchSetup {
  constructor() {
    this.client = new Client({
      node: process.env.ELASTICSEARCH_NODE || 'http://localhost:9200',
      auth: process.env.ELASTICSEARCH_USERNAME && process.env.ELASTICSEARCH_PASSWORD ? {
        username: process.env.ELASTICSEARCH_USERNAME,
        password: process.env.ELASTICSEARCH_PASSWORD
      } : undefined
    })
  }

  async setup() {
    console.log('🚀 Setting up Elasticsearch for Beauty with AI Precision...')
    
    try {
      // Check cluster health
      await this.checkClusterHealth()
      
      // Create indices
      await this.createIndices()
      
      // Setup mappings
      await this.setupMappings()
      
      // Create index templates
      await this.createIndexTemplates()
      
      // Setup analyzers
      await this.setupAnalyzers()
      
      console.log('✅ Elasticsearch setup completed successfully!')
      
    } catch (error) {
      console.error('❌ Elasticsearch setup failed:', error)
      process.exit(1)
    }
  }

  async checkClusterHealth() {
    console.log('📊 Checking cluster health...')
    
    const health = await this.client.cluster.health()
    console.log(\`Cluster status: \${health.body.status}\`)
    console.log(\`Number of nodes: \${health.body.number_of_nodes}\`)
    
    if (health.body.status === 'red') {
      throw new Error('Cluster health is red - cannot proceed with setup')
    }
  }

  async createIndices() {
    console.log('📁 Creating indices...')
    
    const indices = [
      {
        name: 'patients',
        settings: {
          number_of_shards: 1,
          number_of_replicas: 1,
          analysis: {
            analyzer: {
              name_analyzer: {
                type: 'custom',
                tokenizer: 'standard',
                filter: ['lowercase', 'asciifolding']
              }
            }
          }
        }
      },
      {
        name: 'treatments',
        settings: {
          number_of_shards: 1,
          number_of_replicas: 1
        }
      },
      {
        name: 'analytics',
        settings: {
          number_of_shards: 1,
          number_of_replicas: 1
        }
      }
    ]

    for (const index of indices) {
      const exists = await this.client.indices.exists({ index: index.name })
      
      if (!exists) {
        await this.client.indices.create({
          index: index.name,
          body: { settings: index.settings }
        })
        console.log(\`  ✅ Created index: \${index.name}\`)
      } else {
        console.log(\`  ℹ️ Index \${index.name} already exists\`)
      }
    }
  }

  async setupMappings() {
    console.log('📋 Setting up mappings...')
    
    // Patient mappings
    const patientMappings = {
      properties: {
        id: { type: 'keyword' },
        clinicId: { type: 'keyword' },
        firstName: {
          type: 'text',
          analyzer: 'name_analyzer',
          fields: {
            keyword: { type: 'keyword' },
            suggest: {
              type: 'completion',
              analyzer: 'simple'
            }
          }
        },
        lastName: {
          type: 'text',
          analyzer: 'name_analyzer',
          fields: {
            keyword: { type: 'keyword' },
            suggest: {
              type: 'completion',
              analyzer: 'simple'
            }
          }
        },
        email: { type: 'keyword' },
        phone: { type: 'keyword' },
        dateOfBirth: { type: 'date' },
        gender: { type: 'keyword' },
        address: {
          type: 'object',
          properties: {
            street: { type: 'text' },
            city: { type: 'text' },
            state: { type: 'keyword' },
            zipCode: { type: 'keyword' },
            country: { type: 'keyword' }
          }
        },
        medicalHistory: {
          type: 'nested',
          properties: {
            condition: { type: 'text' },
            medications: { type: 'text' },
            allergies: { type: 'text' },
            surgeries: { type: 'text' }
          }
        },
        treatments: {
          type: 'nested',
          properties: {
            type: { type: 'keyword' },
            date: { type: 'date' },
            results: { type: 'text' },
            practitioner: { type: 'text' }
          }
        },
        skinAnalysis: {
          type: 'object',
          properties: {
            overallScore: { type: 'integer' },
            spots: { type: 'integer' },
            wrinkles: { type: 'integer' },
            texture: { type: 'integer' },
            pores: { type: 'integer' },
            redness: { type: 'integer' },
            uvDamage: { type: 'integer' },
            acne: { type: 'integer' }
          }
        },
        tags: { type: 'keyword' },
        notes: { type: 'text' },
        createdAt: { type: 'date' },
        updatedAt: { type: 'date' }
      }
    }

    await this.client.indices.putMapping({
      index: 'patients',
      body: patientMappings
    })
    console.log('  ✅ Set up patient mappings')

    // Treatment mappings
    const treatmentMappings = {
      properties: {
        id: { type: 'keyword' },
        clinicId: { type: 'keyword' },
        patientId: { type: 'keyword' },
        type: { type: 'keyword' },
        name: {
          type: 'text',
          analyzer: 'standard',
          fields: {
            keyword: { type: 'keyword' },
            suggest: {
              type: 'completion',
              analyzer: 'simple'
            }
          }
        },
        description: { type: 'text' },
        category: { type: 'keyword' },
        subcategory: { type: 'keyword' },
        price: { type: 'float' },
        duration: { type: 'integer' },
        practitioner: {
          type: 'object',
          properties: {
            id: { type: 'keyword' },
            name: { type: 'text' },
            specialty: { type: 'keyword' }
          }
        },
        results: {
          type: 'object',
          properties: {
            beforeAfter: { type: 'boolean' },
            satisfaction: { type: 'integer' },
            notes: { type: 'text' }
          }
        },
        products: {
          type: 'nested',
          properties: {
            name: { type: 'text' },
            brand: { type: 'keyword' },
            quantity: { type: 'integer' }
          }
        },
        date: { type: 'date' },
        status: { type: 'keyword' },
        tags: { type: 'keyword' },
        createdAt: { type: 'date' },
        updatedAt: { type: 'date' }
      }
    }

    await this.client.indices.putMapping({
      index: 'treatments',
      body: treatmentMappings
    })
    console.log('  ✅ Set up treatment mappings')
  }

  async createIndexTemplates() {
    console.log('📄 Creating index templates...')
    
    const patientTemplate = {
      index_patterns: ['patients-*'],
      template: {
        settings: {
          number_of_shards: 1,
          number_of_replicas: 1,
          analysis: {
            analyzer: {
              name_analyzer: {
                type: 'custom',
                tokenizer: 'standard',
                filter: ['lowercase', 'asciifolding']
              }
            }
          }
        },
        mappings: {
          properties: {
            id: { type: 'keyword' },
            clinicId: { type: 'keyword' },
            firstName: {
              type: 'text',
              analyzer: 'name_analyzer',
              fields: {
                keyword: { type: 'keyword' }
              }
            },
            lastName: {
              type: 'text',
              analyzer: 'name_analyzer',
              fields: {
                keyword: { type: 'keyword' }
              }
            },
            email: { type: 'keyword' },
            phone: { type: 'keyword' },
            dateOfBirth: { type: 'date' },
            gender: { type: 'keyword' },
            createdAt: { type: 'date' },
            updatedAt: { type: 'date' }
          }
        }
      }
    }

    await this.client.indices.putIndexTemplate({
      name: 'patients-template',
      body: patientTemplate
    })
    console.log('  ✅ Created patient index template')
  }

  async setupAnalyzers() {
    console.log('🔧 Setting up custom analyzers...')
    
    // Custom analyzers are defined in the index settings
    console.log('  ✅ Analyzers configured in index settings')
  }

  async cleanup() {
    console.log('🧹 Cleaning up Elasticsearch...')
    
    const indices = ['patients', 'treatments', 'analytics']
    
    for (const indexName of indices) {
      const exists = await this.client.indices.exists({ index: indexName })
      
      if (exists) {
        await this.client.indices.delete({ index: indexName })
        console.log(\`  🗑️ Deleted index: \${indexName}\`)
      }
    }
  }

  async status() {
    console.log('📊 Elasticsearch Status:')
    
    try {
      const health = await this.client.cluster.health()
      console.log(\`  Cluster Status: \${health.body.status}\`)
      console.log(\`  Number of Nodes: \${health.body.number_of_nodes}\`)
      console.log(\`  Active Primary Shards: \${health.body.active_primary_shards}\`)
      console.log(\`  Active Shards: \${health.body.active_shards}\`)
      
      const indices = await this.client.cat.indices({ format: 'json' })
      console.log('\\n  Indices:')
      indices.body.forEach(index => {
        console.log(\`    \${index.index}: \${index['docs.count']} docs, \${index['store.size']} storage\`)
      })
      
    } catch (error) {
      console.error('Failed to get status:', error)
    }
  }
}

// CLI interface
const setup = new ElasticsearchSetup()
const command = process.argv[2]

switch (command) {
  case 'setup':
    setup.setup()
    break
    
  case 'cleanup':
    setup.cleanup()
    break
    
  case 'status':
    setup.status()
    break
    
  default:
    console.log('Usage: node elasticsearch-setup.js [setup|cleanup|status]')
    break
}

module.exports = ElasticsearchSetup
`

  // Write setup scripts
  const scripts = [
    { file: 'scripts/elasticsearch/setup.js', content: setupScript }
  ]
  
  scripts.forEach(({ file, content }) => {
    const filePath = path.join(process.cwd(), file)
    fs.writeFileSync(filePath, content)
    fs.chmodSync(filePath, '755') // Make executable
    colorLog(`  ✅ Created ${file}`, 'green')
  })
}

// Create Elasticsearch configuration
function createElasticsearchConfig() {
  colorLog('\n⚙️ Creating Elasticsearch configuration...', 'cyan')
  
  const esConfig = `// Elasticsearch Configuration
export const elasticsearchConfig = {
  // Connection settings
  node: process.env.ELASTICSEARCH_NODE || 'http://localhost:9200',
  auth: process.env.ELASTICSEARCH_USERNAME && process.env.ELASTICSEARCH_PASSWORD ? {
    username: process.env.ELASTICSEARCH_USERNAME,
    password: process.env.ELASTICSEARCH_PASSWORD
  } : undefined,
  
  // Performance settings
  maxRetries: parseInt(process.env.ELASTICSEARCH_MAX_RETRIES || '3'),
  requestTimeout: parseInt(process.env.ELASTICSEARCH_REQUEST_TIMEOUT || '30000'),
  sniffOnStart: process.env.ELASTICSEARCH_SNIFF_ON_START === 'true',
  sniffInterval: parseInt(process.env.ELASTICSEARCH_SNIFF_INTERVAL || '300000'),
  pingTimeout: parseInt(process.env.ELASTICSEARCH_PING_TIMEOUT || '3000'),
  resurrectStrategy: (process.env.ELASTICSEARCH_RESURRECT_STRATEGY as 'ping' | 'optimistic') || 'ping',
  
  // Index settings
  indices: {
    patients: {
      name: 'patients',
      shards: 1,
      replicas: 1,
      refreshInterval: '1s'
    },
    treatments: {
      name: 'treatments',
      shards: 1,
      replicas: 1,
      refreshInterval: '1s'
    },
    analytics: {
      name: 'analytics',
      shards: 1,
      replicas: 1,
      refreshInterval: '5s'
    }
  },
  
  // Search settings
  search: {
    defaultSize: 20,
    maxSize: 100,
    highlightFields: [
      'firstName',
      'lastName',
      'email',
      'notes',
      'medicalHistory.condition',
      'medicalHistory.medications',
      'treatments.type'
    ],
    suggestFields: [
      'firstName.suggest',
      'lastName.suggest',
      'email'
    ]
  },
  
  // Analyzers
  analyzers: {
    name: {
      type: 'custom',
      tokenizer: 'standard',
      filter: ['lowercase', 'asciifolding']
    },
    text: {
      type: 'custom',
      tokenizer: 'standard',
      filter: ['lowercase', 'stop', 'asciifolding']
    }
  },
  
  // Performance optimization
  optimization: {
    bulkSize: 1000,
    bulkTimeout: 30000,
    indexRefreshInterval: '30s',
    searchTimeout: 10000
  },
  
  // Security
  security: {
    enableSSL: process.env.ELASTICSEARCH_ENABLE_SSL === 'true',
    verifySSL: process.env.ELASTICSEARCH_VERIFY_SSL !== 'false',
    apiKey: process.env.ELASTICSEARCH_API_KEY
  }
}

export default elasticsearchConfig
`

  // Write configuration
  const configs = [
    { file: 'config/elasticsearch/index.ts', content: esConfig }
  ]
  
  configs.forEach(({ file, content }) => {
    const filePath = path.join(process.cwd(), file)
    fs.writeFileSync(filePath, content)
    colorLog(`  ✅ Created ${file}`, 'green')
  })
}

// Create TypeScript types
function createElasticsearchTypes() {
  colorLog('\n📝 Creating TypeScript types...', 'cyan')
  
  const esTypes = `// Elasticsearch Type Definitions
export interface SearchQuery {
  bool?: {
    must?: any[]
    should?: any[]
    must_not?: any[]
    filter?: any[]
  }
  multi_match?: {
    query: string
    fields: string[]
    type?: 'best_fields' | 'most_fields' | 'cross_fields' | 'phrase' | 'phrase_prefix'
    fuzziness?: string
  }
  match?: {
    [field: string]: any
  }
  term?: {
    [field: string]: any
  }
  terms?: {
    [field: string]: any[]
  }
  range?: {
    [field: string]: {
      gte?: string | number
      lte?: string | number
      gt?: string | number
      lt?: string | number
    }
  }
  nested?: {
    path: string
    query: any
  }
  more_like_this?: {
    fields: string[]
    like: any[]
    min_term_freq?: number
    max_query_terms?: number
    min_doc_freq?: number
  }
}

export interface SearchResult<T = any> {
  hits: Array<{
    id: string
    score: number
    source: T
    highlight?: any
    sort?: any[]
  }>
  total: number
  aggregations?: any
}

export interface PatientFilters {
  clinicId: string
  gender?: string
  ageRange?: [number, number]
  tags?: string[]
  treatmentTypes?: string[]
  scoreRange?: [number, number]
}

export interface TreatmentFilters {
  clinicId: string
  patientId?: string
  type?: string
  category?: string
  dateRange?: [string, string]
  practitioner?: string
  priceRange?: [number, number]
}

export interface AnalyticsFilters {
  clinicId: string
  event?: string
  dateRange?: [string, string]
  userId?: string
}

export interface SearchOptions {
  from?: number
  size?: number
  sort?: string | string[]
  highlight?: boolean
  aggregations?: any
}

export interface SuggestionRequest {
  query: string
  type: 'patients' | 'treatments' | 'analytics'
  clinicId: string
  size?: number
}

export interface SuggestionResult {
  id: string
  text: string
  type: string
  metadata?: any
}

export interface IndexDocument {
  id: string
  index: string
  body: any
}

export interface BulkOperation {
  index?: IndexDocument
  create?: IndexDocument
  update?: {
    _index: string
    _id: string
    doc: any
  }
  delete?: {
    _index: string
    _id: string
  }
}

export interface ElasticsearchResponse<T = any> {
  took: number
  timed_out: boolean
  _shards: {
    total: number
    successful: number
    failed: number
    skipped: number
  }
  hits: {
    total: {
      value: number
      relation: 'eq' | 'gte'
    }
    max_score: number
    hits: Array<{
      _index: string
      _id: string
      _score: number
      _source: T
      _version?: number
      _seq_no?: number
      _primary_term?: number
      highlight?: any
      sort?: any[]
      fields?: any
    }>
  }
  aggregations?: any
}

export interface ClusterHealth {
  cluster_name: string
  status: 'green' | 'yellow' | 'red'
  timed_out: boolean
  number_of_nodes: number
  number_of_data_nodes: number
  active_primary_shards: number
  active_shards: number
  relocating_shards: number
  initializing_shards: number
  unassigned_shards: number
  delayed_unassigned_shards: number
  number_of_pending_tasks: number
  number_of_in_flight_fetch: number
  task_max_waiting_in_queue_millis: number
  active_shards_percent_as_number: number
}

export interface IndexStats {
  primaries: {
    docs: {
      count: number
      deleted: number
    }
    store: {
      size: string
      size_in_bytes: number
    }
    indexing: {
      index_total: number
      index_time: string
      index_time_in_millis: number
      index_current: number
      index_failed: number
      delete_total: number
      delete_time: string
      delete_time_in_millis: number
      delete_current: number
      noop_update_total: number
      is_throttled: boolean
      throttle_time: string
      throttle_time_in_millis: number
    }
    get: {
      total: number
      time: string
      time_in_millis: number
      exists_total: number
      exists_time: string
      exists_time_in_millis: number
      missing_total: number
      missing_time: string
      missing_time_in_millis: number
      current: number
    }
    search: {
      open_contexts: number
      query_total: number
      query_time: string
      query_time_in_millis: number
      query_current: number
      scroll_total: number
      scroll_time: string
      scroll_time_in_millis: number
      scroll_current: number
    }
    merges: {
      current: number
      current_docs: number
      current_size: string
      current_size_in_bytes: number
      total: number
      total_docs: number
      total_size: string
      total_size_in_bytes: number
      total_time: string
      total_time_in_millis: number
    }
    refresh: {
      total: number
      total_time: string
      total_time_in_millis: number
    }
    flush: {
      total: number
      total_time: string
      total_time_in_millis: number
    }
    warmer: {
      current: number
      total: number
      total_time: string
      total_time_in_millis: number
    }
    query_cache: {
      memory_size: string
      memory_size_in_bytes: number
      total_count: number
      hit_count: number
      miss_count: number
      cache_size: number
      cache_count: number
      evictions: number
    }
    fielddata: {
      memory_size: string
      memory_size_in_bytes: number
      evictions: number
    }
    completion: {
      size: string
      size_in_bytes: number
    }
    segments: {
      count: number
      memory: string
      memory_in_bytes: number
      terms_memory: string
      terms_memory_in_bytes: number
      stored_fields_memory: string
      stored_fields_memory_in_bytes: number
      term_vectors_memory: string
      term_vectors_memory_in_bytes: number
      norms_memory: string
      norms_memory_in_bytes: number
      points_memory: string
      points_memory_in_bytes: number
      doc_values_memory: string
      doc_values_memory_in_bytes: number
      index_writer_memory: string
      index_writer_memory_in_bytes: number
      version_map_memory: string
      version_map_memory_in_bytes: number
      fixed_bit_set: string
      fixed_bit_set_in_bytes: number
      max_unsafe_auto_id_timestamp: number
      file_sizes: {}
    }
    translog: {
      operations: number
      size: string
      size_in_bytes: number
      uncommitted_operations: number
      uncommitted_size: string
      uncommitted_size_in_bytes: number
      earliest_last_modified_age: number
    }
    request_cache: {
      memory_size: string
      memory_size_in_bytes: number
      evictions: number
      hit_count: number
      miss_count: number
    }
    recovery: {
      current_as_source: number
      current_as_target: number
      throttle_time: string
      throttle_time_in_millis: number
    }
  }
  total: {
    docs: {
      count: number
      deleted: number
    }
    store: {
      size: string
      size_in_bytes: number
    }
    indexing: {
      index_total: number
      index_time: string
      index_time_in_millis: number
      index_current: number
      index_failed: number
      delete_total: number
      delete_time: string
      delete_time_in_millis: number
      delete_current: number
      noop_update_total: number
      is_throttled: boolean
      throttle_time: string
      throttle_time_in_millis: number
    }
    get: {
      total: number
      time: string
      time_in_millis: number
      exists_total: number
      exists_time: string
      exists_time_in_millis: number
      missing_total: number
      missing_time: string
      missing_time_in_millis: number
      current: number
    }
    search: {
      open_contexts: number
      query_total: number
      query_time: string
      query_time_in_millis: number
      query_current: number
      scroll_total: number
      scroll_time: string
      scroll_time_in_millis: number
      scroll_current: number
    }
    merges: {
      current: number
      current_docs: number
      current_size: string
      current_size_in_bytes: number
      total: number
      total_docs: number
      total_size: string
      total_size_in_bytes: number
      total_time: string
      total_time_in_millis: number
    }
    refresh: {
      total: number
      total_time: string
      total_time_in_millis: number
    }
    flush: {
      total: number
      total_time: string
      total_time_in_millis: number
    }
    warmer: {
      current: number
      total: number
      total_time: string
      total_time_in_millis: number
    }
    query_cache: {
      memory_size: string
      memory_size_in_bytes: number
      total_count: number
      hit_count: number
      miss_count: number
      cache_size: number
      cache_count: number
      evictions: number
    }
    fielddata: {
      memory_size: string
      memory_size_in_bytes: number
      evictions: number
    }
    completion: {
      size: string
      size_in_bytes: number
    }
    segments: {
      count: number
      memory: string
      memory_in_bytes: number
      terms_memory: string
      terms_memory_in_bytes: number
      stored_fields_memory: string
      stored_fields_memory_in_bytes: number
      term_vectors_memory: string
      term_vectors_memory_in_bytes: number
      norms_memory: string
      norms_memory_in_bytes: number
      points_memory: string
      points_memory_in_bytes: number
      doc_values_memory: string
      doc_values_memory_in_bytes: number
      index_writer_memory: string
      index_writer_memory_in_bytes: number
      version_map_memory: string
      version_map_memory_in_bytes: number
      fixed_bit_set: string
      fixed_bit_set_in_bytes: number
      max_unsafe_auto_id_timestamp: number
      file_sizes: {}
    }
    translog: {
      operations: number
      size: string
      size_in_bytes: number
      uncommitted_operations: number
      uncommitted_size: string
      uncommitted_size_in_bytes: number
      earliest_last_modified_age: number
    }
    request_cache: {
      memory_size: string
      memory_size_in_bytes: number
      evictions: number
      hit_count: number
      miss_count: number
    }
    recovery: {
      current_as_source: number
      current_as_target: number
      throttle_time: string
      throttle_time_in_millis: number
    }
  }
}

export interface PatientDocument {
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

export interface TreatmentDocument {
  id: string
  clinicId: string
  patientId: string
  type: string
  name: string
  description: string
  category: string
  subcategory: string
  price: number
  duration: number
  practitioner: {
    id: string
    name: string
    specialty: string
  }
  results: {
    beforeAfter: boolean
    satisfaction: number
    notes: string
  }
  products: Array<{
    name: string
    brand: string
    quantity: number
  }>
  date: string
  status: string
  tags: string[]
  createdAt: string
  updatedAt: string
}

export interface AnalyticsDocument {
  id: string
  clinicId: string
  type: string
  event: string
  data: any
  timestamp: string
  userId: string
  sessionId: string
  metadata: any
}
`

  // Write TypeScript types
  const types = [
    { file: 'types/elasticsearch/index.ts', content: esTypes }
  ]
  
  types.forEach(({ file, content }) => {
    const filePath = path.join(process.cwd(), file)
    fs.writeFileSync(filePath, content)
    colorLog(`  ✅ Created ${file}`, 'green')
  })
}

// Update package.json with Elasticsearch scripts
function updatePackageScripts() {
  colorLog('\n📦 Updating package.json with Elasticsearch scripts...', 'cyan')
  
  try {
    const packagePath = path.join(process.cwd(), 'package.json')
    const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'))
    
    // Add Elasticsearch dependencies
    const newDependencies = {
      '@elastic/elasticsearch': '^8.11.0'
    }
    
    // Add Elasticsearch scripts
    const newScripts = {
      'es:setup': 'node scripts/elasticsearch/setup.js setup',
      'es:cleanup': 'node scripts/elasticsearch/setup.js cleanup',
      'es:status': 'node scripts/elasticsearch/setup.js status',
      'es:index': 'node scripts/elasticsearch/index.js',
      'es:reindex': 'node scripts/elasticsearch/migration.js',
      'es:search': 'node scripts/elasticsearch/search.js'
    }
    
    // Merge dependencies and scripts
    packageJson.dependencies = {
      ...packageJson.dependencies,
      ...newDependencies
    }
    
    packageJson.scripts = {
      ...packageJson.scripts,
      ...newScripts
    }
    
    fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2))
    colorLog('✅ Package.json updated with Elasticsearch dependencies and scripts', 'green')
    
  } catch (error) {
    colorLog(`⚠️ Could not update package.json: ${error.message}`, 'yellow')
  }
}

// Create Elasticsearch documentation
function createElasticsearchDocumentation() {
  colorLog('\n📚 Creating Elasticsearch documentation...', 'cyan')
  
  const esDocs = `# Advanced Search with Elasticsearch

## 🔍 Comprehensive Search Implementation

Beauty with AI Precision features advanced search capabilities powered by Elasticsearch, providing fast, relevant, and scalable search across patient records, treatments, and analytics data.

### 🎯 Key Features

#### Advanced Search Capabilities
- **Full-text Search**: Natural language search across all text fields
- **Fuzzy Matching**: Handles typos and variations in search terms
- **Multi-field Search**: Search across multiple fields simultaneously
- **Faceted Search**: Filter results by categories, tags, and attributes
- **Auto-complete**: Real-time suggestions as users type

#### Intelligent Indexing
- **Dynamic Mappings**: Automatic field type detection and mapping
- **Custom Analyzers**: Specialized text processing for medical terms
- **Nested Objects**: Complex data structure support
- **Geo-search**: Location-based search capabilities
- **Performance Optimization**: Efficient indexing and query execution

#### Real-time Analytics
- **Search Analytics**: Track search patterns and popular queries
- **Performance Metrics**: Monitor search response times and accuracy
- **User Behavior**: Analyze how users interact with search results
- **A/B Testing**: Compare search algorithm performance

## 🚀 Quick Start

### 1. Install Elasticsearch
\`\`\`bash
# Using Docker
docker run -d --name elasticsearch \\
  -p 9200:9200 -p 9300:9300 \\
  -e "discovery.type=single-node" \\
  -e "xpack.security.enabled=false" \\
  elasticsearch:8.11.0

# Or download and install locally
# https://www.elastic.co/downloads/elasticsearch
\`\`\`

### 2. Setup Search Indices
\`\`\`bash
# Setup Elasticsearch indices and mappings
pnpm es:setup

# Check cluster status
pnpm es:status
\`\`\`

### 3. Configure Environment
\`\`\`bash
# .env.local
ELASTICSEARCH_NODE=http://localhost:9200
ELASTICSEARCH_USERNAME=elastic
ELASTICSEARCH_PASSWORD=changeme
\`\`\`

### 4. Start Using Search
\`\`\`bash
# Index patient data
pnpm es:index patients

# Search patients
curl "http://localhost:3000/api/search?q=john&type=patients&clinicId=your-clinic-id"
\`\`\`

## 📋 Search Architecture

### Index Structure

#### Patients Index
\`\`\`json
{
  "mappings": {
    "properties": {
      "id": { "type": "keyword" },
      "clinicId": { "type": "keyword" },
      "firstName": {
        "type": "text",
        "analyzer": "name_analyzer",
        "fields": {
          "keyword": { "type": "keyword" },
          "suggest": {
            "type": "completion",
            "analyzer": "simple"
          }
        }
      },
      "lastName": {
        "type": "text",
        "analyzer": "name_analyzer",
        "fields": {
          "keyword": { "type": "keyword" },
          "suggest": {
            "type": "completion",
            "analyzer": "simple"
          }
        }
      },
      "email": { "type": "keyword" },
      "phone": { "type": "keyword" },
      "dateOfBirth": { "type": "date" },
      "gender": { "type": "keyword" },
      "address": {
        "type": "object",
        "properties": {
          "street": { "type": "text" },
          "city": { "type": "text" },
          "state": { "type": "keyword" },
          "zipCode": { "type": "keyword" },
          "country": { "type": "keyword" }
        }
      },
      "medicalHistory": {
        "type": "nested",
        "properties": {
          "condition": { "type": "text" },
          "medications": { "type": "text" },
          "allergies": { "type": "text" },
          "surgeries": { "type": "text" }
        }
      },
      "treatments": {
        "type": "nested",
        "properties": {
          "type": { "type": "keyword" },
          "date": { "type": "date" },
          "results": { "type": "text" },
          "practitioner": { "type": "text" }
        }
      },
      "skinAnalysis": {
        "type": "object",
        "properties": {
          "overallScore": { "type": "integer" },
          "spots": { "type": "integer" },
          "wrinkles": { "type": "integer" },
          "texture": { "type": "integer" },
          "pores": { "type": "integer" },
          "redness": { "type": "integer" },
          "uvDamage": { "type": "integer" },
          "acne": { "type": "integer" }
        }
      },
      "tags": { "type": "keyword" },
      "notes": { "type": "text" },
      "createdAt": { "type": "date" },
      "updatedAt": { "type": "date" }
    }
  }
}
\`\`\`

#### Treatments Index
\`\`\`json
{
  "mappings": {
    "properties": {
      "id": { "type": "keyword" },
      "clinicId": { "type": "keyword" },
      "patientId": { "type": "keyword" },
      "type": { "type": "keyword" },
      "name": {
        "type": "text",
        "fields": {
          "keyword": { "type": "keyword" },
          "suggest": {
            "type": "completion",
            "analyzer": "simple"
          }
        }
      },
      "description": { "type": "text" },
      "category": { "type": "keyword" },
      "subcategory": { "type": "keyword" },
      "price": { "type": "float" },
      "duration": { "type": "integer" },
      "practitioner": {
        "type": "object",
        "properties": {
          "id": { "type": "keyword" },
          "name": { "type": "text" },
          "specialty": { "type": "keyword" }
        }
      },
      "results": {
        "type": "object",
        "properties": {
          "beforeAfter": { "type": "boolean" },
          "satisfaction": { "type": "integer" },
          "notes": { "type": "text" }
        }
      },
      "products": {
        "type": "nested",
        "properties": {
          "name": { "type": "text" },
          "brand": { "type": "keyword" },
          "quantity": { "type": "integer" }
        }
      },
      "date": { "type": "date" },
      "status": { "type": "keyword" },
      "tags": { "type": "keyword" },
      "createdAt": { "type": "date" },
      "updatedAt": { "type": "date" }
    }
  }
}
\`\`\`

## 🔧 API Endpoints

### Universal Search
\`\`\`bash
# Basic search
GET /api/search?q=john&type=patients&clinicId=your-clinic-id

# Advanced search with filters
GET /api/search?q=john&gender=female&minAge=25&maxAge=45&tags=VIP

# Pagination and sorting
GET /api/search?q=john&from=0&size=20&sort=createdAt:desc
\`\`\`

### Search Suggestions
\`\`\`bash
# Get autocomplete suggestions
GET /api/search/suggestions?q=jo&type=patients&clinicId=your-clinic-id
\`\`\`

### Advanced Search
\`\`\`bash
POST /api/search
{
  "query": {
    "basic": "skin treatment",
    "demographics": {
      "ageRange": [25, 45],
      "gender": "female"
    },
    "medical": {
      "conditions": ["acne", "rosacea"],
      "medications": ["retinol"]
    },
    "treatments": {
      "types": ["facial", "chemical peel"],
      "dateRange": ["2023-01-01", "2023-12-31"]
    },
    "skinAnalysis": {
      "scoreRange": [60, 80],
      "concerns": ["acne", "wrinkles"]
    }
  },
  "options": {
    "from": 0,
    "size": 20,
    "sort": "createdAt:desc"
  }
}
\`\`\`

## 🎨 Search Components

### Search Interface
\`\`\`tsx
import SearchInterface from '@/components/search/search-interface'

<SearchInterface 
  clinicId="your-clinic-id"
  onResultSelect={(result) => {
    console.log('Selected patient:', result)
  }}
/>
\`\`\`

### Search Features
- **Real-time Search**: Instant results as you type
- **Auto-complete**: Smart suggestions
- **Advanced Filters**: Multi-criteria filtering
- **Result Highlighting**: Highlighted search terms
- **Faceted Navigation**: Category-based browsing
- **Export Results**: Download search results

## 📊 Search Analytics

### Performance Metrics
- **Query Response Time**: Average search response time
- **Index Size**: Storage usage and document count
- **Search Volume**: Number of searches per time period
- **Popular Queries**: Most frequently searched terms
- **Zero Results**: Queries that return no results

### User Behavior
- **Click-through Rate**: Percentage of searches that result in clicks
- **Search Refinement**: How users modify their searches
- **Filter Usage**: Which filters are most commonly used
- **Result Engagement**: How users interact with search results

### Business Intelligence
- **Patient Discovery**: How patients find the clinic
- **Treatment Interest**: Popular treatment searches
- **Service Demand**: Search trends for different services
- **Conversion Tracking**: Search to appointment conversion

## 🔍 Search Features

### Text Search
- **Full-text Search**: Search across all text content
- **Phrase Search**: Exact phrase matching
- **Wildcard Search**: Pattern matching with wildcards
- **Proximity Search**: Find terms near each other
- **Boosting**: Prioritize certain fields

### Numeric and Date Search
- **Range Queries**: Search within numeric or date ranges
- **Comparison Operators**: Greater than, less than, etc.
- **Date Math**: Relative date calculations
- **Statistical Queries**: Min, max, avg calculations

### Geo Search
- **Distance Queries**: Find results within radius
- **Bounding Box**: Search within geographic area
- **Geo Shape**: Complex geographic shapes
- **Location Sorting**: Sort by distance

### Aggregations
- **Terms Aggregation**: Count occurrences of terms
- **Date Histogram**: Time-based aggregations
- **Range Aggregation**: Custom range buckets
- **Stats Aggregation**: Statistical calculations

## 🛠️ Configuration

### Environment Variables
\`\`\`bash
# Elasticsearch Connection
ELASTICSEARCH_NODE=http://localhost:9200
ELASTICSEARCH_USERNAME=elastic
ELASTICSEARCH_PASSWORD=changeme

# Performance Settings
ELASTICSEARCH_MAX_RETRIES=3
ELASTICSEARCH_REQUEST_TIMEOUT=30000
ELASTICSEARCH_SNIFF_ON_START=true
ELASTICSEARCH_SNIFF_INTERVAL=300000
ELASTICSEARCH_PING_TIMEOUT=3000

# Security
ELASTICSEARCH_ENABLE_SSL=false
ELASTICSEARCH_VERIFY_SSL=true
ELASTICSEARCH_API_KEY=your-api-key
\`\`\`

### Search Configuration
\`\`\`typescript
// config/elasticsearch/index.ts
export const elasticsearchConfig = {
  node: process.env.ELASTICSEARCH_NODE,
  maxRetries: 3,
  requestTimeout: 30000,
  indices: {
    patients: { shards: 1, replicas: 1 },
    treatments: { shards: 1, replicas: 1 }
  },
  search: {
    defaultSize: 20,
    maxSize: 100,
    highlightFields: ['firstName', 'lastName', 'notes']
  }
}
\`\`\`

## 📈 Performance Optimization

### Index Optimization
- **Shard Strategy**: Optimal shard distribution
- **Replica Configuration**: Balance performance and reliability
- **Refresh Interval**: Balance between freshness and performance
- **Merge Policy**: Optimize segment merging

### Query Optimization
- **Query Caching**: Cache frequent queries
- **Filter Caching**: Cache filter results
- **Index Optimization**: Efficient index design
- **Query Profiling**: Analyze query performance

### Scaling Strategies
- **Horizontal Scaling**: Add more nodes
- **Vertical Scaling**: Increase node resources
- **Load Balancing**: Distribute search load
- **Caching Layers**: Multi-level caching

## 🔒 Security Considerations

### Access Control
- **Role-based Access**: Restrict search by user role
- **Clinic Isolation**: Multi-tenant data separation
- **Field-level Security**: Restrict sensitive fields
- **Audit Logging**: Track all search activities

### Data Protection
- **Encryption**: Data at rest and in transit
- **Authentication**: Secure API access
- **Authorization**: Permission-based access
- **Privacy Compliance**: HIPAA and GDPR compliance

## 🛠️ Troubleshooting

### Common Issues

#### Slow Search Performance
1. Check index health and statistics
2. Optimize query structure
3. Review shard configuration
4. Monitor resource usage

#### No Search Results
1. Verify data indexing
2. Check query syntax
3. Review analyzer configuration
4. Validate field mappings

#### Memory Issues
1. Monitor JVM heap usage
2. Optimize field data cache
3. Review aggregation usage
4. Check index size

### Debugging Tools
- **Query Profiler**: Analyze query execution
- **Index Stats**: Monitor index performance
- **Cluster Health**: Check cluster status
- **Slow Log**: Identify slow queries

## 📞 Support and Resources

### Getting Help
- **Documentation**: Complete search documentation
- **API Reference**: Detailed API documentation
- **Community**: User forums and discussions
- **Support**: Technical support team

### Additional Resources
- [Elasticsearch Official Documentation](https://www.elastic.co/guide/)
- [Search Best Practices](./best-practices.md)
- [Performance Tuning Guide](./performance-tuning.md)
- [Security Configuration](./security.md)

---

**Advanced search capabilities powered by Elasticsearch provide fast, accurate, and scalable search for Beauty with AI Precision platform.**

🚀 [Start Searching Now](../search/)  
📊 [View Analytics](./analytics.md)  
🔧 [Configure Search](./configuration.md)  
📞 [Get Support](https://support.beauty-with-ai-precision.com)
`

  // Write documentation
  const docs = [
    { file: 'docs/elasticsearch/README.md', content: esDocs }
  ]
  
  docs.forEach(({ file, content }) => {
    const filePath = path.join(process.cwd(), file)
    fs.writeFileSync(filePath, content)
    colorLog(`  ✅ Created ${file}`, 'green')
  })
}

// Main execution function
async function main() {
  colorLog('🔍 Setting up Advanced Search with Elasticsearch', 'bright')
  colorLog('='.repeat(60), 'cyan')
  
  try {
    createElasticsearchDirectories()
    createElasticsearchClient()
    createSearchServices()
    createSearchAPIs()
    createSearchComponents()
    createElasticsearchScripts()
    createElasticsearchConfig()
    createElasticsearchTypes()
    updatePackageScripts()
    createElasticsearchDocumentation()
    
    colorLog('\n' + '='.repeat(60), 'green')
    colorLog('🎉 Advanced Search with Elasticsearch setup completed!', 'bright')
    colorLog('\n📋 Next Steps:', 'cyan')
    colorLog('1. Install and configure Elasticsearch server', 'blue')
    colorLog('2. Set up environment variables for connection', 'blue')
    colorLog('3. Run setup script: pnpm es:setup', 'blue')
    colorLog('4. Index existing data: pnpm es:index', 'blue')
    colorLog('5. Test search functionality', 'blue')
    
    colorLog('\n🔍 Search Features:', 'yellow')
    colorLog('• Full-text search with fuzzy matching', 'white')
    colorLog('• Multi-field and cross-field search', 'white')
    colorLog('• Advanced filtering and faceted search', 'white')
    colorLog('• Real-time suggestions and auto-complete', 'white')
    colorLog('• Geographic and location-based search', 'white')
    colorLog('• Aggregations and analytics queries', 'white')
    
    colorLog('\n📊 Index Structure:', 'cyan')
    colorLog('• Patients index with comprehensive medical data', 'blue')
    colorLog('• Treatments index with procedure information', 'blue')
    colorLog('• Analytics index for search metrics', 'blue')
    colorLog('• Custom analyzers for medical terminology', 'blue')
    colorLog('• Optimized mappings for performance', 'blue')
    
    colorLog('\n🚀 Performance Features:', 'green')
    colorLog('• Distributed search across multiple nodes', 'white')
    colorLog('• Intelligent caching and query optimization', 'white')
    colorLog('• Real-time indexing with near-instant search', 'white')
    colorLog('• Scalable architecture for large datasets', 'white')
    colorLog('• Advanced query profiling and monitoring', 'white')
    
    colorLog('\n🔧 Developer Tools:', 'magenta')
    colorLog('• RESTful API endpoints for search', 'white')
    colorLog('• React components for search interfaces', 'white')
    colorLog('• TypeScript types for type safety', 'white')
    colorLog('• Setup and migration scripts', 'white')
    colorLog('• Comprehensive documentation', 'white')
    
  } catch (error) {
    colorLog(`\n❌ Setup failed: ${error.message}`, 'red')
    process.exit(1)
  }
}

// Run the setup
if (require.main === module) {
  main()
}

module.exports = {
  main,
  createElasticsearchDirectories,
  createElasticsearchClient,
  createSearchServices,
  createSearchAPIs,
  createSearchComponents,
  createElasticsearchScripts,
  createElasticsearchConfig,
  createElasticsearchTypes,
  updatePackageScripts,
  createElasticsearchDocumentation
}
