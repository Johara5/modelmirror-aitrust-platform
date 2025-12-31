
import React, { useState, useEffect, useCallback, useRef } from 'react';
import Layout from './components/Layout.tsx';
import Dashboard from './components/Dashboard.tsx';
import Analyzer from './components/Analyzer.tsx';
import BehaviorTimeline from './components/BehaviorTimeline.tsx';
import RiskPanel from './components/RiskPanel.tsx';
import ConfigurationPanel from './components/ConfigurationPanel.tsx';
import { analyzeModelOutput } from './services/geminiService.ts';
import { AuditResult, DriftPoint } from './types.ts';
import { MOCK_DRIFT_DATA } from './constants.tsx';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Simulation Configuration
  const [simulationInterval, setSimulationInterval] = useState(5);
  const [mode, setMode] = useState<'manual' | 'live' | 'simulation'>('simulation');
  
  // Current AI System State
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
  
  // Analysis & History Tracking
  const [lastAnalysis, setLastAnalysis] = useState<AuditResult | null>(null);
  const [history, setHistory] = useState<DriftPoint[]>([]);
  const lastHistoryUpdate = useRef<number>(0);

  // Core Audit Function
  const runAnalysis = useCallback(async () => {
    try {
      const result = await analyzeModelOutput(currentInput, currentOutput, confidence);
      setLastAnalysis(result);
    } catch (e) {
      console.warn("Transparency engine skipped/failed", e);
    }
  }, [currentInput, currentOutput, confidence]);

  // Handle Simulation Drift & History
  useEffect(() => {
    const isSimulation = mode === 'simulation';
    const intervalTime = simulationInterval * 1000;

    const tick = () => {
      const now = new Date();
      const timeStr = `${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`;
      
      let nextConf = confidence;

      if (isSimulation) {
        // Fluctuating model behavior (Simulating Drift)
        nextConf = Math.min(1, Math.max(0.4, confidence + (Math.random() - 0.5) * 0.1));
        setConfidence(parseFloat(nextConf.toFixed(2)));
        
        setCurrentInput(prev => ({
          ...prev,
          loanAmount: Math.floor(prev.loanAmount * (1 + (Math.random() * 0.04 - 0.02)))
        }));

        // In simulation, trigger a transparency audit automatically
        runAnalysis();
      }

      // Record to history for the Timeline
      setHistory(prev => {
        const newPoint: DriftPoint = {
          timestamp: timeStr,
          confidence: nextConf,
          errorRate: 1 - nextConf,
          anomalyDetected: nextConf < 0.7
        };
        const updated = [...prev, newPoint];
        return updated.slice(-20); // Keep last 20 points
      });
    };

    const intervalId = setInterval(tick, intervalTime);
    return () => clearInterval(intervalId);
  }, [mode, simulationInterval, confidence, runAnalysis]);

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard analysis={lastAnalysis} history={history.length > 0 ? history : undefined} />;
      case 'analyzer':
        return (
          <Analyzer 
            initialInput={JSON.stringify(currentInput, null, 2)}
            initialOutput={JSON.stringify(currentOutput, null, 2)}
            initialConfidence={confidence}
            initialResult={lastAnalysis}
            onUpdate={(inp, out, conf) => {
              setCurrentInput(JSON.parse(inp));
              setCurrentOutput(JSON.parse(out));
              setConfidence(conf);
              if (mode === 'live') runAnalysis();
            }}
          />
        );
      case 'timeline':
        return <BehaviorTimeline history={history.length > 0 ? history : undefined} />;
      case 'risk':
        return <RiskPanel analysis={lastAnalysis} />;
      case 'settings':
        return (
          <ConfigurationPanel 
            simulationInterval={simulationInterval}
            setSimulationInterval={setSimulationInterval}
            mode={mode}
            setMode={setMode}
          />
        );
      default:
        return <Dashboard analysis={lastAnalysis} />;
    }
  };

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      {renderContent()}
    </Layout>
  );
};

export default App;
