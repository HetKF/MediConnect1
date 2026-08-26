import React, { useState } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Sparkles, 
  Sliders, 
  Activity, 
  CheckCircle2, 
  Clock, 
  BedDouble, 
  ArrowRight,
  RefreshCw,
  Zap,
  Layers
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  AreaChart, 
  Area 
} from 'recharts';

export const AnalyticsView: React.FC = () => {
  const [simulationScenario, setSimulationScenario] = useState<'normal' | 'surge' | 'expedited_discharge' | 'added_icu_beds'>('normal');

  // Weekly patient flow trends data
  const weeklyTrends = [
    { day: 'Mon', admissions: 142, discharges: 138, edWaitMinutes: 34, icuOccupancy: 84 },
    { day: 'Tue', admissions: 156, discharges: 144, edWaitMinutes: 42, icuOccupancy: 88 },
    { day: 'Wed', admissions: 148, discharges: 150, edWaitMinutes: 31, icuOccupancy: 80 },
    { day: 'Thu', admissions: 162, discharges: 146, edWaitMinutes: 39, icuOccupancy: 85 },
    { day: 'Fri', admissions: 175, discharges: 160, edWaitMinutes: 48, icuOccupancy: 91 },
    { day: 'Sat', admissions: 134, discharges: 120, edWaitMinutes: 28, icuOccupancy: 78 },
    { day: 'Sun', admissions: 128, discharges: 110, edWaitMinutes: 26, icuOccupancy: 74 },
  ];

  // Simulation metrics comparison based on scenario
  const getSimulationResult = () => {
    switch (simulationScenario) {
      case 'surge':
        return {
          title: 'Simulated +24% Evening Patient Surge',
          description: 'Emergency admissions increase to 194 patients. ICU occupancy surges to 96%.',
          edWaitTime: '64 mins (+22m)',
          icuBedDeficit: '-6 beds (Over capacity)',
          divertedAmbulances: '3 required',
          oxygenBurnRate: '6.1%/hr',
          color: 'red',
        };
      case 'expedited_discharge':
        return {
          title: 'Simulated 20% Accelerated Morning Discharges',
          description: 'Clearing 18 discharge candidates by 2 PM frees acute beds early.',
          edWaitTime: '22 mins (-20m)',
          icuBedDeficit: '+8 beds buffer',
          divertedAmbulances: '0',
          oxygenBurnRate: '4.2%/hr (Stable)',
          color: 'emerald',
        };
      case 'added_icu_beds':
        return {
          title: 'Simulated Dynamic Expansion (+6 Step-Down ICU Beds)',
          description: 'Converting Step-Down Wing B into high-acuity overflow units.',
          edWaitTime: '28 mins (-14m)',
          icuBedDeficit: '+4 beds buffer',
          divertedAmbulances: '0',
          oxygenBurnRate: '4.8%/hr',
          color: 'blue',
        };
      default:
        return {
          title: 'Baseline Operational State',
          description: 'Current baseline metrics before evening surge mitigation directives.',
          edWaitTime: '42 mins',
          icuBedDeficit: '2 beds buffer',
          divertedAmbulances: '0',
          oxygenBurnRate: '4.2%/hr',
          color: 'slate',
        };
    }
  };

  const simResult = getSimulationResult();

  return (
    <div className="space-y-6">
      
      {/* Analytics Header */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded bg-blue-100 text-blue-800 font-mono">
              Command Intelligence
            </span>
            <span className="text-xs text-slate-500 font-mono">Historical & Predictive Modeling</span>
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 mt-1">
            Operational Throughput Analytics & Scenario Simulator
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Test policy decisions, surge capacity adjustments, and assess bottleneck mitigation impacts in real time.
          </p>
        </div>
      </div>

      {/* Interactive AI What-If Scenario Simulator */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-indigo-600" />
            <h3 className="text-base font-extrabold text-slate-900">
              Interactive "What-If" Operational Impact Simulator
            </h3>
          </div>
          <span className="text-xs text-slate-500 font-mono">Real-time dynamic stress test</span>
        </div>

        {/* Scenario Selectors */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mt-4">
          {[
            { id: 'normal', label: '1. Baseline Current' },
            { id: 'surge', label: '2. Surge (+24% Admissions)' },
            { id: 'expedited_discharge', label: '3. Expedited Discharges' },
            { id: 'added_icu_beds', label: '4. Expand ICU Capacity' },
          ].map(scenario => (
            <button
              key={scenario.id}
              onClick={() => setSimulationScenario(scenario.id as any)}
              className={`p-3 rounded-xl border text-left text-xs font-bold transition ${
                simulationScenario === scenario.id
                  ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              {scenario.label}
            </button>
          ))}
        </div>

        {/* Simulator Results Output Card */}
        <div className={`mt-4 p-4 rounded-xl border transition-all ${
          simResult.color === 'red'
            ? 'bg-red-50/70 border-red-300'
            : simResult.color === 'emerald'
            ? 'bg-emerald-50/70 border-emerald-300'
            : simResult.color === 'blue'
            ? 'bg-blue-50/70 border-blue-300'
            : 'bg-slate-50 border-slate-200'
        }`}>
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-extrabold text-slate-900">{simResult.title}</h4>
            <span className="text-xs font-bold font-mono px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-700">
              Monte Carlo Model: 1,000 runs
            </span>
          </div>
          <p className="text-xs text-slate-600 mt-1">{simResult.description}</p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
            <div className="p-3 bg-white rounded-lg border border-slate-200/80">
              <span className="text-[10px] text-slate-500 font-bold uppercase">ED Wait Time</span>
              <div className="text-lg font-extrabold text-slate-900 font-mono mt-0.5">{simResult.edWaitTime}</div>
            </div>
            <div className="p-3 bg-white rounded-lg border border-slate-200/80">
              <span className="text-[10px] text-slate-500 font-bold uppercase">ICU Bed Buffer</span>
              <div className="text-lg font-extrabold text-slate-900 font-mono mt-0.5">{simResult.icuBedDeficit}</div>
            </div>
            <div className="p-3 bg-white rounded-lg border border-slate-200/80">
              <span className="text-[10px] text-slate-500 font-bold uppercase">Ambulance Diversions</span>
              <div className="text-lg font-extrabold text-slate-900 font-mono mt-0.5">{simResult.divertedAmbulances}</div>
            </div>
            <div className="p-3 bg-white rounded-lg border border-slate-200/80">
              <span className="text-[10px] text-slate-500 font-bold uppercase">Oxygen Consumption</span>
              <div className="text-lg font-extrabold text-slate-900 font-mono mt-0.5">{simResult.oxygenBurnRate}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Historical Admission & Bed Occupancy Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Weekly Admissions vs Discharges */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <span className="text-xs font-bold uppercase text-blue-700 font-mono">7-Day Historical Run</span>
              <h3 className="text-base font-extrabold text-slate-900 mt-0.5">Admissions vs Discharges</h3>
            </div>
          </div>
          <div className="h-60 w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyTrends}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '11px' }} />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="admissions" fill="#2563eb" name="Admissions" radius={[4, 4, 0, 0]} />
                <Bar dataKey="discharges" fill="#10b981" name="Discharges" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ICU Occupancy & ED Waiting Time Trend */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <span className="text-xs font-bold uppercase text-blue-700 font-mono">Service Latency</span>
              <h3 className="text-base font-extrabold text-slate-900 mt-0.5">ICU Occupancy & ED Wait Times</h3>
            </div>
          </div>
          <div className="h-60 w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weeklyTrends}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis yAxisId="left" tick={{ fontSize: 11, fill: '#64748b' }} domain={[60, 100]} unit="%" />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: '#64748b' }} domain={[10, 60]} unit="m" />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '11px' }} />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Line yAxisId="left" type="monotone" dataKey="icuOccupancy" stroke="#ef4444" strokeWidth={2.5} name="ICU Occupancy %" />
                <Line yAxisId="right" type="monotone" dataKey="edWaitMinutes" stroke="#f59e0b" strokeWidth={2.5} name="ED Wait (mins)" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

    </div>
  );
};
