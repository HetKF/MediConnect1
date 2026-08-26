import React from 'react';
import { 
  Users, 
  BedDouble, 
  Activity, 
  AlertTriangle, 
  TrendingUp, 
  Cpu, 
  Zap, 
  ArrowUpRight, 
  ArrowDownRight, 
  CheckCircle2, 
  Clock, 
  ChevronRight,
  Wind,
  ShieldCheck,
  Stethoscope,
  Building2,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { 
  KPIStats, 
  PatientJourneyStage, 
  OxygenStatus, 
  ICUWardData, 
  AIRecommendation, 
  AlertItem,
  NavigationTab
} from '../types';

interface OverviewViewProps {
  kpis: KPIStats;
  journeyStages: PatientJourneyStage[];
  oxygen: OxygenStatus;
  icuWards: ICUWardData[];
  recommendations: AIRecommendation[];
  alerts: AlertItem[];
  onNavigateTab: (tab: NavigationTab) => void;
  onExecuteRecommendation: (id: string) => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  kpis,
  journeyStages,
  oxygen,
  icuWards,
  recommendations,
  alerts,
  onNavigateTab,
  onExecuteRecommendation,
}) => {
  const pendingRecs = recommendations.filter(r => r.status === 'pending');

  return (
    <div className="space-y-6">
      
      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* KPI 1: Current Patients */}
        <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Current Inpatients</span>
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-slate-900 font-mono">{kpis.currentPatients}</span>
            <span className="inline-flex items-center text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
              +12 today
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Hospital Occupancy</span>
            <span className="font-semibold text-slate-700 font-mono">85.6%</span>
          </div>
        </div>

        {/* KPI 2: ED Patients */}
        <div className="bg-white rounded-xl p-4 sm:p-5 border border-amber-200 shadow-sm hover:shadow-md transition bg-gradient-to-b from-amber-50/20 to-white">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-700">ED Patients Active</span>
            <div className="p-2 rounded-lg bg-amber-100 text-amber-700">
              <Activity className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-slate-900 font-mono">{kpis.edPatients}</span>
            <span className="inline-flex items-center text-xs font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-300">
              <TrendingUp className="w-3.5 h-3.5 mr-0.5" />
              High Surge (89%)
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Capacity Buffer</span>
            <span className="font-semibold text-amber-700 font-mono">8 beds left in ED</span>
          </div>
        </div>

        {/* KPI 3: ICU Occupancy */}
        <div className="bg-white rounded-xl p-4 sm:p-5 border border-red-200 shadow-sm hover:shadow-md transition bg-gradient-to-b from-red-50/20 to-white">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-red-700">ICU Occupancy</span>
            <div className="p-2 rounded-lg bg-red-100 text-red-700">
              <BedDouble className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-slate-900 font-mono">{kpis.icuOccupancy}%</span>
            <span className="inline-flex items-center text-xs font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded-full border border-red-300">
              <AlertTriangle className="w-3.5 h-3.5 mr-0.5" />
              Critical Tier
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>ICU A Critical Load</span>
            <span className="font-bold text-red-600 font-mono">92% (23/25 beds)</span>
          </div>
        </div>

        {/* KPI 4: Available Beds */}
        <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Available Beds</span>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-slate-900 font-mono">{kpis.availableBeds}</span>
            <span className="inline-flex items-center text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              +14 pending discharge
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Total Bed Fleet</span>
            <span className="font-semibold text-slate-700 font-mono">500 Total Beds</span>
          </div>
        </div>

      </div>

      {/* Second Row KPIs: Critical Equipment Util, Predicted Surge, Active Critical Alerts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* KPI 5: Critical Equipment Utilization */}
        <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Cpu className="w-4 h-4 text-blue-600" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
                Critical Equipment Utilization
              </span>
            </div>
            <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
              Heavy Demand
            </span>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-slate-900 font-mono">{kpis.criticalEquipmentUtil}%</span>
            <span className="text-xs text-slate-500">Across 8 Medical Modalities</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2 mt-3 overflow-hidden">
            <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${kpis.criticalEquipmentUtil}%` }}></div>
          </div>
          <div className="mt-3 text-xs text-slate-500 flex justify-between">
            <span>Ventilators (85%)</span>
            <span>OTs (83%)</span>
            <span>Dialysis (80%)</span>
          </div>
        </div>

        {/* KPI 6: Predicted Patient Surge */}
        <div className="bg-white rounded-xl p-4 sm:p-5 border border-indigo-200 shadow-sm hover:shadow-md transition bg-gradient-to-br from-indigo-50/30 to-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-900">
                Predicted Patient Surge
              </span>
            </div>
            <span className="text-xs font-bold text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded-full border border-indigo-200">
              ML Model v4.2
            </span>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-indigo-900 font-mono">+{kpis.predictedPatientSurge}%</span>
            <span className="text-xs font-semibold text-indigo-700">Next 12 Hours (6 PM - 11 PM)</span>
          </div>
          <div className="mt-3 pt-3 border-t border-indigo-100 text-xs text-indigo-950 font-medium">
            Forecasted admissions: <span className="font-bold font-mono text-indigo-900">71 patients</span> (Weather & Festival surge)
          </div>
        </div>

        {/* KPI 7: Active Critical Alerts */}
        <div className="bg-white rounded-xl p-4 sm:p-5 border border-red-200 shadow-sm hover:shadow-md transition bg-gradient-to-br from-red-50/30 to-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-red-600" />
              <span className="text-xs font-bold uppercase tracking-wider text-red-900">
                Active Critical Alerts
              </span>
            </div>
            <span className="text-xs font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded-full border border-red-300 animate-pulse">
              Requires Action
            </span>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-red-600 font-mono">{kpis.activeCriticalAlerts}</span>
            <button
              onClick={() => onNavigateTab('alerts')}
              className="text-xs font-bold text-red-700 hover:text-red-800 hover:underline flex items-center"
            >
              <span>Resolve in Alerts Center</span>
              <ArrowRight className="w-3 h-3 ml-1" />
            </button>
          </div>
          <div className="mt-3 pt-3 border-t border-red-100 text-xs text-red-900 font-medium truncate">
            Top: ICU A Capacity (92%) & Oxygen Reserves (68%, 9h)
          </div>
        </div>

      </div>

      {/* Visual Patient Journey Pipeline Preview */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
              <Activity className="w-5 h-5 text-blue-600" />
              <span>Continuous Patient Flow Management</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Live tracking from Emergency Intake across Diagnostic, Clinical Treatment, Inpatient Bed allocations to Discharge.
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('patient-flow')}
            className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center space-x-1 self-start sm:self-auto"
          >
            <span>Open Interactive Flow & Triage</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* 5-Step Continuous Journey Pipeline */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 mt-4">
          {journeyStages.map((stage, idx) => {
            const isBottleneck = stage.status === 'bottleneck';
            const isWarning = stage.status === 'warning';
            return (
              <div 
                key={stage.id}
                className={`p-3.5 rounded-xl border relative transition-all ${
                  isBottleneck
                    ? 'bg-red-50/50 border-red-200'
                    : isWarning
                    ? 'bg-amber-50/50 border-amber-200'
                    : 'bg-slate-50/80 border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 mb-1">
                  <span>Step 0{idx + 1}</span>
                  <span className={`px-1.5 py-0.5 rounded text-[10px] uppercase font-mono ${
                    isBottleneck ? 'bg-red-100 text-red-800' : isWarning ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {stage.status}
                  </span>
                </div>
                <div className="font-bold text-xs text-slate-900 leading-tight">{stage.name}</div>
                <div className="text-[11px] text-slate-500 mt-0.5">{stage.subtitle}</div>
                
                <div className="mt-3 flex items-baseline justify-between pt-2 border-t border-slate-200/60">
                  <div>
                    <span className="text-lg font-extrabold text-slate-900 font-mono">{stage.activePatients}</span>
                    <span className="text-[10px] text-slate-500 ml-1">pts</span>
                  </div>
                  <div className="text-[11px] text-slate-600 font-mono flex items-center">
                    <Clock className="w-3 h-3 mr-1 text-slate-400" />
                    {stage.avgDurationMinutes}m
                  </div>
                </div>

                <div className="mt-2 text-[10px] font-medium leading-tight line-clamp-1 text-slate-600">
                  {stage.statusText}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Two Columns: Ward Occupancy Heatmap & Top Actionable Directives */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: ICU & Emergency Ward Heatmap */}
        <div className="lg:col-span-2 bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                <Building2 className="w-4 h-4 text-blue-600" />
                <span>ICU & High-Acuity Ward Resource Status</span>
              </h3>
              <p className="text-xs text-slate-500">Live occupancy, ventilator load and clinical risk classification</p>
            </div>
            <button
              onClick={() => onNavigateTab('equipment')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700"
            >
              Equipment Telemetry →
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
            {icuWards.map((ward) => (
              <div 
                key={ward.id} 
                className={`p-3.5 rounded-xl border transition ${
                  ward.riskLevel === 'Critical'
                    ? 'bg-red-50/40 border-red-200'
                    : ward.riskLevel === 'Moderate'
                    ? 'bg-amber-50/40 border-amber-200'
                    : 'bg-emerald-50/40 border-emerald-200'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{ward.name}</h4>
                    <span className={`inline-block mt-1 text-[10px] font-bold px-1.5 py-0.5 rounded uppercase font-mono ${
                      ward.riskLevel === 'Critical'
                        ? 'bg-red-100 text-red-800'
                        : ward.riskLevel === 'Moderate'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {ward.riskLevel} Risk
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-extrabold text-slate-900 font-mono">{ward.occupancyPercent}%</span>
                    <div className="text-[10px] text-slate-500">{ward.occupiedBeds}/{ward.totalBeds} beds</div>
                  </div>
                </div>

                <div className="mt-3 space-y-1.5 text-xs">
                  <div>
                    <div className="flex justify-between text-[11px] text-slate-600 mb-0.5">
                      <span>Ventilator Utilization</span>
                      <span className="font-mono font-semibold">{ward.ventilatorUsagePercent}% ({ward.ventilatorsInUse}/{ward.ventilatorsTotal})</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                      <div 
                        className={`h-1.5 rounded-full ${ward.ventilatorUsagePercent > 80 ? 'bg-red-500' : ward.ventilatorUsagePercent > 60 ? 'bg-amber-500' : 'bg-emerald-500'}`} 
                        style={{ width: `${ward.ventilatorUsagePercent}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[10px] text-slate-500 font-mono">
                  <span>Monitors Active: {ward.patientMonitorsActive}</span>
                  <span>Reserves: {ward.emergencyReserves}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Critical Gas & Life Support Status */}
          <div className="mt-4 p-3.5 bg-blue-50/50 rounded-xl border border-blue-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-blue-100 text-blue-700">
                <Wind className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-slate-900">Central Cryogenic Oxygen System</span>
                <p className="text-[11px] text-slate-600">Level: <span className="font-bold font-mono text-amber-700">68%</span> | Burn Rate: <span className="font-mono">4.2%/hr</span> | Est Critical: <span className="font-bold text-red-600 font-mono">9 hours</span></p>
              </div>
            </div>
            <button
              onClick={() => onNavigateTab('equipment')}
              className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition whitespace-nowrap"
            >
              Manage Oxygen Supplies
            </button>
          </div>
        </div>

        {/* Right 1 Col: Top AI Smart Resource Prioritization Actions */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <Zap className="w-4 h-4 text-emerald-600" />
                <h3 className="text-base font-bold text-slate-900">AI Priority Engine</h3>
              </div>
              <span className="text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                Active Queue
              </span>
            </div>

            <div className="space-y-3 mt-4">
              {recommendations.slice(0, 3).map((rec) => (
                <div key={rec.id} className="p-3 rounded-lg border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition text-xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-blue-900 flex items-center">
                      <span className="w-4 h-4 rounded-full bg-blue-600 text-white text-[10px] font-mono flex items-center justify-center mr-1.5 font-bold">
                        {rec.priority}
                      </span>
                      {rec.title}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">{rec.category}</span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-1 leading-snug">{rec.reason}</p>
                  
                  <div className="mt-2.5 flex items-center justify-between pt-2 border-t border-slate-200/60">
                    <span className="text-[10px] text-emerald-700 font-semibold font-mono">
                      Impact: {rec.predictedImpact.slice(0, 35)}...
                    </span>
                    <button
                      onClick={() => onExecuteRecommendation(rec.id)}
                      className={`px-2.5 py-1 rounded text-[11px] font-bold transition ${
                        rec.status === 'accepted'
                          ? 'bg-emerald-100 text-emerald-800 cursor-default'
                          : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      }`}
                    >
                      {rec.status === 'accepted' ? 'Accepted' : 'Accept'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-center">
            <button
              onClick={() => onNavigateTab('predictions')}
              className="text-xs text-blue-600 font-bold hover:underline"
            >
              Open Full AI Recommendation Engine (5 Directives) →
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};
