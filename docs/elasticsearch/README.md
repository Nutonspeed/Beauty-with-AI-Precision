# Advanced Search with Elasticsearch

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
```bash
# Using Docker
docker run -d --name elasticsearch \
  -p 9200:9200 -p 9300:9300 \
  -e "discovery.type=single-node" \
  -e "xpack.security.enabled=false" \
  elasticsearch:8.11.0

# Or download and install locally
# https://www.elastic.co/downloads/elasticsearch
```

### 2. Setup Search Indices
```bash
# Setup Elasticsearch indices and mappings
pnpm es:setup

# Check cluster status
pnpm es:status
```

### 3. Configure Environment
```bash
# .env.local
ELASTICSEARCH_NODE=http://localhost:9200
ELASTICSEARCH_USERNAME=elastic
ELASTICSEARCH_PASSWORD=changeme
```

### 4. Start Using Search
```bash
# Index patient data
pnpm es:index patients

# Search patients
curl "http://localhost:3000/api/search?q=john&type=patients&clinicId=your-clinic-id"
```

## 📋 Search Architecture

### Index Structure

#### Patients Index
```json
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
```

#### Treatments Index
```json
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
```

## 🔧 API Endpoints

### Universal Search
```bash
# Basic search
GET /api/search?q=john&type=patients&clinicId=your-clinic-id

# Advanced search with filters
GET /api/search?q=john&gender=female&minAge=25&maxAge=45&tags=VIP

# Pagination and sorting
GET /api/search?q=john&from=0&size=20&sort=createdAt:desc
```

### Search Suggestions
```bash
# Get autocomplete suggestions
GET /api/search/suggestions?q=jo&type=patients&clinicId=your-clinic-id
```

### Advanced Search
```bash
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
```

## 🎨 Search Components

### Search Interface
```tsx
import SearchInterface from '@/components/search/search-interface'

<SearchInterface 
  clinicId="your-clinic-id"
  onResultSelect={(result) => {
    console.log('Selected patient:', result)
  }}
/>
```

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
```bash
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
```

### Search Configuration
```typescript
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
```

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
