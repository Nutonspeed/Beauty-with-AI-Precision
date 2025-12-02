// Elasticsearch Client Configuration
import { Client } from '@elastic/elasticsearch'

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
        throw new Error(`Index ${indexName} not found`)
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
        console.log(`Created index: ${index.name}`)
      } else {
        console.log(`Index ${index.name} already exists`)
      }
    } catch (error) {
      console.error(`Failed to create index ${indexName}:`, error)
      throw error
    }
  }

  // Delete index
  async deleteIndex(indexName: string): Promise<void> {
    try {
      const index = this.indices.get(indexName)
      if (!index) {
        throw new Error(`Index ${indexName} not found`)
      }

      await this.client.indices.delete({ index: index.name })
      console.log(`Deleted index: ${index.name}`)
    } catch (error) {
      console.error(`Failed to delete index ${indexName}:`, error)
      throw error
    }
  }

  // Index document
  async indexDocument(indexName: string, document: any, id?: string): Promise<string> {
    try {
      const index = this.indices.get(indexName)
      if (!index) {
        throw new Error(`Index ${indexName} not found`)
      }

      const response = await this.client.index({
        index: index.name,
        id,
        body: document,
        refresh: 'wait_for'
      })

      return response._id
    } catch (error) {
      console.error(`Failed to index document in ${indexName}:`, error)
      throw error
    }
  }

  // Update document
  async updateDocument(indexName: string, id: string, document: any): Promise<void> {
    try {
      const index = this.indices.get(indexName)
      if (!index) {
        throw new Error(`Index ${indexName} not found`)
      }

      await this.client.update({
        index: index.name,
        id,
        body: { doc: document },
        refresh: 'wait_for'
      })
    } catch (error) {
      console.error(`Failed to update document in ${indexName}:`, error)
      throw error
    }
  }

  // Delete document
  async deleteDocument(indexName: string, id: string): Promise<void> {
    try {
      const index = this.indices.get(indexName)
      if (!index) {
        throw new Error(`Index ${indexName} not found`)
      }

      await this.client.delete({
        index: index.name,
        id,
        refresh: 'wait_for'
      })
    } catch (error) {
      console.error(`Failed to delete document from ${indexName}:`, error)
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
        throw new Error(`Index ${indexName} not found`)
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

      return response
    } catch (error) {
      console.error(`Failed to search in ${indexName}:`, error)
      throw error
    }
  }

  // Get document
  async getDocument(indexName: string, id: string) {
    try {
      const index = this.indices.get(indexName)
      if (!index) {
        throw new Error(`Index ${indexName} not found`)
      }

      const response = await this.client.get({
        index: index.name,
        id
      })

      return response
    } catch (error) {
      console.error(`Failed to get document from ${indexName}:`, error)
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

      if (response.errors) {
        console.error('Bulk operation errors:', response.items)
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
      return response
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
        throw new Error(`Index ${indexName} not found`)
      }

      const response = await this.client.indices.stats({ index: index.name })
      return response
    } catch (error) {
      console.error(`Failed to get index stats for ${indexName}:`, error)
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

      return response
    } catch (error) {
      console.error(`Failed to reindex from ${sourceIndex} to ${targetIndex}:`, error)
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
