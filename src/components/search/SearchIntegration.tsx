/**
 * Search Integration Component
 * Complete integrated search solution combining all search features
 * 
 * Features:
 * - Universal search with multiple algorithms
 * - Filter chips management
 * - Logic operators
 * - Search history
 * - 3D search (optional)
 * - Keyboard shortcuts
 * 
 * @version 1.0.0
 * @date 2025-10-12
 * @category Search
 * @tags search, integration, universal, filters, operators
 */

import React, { useState, useEffect } from 'react'
import { Search, Filter, Settings, Zap, Tag, Clock } from 'lucide-react'
import { UniversalSearch } from './UniversalSearch'
import { FilterChips, SmartFilterChips } from './FilterChips'
import { LogicOperators, LogicQueryBuilder } from './LogicOperators'
import { SearchResult, SearchFilter } from '@/lib/search/types'
import { searchHistoryManager } from '@/lib/search/history'
import { cn } from '@/lib/utils'

interface SearchIntegrationProps {
  data: any[]
  onResultSelect?: (result: SearchResult) => void
  className?: string
  enable3D?: boolean
  enableKeyboard?: boolean
  enableOperators?: boolean
  placeholder?: string
}

export function SearchIntegration({
  data,
  onResultSelect,
  className,
  enable3D = false,
  enableKeyboard = true,
  enableOperators = true,
  placeholder = "Search everything..."
}: SearchIntegrationProps) {
  const [query, setQuery] = useState('')
  const [filters, setFilters] = useState<SearchFilter[]>([])
  const [results, setResults] = useState<SearchResult[]>([])
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [availableCategories] = useState(['category', 'type', 'tag', 'date', 'user'])
  
  const handleResultSelect = (result: SearchResult) => {
    onResultSelect?.(result)
    setResults([])
  }
  
  const handleFilterAdd = (filter: SearchFilter) => {
    setFilters(prev => [...prev, filter])
  }
  
  const handleFilterRemove = (filterId: string) => {
    setFilters(prev => prev.filter(f => f.id !== filterId))
  }
  
  const handleSmartFilterAdd = (category: string, value: string) => {
    const filter: SearchFilter = {
      id: `smart-${category}-${value}-${Date.now()}`,
      label: `${category}:${value}`,
      value,
      category,
      color: 'blue',
      removable: true
    }
    handleFilterAdd(filter)
  }
  
  const handleClearAll = () => {
    setFilters([])
    setQuery('')
    setResults([])
  }
  
  const handleOperatorSelect = (operator: any) => {
    // Add operator to query
    const newQuery = query.trim() 
      ? `${query} ${operator.symbol}`
      : operator.symbol
    
    setQuery(newQuery)
  }
  
  const handleQueryUpdate = (newQuery: string) => {
    setQuery(newQuery)
  }
  
  // Load recent searches for suggestions
  const recentSearches = searchHistoryManager.getRecentQueries(5)
  const popularSearches = searchHistoryManager.getPopularQueries(3)
  
  return (
    <div className={cn("space-y-4", className)}>
      {/* Main Search Bar */}
      <div className="relative">
        <UniversalSearch
          data={data}
          onResultSelect={handleResultSelect}
          onFilterAdd={handleFilterAdd}
          onFilterRemove={handleFilterRemove}
          placeholder={placeholder}
          enable3D={enable3D}
          enableKeyboard={enableKeyboard}
          enableOperators={enableOperators}
          maxSuggestions={10}
          debounceMs={300}
        />
        
        {/* Advanced Search Toggle */}
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground"
          title="Advanced Search"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>
      
      {/* Filter Chips */}
      <SmartFilterChips
        filters={filters}
        onRemove={handleFilterRemove}
        onClearAll={handleClearAll}
        onSmartAdd={handleSmartFilterAdd}
        availableCategories={availableCategories}
        searchQuery={query}
        maxVisible={8}
      />
      
      {/* Advanced Search Panel */}
      {showAdvanced && (
        <div className="p-4 border border-input rounded-lg bg-muted/50 space-y-4">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4" />
            <h3 className="font-medium">Advanced Search</h3>
          </div>
          
          {/* Logic Query Builder */}
          <LogicQueryBuilder
            query={query}
            onQueryChange={handleQueryUpdate}
          />
          
          {/* Logic Operators */}
          {enableOperators && (
            <div>
              <label className="text-sm font-medium mb-2 block">
                Logic Operators
              </label>
              <LogicOperators
                onOperatorSelect={handleOperatorSelect}
                onQueryUpdate={handleQueryUpdate}
                currentQuery={query}
                showLabels={true}
                enableGlow={true}
              />
            </div>
          )}
          
          {/* Search History */}
          <div>
            <label className="text-sm font-medium mb-2 block">
              Recent Searches
            </label>
            <div className="flex flex-wrap gap-2">
              {recentSearches.map((search, index) => (
                <button
                  key={index}
                  onClick={() => setQuery(search)}
                  className="flex items-center gap-1 px-2 py-1 text-xs bg-background border border-input rounded hover:bg-accent"
                >
                  <Clock className="w-3 h-3" />
                  {search}
                </button>
              ))}
            </div>
          </div>
          
          {/* Popular Searches */}
          <div>
            <label className="text-sm font-medium mb-2 block">
              Popular Searches
            </label>
            <div className="flex flex-wrap gap-2">
              {popularSearches.map((search, index) => (
                <button
                  key={index}
                  onClick={() => setQuery(search)}
                  className="flex items-center gap-1 px-2 py-1 text-xs bg-background border border-input rounded hover:bg-accent"
                >
                  <Tag className="w-3 h-3" />
                  {search}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
      
      {/* Search Results Summary */}
      {results.length > 0 && (
        <div className="text-sm text-muted-foreground">
          Found {results.length} result{results.length !== 1 ? 's' : ''} 
          {filters.length > 0 && ` with ${filters.length} filter${filters.length !== 1 ? 's' : ''}`}
        </div>
      )}
    </div>
  )
}

interface SearchHeaderProps {
  data: any[]
  onResultSelect?: (result: SearchResult) => void
  className?: string
}

export function SearchHeader({
  data,
  onResultSelect,
  className
}: SearchHeaderProps) {
  return (
    <div className={cn("w-full", className)}>
      <SearchIntegration
        data={data}
        onResultSelect={onResultSelect}
        enable3D={true}
        enableKeyboard={true}
        enableOperators={true}
        placeholder="Search listings, leads, metrics, and more..."
      />
    </div>
  )
}
