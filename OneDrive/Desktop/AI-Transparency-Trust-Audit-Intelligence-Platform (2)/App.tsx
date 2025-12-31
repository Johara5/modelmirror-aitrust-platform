
import React, { useState, useEffect, useCallback, useRef } from 'react';
import Layout from './components/Layout.tsx';
import Dashboard from './components/Dashboard.tsx';
import Analyzer from './components/Analyzer.tsx';
import BehaviorTimeline from './components/BehaviorTimeline.tsx';
import RiskPanel from './components/RiskPanel.tsx';
import ConfigurationPanel from './components/ConfigurationPanel.tsx';
import AuditHistoryModal from './components/AuditHistoryModal.tsx';
import { analyzeModelOutput } from './services/geminiService.ts';
import { AuditResult, DriftPoint, AuditRecord, UserContext } from './types.ts';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  
  const [user, setUser] = useState<UserContext>({
    displayName: "Resolving...",
    role: "Auditor",
    tier: "Demo",
    authProvider: "Session"
  });

  useEffect(() => {
    const resolveUser = async () => {
      // Simulate enterprise identity resolution
      await new Promise(resolve => setTimeout(resolve, 600));
      setUser({
        displayName: "Johara Shaikh",
        role: "Admin",
        tier: "Enterprise",
        authProvider: "Session"
      });
    };
    resolveUser();
  }, []);

  const [simulationInterval, setSimulationInterval] = useState(30);
  const [mode, setMode] = useState<'manual' | 'live' | 'simulation'>('manual');
  
  const [currentInput, setCurrentInput] = useState({
    age: 28,
    income: 75000,
    creditScore: 680,
    loanAmount: 25000
  });
  const [currentOutput, setCurrentOutput] = useState({
    decision: "Approved",
    interestRate: 0.054
  });
  const [confidence, setConfidence] = useState(0.87);
  
  const [lastAnalysis, setLastAnalysis] = useState<AuditResult | null>(null);
  const [history, setHistory] = useState<DriftPoint[]>([]);
  const [auditHistory, setAuditHistory] = useState<AuditRecord[]>([]);
  const tickCount = useRef(0);

  const stateRef = useRef({ currentInput, currentOutput, confidence });
  useEffect(() => {
    stateRef.current = { currentInput, currentOutput, confidence };
  }, [currentInput, currentOutput, confidence]);

  const recordAudit = useCallback((result: AuditResult, input: any, output: any, conf: number) => {
    const biasRisk = result.riskIndicators.find(r => r.category === 'Bias');
    const driftRisk = result.riskIndicators.find(r => r.category === 'Drift');
    const logicRisk = result.riskIndicators.find(r => r.category === 'Logic');
    
    const biasLevel = (biasRisk?.severity.charAt(0).toUpperCase() + biasRisk?.severity.slice(1)) as any || "None";
    
    const newRecord: AuditRecord = {
      auditId: `audit-${Date.now()}`,
      timestamp: new Date().toISOString(),
      inputSnapshot: JSON.parse(JSON.stringify(input)),
      outputSnapshot: JSON.parse(JSON.stringify(output)),
      confidenceScore: conf,
      result: result,
      riskFindings: {
        biasLevel: ["Low", "Medium", "High", "None"].includes(biasLevel) ? biasLevel : "None",
        driftDetected: conf < 0.72 || driftRisk?.severity === 'high',
        logicConsistency: logicRisk?.severity === 'high' ? 'Risk' : logicRisk?.severity === 'medium' ? 'Warning' : 'Stable'
      }
    };
    
    setAuditHistory(prev => [newRecord, ...prev].slice(0, 50));
    setLastAnalysis(result);
  }, []);

  const triggerAudit = useCallback(async () => {
    const { currentInput, currentOutput, confidence } = stateRef.current;
    try {
      const result = await analyzeModelOutput(currentInput, currentOutput, confidence);
      recordAudit(result, currentInput, currentOutput, confidence);
    } catch (e) {
      console.error("Audit automation error:", e);
    }
  }, [recordAudit]);

  useEffect(() => {
    if (mode === 'manual') return;

    const interval = setInterval(() => {
      tickCount.current += 1;
      const isSim = mode === 'simulation';
      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      
      let nextConf = stateRef.current.confidence;

      if (isSim) {
        // More sophisticated simulation drift
        const incomeShift = (Math.random() - 0.5) * 5000;
        const confShift = (Math.random() - 0.5) * 0.08;

        nextConf = Math.min(1, Math.max(0.45, stateRef.current.confidence + confShift));
        setConfidence(Number(nextConf.toFixed(2)));
        
        setCurrentInput(prev => ({
          ...prev,
          income: Math.max(10000, Math.floor(prev.income