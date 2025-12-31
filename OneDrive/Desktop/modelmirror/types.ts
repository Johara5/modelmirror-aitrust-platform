
export interface AuditRequest {
  id: string;
  timestamp: string;
  inputData: any;
  outputData: any;
  confidence: number;
  modelId: string;
}

export interface InfluencingFactor {
  factor: string;
  impact: 'positive' | 'negative' | 'neutral';
  weight: number;
  explanation: string;
}

export interface RiskIndicator {
  category: 'Bias' | 'Confidence' | 'Logic' | 'Drift';
  severity: 'low' | 'medium' | 'high';
  finding: string;
}

export interface AuditResult {
  explanations: {
    simple: string;
    detailed: string;
    technical: string;
  };
  influencingFactors: InfluencingFactor[];
  riskIndicators: RiskIndicator[];
  trustScore: number;
}

export interface DriftPoint {
  timestamp: string;
  confidence: number;
  errorRate: number;
  anomalyDetected: boolean;
  notes?: string;
}

export interface ModelHealth {
  modelId: string;
  overallTrustScore: number;
  uptime: string;
  totalAudits: number;
  driftAlerts: number;
}
