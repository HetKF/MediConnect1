import React from 'react';
import { Activity, Zap, RefreshCw, AlertTriangle, CheckCircle2, Flame, Wind, BedDouble } from 'lucide-react';

interface SimulatedIotToolbarProps {
  onSimulateEvent: (eventType: string) => Promise<void>;
  isSimulating: boolean;
  sseConnected: boolean;
  lastSyncTime: string;
}

export const SimulatedIotToolbar: React.FC<SimulatedIotToolbarProps> = ({
  onSimulateEvent,
  isSimulating,
  sseConnected,
  lastSyncTime,
}) => {
  return (
    <div className="bg-slate-900 border border-slate-800 text-slate-200 rounded-2xl p-3.5 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="relative flex h-3 w-3">
            {sseConnected && (
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            )}
            <span className={`relative inline-flex rounded-full h-3 w-3 ${sseConnected ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
          </span>
          <div>
            <div className="flex items-center gap-1.5 text-xs font-black text-white">
              <Activity className="w-3.5 h-3.5 text-teal-400" />
              <span>IoT &amp; Patient-Sync Engine</span>
              <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-500/30">
                {sseConnected ? 'LIVE SSE' : 'CONNECTING...'}
              </span>
            </div>
            <p className="text-[10px] text-slate-400">
              Single Source of Truth: Updates synchronize across patient &amp; hospital apps
            </p>
          </div>
        </div>
      </div>

      {/* Simulator Actions */}
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 mr-1 hidden sm:inline">
          Test IoT Sensors:
        </span>

        <button
          onClick={() => onSimulateEvent('ct_temp_spike')}
          disabled={isSimulating}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-950/70 hover:bg-rose-900 text-rose-300 border border-rose-700/60 font-semibold transition-all hover:scale-105 active:scale-95 disabled:opacity-50 cursor-pointer"
          title="Simulate X-Ray Tube overheating spike to 44.5°C"
        >
          <Flame className="w-3.5 h-3.5 text-rose-400" />
          <span>CT Temp Spike (44.5°C)</span>
        </button>

        <button
          onClick={() => onSimulateEvent('ventilator_surge')}
          disabled={isSimulating}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-950/70 hover:bg-amber-900 text-amber-300 border border-amber-700/60 font-semibold transition-all hover:scale-105 active:scale-95 disabled:opacity-50 cursor-pointer"
          title="Deploy 4 ventilators immediately"
        >
          <Wind className="w-3.5 h-3.5 text-amber-400" />
          <span>Ventilator Surge (-4)</span>
        </button>

        <button
          onClick={() => onSimulateEvent('icu_patient_discharge')}
          disabled={isSimulating}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-950/70 hover:bg-teal-900 text-teal-300 border border-teal-700/60 font-semibold transition-all hover:scale-105 active:scale-95 disabled:opacity-50 cursor-pointer"
          title="Simulate 3 ICU discharges releasing beds"
        >
          <BedDouble className="w-3.5 h-3.5 text-teal-400" />
          <span>Discharge ICU (+3)</span>
        </button>

        <button
          onClick={() => onSimulateEvent('o2_refill_completed')}
          disabled={isSimulating}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-950/70 hover:bg-cyan-900 text-cyan-300 border border-cyan-700/60 font-semibold transition-all hover:scale-105 active:scale-95 disabled:opacity-50 cursor-pointer"
          title="Simulate bulk oxygen tanker refill to 95%"
        >
          <Zap className="w-3.5 h-3.5 text-cyan-400" />
          <span>O2 Refill (95%)</span>
        </button>

        <button
          onClick={() => onSimulateEvent('reset_nominal')}
          disabled={isSimulating}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-600 font-semibold transition-all hover:scale-105 active:scale-95 disabled:opacity-50 cursor-pointer"
          title="Reset all hospital telemetry and resources to baseline"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-slate-400 ${isSimulating ? 'animate-spin' : ''}`} />
          <span>Reset Nominal</span>
        </button>
      </div>
    </div>
  );
};
