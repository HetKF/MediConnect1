import React from 'react';
import { 
  AlertCircle, 
  TrendingUp, 
  CheckCircle2, 
  ArrowRight, 
  ShieldAlert, 
  Flame, 
  Zap,
  Activity,
  Wind,
  BedDouble,
  HeartPulse
} from 'lucide-react';
import { KPIStats, BottleneckItem, AIRecommendation } from '../types';

interface CommandCenterSummaryProps {
  kpis: KPIStats;
  bottlenecks: BottleneckItem[];
  recommendations: AIRecommendation[];
  onExecuteRecommendation: (id: string) => void;
  onNavigateToTab: (tab: any) => void;
}

export const CommandCenterSummary: React.FC<CommandCenterSummaryProps> = ({
  kpis,
  bottlenecks,
  recommendations,
  onExecuteRecommendation,
  onNavigateToTab,
}) => {
  const pendingRecs = recommendations.filter(r => r.status === 'pending');
  const topAction = pendingRecs[0] || recommendations[0];

  return (
    <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-blue-950 text-white rounded-2xl p-4 sm:p-6 shadow-xl border border-slate-700/80 mb-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-700/60">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-blue-600/30 border border-blue-500/40 text-blue-400">
            <ShieldAlert className="w-6 h-6 text-cyan-300 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs uppercase font-extrabold tracking-widest text-cyan-400">
                Hospital Command Directive
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-500/20 text-red-300 border border-red-500/40">
                High Surge Alert Active
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-extrabold text-white tracking-tight">
              Real-Time Operational Assessment & Prioritization
            </h2>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => onNavigateToTab('predictions')}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition flex items-center space-x-1"
          >
            <span>Full AI Forecast Matrix</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* The 3 Core Command Center Questions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
        
        {/* Question 1: What resources are currently under pressure? */}
        <div className="bg-slate-800/80 backdrop-blur rounded-xl p-4 border border-slate-700 hover:border-red-500/40 transition">
          <div className="flex items-center space-x-2 text-xs font-bold text-red-400 uppercase tracking-wider mb-2">
            <Flame className="w-4 h-4 text-red-400" />
            <span>1. Current Pressure Points</span>
          </div>
          <div className="space-y-2.5">
            <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Wind className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-medium text-slate-200">Oxygen Reserves</span>
              </div>
              <div className="text-right">
                <div className="text-xs font-bold text-amber-400">68% Capacity</div>
                <div className="text-[10px] text-slate-400 font-mono">9h to critical</div>
              </div>
            </div>

            <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <BedDouble className="w-4 h-4 text-red-400" />
                <span className="text-xs font-medium text-slate-200">ICU Block A Beds</span>
              </div>
              <div className="text-right">
                <div className="text-xs font-bold text-red-400">92% Occupied</div>
                <div className="text-[10px] text-slate-400">2 beds left</div>
              </div>
            </div>

            <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <HeartPulse className="w-4 h-4 text-red-400" />
                <span className="text-xs font-medium text-slate-200">ECMO Machines</span>
              </div>
              <div className="text-right">
                <div className="text-xs font-bold text-red-400">1 Available / 6</div>
                <div className="text-[10px] text-slate-400">2 queued</div>
              </div>
            </div>
          </div>
        </div>

        {/* Question 2: What problems or bottlenecks are predicted soon? */}
        <div className="bg-slate-800/80 backdrop-blur rounded-xl p-4 border border-slate-700 hover:border-amber-500/40 transition">
          <div className="flex items-center space-x-2 text-xs font-bold text-amber-400 uppercase tracking-wider mb-2">
            <TrendingUp className="w-4 h-4 text-amber-400" />
            <span>2. Predicted Bottlenecks</span>
          </div>
          <div className="space-y-2 text-xs">
            <div className="p-2 rounded-lg bg-amber-950/30 border border-amber-900/50 text-slate-200">
              <div className="font-semibold text-amber-300 flex items-center justify-between">
                <span>ED Patient Surge (+24%)</span>
                <span className="text-[10px] font-mono bg-amber-900/60 px-1.5 py-0.5 rounded text-amber-200">6 PM - 11 PM</span>
              </div>
              <p className="text-[11px] text-slate-300 mt-1">
                Cold weather & local festival influx will deliver ~71 admissions in next 12h.
              </p>
            </div>

            <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800 text-slate-300">
              <div className="font-semibold text-slate-200 flex items-center justify-between">
                <span>CT Emergency Queue Overload</span>
                <span className="text-[10px] font-mono text-slate-400">By 7 PM</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Queue expected to exceed 10 patients without rescheduling elective scans.
              </p>
            </div>

            <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800 text-slate-300">
              <div className="font-semibold text-slate-200 flex items-center justify-between">
                <span>Dialysis Capacity Deficit</span>
                <span className="text-[10px] font-mono text-slate-400">Tomorrow 08:00</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Demand will exceed active stations by 20% due to acute ESRD admissions.
              </p>
            </div>
          </div>
        </div>

        {/* Question 3: What action should the hospital take now? */}
        <div className="bg-slate-800/80 backdrop-blur rounded-xl p-4 border border-cyan-500/40 bg-gradient-to-b from-slate-800/90 to-cyan-950/40 shadow-inner">
          <div className="flex items-center space-x-2 text-xs font-bold text-cyan-400 uppercase tracking-wider mb-2">
            <Zap className="w-4 h-4 text-cyan-400" />
            <span>3. Immediate Action (Priority 1)</span>
          </div>

          {topAction ? (
            <div className="space-y-3">
              <div className="p-2.5 rounded-lg bg-cyan-950/80 border border-cyan-700/60">
                <div className="text-xs font-bold text-cyan-200 mb-1 flex items-center">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 inline-block mr-1.5"></span>
                  {topAction.title}
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  {topAction.reason}
                </p>
                <div className="mt-2 text-[10px] font-mono text-emerald-300 bg-emerald-950/60 px-2 py-1 rounded border border-emerald-800/60">
                  ⚡ Impact: {topAction.predictedImpact}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => onExecuteRecommendation(topAction.id)}
                  className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center space-x-1.5 shadow ${
                    topAction.status === 'accepted'
                      ? 'bg-emerald-600 text-white cursor-default'
                      : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{topAction.status === 'accepted' ? 'Order Dispatched' : 'Execute Directive Now'}</span>
                </button>
                <button
                  onClick={() => onNavigateToTab('predictions')}
                  className="py-1.5 px-2.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
                >
                  View All 5
                </button>
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-400">All priority actions addressed.</p>
          )}
        </div>

      </div>
    </section>
  );
};
