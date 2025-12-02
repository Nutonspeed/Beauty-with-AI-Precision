/**
 * Elasticsearch client for search services
 */

import { Client } from '@elastic/elasticsearch'

let esClient: Client | null = null

export function getElasticsearchClient(): Client {
  if (!esClient) {
    esClient = new Client({
      node: process.env.ELASTICSEARCH_URL || 'http://localhost:9200',
      auth: process.env.ELASTICSEARCH_AUTH 
        ? { 
            username: process.env.ELASTICSEARCH_USERNAME || '',
            password: process.env.ELASTICSEARCH_PASSWORD || ''
          } 
        : undefined,
      maxRetries: 3,
      requestTimeout: 30000,
      sniffOnStart: true,
    })
  }
  
  return esClient
}

export const elasticsearchManager = {
  client: getElasticsearchClient,
  testConnection: async (): Promise<boolean> => {
    try {
      const client = getElasticsearchClient()
      await client.ping()
      return true
    } catch (error) {
      console.error('Elasticsearch connection failed:', error)
      return false
    }
  },
  close: async (): Promise<void> => {
    if (esClient) {
      await esClient.close()
      esClient = null
    }
  }
}

export async function testElasticsearchConnection(): Promise<boolean> {
  return elasticsearchManager.testConnection()
}

export async function closeElasticsearchClient(): Promise<void> {
  await elasticsearchManager.close()
}
