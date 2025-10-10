/**
 * Main Dashboard Application
 * Single-page dashboard with functional widgets powered by Zustand stores
 * 
 * @version 2.0.0
 * @date 2025-10-08
 */

import { useEffect, useState } from 'react'
import { ThemeProvider } from '@/lib/design-system/provider'
import { AuthProvider } from '@/lib/auth-context'
// Note: Toaster components will be replaced with Redux UI equivalents
// import { Toaster } from '@/components/ui/toaster'
// import { Toaster as SonnerToaster } from '@/components/ui/sonner'
import { getAppVersion } from '@/lib/version'

// Zustand Stores - Core dashboard only
import { useDashboardStore } from '@/lib/stores/dashboard.store'
// import { useListingsStore } from '@/lib/stores/listings.store'
// import { useAutoResponderStore } from '@/lib/stores/auto-responder.store'

// Dashboard Components Library - Core components only
import { DashboardOverview } from '@/components/dashboard-overview'
import { NewPostFlow } from '@/components/NewPostFlow'
// Note: Other components will be added back once they're updated to use Redux UI
// import { ListingManagement } from '@/components/listing-management'
// import { AutoResponderManager } from '@/components/auto-responder-manager'
// import { LeadsManager } from '@/components/leads-manager'

// Phase Dashboards - Temporarily disabled due to TypeScript errors
// import { Phase1Dashboard } from '@/components/Phase1Dashboard'
// import { Phase2Dashboard } from '@/components/Phase2Dashboard'

// Navigation Components - Redux UI
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/redux-ui'
import { Button } from '@/components/redux-ui'
import { Badge } from '@/components/redux-ui'

// Search Components
import { SearchHeader } from '@/components/search/SearchIntegration'

// Icons
import { 
  BarChart3, 
  Users, 
  MessageSquare, 
  FileText,
  TrendingUp,
  Activity,
  RefreshCw,
  Settings,
  Home,
  List,
  UserCheck,
  Bot,
  Package,
  Zap,
  Plus
} from 'lucide-react'

function Dashboard() {
  // Dashboard metrics
  const { metrics, loading: dashLoading, fetchMetrics } = useDashboardStore()
  
  const version = getAppVersion()

  // Fetch data on mount
  useEffect(() => {
    fetchMetrics()
  }, [fetchMetrics])

  const handleRefreshAll = async () => {
    await fetchMetrics()
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between mb-4">
          <div>
              <h1 className="text-3xl font-bold">pow3r.cashout</h1>
              <p className="text-muted-foreground">Multi-Platform Selling Dashboard</p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs text-muted-foreground font-mono">{version}</span>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRefreshAll}
              disabled={dashLoading}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${dashLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

          {/* Universal Search - Simplified */}
          <SearchHeader
            data={[
              {
                id: 'metrics',
                title: 'Dashboard Metrics',
                description: 'View dashboard statistics and analytics',
                category: 'analytics',
                type: 'metrics',
                tags: ['dashboard', 'stats'],
                timestamp: new Date()
              }
            ]}
            onResultSelect={(result) => {
              console.log('Search result selected:', result)
              // Handle search result selection
            }}
          />
        </div>
      </div>

      {/* Main Content with Navigation */}
      <div className="container mx-auto px-4 py-6">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Home className="w-4 h-4" />
              <span>Dashboard Overview</span>
            </TabsTrigger>
            <TabsTrigger value="new-post" className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              <span>New Post Flow</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <DashboardOverview />
          </TabsContent>

          <TabsContent value="new-post" className="space-y-6">
            <NewPostFlow />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

function App() {
  return (
    <ThemeProvider 
      defaultTheme="pow3r-dark" 
      enableSystemPreference={true}
      enableCSSVariables={true}
      storageKey="pow3r-cashout-theme"
    >
      <AuthProvider>
        <Dashboard />
      {/* Toaster components will be added when Redux UI versions are created */}
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App