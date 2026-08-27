import React, { useState } from 'react';
import { 
  Sparkles, Cpu, TrendingUp, AlertTriangle, CheckCircle2, 
  Activity, ArrowRight, ShieldCheck, RefreshCw, Zap
} from 'lucide-react';
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, 
  CartesianGrid, LineChart, Line 
} from 'recharts';
import { HospitalEquipment } from '../../types';

interface AiPredictionsTabProps {
  equipmentList: HospitalEquipment[];
  onOpenAdvisorModal: () => void;
  onOpenForecastModal: () => void;
}

export const AiPredictionsTab: React.FC<AiPredictionsTabProps> = ({
  equipmentList,
  onOpenAdvisorModal,
  onOpenForecastModal,
}) => {
  const [scenario, setScenario] = useState<'normal' | 'moderate' | 'peak'>('normal');

  const chartData = [
    { hour: '08:00', admissions: 12, icuLoad: 65, ctLoad: 70 },
    { hour: '11:00', admissions: 18, icuLoad: 72, ctLoad: 85 },
    { hour: '14:00', admissions: 15, icuLoad: 70, ctLoad: 88 },
    { hour: '17:00', admissions: 22, icuLoad: 82, ctLoad: 92 },
    { hour: '20:00', admissions: scenario === 'peak' ? 42 : scenario === 'moderate' ? 28 : 19, icuLoad: scenario === 'peak' ? 98 : scenario === 'moderate' ? 88 : 78, ctLoad: scenario === 'peak' ? 100 : 88 },
    { hour: '23:00', admissions: scenario === 'peak' ? 28 : 14, icuLoad: scenario === 'peak' ? 95 : 74, ctLoad: 75 },
  ];

  return (
    <div className="space-y-6">
      
      {/* Simulation Selector Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-teal-600" />
            <h3 className="text-base font-bold text-slate-900">
              AI Capacity Forecasting &amp; Bottleneck Neural Simulation
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            12-Hour forward-looking projection combining weather, traffic, emergency intake telemetry, and ICU load.
          </p>
        </div>

        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs">
          <button
            onClick={() => setScenario('normal')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              scenario === 'normal' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Baseline Normal
          </button>
          <button
            onClick={() => setScenario('moderate')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              scenario === 'moderate' ? 'bg-amber-500 text-slate-950 font-black shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Moderate Surge (+25%)
          </button>
          <button
            onClick={() => setScenario('peak')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              scenario === 'peak' ? 'bg-rose-600 text-white font-black shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Peak Disaster (+60%)
          </button>
        </div>
      </div>

      {/* Projected Demand Chart */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-bold text-slate-900">
              Simulated Admissions &amp; ICU / CT Utilization Curve (Next 12 Hours)
            </h4>
            <span className="text-xs text-slate-500">
              Active Scenario: <strong className="text-slate-900 uppercase">{scenario}</strong>
            </span>
          </div>
          <button
            onClick={onOpenForecastModal}
            className="text-xs text-teal-700 font-bold hover:underline"
          >
            View Full Matrix &rarr;
          </button>
        </div>

        <div className="h-64 sm:h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="hour" stroke="#64748b" fontSize={11} />
              <YAxis stroke="#64748b" fontSize={11} domain={[0, 100]} unit="%" />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', color: '#fff', fontSize: '12px' }}
              />
              <Bar dataKey="icuLoad" fill="#00c99f" name="ICU Bed Load %" radius={[4, 4, 0, 0]} />
              <Bar dataKey="ctLoad" fill="#3b82f6" name="CT Scanner Load %" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Key Neural Bottlenecks & Directives */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        <div className="bg-white p-5 rounded-2xl border border-rose-200 bg-rose-50/20 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-rose-800">Critical Bottleneck</span>
            <span className="text-[10px] font-black bg-rose-100 text-rose-800 px-2 py-0.5 rounded">19:45 EST</span>
          </div>
          <h4 className="text-sm font-bold text-slate-900">ICU A Ventilator Saturation</h4>
          <p className="text-xs text-slate-600">
            Without proactive reallocation, ICU Block A will hit 100% capacity due to impending evening ARDS intake.
          </p>
          <div className="pt-2 border-t border-rose-200/60 text-[11px] font-bold text-rose-700">
            ⚡ Action: Reallocate 4 units from reserve depot.
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-amber-200 bg-amber-50/20 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-800">Radiology Strain</span>
            <span className="text-[10px] font-black bg-amber-100 text-amber-800 px-2 py-0.5 rounded">20:30 EST</span>
          </div>
          <h4 className="text-sm font-bold text-slate-900">CT Bay 1 Thermal Limit</h4>
          <p className="text-xs text-slate-600">
            Consecutive emergency polytrauma angiography scans will trigger thermal safeguard if duty cycle is not shifted.
          </p>
          <div className="pt-2 border-t border-amber-200/60 text-[11px] font-bold text-amber-700">
            ⚡ Action: Route head CTs to Unit 03 in General Radiology.
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-teal-200 bg-teal-50/20 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-teal-800">Discharge Flow</span>
            <span className="text-[10px] font-black bg-teal-100 text-teal-800 px-2 py-0.5 rounded">16:30 EST</span>
          </div>
          <h4 className="text-sm font-bold text-slate-900">Bed Release Optimization</h4>
          <p className="text-xs text-slate-600">
            14 general ward patients ready for discharge. Expedited pharmacy clearance will release 14 beds before the evening surge.
          </p>
          <div className="pt-2 border-t border-teal-200/60 text-[11px] font-bold text-teal-700">
            ⚡ Action: Fast-track pharmacy discharge clearance.
          </div>
        </div>

      </div>

    </div>
  );
};
