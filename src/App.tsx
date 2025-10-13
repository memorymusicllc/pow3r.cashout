/**
 * Main Application Component
 * Comprehensive dashboard with workflow management
 * 
 * @version 3.0.0
 * @date 2025-10-13
 * @category Core
 * @tags dashboard, main, app, workflows, navigation
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { DashboardCard } from '@/components/redux-ui';
import { Button } from '@/components/redux-ui';
import { Badge } from '@/components/redux-ui';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/redux-ui';
import { Separator } from '@/components/redux-ui';
import {
  LayoutDashboard,
  Workflow,
  MessageSquare,
  FileText,
  Settings,
  Zap,
  Target,
  Users,
  TrendingUp,
  Package,
  ArrowRight,
  Activity,
  Clock,
  CheckCircle2,
  AlertCircle,
  Eye,
  MessageCircle,
  Star,
  DollarSign
} from 'lucide-react';
import { DashboardOverview } from '@/components/dashboard-overview';
import { Phase1Dashboard } from '@/components/Phase1Dashboard';
import { Phase2Dashboard } from '@/components/Phase2Dashboard';
import { FlowModificationWorkflow } from '@/components/workflows/FlowModificationWorkflow';
import { MessageReviewWorkflow } from '@/components/workflows/MessageReviewWorkflow';
import { ProjectManagementWorkflow } from '@/components/workflows/ProjectManagementWorkflow';
import { NewPostFlowPage } from '@/pages/NewPostFlowPage';

type TabType = 'overview' | 'api-agent' | 'ui-agent' | 'library';

interface WorkflowItem {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  status: 'active' | 'inactive' | 'pending';
  category: 'api' | 'ui';
  phase?: string;
}

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [selectedWorkflow, setSelectedWorkflow] = useState<string | null>(null);

  // Workflow definitions
  const workflows: WorkflowItem[] = [
    // API Agent Workflows
    {
      id: 'flow-modification',
      title: 'Flow Modification',
      description: 'Design and modify automated workflows',
      icon: Workflow,
      status: 'active',
      category: 'api'
    },
    {
      id: 'message-review',
      title: 'Message Review',
      description: 'AI-powered message processing and responses',
      icon: MessageSquare,
      status: 'active',
      category: 'api'
    },
    {
      id: 'project-management',
      title: 'Project Management',
      description: 'Manage complex multi-step projects',
      icon: Target,
      status: 'active',
      category: 'api'
    },
    // UI Agent Workflows
    {
      id: 'phase1-dashboard',
      title: 'Phase 1: Content & Setup',
      description: 'Content creation and initial setup workflows',
      icon: FileText,
      status: 'active',
      category: 'ui',
      phase: 'Phase 1'
    },
    {
      id: 'phase2-dashboard',
      title: 'Phase 2: Automation & Management',
      description: 'Automated posting and lead management',
      icon: Zap,
      status: 'active',
      category: 'ui',
      phase: 'Phase 2'
    },
    {
      id: 'new-post-flow',
      title: 'New Post Flow',
      description: 'Step-by-step post creation workflow',
      icon: Package,
      status: 'active',
      category: 'ui'
    }
  ];

  // Get workflows by category
  const apiWorkflows = workflows.filter(w => w.category === 'api');
  const uiWorkflows = workflows.filter(w => w.category === 'ui');

  // Render workflow content
  const renderWorkflowContent = () => {
    if (!selectedWorkflow) return null;

    switch (selectedWorkflow) {
      case 'flow-modification':
        return <FlowModificationWorkflow />;
      case 'message-review':
        return <MessageReviewWorkflow />;
      case 'project-management':
        return <ProjectManagementWorkflow />;
      case 'phase1-dashboard':
        return <Phase1Dashboard />;
      case 'phase2-dashboard':
        return <Phase2Dashboard />;
      case 'new-post-flow':
        return <NewPostFlowPage />;
      default:
        return null;
    }
  };

  // Render workflow cards
  const renderWorkflowCards = (workflowList: WorkflowItem[]) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {workflowList.map((workflow) => (
        <DashboardCard
          key={workflow.id}
          title={workflow.title}
          description={workflow.description}
          className="cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => {
            setSelectedWorkflow(workflow.id);
            setActiveTab(workflow.category === 'api' ? 'api-agent' : 'ui-agent');
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <workflow.icon className="w-8 h-8 text-primary" />
              <div>
                <Badge 
                  variant={workflow.status === 'active' ? 'default' : 'secondary'}
                  className="mb-2"
                >
                  {workflow.status}
                </Badge>
                {workflow.phase && (
                  <Badge variant="outline" className="ml-2">
                    {workflow.phase}
                  </Badge>
                )}
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-muted-foreground" />
          </div>
        </DashboardCard>
      ))}
    </div>
  );

  // Render main content based on active tab
  const renderMainContent = () => {
    if (selectedWorkflow) {
      return (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">
                {workflows.find(w => w.id === selectedWorkflow)?.title}
              </h2>
              <p className="text-muted-foreground">
                {workflows.find(w => w.id === selectedWorkflow)?.description}
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => setSelectedWorkflow(null)}
            >
              Back to Dashboard
            </Button>
          </div>
          <Separator />
          {renderWorkflowContent()}
        </div>
      );
    }

    switch (activeTab) {
      case 'overview':
        return <DashboardOverview />;
      case 'api-agent':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">API Agent Workflows</h2>
              <p className="text-muted-foreground">
                Backend-focused workflows for automation and data processing
              </p>
            </div>
            {renderWorkflowCards(apiWorkflows)}
          </div>
        );
      case 'ui-agent':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">UI Agent Workflows</h2>
              <p className="text-muted-foreground">
                Frontend-focused workflows for content creation and management
              </p>
            </div>
            {renderWorkflowCards(uiWorkflows)}
          </div>
        );
      case 'library':
        return (
          <div className="text-center py-12">
            <Package className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-2xl font-bold mb-2">Component Library</h2>
            <p className="text-muted-foreground mb-6">
              Browse and test all UI components
            </p>
            <Link to="/library">
              <Button>
                <Package className="w-4 h-4 mr-2" />
                Open Component Library
              </Button>
            </Link>
          </div>
        );
      default:
        return <DashboardOverview />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Zap className="w-8 h-8 text-primary" />
                <div>
                  <h1 className="text-xl font-bold">pow3r.cashout</h1>
                  <p className="text-xs text-muted-foreground">Workflow Management Dashboard</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="outline">v3.0.0</Badge>
              <Badge variant="default" className="bg-green-600">Live</Badge>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="border-b">
        <div className="container mx-auto px-4">
          <div className="flex space-x-8">
            {[
              { id: 'overview', label: 'Overview', icon: LayoutDashboard },
              { id: 'api-agent', label: 'API Agent', icon: Workflow },
              { id: 'ui-agent', label: 'UI Agent', icon: FileText },
              { id: 'library', label: 'Library', icon: Package }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as TabType);
                  setSelectedWorkflow(null);
                }}
                className={`flex items-center space-x-2 py-4 border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {renderMainContent()}
      </main>

      {/* Footer */}
      <footer className="border-t mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-sm text-muted-foreground">
            <p>pow3r.cashout • Workflow Management Dashboard • Built with React + Vite + Tailwind CSS</p>
            <p className="mt-2">
              <Link to="/library" className="text-primary hover:underline">
                Component Library
              </Link>
              {' • '}
              <a href="https://github.com/make-sum/pow3r-cashout" className="text-primary hover:underline">
                GitHub
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
