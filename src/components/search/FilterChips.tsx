/**
 * Filter Chips Component
 * Visual filter tags with smart routing and removal functionality
 * 
 * Features:
 * - Color-coded filter categories
 * - Individual filter removal
 * - Clear all filters action
 * - Icon-based visual identification
 * - Responsive chip layout
 * 
 * @version 1.0.0
 * @date 2025-10-12
 * @category Search
 * @tags filter, chips, search, ui, visual
 */

import React from 'react'
import { X, Tag, Filter, Layers, Calendar, User } from 'lucide-react'
import { cn } from '@/lib/utils'
import { SearchFilter } from '@/lib/search/types'

interface FilterChipsProps {
  filters: SearchFilter[]
  onRemove: (filterId: string) => void
  onClearAll: () => void
  className?: string
  maxVisible?: number
}

export function FilterChips({
  filters,
  onRemove,
  onClearAll,
  className,
  maxVisible = 10
}: FilterChipsProps) {
  const visibleFilters = filters.slice(0, maxVisible)
  const hiddenCount = filters.length - maxVisible
  
  const getFilterIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'category':
        return <Tag className="w-3 h-3" />
      case 'type':
        return <Layers className="w-3 h-3" />
      case 'date':
        return <Calendar className="w-3 h-3" />
      case 'user':
        return <User className="w-3 h-3" />
      default:
        return <Filter className="w-3 h-3" />
    }
  }
  
  const getFilterColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'category':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'type':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'date':
        return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'user':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }
  
  if (filters.length === 0) return null
  
  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {visibleFilters.map((filter) => (
        <div
          key={filter.id}
          className={cn(
            "inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border",
            getFilterColor(filter.category),
            "hover:opacity-80 transition-opacity"
          )}
        >
          {getFilterIcon(filter.category)}
          <span>{filter.label}</span>
          {filter.removable && (
            <button
              onClick={() => onRemove(filter.id)}
              className="ml-1 hover:bg-black/10 rounded-full p-0.5"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      ))}
      
      {hiddenCount > 0 && (
        <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
          +{hiddenCount} more
        </div>
      )}
      
      {filters.length > 1 && (
        <button
          onClick={onClearAll}
          className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-600 border border-red-200 hover:bg-red-200 transition-colors"
        >
          <X className="w-3 h-3" />
          Clear all
        </button>
      )}
    </div>
  )
}

interface SmartFilterChipsProps extends FilterChipsProps {
  onSmartAdd: (category: string, value: string) => void
  availableCategories: string[]
  searchQuery?: string
}

export function SmartFilterChips({
  filters,
  onRemove,
  onClearAll,
  onSmartAdd,
  availableCategories,
  searchQuery = '',
  className,
  maxVisible = 10
}: SmartFilterChipsProps) {
  const [showSuggestions, setShowSuggestions] = React.useState(false)
  const [suggestedFilters, setSuggestedFilters] = React.useState<SearchFilter[]>([])
  
  React.useEffect(() => {
    if (searchQuery.trim()) {
      // Generate smart filter suggestions based on search query
      const suggestions: SearchFilter[] = []
      
      // Extract potential filters from search query
      const words = searchQuery.toLowerCase().split(/\s+/)
      
      words.forEach(word => {
        if (word.includes(':')) {
          const [category, value] = word.split(':')
          if (availableCategories.includes(category)) {
            suggestions.push({
              id: `suggestion-${category}-${value}`,
              label: `${category}:${value}`,
              value,
              category,
              color: 'blue',
              removable: true
            })
          }
        }
      })
      
      setSuggestedFilters(suggestions)
    } else {
      setSuggestedFilters([])
    }
  }, [searchQuery, availableCategories])
  
  return (
    <div className={cn("space-y-2", className)}>
      <FilterChips
        filters={filters}
        onRemove={onRemove}
        onClearAll={onClearAll}
        maxVisible={maxVisible}
      />
      
      {/* Smart Filter Suggestions */}
      {suggestedFilters.length > 0 && (
        <div className="space-y-1">
          <div className="text-xs text-muted-foreground">Suggested filters:</div>
          <div className="flex flex-wrap gap-1">
            {suggestedFilters.map((filter) => (
              <button
                key={filter.id}
                onClick={() => onSmartAdd(filter.category, filter.value)}
                className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100 transition-colors"
              >
                <Tag className="w-3 h-3" />
                <span>{filter.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
