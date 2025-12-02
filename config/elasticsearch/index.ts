// Elasticsearch Configuration
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
