# Component Inventory

Complete catalog of all components in the pow3r.cashout application.

**Total Components:** 139 files  
**Last Updated:** 2025-10-12  
**Tech Stack:** React 18 + TypeScript + Redux UI (Unbound Design System) + Zustand

---

## Documentation Standards

Per `.cursor/rules/component-library-policies.md`:
- ✅ All components use Redux UI unbound design system
- ✅ TypeScript with comprehensive interfaces
- ✅ JSDoc comments (where applicable)
- ✅ Mobile-first responsive design
- ✅ Dark/light mode support
- ✅ WCAG 2.1 AA accessibility compliance

---

## Component Categories

### Dashboard Components (19)
High-level dashboard widgets and management interfaces for Phase 1 and Phase 2 features.

| Name | Description | Version | Tags | Path |
|------|-------------|---------|------|------|
| AdminPanel | System administration and oversight | v1.0.0 | admin, management, system | src/components/dashboard/AdminPanel.tsx |
| AIResponseSystem | AI-powered auto-responses and templates | v2.0.0 | ai, automation, phase2 | src/components/dashboard/AIResponseSystem.tsx |
| AnalyticsDashboard | Analytics and metrics visualization | v1.0.0 | analytics, metrics, phase2 | src/components/dashboard/AnalyticsDashboard.tsx |
| AutomationEngine | Task automation and scheduling | v1.0.0 | automation, workflow | src/components/dashboard/AutomationEngine.tsx |
| AutoPostingEngine | Automated cross-platform posting | v1.0.0 | posting, automation, phase2 | src/components/dashboard/AutoPostingEngine.tsx |
| ContentGenerator | AI content generation for posts | v1.0.0 | ai, content, generation | src/components/dashboard/ContentGenerator.tsx |
| ItemDetailsCollector | Item information collection | v1.0.0 | items, data-collection | src/components/dashboard/ItemDetailsCollector.tsx |
| LeadMonitor | Lead tracking and monitoring | v1.0.0 | leads, monitoring, phase2 | src/components/dashboard/LeadMonitor.tsx |
| LLMSwitcher | AI model switcher | v1.0.0 | ai, llm, configuration | src/components/dashboard/LLMSwitcher.tsx |
| MessageCenter | Central message management | v1.0.0 | messaging, communication | src/components/dashboard/MessageCenter.tsx |
| NegotiationManager | Price negotiation management | v1.0.0 | negotiation, pricing, phase2 | src/components/dashboard/NegotiationManager.tsx |
| PhotoProcessor | Image processing and optimization | v1.0.0 | images, processing | src/components/dashboard/PhotoProcessor.tsx |
| PlatformSelector | Multi-platform selector | v1.0.0 | platforms, selection | src/components/dashboard/PlatformSelector.tsx |
| PostingStrategy | Posting strategy configuration | v1.0.0 | strategy, posting, phase2 | src/components/dashboard/PostingStrategy.tsx |
| PriceResearcher | Market price research | v1.0.0 | pricing, research | src/components/dashboard/PriceResearcher.tsx |
| PromptTemplatesManager | AI prompt template manager | v1.0.0 | ai, prompts, templates | src/components/dashboard/PromptTemplatesManager.tsx |
| ResponseTemplatesManager | Response template manager | v1.0.0 | responses, templates | src/components/dashboard/ResponseTemplatesManager.tsx |
| SaleProcessor | Sales transaction processing | v1.0.0 | sales, transactions | src/components/dashboard/SaleProcessor.tsx |
| UserManager | User management interface | v1.0.0 | users, management, admin | src/components/dashboard/UserManager.tsx |

### Chart Components (22)
Data visualization components using Recharts for analytics and metrics.

| Name | Description | Version | Tags | Path |
|------|-------------|---------|------|------|
| LeadsChart | Lead pipeline pie chart | v2.0.0 | chart, leads, analytics | src/components/charts/leads-chart.tsx |
| BloomGraphChart | Bloom filter visualization | v1.0.0 | chart, visualization | src/components/charts/bloom-graph-chart.tsx |
| ConfusionMatrixChart | ML confusion matrix | v1.0.0 | chart, ml, analytics | src/components/charts/confusion-matrix-chart.tsx |
| CostAnalysisChart | Cost breakdown analysis | v1.0.0 | chart, cost, financial | src/components/charts/cost-analysis-chart.tsx |
| ErrorRateChart | Error rate tracking | v1.0.0 | chart, errors, monitoring | src/components/charts/error-rate-chart.tsx |
| GanttChart | Project timeline gantt | v1.0.0 | chart, timeline, project | src/components/charts/gantt-chart.tsx |
| HeatmapChart | Activity heatmap | v1.0.0 | chart, heatmap, activity | src/components/charts/heatmap-chart.tsx |
| LatencyDistributionChart | API latency distribution | v1.0.0 | chart, performance | src/components/charts/latency-distribution-chart.tsx |
| LLMPerformanceChart | AI model performance | v1.0.0 | chart, ai, performance | src/components/charts/llm-performance-chart.tsx |
| ModelComparisonChart | AI model comparison | v1.0.0 | chart, ai, comparison | src/components/charts/model-comparison-chart.tsx |
| NetworkGraphChart | Network relationship graph | v1.0.0 | chart, network, graph | src/components/charts/network-graph-chart.tsx |
| PriceChart | Price trend chart | v1.0.0 | chart, pricing, trends | src/components/charts/price-chart.tsx |
| QuadrantLeaderChart | Quadrant analysis | v1.0.0 | chart, quadrant, strategy | src/components/charts/quadrant-leader-chart.tsx |
| QualityMetricsChart | Quality metrics dashboard | v1.0.0 | chart, quality, metrics | src/components/charts/quality-metrics-chart.tsx |
| RequestVolumeChart | API request volume | v1.0.0 | chart, api, volume | src/components/charts/request-volume-chart.tsx |
| RocCurveChart | ROC curve for ML | v1.0.0 | chart, ml, roc | src/components/charts/roc-curve-chart.tsx |
| SankeyDiagramChart | Sankey flow diagram | v1.0.0 | chart, flow, sankey | src/components/charts/sankey-diagram-chart.tsx |
| ScatterPlotChart | Scatter plot visualization | v1.0.0 | chart, scatter | src/components/charts/scatter-plot-chart.tsx |
| TimelineChart | Event timeline | v1.0.0 | chart, timeline, events | src/components/charts/timeline-chart.tsx |
| TokenUsageChart | AI token usage tracking | v1.0.0 | chart, ai, tokens | src/components/charts/token-usage-chart.tsx |
| UsagePatternsChart | Usage pattern analysis | v1.0.0 | chart, usage, patterns | src/components/charts/usage-patterns-chart.tsx |
| WordCloudChart | Word cloud visualization | v1.0.0 | chart, wordcloud, text | src/components/charts/word-cloud-chart.tsx |

### Workflow Components (10)
Workflow management components for project, message, flow, and post workflows.

| Name | Description | Version | Tags | Path |
|------|-------------|---------|------|------|
| WorkflowDashboard | Main workflow dashboard | v1.0.0 | workflow, dashboard, phase2 | src/components/workflows/WorkflowDashboard.tsx |
| WorkflowCard | Workflow card display | v1.0.0 | workflow, card | src/components/workflows/WorkflowCard.tsx |
| WorkflowStep | Single workflow step | v1.0.0 | workflow, step | src/components/workflows/WorkflowStep.tsx |
| WorkflowProgress | Progress tracker | v1.0.0 | workflow, progress | src/components/workflows/WorkflowProgress.tsx |
| WorkflowStatus | Status indicator | v1.0.0 | workflow, status | src/components/workflows/WorkflowStatus.tsx |
| WorkflowActions | Action controls | v1.0.0 | workflow, actions | src/components/workflows/WorkflowActions.tsx |
| FlowModificationWorkflow | Flow editing workflow | v1.0.0 | workflow, modification | src/components/workflows/FlowModificationWorkflow.tsx |
| MessageReviewWorkflow | Message review workflow | v1.0.0 | workflow, messages | src/components/workflows/MessageReviewWorkflow.tsx |
| PostManagementWorkflow | Post management workflow | v1.0.0 | workflow, posts | src/components/workflows/PostManagementWorkflow.tsx |
| ProjectManagementWorkflow | Project workflow | v1.0.0 | workflow, projects | src/components/workflows/ProjectManagementWorkflow.tsx |

### Search Components (5)
Universal search with advanced filtering and logic operators.

| Name | Description | Version | Tags | Path |
|------|-------------|---------|------|------|
| UniversalSearch | Advanced universal search | v1.0.0 | search, filter, operators | src/components/search/UniversalSearch.tsx |
| Search3D | 3D spatial search | v1.0.0 | search, 3d, visualization | src/components/search/Search3D.tsx |
| FilterChips | Search filter chips | v1.0.0 | search, filters, chips | src/components/search/FilterChips.tsx |
| LogicOperators | Search logic operators | v1.0.0 | search, logic, operators | src/components/search/LogicOperators.tsx |
| SearchIntegration | Integrated search | v1.0.0 | search, integration | src/components/search/SearchIntegration.tsx |

### UI Components (52)
Core UI primitives from Redux UI unbound design system, based on Radix UI.

| Name | Path |
|------|------|
| Button | src/components/ui/button.tsx |
| Card | src/components/ui/card.tsx |
| Badge | src/components/ui/badge.tsx |
| Input | src/components/ui/input.tsx |
| Textarea | src/components/ui/textarea.tsx |
| Select | src/components/ui/select.tsx |
| Checkbox | src/components/ui/checkbox.tsx |
| Switch | src/components/ui/switch.tsx |
| Tabs | src/components/ui/tabs.tsx |
| Dialog | src/components/ui/dialog.tsx |
| Alert | src/components/ui/alert.tsx |
| AlertDialog | src/components/ui/alert-dialog.tsx |
| Progress | src/components/ui/progress.tsx |
| Separator | src/components/ui/separator.tsx |
| Tooltip | src/components/ui/tooltip.tsx |
| Popover | src/components/ui/popover.tsx |
| DropdownMenu | src/components/ui/dropdown-menu.tsx |
| ContextMenu | src/components/ui/context-menu.tsx |
| Accordion | src/components/ui/accordion.tsx |
| Table | src/components/ui/table.tsx |
| ScrollArea | src/components/ui/scroll-area.tsx |
| Sheet | src/components/ui/sheet.tsx |
| Drawer | src/components/ui/drawer.tsx |
| Calendar | src/components/ui/calendar.tsx |
| DateRangePicker | src/components/ui/date-range-picker.tsx |
| Label | src/components/ui/label.tsx |
| Form | src/components/ui/form.tsx |
| Slider | src/components/ui/slider.tsx |
| RadioGroup | src/components/ui/radio-group.tsx |
| Toggle | src/components/ui/toggle.tsx |
| ToggleGroup | src/components/ui/toggle-group.tsx |
| HoverCard | src/components/ui/hover-card.tsx |
| Avatar | src/components/ui/avatar.tsx |
| AspectRatio | src/components/ui/aspect-ratio.tsx |
| Resizable | src/components/ui/resizable.tsx |
| Collapsible | src/components/ui/collapsible.tsx |
| Breadcrumb | src/components/ui/breadcrumb.tsx |
| NavigationMenu | src/components/ui/navigation-menu.tsx |
| Menubar | src/components/ui/menubar.tsx |
| Pagination | src/components/ui/pagination.tsx |
| Command | src/components/ui/command.tsx |
| Carousel | src/components/ui/carousel.tsx |
| InputOTP | src/components/ui/input-otp.tsx |
| Skeleton | src/components/ui/skeleton.tsx |
| Toast | src/components/ui/toast.tsx |
| Toaster | src/components/ui/toaster.tsx |
| Sonner | src/components/ui/sonner.tsx |
| DashboardCard | src/components/ui/dashboard-card.tsx |
| TaskCard | src/components/ui/task-card.tsx |
| ConnectionStatus | src/components/ui/connection-status.tsx |
| CodeEditor | src/components/ui/code-editor.tsx |
| ResponsiveGrid | src/components/ui/responsive-grid.tsx |
| MobileNav | src/components/ui/mobile-nav.tsx |
| UIElementsFilter | src/components/ui/ui-elements-filter.tsx |

### Redux UI Components (13)
Custom Redux UI unbound design system components.

| Name | Path |
|------|------|
| Button | src/components/redux-ui/Button.tsx |
| Card | src/components/redux-ui/Card.tsx |
| Badge | src/components/redux-ui/Badge.tsx |
| Input | src/components/redux-ui/Input.tsx |
| Select | src/components/redux-ui/Select.tsx |
| Tabs | src/components/redux-ui/Tabs.tsx |
| Progress | src/components/redux-ui/Progress.tsx |
| Separator | src/components/redux-ui/Separator.tsx |
| DashboardCard | src/components/redux-ui/DashboardCard.tsx |
| ConnectionStatus | src/components/redux-ui/ConnectionStatus.tsx |
| CodeEditor | src/components/redux-ui/CodeEditor.tsx |
| ResponsiveGrid | src/components/redux-ui/ResponsiveGrid.tsx |
| UIElementsFilter | src/components/redux-ui/UIElementsFilter.tsx |

### Pow3r Components (5)
Enterprise-ready workflow components for the pow3r component library.

| Name | Description | Version | Path |
|------|-------------|---------|------|
| WorkflowCard | Workflow display card | v1.0.0 | src/components/pow3r/WorkflowCard.tsx |
| WorkflowStep | Workflow step component | v1.0.0 | src/components/pow3r/WorkflowStep.tsx |
| WorkflowProgress | Progress visualization | v1.0.0 | src/components/pow3r/WorkflowProgress.tsx |
| WorkflowStatus | Status badge | v1.0.0 | src/components/pow3r/WorkflowStatus.tsx |
| WorkflowActions | Action buttons | v1.0.0 | src/components/pow3r/WorkflowActions.tsx |

### Feature Components (13)
High-level feature implementations.

| Name | Description | Version | Path |
|------|-------------|---------|------|
| NewPostFlow | Multi-step post creation | v1.0.0 | src/components/NewPostFlow.tsx |
| Phase1Dashboard | Phase 1 interface | v1.0.0 | src/components/Phase1Dashboard.tsx |
| Phase2Dashboard | Phase 2 interface | v1.0.0 | src/components/Phase2Dashboard.tsx |
| DashboardLayout | Main layout wrapper | v1.0.0 | src/components/dashboard-layout.tsx |
| DashboardOverview | Dashboard home | v1.0.0 | src/components/dashboard-overview.tsx |
| Sidebar | Side navigation | v1.0.0 | src/components/sidebar.tsx |
| ListingGenerator | Listing creation | v1.0.0 | src/components/listing-generator.tsx |
| ListingManagement | Listing admin | v1.0.0 | src/components/listing-management.tsx |
| LeadsManager | Lead management | v1.0.0 | src/components/leads-manager.tsx |
| AutoResponderManager | Auto-responder config | v1.0.0 | src/components/auto-responder-manager.tsx |
| ResponseMonitor | Response tracking | v1.0.0 | src/components/response-monitor.tsx |
| MetadataDisplay | Metadata viewer | v1.0.0 | src/components/MetadataDisplay.tsx |
| ThemeProvider | Theme context | v1.0.0 | src/components/theme-provider.tsx |

---

## State Management

**Technology:** Zustand v5.0.3 (NOT Redux)

### Store Files (14)
| Store | Purpose | Path |
|-------|---------|------|
| ai-response.store | AI responses | src/lib/stores/ai-response.store.ts |
| analytics.store | Analytics data | src/lib/stores/analytics.store.ts |
| automation.store | Automation config | src/lib/stores/automation.store.ts |
| auto-responder.store | Auto-responders | src/lib/stores/auto-responder.store.ts |
| dashboard.store | Dashboard state | src/lib/stores/dashboard.store.ts |
| flow-workflow.store | Flow workflows | src/lib/stores/flow-workflow.store.ts |
| lead-monitoring.store | Lead tracking | src/lib/stores/lead-monitoring.store.ts |
| listings.store | Listings data | src/lib/stores/listings.store.ts |
| message-workflow.store | Message workflows | src/lib/stores/message-workflow.store.ts |
| negotiation.store | Negotiations | src/lib/stores/negotiation.store.ts |
| new-post-flow.store | Post creation | src/lib/stores/new-post-flow.store.ts |
| post-workflow.store | Post workflows | src/lib/stores/post-workflow.store.ts |
| project-workflow.store | Project workflows | src/lib/stores/project-workflow.store.ts |

---

## Compliance Summary

### ✅ Policy Compliance

**From `.cursor/rules/system-policies.md`:**
- ✅ Redux UI (Unbound Design System) - used throughout
- ✅ Zustand - all state management uses Zustand
- ✅ Vite - build tool
- ✅ Tailwind CSS - styling system
- ✅ NO ShadCN - using Redux UI instead
- ✅ NO Next.js - using Vite

**From `.cursor/rules/component-library-policies.md`:**
- ✅ Unbound design system implementation
- ✅ TypeScript with interfaces
- ✅ Mobile-first responsive design
- ✅ Dark/light mode support
- ✅ JSDoc comments on applicable components
- ✅ WCAG 2.1 AA accessibility

### Component Statistics

- **Total:** 139 component files
- **Dashboard:** 19 widgets
- **Charts:** 22 visualizations
- **Workflows:** 10 management
- **Search:** 5 components
- **UI Primitives:** 52 base components
- **Redux UI:** 13 custom components
- **Pow3r Library:** 5 enterprise components
- **Features:** 13 high-level implementations

### JSDoc Coverage

- **Dashboard Components:** 100% (19/19)
- **Chart Components:** 100% (22/22)
- **Workflow Components:** 100% (10/10)
- **Pow3r Components:** 100% (5/5)
- **UI Components:** Minimal (primitives don't require extensive docs)
- **Feature Components:** Partial (high-level features documented)

---

## Related Documentation

- [Component Library Documentation](COMPONENT_LIBRARY_DOCUMENTATION.md) - Full design system docs
- [Workflow API Documentation](WORKFLOW_API_DOCUMENTATION.md) - API endpoints for workflows
- [README](README.md) - Main project documentation
- [API Integration Guide](API_INTEGRATION_GUIDE.md) - Complete API guide

---

**Repository:** pow3r.cashout  
**Component Library:** git@github.com:memorymusicllc/power.components.git  
**Last Audit:** 2025-10-12

