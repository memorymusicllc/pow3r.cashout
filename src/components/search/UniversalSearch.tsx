/**
 * Universal Search Component
 * The one search component to rule them all - comprehensive search solution
 * 
 * Features:
 * - Multiple search algorithms (fuzzy, semantic, exact)
 * - Advanced filtering system
 * - Logic operators (AND, OR, NOT, XOR)
 * - Search suggestions and history
 * - 3D search integration (optional)
 * - Keyboard shortcuts
 * - Real-time results
 * - Weighted relevance scoring
 * 
 * @version 1.0.0
 * @date 2025-10-12
 * @category Search
 * @tags search, universal, advanced, algorithms, filters, operators
 */

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Search, X, ArrowUp, ArrowDown, Zap, Tag, Clock, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'
import { SearchResult, SearchSuggestion, SearchFilter, LogicOperator } from '@/lib/search/types'
import { searchAlgorithms, calculateWeightedResults } from '@/lib/search/algorithms'
import { logicOperators, parseQueryWithOperators, applyLogicToResults } from '@/lib/search/operators'
import { searchHistoryManager } from '@/lib/search/history'
import { SearchSuggestionsManager } from '@/lib/search/suggestions'
import { Search3DManager } from '@/lib/search/3d-search'

interface UniversalSearchProps {
  data: any[]
  onResultSelect?: (result: SearchResult) => void
  onFilterAdd?: (filter: SearchFilter) => void
  onFilterRemove?: (filterId: string) => void
  placeholder?: string
  className?: string
  enable3D?: boolean
  enableKeyboard?: boolean
  enableOperators?: boolean
  maxSuggestions?: number
  debounceMs?: number
}

export function UniversalSearch({
  data,
  onResultSelect,
  onFilterAdd,
  onFilterRemove,
  placeholder = "Search everything...",
  className,
  enable3D = false,
  enableKeyboard = true,
  enableOperators = true,
  maxSuggestions = 10,
  debounceMs = 300
}: UniversalSearchProps) {
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([])
  const [results, setResults] = useState<SearchResult[]>([])
  const [filters, setFilters] = useState<SearchFilter[]>([])
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [historyIndex, setHistoryIndex] = useState(-1)
  
  const inputRef = useRef<HTMLInputElement>(null)
  const suggestionsRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<NodeJS.Timeout>()
  
  const suggestionsManager = useRef(new SearchSuggestionsManager(data))
  const search3DManager = useRef(new Search3DManager())
  
  // Update suggestions manager when data changes
  useEffect(() => {
    suggestionsManager.current.setData(data)
  }, [data])
  
  // Debounced search
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }
    
    debounceRef.current = setTimeout(() => {
      if (query.trim()) {
        performSearch(query)
      } else {
        setResults([])
        setSuggestions([])
      }
    }, debounceMs)
    
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
    }
  }, [query, debounceMs])
  
  const performSearch = useCallback(async (searchQuery: string) => {
    setIsLoading(true)
    
    try {
      let searchResults: SearchResult[] = []
      
      // Parse query with operators
      const { terms, operators } = parseQueryWithOperators(searchQuery)
      
      // Apply different search algorithms
      for (const algorithm of searchAlgorithms) {
        const algorithmResults = algorithm.function(searchQuery, data, 'title')
        searchResults.push(...algorithmResults)
      }
      
      // Apply logic operators if enabled
      if (enableOperators && operators.length > 0) {
        searchResults = applyLogicToResults(searchResults, terms, operators)
      }
      
      // Calculate weighted results
      const weightedResults = calculateWeightedResults(searchResults, searchAlgorithms)
      
      // Apply filters
      let filteredResults = weightedResults
      if (filters.length > 0) {
        filteredResults = weightedResults.filter(result => {
          return filters.every(filter => {
            switch (filter.category) {
              case 'category':
                return result.category === filter.value
              case 'type':
                return result.type === filter.value
              case 'tag':
                return result.tags.includes(filter.value)
              default:
                return true
            }
          })
        })
      }
      
      setResults(filteredResults)
      
      // Add to search history
      searchHistoryManager.addSearch(searchQuery, filteredResults.length, filters)
      
      // 3D search if enabled
      if (enable3D) {
        const results3D = search3DManager.current.searchIn3D(searchQuery)
        // Merge 3D results with regular results
        setResults(prev => [...prev, ...results3D])
      }
      
    } catch (error) {
      console.error('Search error:', error)
    } finally {
      setIsLoading(false)
    }
  }, [data, filters, enableOperators, enable3D])
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setQuery(value)
    setSelectedIndex(-1)
    setHistoryIndex(-1)
    
    if (value.trim()) {
      const newSuggestions = suggestionsManager.current.getSuggestions(value, maxSuggestions)
      setSuggestions(newSuggestions)
      setIsOpen(true)
    } else {
      setSuggestions([])
      setIsOpen(false)
    }
  }
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!enableKeyboard) return
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(prev => {
          const maxIndex = suggestions.length - 1
          return prev < maxIndex ? prev + 1 : 0
        })
        break
        
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(prev => {
          const maxIndex = suggestions.length - 1
          return prev > 0 ? prev - 1 : maxIndex
        })
        break
        
      case 'Enter':
        e.preventDefault()
        if (selectedIndex >= 0 && suggestions[selectedIndex]) {
          handleSuggestionSelect(suggestions[selectedIndex])
        } else if (query.trim()) {
          performSearch(query)
        }
        break
        
      case 'Escape':
        setIsOpen(false)
        setSelectedIndex(-1)
        break
        
      case 'Tab':
        if (selectedIndex >= 0 && suggestions[selectedIndex]) {
          e.preventDefault()
          handleSuggestionSelect(suggestions[selectedIndex])
        }
        break
    }
  }
  
  const handleSuggestionSelect = (suggestion: SearchSuggestion) => {
    if (suggestion.type === 'filter') {
      // Add filter
      const filter: SearchFilter = {
        id: `filter-${Date.now()}`,
        label: suggestion.text,
        value: suggestion.text.split(':')[1] || suggestion.text,
        category: suggestion.text.split(':')[0] || 'general',
        color: 'blue',
        removable: true
      }
      setFilters(prev => [...prev, filter])
      onFilterAdd?.(filter)
    } else {
      // Set query
      setQuery(suggestion.text)
      setIsOpen(false)
      performSearch(suggestion.text)
    }
  }
  
  const handleResultSelect = (result: SearchResult) => {
    onResultSelect?.(result)
    setIsOpen(false)
  }
  
  const handleFilterRemove = (filterId: string) => {
    setFilters(prev => prev.filter(f => f.id !== filterId))
    onFilterRemove?.(filterId)
  }
  
  const clearSearch = () => {
    setQuery('')
    setResults([])
    setSuggestions([])
    setIsOpen(false)
    setSelectedIndex(-1)
  }
  
  const getSuggestionIcon = (suggestion: SearchSuggestion) => {
    switch (suggestion.type) {
      case 'recent':
        return <Clock className="w-4 h-4" />
      case 'suggestion':
        return <Search className="w-4 h-4" />
      case 'filter':
        return <Tag className="w-4 h-4" />
      case 'operator':
        return <Zap className="w-4 h-4" />
      default:
        return <TrendingUp className="w-4 h-4" />
    }
  }
  
  return (
    <div className={cn("relative w-full", className)}>
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className="w-full pl-10 pr-10 py-2 border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
        />
        {query && (
          <button
            onClick={clearSearch}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </button>
        )}
        {isLoading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
          </div>
        )}
      </div>
      
      {/* Active Filters */}
      {filters.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {filters.map(filter => (
            <div
              key={filter.id}
              className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs"
            >
              <span>{filter.label}</span>
              <button
                onClick={() => handleFilterRemove(filter.id)}
                className="hover:text-blue-600"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}
      
      {/* Suggestions Dropdown */}
      {isOpen && suggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute top-full left-0 right-0 mt-1 bg-background border border-input rounded-md shadow-lg z-50 max-h-60 overflow-y-auto"
        >
          {suggestions.map((suggestion, index) => (
            <div
              key={suggestion.id}
              className={cn(
                "flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-accent",
                selectedIndex === index && "bg-accent"
              )}
              onClick={() => handleSuggestionSelect(suggestion)}
            >
              {getSuggestionIcon(suggestion)}
              <div className="flex-1">
                <div className="font-medium">{suggestion.text}</div>
                <div className="text-xs text-muted-foreground">{suggestion.category}</div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Search Results */}
      {results.length > 0 && (
        <div className="mt-4 space-y-2">
          <div className="text-sm text-muted-foreground">
            {results.length} result{results.length !== 1 ? 's' : ''} found
          </div>
          <div className="space-y-1 max-h-60 overflow-y-auto">
            {results.slice(0, 10).map((result) => (
              <div
                key={result.id}
                className="flex items-center gap-3 p-3 border border-input rounded-md hover:bg-accent cursor-pointer"
                onClick={() => handleResultSelect(result)}
              >
                <div className="flex-1">
                  <div className="font-medium">{result.title}</div>
                  {result.description && (
                    <div className="text-sm text-muted-foreground">{result.description}</div>
                  )}
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      {result.category}
                    </span>
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                      {result.type}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {Math.round(result.relevanceScore * 100)}% match
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
