
import React from 'react';
import { Settings, Play, Pause, Zap, Clock, Shield } from 'lucide-react';

interface ConfigurationPanelProps {
  simulationInterval: number;
  setSimulationInterval: (val: number) => void;
  mode: 'manual' | 'live' | 'simulation';
  setMode: (mode: 'manual' | 'live' | 'simulation') => void;
}

const ConfigurationPanel: React.FC<ConfigurationPanelProps> = ({ 
  simulationInterval, 
  setSimulationInterval, 
  mode, 
  setMode 
}) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-slate-100 flex items-center gap-3 bg-slate-50/50">
        <Settings className="text-indigo-600" size={24} />
        <div>
          <h2 className="text-xl font-bold text-slate-900">Infrastructure Configuration</h2>
          <p className="text-slate-500 text-sm">Configure system monitoring parameters and ingestion modes.</p>
        </div>
      </div>
      
      <div className="p-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Operation Mode */}
          <div className="space-y-4">
            <label className="block text-sm font-bold text-slate-700 uppercase tracking-wider">System Operation Mode</label>
            <div className="grid grid-cols-1 gap-3">
              {[
                { id: 'manual', label: 'Manual Audit', icon: Shield, desc: 'Trigger audits on-demand via the Live Analyzer.' },
                { id: 'live', label: 'Live Monitoring', icon: Zap, desc: 'Automatically audit every change in observed data.' },
                { id: 'simulation', label: 'Continuous Simulation', icon: Play, desc: 'System-generated drift events for stress testing.' }
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setMode(opt.id as any)}
                  className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left ${
                    mode === opt.id 
                      ? 'border-indigo-600 bg-indigo-50/50 ring-4 ring-indigo-50' 
                      : 'border-slate-100 hover:border-slate-200 bg-white'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                    mode === opt.id ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'
                  }`}>
                    <opt.icon size={20} />
                  </div>
                  <div className="flex-1">
                    <p className={`font-bold text-sm ${mode === opt.id ? 'text-indigo-900' : 'text-slate-800'}`}>{opt.label}</p>
                    <p className="text-xs text-slate-500 mt-0.5 leading-snug">{opt.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Simulation Settings */}
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 space-y-6">
              <label className="block text-sm font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                <Clock size={16} /> Drift Simulation Parameters
              </label>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-slate-600">Sync Interval</span>
                  <span className="text-sm font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded">{simulationInterval}s</span>
                </div>
                <input 
                  type="range" 
                  min={1} 
                  max={20} 
                  value={simulationInterval} 
                  onChange={(e) => setSimulationInterval(Number(e.target.value))}
                  disabled={mode !== 'simulation'}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600 disabled:opacity-30"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-bold px-1 uppercase tracking-tighter">
                  <span>Fast (1s)</span>
                  <span>Balanced</span>
                  <span>Deep Audit (20s)</span>
                </div>
              </div>

              <div className="pt-4 space-y-2">
                <p className="text-xs text-slate-500 italic">
                  Note: Lower intervals increase API consumption. Recommended: 5s-10s for production monitoring.
                </p>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-start gap-4">
              <Shield className="text-emerald-600 mt-1 shrink-0" size={20} />
              <div>
                <h4 className="font-bold text-emerald-800 text-sm">Enterprise Security Active</h4>
                <p className="text-xs text-emerald-700/80 leading-relaxed mt-1">
                  All configuration changes are logged in the immutable audit trail. Access limited to Infrastructure Administrators.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfigurationPanel;
