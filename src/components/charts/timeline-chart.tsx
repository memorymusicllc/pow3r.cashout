/**
 * Timeline Chart
 * Displays events and data points along a temporal axis
 * 
 * @version 1.0.0
 * @date 2025-10-08
 */

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/redux-ui'
import { Badge } from '@/components/redux-ui'
import { Button } from '@/components/redux-ui'
import { Calendar, Clock, ArrowRight, ArrowLeft } from 'lucide-react'

interface TimelineEvent {
  id: string
  title: string
  description?: string
  date: Date
  type: 'milestone' | 'event' | 'phase' | 'deadline'
  color?: string
  importance?: 'low' | 'medium' | 'high'
  category?: string
}

interface TimelineChartProps {
  events: TimelineEvent[]
  title?: string
  showCategories?: boolean
  showImportance?: boolean
  className?: string
}

export function TimelineChart({
  events,
  title = "Timeline Analysis",
  showCategories = true,
  showImportance = true,
  className = ""
}: TimelineChartProps) {
  // Fallback data if none provided
  const chartEvents: TimelineEvent[] = events && events.length > 0 ? events : [
    { 
      id: '1', 
      title: 'Event 1', 
      date: new Date('2024-01-01'), 
      type: 'milestone', 
      description: 'First milestone',
      color: '#3b82f6',
      importance: 'high',
      category: 'milestone'
    },
    { 
      id: '2', 
      title: 'Event 2', 
      date: new Date('2024-02-01'), 
      type: 'event', 
      description: 'Important task',
      color: '#10b981',
      importance: 'medium',
      category: 'task'
    },
    { 
      id: '3', 
      title: 'Event 3', 
      date: new Date('2024-03-01'), 
      type: 'milestone', 
      description: 'Second milestone',
      color: '#f59e0b',
      importance: 'high',
      category: 'milestone'
    }
  ];
  
  const [selectedEvent, setSelectedEvent] = useState<TimelineEvent | null>(null)
  const [filterCategory, setFilterCategory] = useState<string>('all')

  // Sort events by date
  const sortedEvents = [...chartEvents].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  
  // Filter events by category
  const filteredEvents = filterCategory === 'all' 
    ? sortedEvents 
    : sortedEvents.filter(event => event.category === filterCategory)

  // Get unique categories
  const categories = Array.from(new Set(chartEvents.map(e => e.category).filter(Boolean)))

  // Chart dimensions
  const width = 600
  const height = 300
  const margin = 60
  const timelineY = height / 2

  // Calculate time range
  const dates = chartEvents.map(e => new Date(e.date).getTime())
  const minDate = Math.min(...dates)
  const maxDate = Math.max(...dates)
  const dateRange = maxDate - minDate

  // Scale function for x-axis
  const scaleX = (date: string | Date) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return margin + ((dateObj.getTime() - minDate) / dateRange) * (width - margin * 2);
  }

  // Get event type styling
  const getEventTypeStyle = (type: string) => {
    switch (type) {
      case 'milestone':
        return { size: 12, shape: 'diamond' }
      case 'event':
        return { size: 8, shape: 'circle' }
      case 'phase':
        return { size: 10, shape: 'square' }
      case 'deadline':
        return { size: 8, shape: 'triangle' }
      default:
        return { size: 8, shape: 'circle' }
    }
  }

  // Get importance styling
  const getImportanceStyle = (importance: string) => {
    switch (importance) {
      case 'high':
        return { strokeWidth: 3, opacity: 1 }
      case 'medium':
        return { strokeWidth: 2, opacity: 0.8 }
      case 'low':
        return { strokeWidth: 1, opacity: 0.6 }
      default:
        return { strokeWidth: 2, opacity: 0.8 }
    }
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
          {title}
        </CardTitle>
        <CardDescription>
          Interactive timeline with events, milestones, and phases
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Controls */}
          {showCategories && categories.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Filter:</span>
              <Button
                size="sm"
                variant={filterCategory === 'all' ? 'default' : 'outline'}
                onClick={() => setFilterCategory('all')}
              >
                All
              </Button>
              {categories.map(category => (
                <Button
                  key={category}
                  size="sm"
                  variant={filterCategory === category ? 'default' : 'outline'}
                  onClick={() => setFilterCategory(category || 'All')}
                >
                  {category}
                </Button>
              ))}
            </div>
          )}

          {/* Timeline Chart */}
          <div className="relative">
            <svg width={width} height={height} className="border rounded">
              {/* Background */}
              <rect width={width} height={height} fill="hsl(var(--background))" />

              {/* Timeline line */}
              <line
                x1={margin}
                y1={timelineY}
                x2={width - margin}
                y2={timelineY}
                stroke="hsl(var(--foreground))"
                strokeWidth={3}
              />

              {/* Time markers */}
              {[0, 0.25, 0.5, 0.75, 1].map(ratio => {
                const date = new Date(minDate + dateRange * ratio)
                const x = scaleX(date)
                return (
                  <g key={ratio}>
                    <line
                      x1={x}
                      y1={timelineY - 10}
                      x2={x}
                      y2={timelineY + 10}
                      stroke="hsl(var(--muted-foreground))"
                      strokeWidth={2}
                    />
                    <text
                      x={x}
                      y={timelineY - 15}
                      textAnchor="middle"
                      className="text-xs fill-muted-foreground"
                    >
                      {date.toLocaleDateString()}
                    </text>
                  </g>
                )
              })}

              {/* Events */}
              {filteredEvents.map((event, index) => {
                const x = scaleX(event.date)
                const typeStyle = getEventTypeStyle(event.type)
                const importanceStyle = getImportanceStyle(event.importance || 'medium')
                const isSelected = selectedEvent?.id === event.id
                const yOffset = (index % 2 === 0 ? -1 : 1) * 30

                return (
                  <g key={event.id}>
                    {/* Connection line */}
                    <line
                      x1={x}
                      y1={timelineY}
                      x2={x}
                      y2={timelineY + yOffset}
                      stroke={event.color || 'hsl(var(--primary))'}
                      strokeWidth={1}
                      opacity={0.6}
                    />

                    {/* Event marker */}
                    {typeStyle.shape === 'diamond' && (
                      <polygon
                        points={`${x},${timelineY + yOffset - typeStyle.size} ${x + typeStyle.size},${timelineY + yOffset} ${x},${timelineY + yOffset + typeStyle.size} ${x - typeStyle.size},${timelineY + yOffset}`}
                        fill={event.color || 'hsl(var(--primary))'}
                        stroke={isSelected ? "hsl(var(--primary))" : "hsl(var(--background))"}
                        strokeWidth={importanceStyle.strokeWidth}
                        opacity={importanceStyle.opacity}
                        className="cursor-pointer hover:opacity-80"
                        onClick={() => setSelectedEvent(isSelected ? null : event)}
                      />
                    )}
                    {typeStyle.shape === 'circle' && (
                      <circle
                        cx={x}
                        cy={timelineY + yOffset}
                        r={typeStyle.size}
                        fill={event.color || 'hsl(var(--primary))'}
                        stroke={isSelected ? "hsl(var(--primary))" : "hsl(var(--background))"}
                        strokeWidth={importanceStyle.strokeWidth}
                        opacity={importanceStyle.opacity}
                        className="cursor-pointer hover:opacity-80"
                        onClick={() => setSelectedEvent(isSelected ? null : event)}
                      />
                    )}
                    {typeStyle.shape === 'square' && (
                      <rect
                        x={x - typeStyle.size}
                        y={timelineY + yOffset - typeStyle.size}
                        width={typeStyle.size * 2}
                        height={typeStyle.size * 2}
                        fill={event.color || 'hsl(var(--primary))'}
                        stroke={isSelected ? "hsl(var(--primary))" : "hsl(var(--background))"}
                        strokeWidth={importanceStyle.strokeWidth}
                        opacity={importanceStyle.opacity}
                        className="cursor-pointer hover:opacity-80"
                        onClick={() => setSelectedEvent(isSelected ? null : event)}
                      />
                    )}
                    {typeStyle.shape === 'triangle' && (
                      <polygon
                        points={`${x},${timelineY + yOffset - typeStyle.size} ${x + typeStyle.size},${timelineY + yOffset + typeStyle.size} ${x - typeStyle.size},${timelineY + yOffset + typeStyle.size}`}
                        fill={event.color || 'hsl(var(--primary))'}
                        stroke={isSelected ? "hsl(var(--primary))" : "hsl(var(--background))"}
                        strokeWidth={importanceStyle.strokeWidth}
                        opacity={importanceStyle.opacity}
                        className="cursor-pointer hover:opacity-80"
                        onClick={() => setSelectedEvent(isSelected ? null : event)}
                      />
                    )}

                    {/* Event label */}
                    <text
                      x={x}
                      y={timelineY + yOffset + (yOffset > 0 ? 20 : -5)}
                      textAnchor="middle"
                      className="text-xs font-medium fill-foreground"
                    >
                      {event.title}
                    </text>
                  </g>
                )
              })}
            </svg>
          </div>

          {/* Selected event info */}
          {selectedEvent && (
            <div className="p-3 bg-muted rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <div className="text-sm font-medium">{selectedEvent.title}</div>
                <Badge variant="outline" className="text-xs">
                  {selectedEvent.type}
                </Badge>
                {selectedEvent.importance && (
                  <Badge 
                    variant={selectedEvent.importance === 'high' ? 'destructive' : 'outline'}
                    className="text-xs"
                  >
                    {selectedEvent.importance}
                  </Badge>
                )}
              </div>
              <div className="text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {selectedEvent.date.toLocaleDateString()}
                </div>
                {selectedEvent.description && (
                  <div className="mt-1">{selectedEvent.description}</div>
                )}
                {selectedEvent.category && (
                  <div className="mt-1">Category: {selectedEvent.category}</div>
                )}
              </div>
            </div>
          )}

          {/* Statistics */}
          <div className="grid grid-cols-3 gap-4 text-xs">
            <div>
              <div className="font-medium">Total Events: {chartEvents.length}</div>
              <div>Filtered: {filteredEvents.length}</div>
            </div>
            <div>
              <div className="font-medium">Date Range:</div>
              <div>{new Date(minDate).toLocaleDateString()} - {new Date(maxDate).toLocaleDateString()}</div>
            </div>
            <div>
              <div className="font-medium">Event Types:</div>
              <div>{Array.from(new Set(chartEvents.map(e => e.type))).join(', ')}</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Metadata for component library
TimelineChart.metadata = {
  name: "TimelineChart",
  label: "Timeline Chart",
  version: "1.0.0",
  date: "2025-10-08",
  description: "Interactive timeline with events, milestones, and phases",
  phase: "Core",
  category: "Data Visualization",
  tags: ["dataviz", "timeline", "events", "temporal", "interactive"]
}
