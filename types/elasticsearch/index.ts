// Elasticsearch Type Definitions
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
