/**
 * Logic Operators Component
 * Advanced search logic operators with glowing effects and keyboard shortcuts
 * 
 * Features:
 * - Boolean logic operators (AND, OR, NOT, XOR)
 * - Visual glow effects
 * - Keyboard shortcuts
 * - Query builder integration
 * - Real-time query preview
 * 
 * @version 1.0.0
 * @date 2025-10-12
 * @category Search
 * @tags logic, operators, boolean, search, advanced, keyboard
 */

import React, { useState } from 'react'
import { Zap, Plus, Minus, X, RotateCcw } from 'lucide-react'
import { cn } from '@/lib/utils'
import { LogicOperator } from '@/lib/search/types'
import { logicOperators } from '@/lib/search/operators'

interface LogicOperatorsProps {
  onOperatorSelect: (operator: LogicOperator) => void
  onQueryUpdate: (query: string) => void
  currentQuery: string
  className?: string
  showLabels?: boolean
  enableGlow?: boolean
}

export function LogicOperators({
  onOperatorSelect,
  onQueryUpdate,
  currentQuery,
  className,
  showLabels = true,
  enableGlow = true
}: LogicOperatorsProps) {
  const [activeOperator, setActiveOperator] = useState<string | null>(null)
  const [isGlowing, setIsGlowing] = useState(false)
  
  const handleOperatorClick = (operator: LogicOperator) => {
    setActiveOperator(operator.id)
    setIsGlowing(true)
    
    // Add operator to query
    const newQuery = currentQuery.trim() 
      ? `${currentQuery} ${operator.symbol}`
      : operator.symbol
    
    onQueryUpdate(newQuery)
    onOperatorSelect(operator)
    
    // Reset glow effect after animation
    setTimeout(() => {
      setIsGlowing(false)
      setActiveOperator(null)
    }, 1000)
  }
  
  const handleKeyboardShortcut = (e: React.KeyboardEvent) => {
    const operator = logicOperators.find(op => op.keyboard === e.key)
    if (operator) {
      e.preventDefault()
      handleOperatorClick(operator)
    }
  }
  
  return (
    <div 
      className={cn("flex items-center gap-2", className)}
      onKeyDown={handleKeyboardShortcut}
      tabIndex={0}
    >
      {logicOperators.map((operator) => (
        <button
          key={operator.id}
          onClick={() => handleOperatorClick(operator)}
          className={cn(
            "flex items-center gap-1 px-3 py-2 rounded-lg border transition-all duration-300",
            "hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2",
            operator.color,
            enableGlow && activeOperator === operator.id && isGlowing && [
              "shadow-lg animate-pulse",
              operator.glowColor
            ],
            "hover:shadow-md"
          )}
          title={`${operator.description} (${operator.keyboard})`}
        >
          <Zap className="w-4 h-4" />
          {showLabels && (
            <span className="font-medium">{operator.label}</span>
          )}
          <span className="text-lg font-bold">{operator.symbol}</span>
        </button>
      ))}
    </div>
  )
}

interface LogicQueryBuilderProps {
  query: string
  onQueryChange: (query: string) => void
  className?: string
}

export function LogicQueryBuilder({
  query,
  onQueryChange,
  className
}: LogicQueryBuilderProps) {
  const [showBuilder, setShowBuilder] = useState(false)
  const [terms, setTerms] = useState<string[]>([])
  const [operators, setOperators] = useState<LogicOperator[]>([])
  
  React.useEffect(() => {
    // Parse existing query
    const words = query.split(/\s+/).filter(word => word.trim())
    const newTerms: string[] = []
    const newOperators: LogicOperator[] = []
    
    words.forEach(word => {
      const operator = logicOperators.find(op => 
        op.symbol === word || op.label === word
      )
      if (operator) {
        newOperators.push(operator)
      } else {
        newTerms.push(word)
      }
    })
    
    setTerms(newTerms)
    setOperators(newOperators)
  }, [query])
  
  const addTerm = () => {
    const newTerm = prompt('Enter search term:')
    if (newTerm) {
      const newTerms = [...terms, newTerm]
      setTerms(newTerms)
      updateQuery(newTerms, operators)
    }
  }
  
  const removeTerm = (index: number) => {
    const newTerms = terms.filter((_, i) => i !== index)
    setTerms(newTerms)
    updateQuery(newTerms, operators)
  }
  
  const addOperator = (operator: LogicOperator) => {
    const newOperators = [...operators, operator]
    setOperators(newOperators)
    updateQuery(terms, newOperators)
  }
  
  const removeOperator = (index: number) => {
    const newOperators = operators.filter((_, i) => i !== index)
    setOperators(newOperators)
    updateQuery(terms, newOperators)
  }
  
  const updateQuery = (newTerms: string[], newOperators: LogicOperator[]) => {
    let newQuery = ''
    
    for (let i = 0; i < Math.max(newTerms.length, newOperators.length + 1); i++) {
      if (i < newTerms.length) {
        newQuery += `"${newTerms[i]}"`
      }
      if (i < newOperators.length) {
        newQuery += ` ${newOperators[i].symbol} `
      }
    }
    
    onQueryChange(newQuery.trim())
  }
  
  const clearQuery = () => {
    setTerms([])
    setOperators([])
    onQueryChange('')
  }
  
  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center gap-2">
        <button
          onClick={() => setShowBuilder(!showBuilder)}
          className="flex items-center gap-2 px-3 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
        >
          <Zap className="w-4 h-4" />
          Logic Builder
        </button>
        
        <button
          onClick={clearQuery}
          className="flex items-center gap-2 px-3 py-2 bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/90"
        >
          <RotateCcw className="w-4 h-4" />
          Clear
        </button>
      </div>
      
      {showBuilder && (
        <div className="p-4 border border-input rounded-lg bg-muted/50">
          <div className="space-y-3">
            {/* Terms */}
            <div>
              <label className="text-sm font-medium mb-2 block">Search Terms</label>
              <div className="flex flex-wrap gap-2">
                {terms.map((term, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-1 px-2 py-1 bg-background border border-input rounded"
                  >
                    <span>"{term}"</span>
                    <button
                      onClick={() => removeTerm(index)}
                      className="text-destructive hover:bg-destructive/10 rounded p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                <button
                  onClick={addTerm}
                  className="flex items-center gap-1 px-2 py-1 border border-dashed border-input rounded hover:bg-accent"
                >
                  <Plus className="w-3 h-3" />
                  Add Term
                </button>
              </div>
            </div>
            
            {/* Operators */}
            <div>
              <label className="text-sm font-medium mb-2 block">Logic Operators</label>
              <div className="flex flex-wrap gap-2">
                {operators.map((operator, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-1 px-2 py-1 bg-background border border-input rounded"
                  >
                    <span className={operator.color}>{operator.symbol}</span>
                    <button
                      onClick={() => removeOperator(index)}
                      className="text-destructive hover:bg-destructive/10 rounded p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                <div className="flex gap-1">
                  {logicOperators.map((operator) => (
                    <button
                      key={operator.id}
                      onClick={() => addOperator(operator)}
                      className={cn(
                        "flex items-center gap-1 px-2 py-1 border border-input rounded hover:bg-accent",
                        operator.color
                      )}
                      title={operator.description}
                    >
                      <Zap className="w-3 h-3" />
                      {operator.symbol}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Query Preview */}
            <div>
              <label className="text-sm font-medium mb-2 block">Query Preview</label>
              <div className="p-2 bg-background border border-input rounded font-mono text-sm">
                {query || 'No query built yet'}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
