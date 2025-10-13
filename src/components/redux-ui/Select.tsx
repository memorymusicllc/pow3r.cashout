/**
 * Select Component - Redux UI
 * Custom select component without external dependencies
 * 
 * @version 1.0.0
 * @date 2025-01-10
 */

import React, { useState, useRef, useEffect } from 'react'
import { ChevronDown } from 'lucide-react'

export interface SelectProps {
  value?: string
  onValueChange?: (value: string) => void
  children: React.ReactNode
  disabled?: boolean
  className?: string
}

export interface SelectTriggerProps {
  children: React.ReactNode
  className?: string
  onClick?: () => void
  disabled?: boolean
}

export interface SelectContentProps {
  children: React.ReactNode
  className?: string
}

export interface SelectItemProps {
  value: string
  children: React.ReactNode
  className?: string
  onClick?: () => void
}

export interface SelectValueProps {
  placeholder?: string
  children?: React.ReactNode
}

const SelectContext = React.createContext<{
  value?: string
  onValueChange?: (value: string) => void
  isOpen: boolean
  setIsOpen: (open: boolean) => void
}>({
  isOpen: false,
  setIsOpen: () => {}
})

export function Select({ value, onValueChange, children, disabled, className = '' }: SelectProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <SelectContext.Provider value={{ value, onValueChange, isOpen, setIsOpen }}>
      <div className={`relative ${className}`}>
        {children}
      </div>
    </SelectContext.Provider>
  )
}

export function SelectTrigger({ children, className = '', onClick, disabled }: SelectTriggerProps) {
  const { isOpen, setIsOpen } = React.useContext(SelectContext)

  const handleClick = () => {
    if (!disabled) {
      setIsOpen(!isOpen)
      onClick?.()
    }
  }

  return (
    <button
      type="button"
      className={`flex items-center justify-between w-full px-3 py-2 text-sm border border-gray-300 rounded-md bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      onClick={handleClick}
      disabled={disabled}
    >
      {children}
      <ChevronDown className="w-4 h-4 ml-2" />
    </button>
  )
}

export function SelectContent({ children, className = '' }: SelectContentProps) {
  const { isOpen } = React.useContext(SelectContext)
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (contentRef.current && !contentRef.current.contains(event.target as Node)) {
        const { setIsOpen } = React.useContext(SelectContext)
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div
      ref={contentRef}
      className={`absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto ${className}`}
    >
      {children}
    </div>
  )
}

export function SelectItem({ value, children, className = '', onClick }: SelectItemProps) {
  const { value: selectedValue, onValueChange, setIsOpen } = React.useContext(SelectContext)

  const handleClick = () => {
    onValueChange?.(value)
    setIsOpen(false)
    onClick?.()
  }

  const isSelected = selectedValue === value

  return (
    <button
      type="button"
      className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-100 focus:bg-gray-100 focus:outline-none ${
        isSelected ? 'bg-blue-50 text-blue-600' : 'text-gray-900'
      } ${className}`}
      onClick={handleClick}
    >
      {children}
    </button>
  )
}

export function SelectValue({ placeholder, children }: SelectValueProps) {
  const { value } = React.useContext(SelectContext)

  if (children) {
    return <>{children}</>
  }

  return <span className={value ? 'text-gray-900' : 'text-gray-500'}>{value || placeholder}</span>
}
