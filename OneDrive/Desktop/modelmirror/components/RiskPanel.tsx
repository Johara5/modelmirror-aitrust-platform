
import React from 'react';
import { ShieldAlert, Fingerprint, Scale, Zap, Info } from 'lucide-react';
import { AuditResult } from '../types.ts';

interface RiskPanelProps {
  analysis: AuditResult | null;
}

const RiskPanel: React.FC<RiskPanelProps> = ({ analysis }) => {
  const staticRisks = [
    { category: 'Demographic Bias', level: 'Medium', desc: 'Slight correlation found between loan approval and applicant region.', icon: Scale, color: 'text-amber-600 bg-amber-50' },
    { category: 'Confidence Drift', level: 'Low', desc: 'Predictive stability remains within standard deviation thresholds.', icon: Zap, color: 'text-blue-600 bg-blue-50' },
    { category: 'Logic Consistency', level: 'High', desc: 'Potential contradiction in multi-agent logic for high-income bracket.', icon: ShieldAlert, color: 'text-red-600 bg-red-50' },
    { category: 'Identity Proxy', level: 'None', desc: 'No proxy variables for protected classes detected.', icon: Fingerprint, color: 'text-emerald-600 bg-emerald-50' },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Live Scan Results Section */}
      {analysis && (
        <div className="bg-indigo-900 rounded-2xl p-6 text-white shadow-xl shadow-indigo-100 animate-in fade-in zoom-in duration-300">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-500 rounded-lg flex items-center justify-center">
                <ShieldAlert size={20} />
              </div>
              <h3 className="text-lg font-bold">Real-time Trust Analysis</h3>
            </div>
            <div className="px-3 py-1 bg-indigo-800 rounded-full text-[10px] font-black tracking-widest uppercase">
              Live Buffer Scan
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {analysis.riskIndicators.map((risk, idx) => (
              <div key={idx} className="bg-white/10 border border-white/10 rounded-xl p-4">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-bold uppercase text-indigo-200">{risk.category}</span>
                  <span className={`text-[9px] font-black px-1.5 py-0.5 rounded ${
                    risk.severity === 'high' ? 'bg-red-500 text-white' : 'bg-indigo-300 text-indigo-900'
                  }`}>{risk.severity}</span>
                </div>
                <p className="text-xs text-white leading-relaxed">{risk.finding}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {staticRisks.map((risk, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4 mb-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${risk.color}`}>
                <risk.icon size={24} />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-900">{risk.category}</h3>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                    risk.level === 'High' ? 'bg-red-100 text-red-700' : 
                    risk.level === 'Medium' ? 'bg-amber-100 text-amber-700' : 
                    'bg-slate-100 text-slate-600'
                  }`}>{risk.level} Risk</span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5 tracking-tight">Compliance Scan #8271</p>
              </div>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed border-t border-slate-50 pt-4">
              {risk.desc}
            </p>
            <div className="mt-4 flex gap-2">
              <button className="text-[10px] font-bold text-indigo-600 hover:underline">View History</button>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center">
        <Fingerprint className="mx-auto text-slate-200 mb-4" size={48} />
        <h3 className="text-slate-900 font-bold mb-2">Automated Bias Mitigation</h3>
        <p className="text-slate-500 text-sm max-w-md mx-auto mb-6">System is actively monitoring active inference pipelines. Protected class proxies are scanned every 4 minutes.</p>
        <div className="flex items-center justify-center gap-4 max-w-xs mx-auto">
          <div className="h-2 flex-1 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-indigo-500 w-3/4 rounded-full" />
          </div>
          <span className="text-[10px] font-black text-slate-400">75% SECURE</span>
        </div>
      </div>
    </div>
  );
};

export default RiskPanel;
