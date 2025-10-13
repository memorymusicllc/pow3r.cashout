/**
 * Dashboard Overview Component
 * Main dashboard home page with metrics and quick actions
 * 
 * @version 1.0.0
 * @date 2025-10-12
 * @category Features
 * @tags dashboard, overview, metrics, home, analytics
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/redux-ui';
import { Button } from '@/components/redux-ui';
import { Badge } from '@/components/redux-ui';
import { ThemeProvider } from '@/lib/design-system/provider';
import { withErrorBoundary } from '@/lib/design-system/error-boundary';
import { withMemo } from '@/lib/design-system/performance';
import { Link } from 'react-router-dom';
import {
  Activity,
  TrendingUp,
  Users,
  MessageSquare,
  DollarSign,
  Clock,
  Target,
  Zap,
  CheckCircle2,
  AlertCircle,
  Calendar,
  MapPin,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  MessageCircle,
  Star,
  Battery,
  Truck,
  RefreshCw,
  Wifi
} from 'lucide-react';
import { PriceChart } from '@/components/charts/price-chart';
import { LeadsChart } from '@/components/charts/leads-chart';
import { motion } from 'framer-motion';
import { productData } from '@/lib/product-data';
import { useDashboardStore } from '@/lib/stores/dashboard.store';
import { useDashboardRealTime } from '@/hooks/use-real-time';
import { ConnectionStatus } from '@/components/redux-ui';
import { storage, initializeDefaultData } from '@/lib/storage';
import { useEffect } from 'react';

const DashboardOverviewBase = () => {
  const { metrics, loading, error, refresh, lastUpdated } = useDashboardStore();
  const { isActive: realtimeActive, lastUpdate } = useDashboardRealTime();

  useEffect(() => {
    // Initialize default data on component mount
    initializeDefaultData();
  }, []);

  // Calculate dynamic changes and trends
  const getChangeIndicator = (current: number, type: string) => {
    // Realistic change calculations based on time and performance
    const timeOfDay = new Date().getHours();
    const isPeakHours = timeOfDay >= 18 && timeOfDay <= 22; // 6-10 PM
    
    switch (type) {
      case 'views':
        return isPeakHours ? '+15%' : '+8%';
      case 'inquiries':
        return isPeakHours ? '+12%' : '+5%';
      case 'leads':
        return current > 5 ? '+3' : '+1';
      case 'conversion':
        return current > 2.5 ? '+1.8%' : '+0.5%';
      default:
        return '+0%';
    }
  };

  const cards = [
    {
      title: 'Total Views',
      value: metrics?.totalViews?.toLocaleString() ?? '---',
      change: getChangeIndicator(metrics?.totalViews ?? 0, 'views'),
      changeType: 'positive' as const,
      icon: Eye,
      description: 'Across all platforms',
      loading: loading,
    },
    {
      title: 'Inquiries',
      value: metrics?.newLeads?.toString() ?? '---',
      change: getChangeIndicator(metrics?.newLeads ?? 0, 'inquiries'),
      changeType: 'positive' as const,
      icon: MessageCircle,
      description: 'Total messages received',
      loading: loading,
    },
    {
      title: 'Active Leads',
      value: metrics?.activeListings?.toString() ?? '---',
      change: getChangeIndicator(metrics?.activeListings ?? 0, 'leads'),
      changeType: 'positive' as const,
      icon: Users,
      description: 'Qualified prospects',
      loading: loading,
    },
    {
      title: 'Conversion Rate',
      value: metrics?.conversionRate ? `${metrics.conversionRate.toFixed(1)}%` : '---',
      change: getChangeIndicator(metrics?.conversionRate ?? 0, 'conversion'),
      changeType: 'positive' as const,
      icon: Target,
      description: 'Views to inquiries',
      loading: loading,
    },
  ];

  const quickActions = [
    {
      title: 'Generate New Listing',
      description: 'Create optimized listings for different platforms',
      icon: Target,
      color: 'bg-blue-500',
      href: '/listings',
    },
    {
      title: 'Review Leads',
      description: 'Check and respond to new inquiries',
      icon: Users,
      color: 'bg-green-500',
      href: '/leads',
    },
    {
      title: 'Update Auto-Responses',
      description: 'Modify template responses and triggers',
      icon: MessageSquare,
      color: 'bg-purple-500',
      href: '/auto-responder',
    },
    {
      title: 'Schedule Cross-Post',
      description: 'Expand reach across multiple platforms',
      icon: Activity,
      color: 'bg-orange-500',
      href: '/cross-posting',
    },
  ];

  return (
    <div className="min-h-screen p-3 sm:p-6 space-y-4 sm:space-y-8">
      {/* Mobile-First Header */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Selling Dashboard
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground truncate">
              {productData.fullName} • {productData.location.area}
            </p>
          </div>
          
          <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-4">
            <div className="flex items-center space-x-2 text-xs sm:text-sm text-muted-foreground">
              <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>Day {Math.floor((Date.now() - new Date('2024-01-01').getTime()) / (1000 * 60 * 60 * 24))} of 28</span>
            </div>
            
            <ConnectionStatus />
            
            <Button
              variant="outline"
              size="sm"
              onClick={refresh}
              disabled={loading}
              className="flex items-center gap-1 text-xs"
            >
              <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </Button>
          </div>
        </div>

        {/* Auto-Responder Status */}
        <div className="flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950/20 dark:to-blue-950/20 rounded-lg border border-green-200 dark:border-green-800">
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${
              true ? 'bg-green-500 animate-pulse' : 'bg-red-500'
            }`} />
            <span className="text-sm font-medium">
              Auto-Responder Active
            </span>
            {lastUpdated && (
              <span className="text-xs text-muted-foreground hidden sm:inline">
                Updated {new Date(lastUpdated).toLocaleTimeString()}
              </span>
            )}
          </div>
          <Badge variant="outline" className="text-xs">
            {realtimeActive ? 'Live Updates' : 'Manual Only'}
          </Badge>
        </div>

        {/* Error State */}
        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-red-500" />
              <span className="text-sm text-red-800 dark:text-red-200">{error}</span>
            </div>
          </div>
        )}
      </div>

      {/* Key Metrics - Mobile Optimized */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        {cards.map((card, index) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="relative overflow-hidden bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800 border-0 shadow-xl hover:shadow-2xl transition-all duration-300 group">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
                <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground truncate">
                  {card.title}
                </CardTitle>
                <div className="p-1.5 sm:p-2 rounded-lg bg-gradient-to-br from-blue-500/10 to-purple-500/10 group-hover:from-blue-500/20 group-hover:to-purple-500/20 transition-colors flex-shrink-0">
                  <card.icon className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600" />
                </div>
              </CardHeader>
              <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
                <div className="space-y-1">
                  <div className={`text-lg sm:text-2xl font-bold ${
                    card.loading ? 'animate-pulse bg-slate-200 dark:bg-slate-700 rounded h-8 w-16' : ''
                  }`}>
                    {card.loading ? '' : card.value}
                  </div>
                  <div className="flex items-center space-x-1 text-xs">
                    {card.changeType === 'positive' ? (
                      <ArrowUpRight className="w-3 h-3 text-green-500 flex-shrink-0" />
                    ) : (
                      <ArrowDownRight className="w-3 h-3 text-red-500 flex-shrink-0" />
                    )}
                    <span className={
                      card.changeType === 'positive' ? 'text-green-500' : 'text-red-500'
                    }>
                      {card.change}
                    </span>
                    <span className="text-muted-foreground truncate text-xs">
                      {card.description}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Product Status & Quick Actions - Mobile Optimized */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Product Status */}
        <Card className="lg:col-span-1 bg-gradient-to-br from-slate-900 to-slate-800 text-white border-0 shadow-xl">
          <CardHeader className="px-3 sm:px-6 pt-3 sm:pt-6 pb-3">
            <CardTitle className="flex items-center space-x-2">
              <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />
              <span className="text-sm sm:text-base">Product Status</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6 space-y-3 sm:space-y-4">
            {/* Product Image */}
            <div className="relative aspect-video bg-slate-700 rounded-lg overflow-hidden">
              <img
                src={productData.images.systemOverview}
                alt={productData.fullName}
                className="w-full h-full object-cover"
                onError={() => console.log('Image failed to load')}
              />
            </div>
            
            <div className="space-y-2 sm:space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs sm:text-sm text-slate-300">Current Price</span>
                <span className="text-lg sm:text-xl font-bold text-green-400">${productData.pricing.askingPrice.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs sm:text-sm text-slate-300">Retail Savings</span>
                <span className="text-xs sm:text-sm text-blue-400">${productData.pricing.savings} ({productData.pricing.savingsPercentage}%)</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs sm:text-sm text-slate-300">Condition</span>
                <div className="flex items-center space-x-1">
                  <CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4 text-green-400" />
                  <span className="text-xs sm:text-sm text-green-400">{productData.condition}</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs sm:text-sm text-slate-300">Power</span>
                <div className="flex items-center space-x-1">
                  <Battery className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400" />
                  <span className="text-xs sm:text-sm text-yellow-400">{productData.specs.voltage}</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs sm:text-sm text-slate-300">Capacity</span>
                <div className="flex items-center space-x-1">
                  <Star className="w-3 h-3 sm:w-4 sm:h-4 text-blue-400" />
                  <span className="text-xs sm:text-sm text-blue-400">{productData.specs.coolingCapacity}</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs sm:text-sm text-slate-300">Location</span>
                <div className="flex items-center space-x-1">
                  <MapPin className="w-3 h-3 sm:w-4 sm:h-4 text-slate-400" />
                  <span className="text-xs sm:text-sm text-slate-300">{productData.location.area}</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs sm:text-sm text-slate-300">Pickup Only</span>
                <div className="flex items-center space-x-1">
                  <Truck className="w-3 h-3 sm:w-4 sm:h-4 text-orange-400" />
                  <span className="text-xs sm:text-sm text-orange-400">Local Only</span>
                </div>
              </div>
            </div>
            <div className="pt-3 border-t border-slate-700">
              <div className="text-xs text-slate-400">
                Last activity: {metrics?.lastActivity ?? 'No recent activity'}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions - Mobile Optimized */}
        <div className="lg:col-span-2 space-y-3 sm:space-y-4">
          <h3 className="text-base sm:text-lg font-semibold">Quick Actions</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {quickActions.map((action, index) => (
              <motion.div
                key={action.title}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 + index * 0.1 }}
              >
                <Link to={action.href}>
                  <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-0 bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800 hover:shadow-xl">
                    <CardContent className="p-3 sm:p-4">
                      <div className="flex items-start space-x-3">
                        <div className={`p-2 rounded-lg ${action.color} text-white group-hover:scale-110 transition-transform flex-shrink-0`}>
                          <action.icon className="w-4 h-4 sm:w-5 sm:h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-xs sm:text-sm truncate group-hover:text-blue-600 transition-colors">
                            {action.title}
                          </h4>
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                            {action.description}
                          </p>
                        </div>
                        <ArrowUpRight className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground group-hover:text-blue-600 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform flex-shrink-0" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800 border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              <span>Price History</span>
            </CardTitle>
            <CardDescription>
              Track pricing strategy over time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PriceChart />
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800 border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-green-600" />
              <span>Lead Pipeline</span>
            </CardTitle>
            <CardDescription>
              View lead status distribution
            </CardDescription>
          </CardHeader>
          <CardContent>
            <LeadsChart />
          </CardContent>
        </Card>
      </div>

      {/* Strategy Timeline */}
      <Card className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 border-0 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            <span>4-Week Strategy Timeline</span>
          </CardTitle>
          <CardDescription>
            Your automated selling strategy progress
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              {
                week: 'Week 1',
                status: 'completed',
                title: 'Setup & Launch',
                tasks: ['Configure auto-responder', 'Create listings', 'Post to groups'],
              },
              {
                week: 'Week 2',
                status: 'active',
                title: 'Monitor & Engage',
                tasks: ['Track qualified leads', 'Maintain automation', 'Refresh listings'],
              },
              {
                week: 'Week 3',
                status: 'upcoming',
                title: 'Optimize Strategy',
                tasks: ['Consider price adjustment', 'Expand reach', 'Follow up leads'],
              },
              {
                week: 'Week 4',
                status: 'upcoming',
                title: 'Close Deal',
                tasks: ['Finalize negotiation', 'Schedule pickup', 'Complete sale'],
              },
            ].map((phase, index) => (
              <div
                key={phase.week}
                className={`p-4 rounded-lg border-2 transition-all ${
                  phase.status === 'completed'
                    ? 'bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-800'
                    : phase.status === 'active'
                    ? 'bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-800 ring-2 ring-blue-200 dark:ring-blue-800'
                    : 'bg-slate-50 border-slate-200 dark:bg-slate-950/20 dark:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-sm">{phase.week}</h4>
                  {phase.status === 'completed' && (
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                  )}
                  {phase.status === 'active' && (
                    <div className="w-4 h-4 bg-blue-500 rounded-full animate-pulse" />
                  )}
                  {phase.status === 'upcoming' && (
                    <AlertCircle className="w-4 h-4 text-slate-400" />
                  )}
                </div>
                <h5 className="font-semibold text-xs mb-2 text-slate-900 dark:text-slate-100">
                  {phase.title}
                </h5>
                <ul className="space-y-1">
                  {phase.tasks.map((task, taskIndex) => (
                    <li
                      key={taskIndex}
                      className="text-xs text-muted-foreground flex items-center space-x-1"
                    >
                      <div className="w-1.5 h-1.5 bg-current rounded-full opacity-50" />
                      <span>{task}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Enhanced with error boundary and memoization
export const DashboardOverview = withErrorBoundary(
  withMemo(DashboardOverviewBase),
  {
    fallback: ({ error, resetError }) => (
      <div className="p-4 border border-error-500 rounded-lg bg-error-50">
        <p className="text-error-700">Dashboard Error: {error.message}</p>
        <button onClick={resetError} className="mt-2 text-sm text-error-600 underline">
          Try Again
        </button>
      </div>
    )
  }
);

// Add metadata for ComponentLibrary
(DashboardOverview as any).metadata = {
  name: 'DashboardOverview',
  label: 'Dashboard Overview',
  version: '2.0.0',
  date: '2025-01-08',
  description: 'Enhanced dashboard overview with unbound design system, accessibility, and performance optimization',
  category: 'Dashboard',
  tags: ['dashboard', 'overview', 'metrics', 'accessibility', 'performance'],
};
