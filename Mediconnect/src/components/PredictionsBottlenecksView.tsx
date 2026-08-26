import React, { useState } from 'react';
import { 
  Sparkles, 
  AlertTriangle, 
  TrendingUp, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  ArrowRight, 
  Zap, 
  Flame, 
  ShieldAlert, 
  BedDouble, 
  Wind, 
  Scan, 
  Activity,
  Layers,
  Check
} from 'lucide-react';
import { BottleneckItem, AIRecommendation } from '../types';

interface PredictionsBottlenecksViewProps {
  bottlenecks: BottleneckItem[];
  recommendations: AIRecommendation[];
  onAcceptRecommendation: (id: string) => void;
  onDismissRecommendation: (id: string) => void;
  onExecuteBottleneckAction: (id: string) => void;
}

export const PredictionsBottlenecksView: React.FC<PredictionsBottlenecksViewProps> = ({
  bottlenecks,
  recommendations,
  onAcceptRecommendation,
  onDismissRecommendation,
  onExecuteBottleneckAction,
}) => {
  const [selectedHorizon, setSelectedHorizon] = useState<'4h' | '8h' | '12h' | '24h'>('12h');

  // 4 Horizon Multi-Modality Forecast Matrix
  const forecastMatrix = [
    {
      metric: 'Patient Admission Surge',
      unit: 'Admissions',
      '4h': { value: '+18 pts', change: '+8%', status: 'Normal' },
      '8h': { value: '+42 pts', change: '+18%', status: 'Warning' },
      '12h': { value: '+71 pts', change: '+24%', status: 'Critical' },
      '24h': { value: '+156 pts', change: '+32%', status: 'Critical' },
      note: 'Evening rush 6 PM - 11 PM creates sharp peak.',
    },
    {
      metric: 'Oxygen Consumption Burn Rate',
      unit: 'L/hr & Reserve %',
      '4h': { value: '62% (4.4%/h)', change: '+4%', status: 'Normal' },
      '8h': { value: '50% (5.0%/h)', change: '+19%', status: 'Warning' },
      '12h': { value: '38% (5.8%/h)', change: '+31%', status: 'Critical' },
      '24h': { value: '18% (Critical)', change: '+45%', status: 'Critical' },
      note: 'Oxygen demand predicted to increase by 31% in next 12 hours.',
    },
    {
      metric: 'ICU Ventilator Utilization',
      unit: 'Active Units / %',
      '4h': { value: '36/40 (90%)', change: '+5%', status: 'Warning' },
      '8h': { value: '38/40 (95%)', change: '+10%', status: 'Critical' },
      '12h': { value: '39/40 (98%)', change: '+13%', status: 'Critical' },
      '24h': { value: '37/40 (92%)', change: '+7%', status: 'Critical' },
      note: 'ICU ventilator utilization may reach 95% by 10 PM.',
    },
    {
      metric: 'CT Scan Imaging Demand',
      unit: 'Scans / Queue',
      '4h': { value: '7 in queue', change: '+8%', status: 'Normal' },
      '8h': { value: '12 in queue', change: '+18%', status: 'Critical' },
      '12h': { value: '16 in queue', change: '+22%', status: 'Critical' },
      '24h': { value: '28 scans total', change: '+15%', status: 'Warning' },
      note: 'CT scan demand is expected to increase by 18% during peak hours.',
    },
    {
      metric: 'Dialysis Machine Capacity',
      unit: 'Stations active',
      '4h': { value: '16/20 (80%)', change: '0%', status: 'Normal' },
      '8h': { value: '18/20 (90%)', change: '+10%', status: 'Warning' },
      '12h': { value: '20/20 (100%)', change: '+20%', status: 'Critical' },
      '24h': { value: '22 needed (Deficit)', change: '+25%', status: 'Critical' },
      note: 'Dialysis demand may exceed current available capacity tomorrow morning.',
    },
    {
      metric: 'Operation Theatre (OT) Demand',
      unit: 'Suites in use',
      '4h': { value: '8/12 active', change: '0%', status: 'Normal' },
      '8h': { value: '10/12 active', change: '+16%', status: 'Warning' },
      '12h': { value: '11/12 active', change: '+25%', status: 'Critical' },
      '24h': { value: '19 cases scheduled', change: '+18%', status: 'Critical' },
      note: 'Surgical demand is expected to increase by 18% tomorrow.',
    },
  ];

  return (
    <div className="space-y-6">
      
      {/* Top AI Predictive Highlights Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 text-white rounded-2xl p-5 sm:p-6 border border-slate-700 shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start space-x-3.5">
            <div className="p-2.5 rounded-xl bg-indigo-500/20 border border-indigo-400/30 text-indigo-300">
              <Sparkles className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs uppercase font-extrabold tracking-wider text-indigo-400 font-mono">
                  Machine Learning Forecast Horizons
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  96.4% Model Precision
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-extrabold text-white mt-1">
                AI Predictive Analysis & Multi-Horizon Demand Forecasting
              </h2>
              <p className="text-xs text-slate-300 mt-1 max-w-2xl">
                Real-time multivariate simulation predicting patient intake waves, life support utilization, gas reserves, and surgical theatre saturation 4 to 24 hours in advance.
              </p>
            </div>
          </div>

          {/* Horizon Switcher */}
          <div className="flex items-center space-x-1.5 bg-slate-800/90 p-1.5 rounded-xl border border-slate-700 self-start md:self-auto">
            {(['4h', '8h', '12h', '24h'] as const).map(h => (
              <button
                key={h}
                onClick={() => setSelectedHorizon(h)}
                className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition ${
                  selectedHorizon === h
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {h.toUpperCase()} Horizon
              </button>
            ))}
          </div>
        </div>

        {/* 4 Quick Predictive Callout Pills */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-5 pt-4 border-t border-slate-800 text-xs">
          <div className="p-2.5 rounded-lg bg-slate-800/60 border border-slate-700">
            <span className="text-slate-400 font-mono text-[10px]">OXYGEN PROJECTION</span>
            <div className="font-bold text-amber-300 mt-0.5">+31% demand in next 12h</div>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-800/60 border border-slate-700">
            <span className="text-slate-400 font-mono text-[10px]">ICU VENTILATORS</span>
            <div className="font-bold text-red-300 mt-0.5">Utilization may reach 95% by 10 PM</div>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-800/60 border border-slate-700">
            <span className="text-slate-400 font-mono text-[10px]">CT SCAN LOAD</span>
            <div className="font-bold text-slate-200 mt-0.5">Demand expected to increase 18%</div>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-800/60 border border-slate-700">
            <span className="text-slate-400 font-mono text-[10px]">DIALYSIS CAPACITY</span>
            <div className="font-bold text-amber-300 mt-0.5">May exceed available capacity tomorrow AM</div>
          </div>
        </div>
      </div>

      {/* Multi-Horizon Demand Prediction Matrix Table */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-extrabold text-slate-900">
              Demand Forecast Matrix across 4, 8, 12, and 24 Hours
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Simulated projections based on epidemiological models, current census, and environmental telemetry.
            </p>
          </div>
          <span className="text-xs font-mono text-slate-400">Values update continuously</span>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-600 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
                <th className="py-3 px-3">Modality / Operational Metric</th>
                <th className="py-3 px-3">Next 4 Hours</th>
                <th className="py-3 px-3">Next 8 Hours</th>
                <th className="py-3 px-3">Next 12 Hours</th>
                <th className="py-3 px-3">Next 24 Hours</th>
                <th className="py-3 px-3">AI ML Diagnostic Note</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {forecastMatrix.map((item, i) => (
                <tr key={i} className="hover:bg-slate-50 transition">
                  <td className="py-3 px-3 font-sans font-bold text-slate-900">
                    {item.metric}
                    <span className="block text-[10px] text-slate-400 font-normal font-mono">{item.unit}</span>
                  </td>
                  <td className="py-3 px-3">
                    <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                      item['4h'].status === 'Critical' ? 'bg-red-100 text-red-800' : item['4h'].status === 'Warning' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-800'
                    }`}>
                      {item['4h'].value}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                      item['8h'].status === 'Critical' ? 'bg-red-100 text-red-800' : item['8h'].status === 'Warning' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-800'
                    }`}>
                      {item['8h'].value}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                      item['12h'].status === 'Critical' ? 'bg-red-100 text-red-800' : item['12h'].status === 'Warning' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-800'
                    }`}>
                      {item['12h'].value}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                      item['24h'].status === 'Critical' ? 'bg-red-100 text-red-800' : item['24h'].status === 'Warning' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-800'
                    }`}>
                      {item['24h'].value}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-sans text-[11px] text-slate-600">
                    {item.note}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Two Column Section: Bottleneck Prediction List & Smart Resource Prioritization Engine */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left Column: AI-Generated List of Predicted Bottlenecks */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <ShieldAlert className="w-5 h-5 text-red-600" />
                <h3 className="text-base font-extrabold text-slate-900">
                  Predicted Bottlenecks (Top 5 Early Warning Points)
                </h3>
              </div>
              <span className="text-xs font-mono font-bold bg-red-100 text-red-800 px-2 py-0.5 rounded">
                5 Active Risks
              </span>
            </div>

            <div className="space-y-3.5 mt-4">
              {bottlenecks.map((btn, idx) => (
                <div 
                  key={btn.id}
                  className={`p-3.5 rounded-xl border transition ${
                    btn.severity === 'critical'
                      ? 'bg-red-50/40 border-red-200'
                      : 'bg-amber-50/40 border-amber-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center space-x-2">
                      <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-[11px] font-bold font-mono flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <h4 className="text-xs font-bold text-slate-900">{btn.title}</h4>
                    </div>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-700 shrink-0">
                      {btn.horizon}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-600 mt-2 ml-7 leading-relaxed">
                    {btn.description}
                  </p>

                  <div className="mt-2.5 ml-7 p-2 rounded-lg bg-white/80 border border-slate-200 text-[11px]">
                    <span className="font-bold text-slate-900">Action Required: </span>
                    <span className="text-slate-700">{btn.actionRequired}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: SMART RESOURCE PRIORITIZATION (AI Recommendation Engine) */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <Zap className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-extrabold text-slate-900">
                  Smart Resource Prioritization Engine
                </h3>
              </div>
              <span className="text-xs font-mono text-slate-500">Autonomous Directives</span>
            </div>

            <p className="text-xs text-slate-600 mt-2 mb-4">
              AI engine continuously ranks critical corrective actions based on forecasted clinical risks and resource bottlenecks.
            </p>

            <div className="space-y-3.5">
              {recommendations.map((rec) => {
                const isAccepted = rec.status === 'accepted';
                const isDismissed = rec.status === 'dismissed';
                return (
                  <div 
                    key={rec.id}
                    className={`p-3.5 rounded-xl border transition ${
                      isAccepted
                        ? 'bg-emerald-50/50 border-emerald-300'
                        : isDismissed
                        ? 'bg-slate-100/60 border-slate-200 opacity-60'
                        : 'bg-slate-50/80 border-slate-200 hover:border-blue-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center space-x-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-blue-600 text-white">
                          Priority {rec.priority}
                        </span>
                        <h4 className="text-xs font-bold text-slate-900">{rec.title}</h4>
                      </div>
                      <span className="text-[10px] font-mono text-slate-500">{rec.category}</span>
                    </div>

                    <div className="text-[11px] text-slate-600 mt-1.5 space-y-1">
                      <div><strong className="text-slate-800">Resource Affected:</strong> {rec.resourceAffected}</div>
                      <div><strong className="text-slate-800">Reason:</strong> {rec.reason}</div>
                      <div className="text-emerald-700 font-semibold font-mono text-[10px] bg-emerald-50 px-2 py-1 rounded border border-emerald-200 mt-1">
                        ⚡ Predicted Impact: {rec.predictedImpact}
                      </div>
                    </div>

                    {/* Accept / Dismiss Action Buttons */}
                    <div className="mt-3 pt-2.5 border-t border-slate-200/80 flex items-center justify-end space-x-2">
                      {isAccepted ? (
                        <span className="text-xs font-bold text-emerald-700 flex items-center">
                          <Check className="w-4 h-4 mr-1" />
                          Directive Accepted & Dispatched
                        </span>
                      ) : isDismissed ? (
                        <span className="text-xs text-slate-500 italic">Dismissed by administrator</span>
                      ) : (
                        <>
                          <button
                            onClick={() => onDismissRecommendation(rec.id)}
                            className="px-3 py-1 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-200 transition"
                          >
                            Dismiss
                          </button>
                          <button
                            onClick={() => onAcceptRecommendation(rec.id)}
                            className="px-3.5 py-1 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition shadow-sm flex items-center space-x-1"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Accept Action</span>
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
