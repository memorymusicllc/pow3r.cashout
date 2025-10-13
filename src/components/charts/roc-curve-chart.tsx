/**
 * ROC Curve Chart
 * Displays Receiver Operating Characteristic and Precision-Recall curves
 * 
 * @version 1.0.0
 * @date 2025-10-08
 */

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/redux-ui'
import { Badge } from '@/components/redux-ui'
import { Button } from '@/components/redux-ui'
import { TrendingUp, Target, BarChart3 } from 'lucide-react'

interface ROCPoint {
  threshold: number
  tpr: number // True Positive Rate (Sensitivity)
  fpr: number // False Positive Rate (1 - Specificity)
  precision: number
  recall: number
  f1Score: number
}

interface ROCCurveChartProps {
  data: ROCPoint[]
  title?: string
  showAUC?: boolean
  showOptimalPoint?: boolean
  className?: string
}

export function ROCCurveChart({
  data,
  title = "ROC & Precision-Recall Curves",
  showAUC = true,
  showOptimalPoint = true,
  className = ""
}: ROCCurveChartProps) {
  // Fallback data if none provided
  const chartData = data && data.length > 0 ? data : [
    { threshold: 0.0, tpr: 0.0, fpr: 0.0, precision: 0.8, recall: 0.0, f1Score: 0.0 },
    { threshold: 0.2, tpr: 0.3, fpr: 0.1, precision: 0.75, recall: 0.3, f1Score: 0.43 },
    { threshold: 0.4, tpr: 0.6, fpr: 0.2, precision: 0.75, recall: 0.6, f1Score: 0.67 },
    { threshold: 0.6, tpr: 0.8, fpr: 0.3, precision: 0.73, recall: 0.8, f1Score: 0.76 },
    { threshold: 0.8, tpr: 0.9, fpr: 0.4, precision: 0.69, recall: 0.9, f1Score: 0.78 },
    { threshold: 1.0, tpr: 1.0, fpr: 1.0, precision: 0.5, recall: 1.0, f1Score: 0.67 }
  ];
  
  const [activeTab, setActiveTab] = useState<'roc' | 'pr'>('roc')
  const [selectedPoint, setSelectedPoint] = useState<ROCPoint | null>(null)

  // Chart dimensions
  const width = 400
  const height = 300
  const margin = 60
  const chartWidth = width - margin * 2
  const chartHeight = height - margin * 2

  // Scale functions
  const scaleX = (value: number) => margin + value * chartWidth
  const scaleY = (value: number) => margin + chartHeight - value * chartHeight

  // Calculate AUC (Area Under Curve)
  const calculateAUC = (points: ROCPoint[]) => {
    if (points.length < 2) return 0
    
    let auc = 0
    for (let i = 1; i < points.length; i++) {
      const x1 = points[i - 1].fpr
      const y1 = points[i - 1].tpr
      const x2 = points[i].fpr
      const y2 = points[i].tpr
      auc += (x2 - x1) * (y1 + y2) / 2
    }
    return auc
  }

  const rocAUC = calculateAUC(chartData)
  const prAUC = calculateAUC(chartData.map(d => ({ ...d, fpr: d.recall, tpr: d.precision })))

  // Find optimal point (closest to top-left for ROC, closest to top-right for PR)
  const findOptimalPoint = () => {
    if (chartData.length === 0) {
      return { tpr: 0, fpr: 0, precision: 0, recall: 0 }
    }
    
    if (activeTab === 'roc') {
      return chartData.reduce((best, current) => {
        const bestDistance = Math.sqrt(best.fpr ** 2 + (1 - best.tpr) ** 2)
        const currentDistance = Math.sqrt(current.fpr ** 2 + (1 - current.tpr) ** 2)
        return currentDistance < bestDistance ? current : best
      })
    } else {
      return chartData.reduce((best, current) => {
        const bestRecall = best.recall || 0
        const bestPrecision = best.precision || 0
        const currentRecall = current.recall || 0
        const currentPrecision = current.precision || 0
        
        const bestDistance = Math.sqrt((1 - bestRecall) ** 2 + (1 - bestPrecision) ** 2)
        const currentDistance = Math.sqrt((1 - currentRecall) ** 2 + (1 - currentPrecision) ** 2)
        return currentDistance < bestDistance ? current : best
      })
    }
  }

  const optimalPoint = findOptimalPoint()

  // Generate curve path
  const generateCurvePath = (points: ROCPoint[], xKey: keyof ROCPoint, yKey: keyof ROCPoint) => {
    if (points.length === 0) return ''
    
    const sortedPoints = [...points].sort((a, b) => a[xKey] - b[xKey])
    const pathData = sortedPoints.map((point, index) => {
      const x = scaleX(point[xKey])
      const y = scaleY(point[yKey])
      return `${index === 0 ? 'M' : 'L'} ${x} ${y}`
    }).join(' ')
    
    return pathData
  }

  const rocPath = generateCurvePath(chartData, 'fpr', 'tpr')
  const prPath = generateCurvePath(chartData, 'recall', 'precision')

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="w-3 h-3 bg-teal-500 rounded-full"></div>
          {title}
        </CardTitle>
        <CardDescription>
          ROC and Precision-Recall curves with AUC metrics
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Tab Navigation */}
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant={activeTab === 'roc' ? 'default' : 'outline'}
              onClick={() => setActiveTab('roc')}
            >
              <TrendingUp className="w-4 h-4 mr-1" />
              ROC Curve
            </Button>
            <Button
              size="sm"
              variant={activeTab === 'pr' ? 'default' : 'outline'}
              onClick={() => setActiveTab('pr')}
            >
              <Target className="w-4 h-4 mr-1" />
              Precision-Recall
            </Button>
          </div>

          {/* Chart */}
          <div className="relative">
            <svg width={width} height={height} className="border rounded">
              {/* Background */}
              <rect width={width} height={height} fill="hsl(var(--background))" />

              {/* Grid lines */}
              {[0.2, 0.4, 0.6, 0.8, 1.0].map(value => (
                <g key={value}>
                  <line
                    x1={scaleX(0)}
                    y1={scaleY(value)}
                    x2={scaleX(1)}
                    y2={scaleY(value)}
                    stroke="hsl(var(--border))"
                    strokeWidth={1}
                    opacity={0.3}
                  />
                  <line
                    x1={scaleX(value)}
                    y1={scaleY(0)}
                    x2={scaleX(value)}
                    y2={scaleY(1)}
                    stroke="hsl(var(--border))"
                    strokeWidth={1}
                    opacity={0.3}
                  />
                </g>
              ))}

              {/* Diagonal line for ROC */}
              {activeTab === 'roc' && (
                <line
                  x1={scaleX(0)}
                  y1={scaleY(0)}
                  x2={scaleX(1)}
                  y2={scaleY(1)}
                  stroke="hsl(var(--muted-foreground))"
                  strokeWidth={2}
                  strokeDasharray="5,5"
                  opacity={0.5}
                />
              )}

              {/* Curve */}
              <path
                d={activeTab === 'roc' ? rocPath : prPath}
                fill="none"
                stroke="hsl(var(--primary))"
                strokeWidth={3}
                className="drop-shadow-sm"
              />

              {/* Data points */}
              {chartData.map((point, index) => {
                const x = activeTab === 'roc' ? point.fpr : point.recall
                const y = activeTab === 'roc' ? point.tpr : point.precision
                const svgX = scaleX(x)
                const svgY = scaleY(y)
                const isOptimal = point === optimalPoint
                const isSelected = selectedPoint === point

                return (
                  <g key={index}>
                    <circle
                      cx={svgX}
                      cy={svgY}
                      r={isOptimal ? 6 : 4}
                      fill={isOptimal ? "hsl(var(--destructive))" : "hsl(var(--primary))"}
                      stroke={isSelected ? "hsl(var(--primary))" : "hsl(var(--background))"}
                      strokeWidth={isSelected ? 3 : 2}
                      className="cursor-pointer hover:opacity-80"
                      onClick={() => setSelectedPoint(isSelected ? null : point)}
                    />
                    {isOptimal && (
                      <text
                        x={svgX}
                        y={svgY - 12}
                        textAnchor="middle"
                        className="text-xs font-bold fill-destructive"
                      >
                        Optimal
                      </text>
                    )}
                  </g>
                )
              })}

              {/* Axes */}
              <line
                x1={margin}
                y1={margin}
                x2={margin}
                y2={margin + chartHeight}
                stroke="hsl(var(--foreground))"
                strokeWidth={2}
              />
              <line
                x1={margin}
                y1={margin + chartHeight}
                x2={margin + chartWidth}
                y2={margin + chartHeight}
                stroke="hsl(var(--foreground))"
                strokeWidth={2}
              />

              {/* Axis labels */}
              <text
                x={margin + chartWidth / 2}
                y={height - 10}
                textAnchor="middle"
                className="text-sm font-medium fill-foreground"
              >
                {activeTab === 'roc' ? 'False Positive Rate' : 'Recall'}
              </text>
              <text
                x={10}
                y={margin + chartHeight / 2}
                textAnchor="middle"
                transform={`rotate(-90, 10, ${margin + chartHeight / 2})`}
                className="text-sm font-medium fill-foreground"
              >
                {activeTab === 'roc' ? 'True Positive Rate' : 'Precision'}
              </text>

              {/* Axis values */}
              {[0, 0.2, 0.4, 0.6, 0.8, 1.0].map(value => (
                <g key={value}>
                  <text
                    x={scaleX(value)}
                    y={height - 5}
                    textAnchor="middle"
                    className="text-xs fill-muted-foreground"
                  >
                    {value}
                  </text>
                  <text
                    x={5}
                    y={scaleY(value) + 4}
                    textAnchor="end"
                    className="text-xs fill-muted-foreground"
                  >
                    {value}
                  </text>
                </g>
              ))}
            </svg>
          </div>

          {/* Selected point info */}
          {selectedPoint && (
            <div className="p-3 bg-muted rounded-lg">
              <div className="text-sm font-medium">Threshold: {selectedPoint.threshold.toFixed(3)}</div>
              <div className="text-xs text-muted-foreground">
                {activeTab === 'roc' ? (
                  <>
                    TPR: {selectedPoint.tpr.toFixed(3)} | FPR: {selectedPoint.fpr.toFixed(3)}
                  </>
                ) : (
                  <>
                    Precision: {selectedPoint.precision.toFixed(3)} | Recall: {selectedPoint.recall.toFixed(3)}
                  </>
                )}
              </div>
              <div className="text-xs text-muted-foreground">
                F1-Score: {selectedPoint.f1Score.toFixed(3)}
              </div>
            </div>
          )}

          {/* Metrics */}
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <div className="font-medium">ROC Curve</div>
              <div>AUC: {rocAUC.toFixed(3)}</div>
              <div>Optimal TPR: {(optimalPoint.tpr || 0).toFixed(3)}</div>
              <div>Optimal FPR: {(optimalPoint.fpr || 0).toFixed(3)}</div>
            </div>
            <div>
              <div className="font-medium">Precision-Recall</div>
              <div>AUC: {prAUC.toFixed(3)}</div>
              <div>Optimal Precision: {(optimalPoint.precision || 0).toFixed(3)}</div>
              <div>Optimal Recall: {(optimalPoint.recall || 0).toFixed(3)}</div>
            </div>
          </div>

          {/* Performance indicators */}
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-primary rounded-full"></div>
              <span>Curve</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-destructive rounded-full"></div>
              <span>Optimal Point</span>
            </div>
            {activeTab === 'roc' && (
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-muted-foreground rounded-full"></div>
                <span>Random Classifier</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Metadata for component library
ROCCurveChart.metadata = {
  name: "ROCCurveChart",
  label: "ROC Curve Chart",
  version: "1.0.0",
  date: "2025-10-08",
  description: "ROC and Precision-Recall curves with AUC metrics",
  phase: "Core",
  category: "Data Visualization",
  tags: ["dataviz", "roc", "precision", "recall", "auc", "classification"]
}
