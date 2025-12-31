
import React from 'react';
import { MOCK_DRIFT_DATA } from '../constants.tsx';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceArea } from 'recharts';
import { History, Activity, AlertCircle, Zap } from 'lucide-react';
import { DriftPoint } from '../types.ts';

interface BehaviorTimelineProps {
  history?: DriftPoint[];
}

const BehaviorTimeline: React.FC<BehaviorTimelineProps> = ({ history }) => {
  // Map internal types to Recharts format if needed
  const chartData = history 
    ? history.map(p => ({ time: p.timestamp, confidence: p.confidence, errors: p.errorRate, anomaly: p.anomalyDetected }))
    : MOCK_DRIFT_DATA;

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">System Behavior Timeline</h2>
            <p className="text-slate-500 text-sm mt-1">Audit trail of model confidence and prediction stability over time.</p>
          </div>
          <div className="flex items-center gap-2">
            {history && (
              <div className="flex items-center gap-2 px-3 py-1 bg-indigo-600 text-white rounded-lg text-xs font-bold animate-pulse">
                <Zap size={14} fill="currentColor" /> LIVE FEED
              </div>
            )}
            <div className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg text-sm font-bold">
              <Activity size={18} /> Drift Detection: Active
            </div>
          </div>
        </div>

        <div className="h-[400px] w-full mb-8">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} dy={10} />
              <YAxis domain={[0, 1]} axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} />
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '12px' }}
                cursor={{ stroke: '#4f46e5', strokeWidth: 1 }}
              />
              <Line type="monotone" dataKey="confidence" stroke="#4f46e5" strokeWidth={3} dot={{ fill: '#4f46e5', r: 3 }} activeDot={{ r: 5 }} animationDuration={300} isAnimationActive={!history} />
              <Line type="monotone" dataKey="errors" stroke="#f43f5e" strokeWidth={2} strokeDasharray="5 5" dot={false} animationDuration={300} isAnimationActive={!history} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
            <h4 className="font-bold text-slate-800 text-sm mb-3 flex items-center gap-2">
              <History size={16} className="text-slate-400" /> Recent Observational Points
            </h4>
            <div className="space-y-2 max-h-[120px] overflow-y-auto pr-2 custom-scrollbar">
              {[...chartData].reverse().map((point, i) => (
                <div key={i} className="flex justify-between items-center text-[11px] py-1 border-b border-slate-200 last:border-0">
                  <span className="text-slate-500 font-medium">{point.time}</span>
                  <div className="flex items-center gap-3">
                    <span className={`px-1.5 py-0.5 rounded font-bold ${point.anomaly ? 'bg-red-100 text-red-600' : 'bg-slate-200 text-slate-600'}`}>
                      {(point.confidence * 100).toFixed(0)}%
                    </span>
                    {point.anomaly && <AlertCircle size={12} className="text-red-500" />}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-100">
            <h4 className="font-bold text-amber-800 text-sm mb-2 flex items-center gap-2">
              <AlertCircle size={16} /> Latest Behavior Insight
            </h4>
            <p className="text-xs text-amber-700 leading-relaxed">
              {history && history.length > 0 && history[history.length - 1].anomalyDetected 
                ? "CRITICAL: System confidence has dipped below 70%. Mirror is detecting anomalous decision paths. Recommend human intervention."
                : "Stability stable. Minor fluctuations observed in feature weights during the last sync cycle. No manual action required."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BehaviorTimeline;
