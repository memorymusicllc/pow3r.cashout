/**
 * Automation Engine Component - Phase 2 Core
 * Manages auto-posting, content rotation, and cross-platform sync
 * 
 * @version 2.0.0
 * @date 2025-01-08
 */

import React, { useEffect, useState } from 'react'
import { useAutomationStore } from '@/lib/stores/automation.store'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Calendar, 
  RotateCcw, 
  RefreshCw, 
  Play, 
  Pause, 
  Settings,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react'

export function AutomationEngine() {
  const {
    schedules,
    contentRotations,
    crossPlatformSyncs,
    metrics,
    loading,
    posting,
    syncing,
    fetchSchedules,
    fetchContentRotations,
    fetchCrossPlatformSyncs,
    createSchedule,
    createContentRotation,
    syncToPlatforms,
    retryFailedSyncs,
    refreshAll
  } = useAutomationStore()

  const [activeTab, setActiveTab] = useState('schedules')

  useEffect(() => {
    refreshAll()
  }, [])

  const handleCreateSchedule = async () => {
    const newSchedule = {
      listingId: 'listing-001',
      platform: 'facebook',
      scheduledTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      status: 'pending' as const,
      retryCount: 0
    }
    await createSchedule(newSchedule)
  }

  const handleCreateContentRotation = async () => {
    const newRotation = {
      listingId: 'listing-001',
      variations: [
        'Original content',
        'Alternative description',
        'Updated pricing focus'
      ],
      rotationInterval: 24,
      currentIndex: 0,
      lastRotation: new Date().toISOString(),
      performance: {
        views: 0,
        inquiries: 0,
        conversions: 0
      }
    }
    await createContentRotation(newRotation)
  }

  const handleSyncToPlatforms = async () => {
    await syncToPlatforms('listing-001', ['facebook', 'offerup', 'craigslist'])
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Automation Engine</h2>
          <p className="text-muted-foreground">Manage auto-posting, content rotation, and cross-platform sync</p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            onClick={refreshAll}
            disabled={loading}
          >
            <RotateCcw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={handleCreateSchedule} disabled={posting}>
            <Play className="w-4 h-4 mr-2" />
            New Schedule
          </Button>
        </div>
      </div>

      {/* Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalPosts}</div>
            <p className="text-xs text-muted-foreground">
              {metrics.successfulPosts} successful
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics.totalPosts > 0 ? Math.round((metrics.successfulPosts / metrics.totalPosts) * 100) : 0}%
            </div>
            <Progress 
              value={metrics.totalPosts > 0 ? (metrics.successfulPosts / metrics.totalPosts) * 100 : 0} 
              className="mt-2" 
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.averageResponseTime}ms</div>
            <p className="text-xs text-muted-foreground">
              Cross-platform reach: {metrics.crossPlatformReach}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Content Rotation</CardTitle>
            <RotateCcw className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(metrics.contentRotationEffectiveness)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Effectiveness score
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="schedules">Schedules</TabsTrigger>
          <TabsTrigger value="rotations">Content Rotation</TabsTrigger>
          <TabsTrigger value="sync">Cross-Platform Sync</TabsTrigger>
        </TabsList>

        <TabsContent value="schedules" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Posting Schedules</h3>
            <Button onClick={handleCreateSchedule} disabled={posting}>
              <Calendar className="w-4 h-4 mr-2" />
              Schedule Post
            </Button>
          </div>

          <div className="grid gap-4">
            {schedules.map((schedule) => (
              <Card key={schedule.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base">{schedule.platform}</CardTitle>
                      <CardDescription>
                        Scheduled: {new Date(schedule.scheduledTime).toLocaleString()}
                      </CardDescription>
                    </div>
                    <Badge variant={
                      schedule.status === 'posted' ? 'default' :
                      schedule.status === 'failed' ? 'destructive' :
                      schedule.status === 'pending' ? 'secondary' : 'outline'
                    }>
                      {schedule.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                      Retry count: {schedule.retryCount}
                    </div>
                    <div className="flex items-center gap-2">
                      {schedule.status === 'failed' && (
                        <Button size="sm" variant="outline">
                          <RotateCcw className="w-4 h-4 mr-1" />
                          Retry
                        </Button>
                      )}
                      <Button size="sm" variant="outline">
                        <Settings className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="rotations" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Content Rotation</h3>
            <Button onClick={handleCreateContentRotation}>
              <RotateCcw className="w-4 h-4 mr-2" />
              New Rotation
            </Button>
          </div>

          <div className="grid gap-4">
            {contentRotations.map((rotation) => (
              <Card key={rotation.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base">Listing {rotation.listingId}</CardTitle>
                      <CardDescription>
                        {rotation.variations.length} variations • 
                        Rotate every {rotation.rotationInterval}h
                      </CardDescription>
                    </div>
                    <Badge variant="outline">
                      Variation {rotation.currentIndex + 1}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="text-sm">
                      <strong>Performance:</strong> {rotation.performance.views} views, 
                      {rotation.performance.inquiries} inquiries, 
                      {rotation.performance.conversions} conversions
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Last rotation: {new Date(rotation.lastRotation).toLocaleString()}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="sync" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Cross-Platform Sync</h3>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                onClick={retryFailedSyncs}
                disabled={syncing}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${syncing ? 'animate-spin' : ''}`} />
                Retry Failed
              </Button>
              <Button onClick={handleSyncToPlatforms}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Sync Now
              </Button>
            </div>
          </div>

          <div className="grid gap-4">
            {crossPlatformSyncs.map((sync) => (
              <Card key={sync.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base">Listing {sync.listingId}</CardTitle>
                      <CardDescription>
                        Platforms: {sync.platforms.join(', ')}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      {Object.entries(sync.syncStatus).map(([platform, status]) => (
                        <Badge 
                          key={platform}
                          variant={
                            status === 'synced' ? 'default' :
                            status === 'failed' ? 'destructive' :
                            'secondary'
                          }
                        >
                          {platform}: {status}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="text-sm">
                      Last sync: {new Date(sync.lastSync).toLocaleString()}
                    </div>
                    {Object.keys(sync.syncErrors).length > 0 && (
                      <div className="text-sm text-destructive">
                        Errors: {Object.entries(sync.syncErrors).map(([platform, error]) => 
                          `${platform}: ${error}`
                        ).join(', ')}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
