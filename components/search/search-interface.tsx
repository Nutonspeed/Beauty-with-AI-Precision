'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Checkbox } from '@/components/ui/checkbox'
import { 
  Search, 
  Filter, 
  X, 
  User, 
  Calendar
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
  
  const searchTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)
  const abortControllerRef = useRef<AbortController | undefined>(undefined)

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
        `/api/search/suggestions?q=${encodeURIComponent(query)}&type=patients&clinicId=${clinicId}`
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

      const response = await fetch(`/api/search?${params}`, {
        signal: abortControllerRef.current.signal
      })
      
      const data = await response.json()
      
      if (data.success) {
        setResults(data.data.hits)
        setTotal(data.data.total)
      }
    } catch (error) {
      if (error instanceof Error && error.name !== 'AbortError') {
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
                  <em>{(highlights as string[])[0]}</em>
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
          Age Range: {filters.ageRange ? `${filters.ageRange[0]} - ${filters.ageRange[1]}` : 'All ages'}
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
          Skin Score Range: {filters.scoreRange ? `${filters.scoreRange[0]} - ${filters.scoreRange[1]}` : 'All scores'}
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
