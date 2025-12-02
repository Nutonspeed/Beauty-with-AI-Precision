#!/usr/bin/env node

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
    console.log(`Cluster status: ${health.body.status}`)
    console.log(`Number of nodes: ${health.body.number_of_nodes}`)
    
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
        console.log(`  ✅ Created index: ${index.name}`)
      } else {
        console.log(`  ℹ️ Index ${index.name} already exists`)
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
        console.log(`  🗑️ Deleted index: ${indexName}`)
      }
    }
  }

  async status() {
    console.log('📊 Elasticsearch Status:')
    
    try {
      const health = await this.client.cluster.health()
      console.log(`  Cluster Status: ${health.body.status}`)
      console.log(`  Number of Nodes: ${health.body.number_of_nodes}`)
      console.log(`  Active Primary Shards: ${health.body.active_primary_shards}`)
      console.log(`  Active Shards: ${health.body.active_shards}`)
      
      const indices = await this.client.cat.indices({ format: 'json' })
      console.log('\n  Indices:')
      indices.body.forEach(index => {
        console.log(`    ${index.index}: ${index['docs.count']} docs, ${index['store.size']} storage`)
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
