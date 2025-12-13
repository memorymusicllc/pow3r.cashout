/**
 * XMAP Type Definitions for v5 Schema
 */

// Signal Types
export interface SignalType {
  color: string;
  size: number;
  speed: number;
  density: string;
  waveform?: string;
  waveAmplitude?: number;
  streak?: boolean;
  streakLength?: number;
  bloom?: boolean;
  bloomIntensity?: number;
  accessibilityPattern?: string;
  accessibilityShape?: string;
}

// Node Effect
export interface NodeEffect {
  type: string;
  brightness: number;
  particleCount?: number;
  orbitRadius?: number;
  outlineFlow?: boolean;
  intensity?: string;
  color?: string;
}

// Development Status
export interface DevelopmentStatus {
  phase: 'complete' | 'in-progress' | 'planned' | 'blocked' | 'failed';
  completion: number;
  healthScore: number;
  qualityScore?: number;
  lastUpdate: string;
  notes?: string;
  blockers?: string[];
}

// Self Healing Config
export interface SelfHealingConfig {
  enabled: boolean;
  monitoredMetrics?: string[];
  failureCondition?: string;
  repairPrompt?: string;
  repairAuthority?: 'auto' | 'guardian' | 'human';
}

// Particle Visualization
export interface ParticleVisualization {
  nodeEffect: string;
  borderParticles: boolean;
  color: string;
}

// Node
export interface XMAPNode {
  id: string;
  type: string;
  version?: string;
  extends?: string;
  metadata: {
    title: string;
    description?: string;
    tags?: string[];
  };
  spatialPosition: {
    x: number;
    y: number;
    z: number;
    scale?: number;
  };
  developmentStatus: DevelopmentStatus;
  selfHealing?: SelfHealingConfig;
  kpiContributions?: string[];
  particleVisualization?: ParticleVisualization;
  observability?: {
    xstream?: boolean | string;
    research?: boolean | string;
    metrics?: string[];
  };
  [key: string]: unknown;
}

// Pre-deploy validation
export interface PreDeployValidation {
  auth?: {
    required: boolean;
    provider?: string;
    credentials?: string[];
  };
  cors?: {
    required: boolean;
    allowedOrigins?: string[];
  };
  guardianGate?: string;
}

// Circuit Breaker Config (edge-level)
export interface EdgeCircuitBreakerConfig {
  failureThreshold: number;
  recoveryTimeoutMs: number;
  halfOpenRequests: number;
  monitoredErrors?: string[];
}

// Trace Config
export interface TraceConfig {
  createSpan: boolean;
  spanName: string;
  propagateContext: boolean;
}

// Edge
export interface XMAPEdge {
  id: string;
  from: { nodeId: string; port?: string };
  to: { nodeId: string; port?: string };
  edgeType: string;
  metadata: {
    label: string;
    description?: string;
    strength?: number;
  };
  preDeployValidation?: PreDeployValidation;
  circuitBreaker?: EdgeCircuitBreakerConfig;
  traceConfig?: TraceConfig;
  particleConfig?: {
    signalType: string;
    bidirectional?: boolean;
    returnType?: string;
  };
  visualization?: {
    animated?: boolean;
    bidirectional?: boolean;
    color?: string;
    dashed?: boolean;
    curveType?: string;
    lineWidth?: number;
  };
  status?: 'complete' | 'in-progress' | 'planned' | 'blocked' | 'failed';
}

// Observability Config
export interface ObservabilityConfig {
  otlpExporter: {
    endpoint: string;
    protocol: string;
    headers?: Record<string, string>;
  };
  metrics: Record<string, {
    type: 'gauge' | 'counter' | 'histogram' | 'summary';
    unit: string;
    buckets?: number[];
    alertThreshold?: { warning: number; critical: number };
  }>;
  tracing: {
    enabled: boolean;
    samplingRate: number;
    propagation?: string[];
  };
}

// Self Healing Coordination
export interface SelfHealingCoordination {
  coordination: {
    coordinator: string;
    consensusRequired: {
      criticalNodes: string[];
      minAgreement: number;
    };
    repairQueue: {
      maxConcurrent: number;
      priorityOrder: string[];
      cooldownMs: number;
    };
    cascadeProtection: {
      enabled: boolean;
      maxFailuresBeforeHalt: number;
      requireManualReset: boolean;
    };
  };
  predictive: {
    enabled: boolean;
    lookbackWindowSec?: number;
    degradationSlope?: number;
    anomalyThreshold?: number;
  };
  learning: {
    enabled: boolean;
    syncToPKG?: boolean;
    patternStorage?: string;
  };
}

// Visualization Config
export interface VisualizationConfig {
  modes: Record<string, {
    signalFilter: string[];
    particleDensity: number;
    showLabels?: boolean;
    showMetrics?: boolean;
    highlightNodes?: string[];
  }>;
  accessibility: {
    colorBlindMode: {
      enabled: boolean;
      type: string;
      patterns: Record<string, string>;
      shapes: Record<string, string>;
    };
    reducedMotion: {
      enabled: boolean;
      particleSpeedMultiplier: number;
      disableBloom: boolean;
      disableStreaks: boolean;
    };
    highContrast: {
      enabled: boolean;
      contrastRatio: number;
    };
    screenReader: {
      enabled: boolean;
      verbosity: 'minimal' | 'normal' | 'verbose';
    };
  };
  performance: {
    lodLevels: Record<string, { distance: number; particleMultiplier: number }>;
    frustumCulling: boolean;
    instancedParticles: boolean;
    maxParticlesPerEdge: number;
    targetFPS: number;
    adaptiveQuality: boolean;
  };
}

// Success Matrix
export interface SuccessMatrixConfig {
  dimensions: string[];
  currentScores: {
    composite: number;
    byDimension: Record<string, number>;
    lastCalculated: string;
  };
  phaseGates: Array<{
    phase: string;
    gates: Array<{
      kpi: string;
      threshold: number;
      status: 'pending' | 'passed' | 'failed';
    }>;
  }>;
}

// Full XMAP Data
export interface XMAPData {
  $schema?: string;
  xmapId: string;
  version: string;
  schemaVersion: {
    current: string;
    minSupported: string;
    migrationRegistry?: string;
  };
  metadata: {
    title: string;
    description: string;
    ecosystem: string;
    maintainers: string[];
    createdAt: string;
    lastUpdate: string;
  };
  levelOfDetail?: {
    L0: string[];
    L1: string[];
    L2: string;
    L3: string;
    defaultView: string;
  };
  observability?: ObservabilityConfig;
  circuitBreakers?: {
    enabled: boolean;
    defaults: EdgeCircuitBreakerConfig;
    overrides?: Record<string, EdgeCircuitBreakerConfig>;
  };
  selfHealing?: SelfHealingCoordination;
  visualization?: VisualizationConfig;
  deployment?: {
    environments: Record<string, {
      endpoints: Record<string, string>;
      requireApproval: boolean;
      guardianGates: string[];
    }>;
    versionControl: {
      historyRetention: number;
      snapshotOnDeploy: boolean;
      rollbackEnabled: boolean;
      kvNamespace: string;
    };
  };
  successMatrix?: SuccessMatrixConfig;
  particleSystem: {
    version?: string;
    signalTypes: Record<string, SignalType>;
    nodeEffects: Record<string, NodeEffect>;
  };
  nodes: XMAPNode[];
  edges: XMAPEdge[];
  statusSummary?: {
    totalNodes?: number;
    byPhase?: Record<string, number>;
    overallCompletion?: number;
    criticalIssues?: string[];
    complete?: string[];
    inProgress?: string[];
    planned?: string[];
    failed?: string[];
    blocked?: string[];
  };
  knownIssues?: Array<{
    id: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    status: 'open' | 'in-progress' | 'resolved';
  }>;
  [key: string]: unknown;
}

// Re-export for convenience
export type { XMAPData as XMAP };
