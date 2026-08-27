import React from 'react';
import { 
  Wrench, ShieldAlert, CheckCircle2, Clock, AlertTriangle, Calendar, 
  Sparkles, FileText, ChevronRight, UserCheck, HardHat
} from 'lucide-react';
import { HospitalEquipment } from '../../types';

interface MaintenanceCenterTabProps {
  equipmentList: HospitalEquipment[];
  onSelectEquipment: (equipment: HospitalEquipment) => void;
  onTriggerAiDiagnosis: (equipment: HospitalEquipment) => Promise<void>;
}

export const MaintenanceCenterTab: React.FC<MaintenanceCenterTabProps> = ({
  equipmentList,
  onSelectEquipment,
  onTriggerAiDiagnosis,
}) => {
  // Sort equipment by maintenance risk
  const sortedByRisk = [...equipmentList].sort((a, b) => b.maintenanceRisk.scorePercent - a.maintenanceRisk.scorePercent);
  
  const highRisk = sortedByRisk.filter(e => e.maintenanceRisk.level === 'HIGH' || e.maintenanceRisk.scorePercent > 40);
  const totalDowntimeHours = equipmentList.reduce((acc, curr) => acc + (curr.maintenanceIntelligence?.totalDowntimeHours || 0), 0);
  const totalBreakdowns = equipmentList.reduce((acc, curr) => acc + curr.failureCount, 0);

  return (
    <div className="space-y-6">
      
      {/* Maintenance KPI Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-semibold">Priority Action Items</span>
          <p className="text-2xl font-black text-rose-600 mt-1">{highRisk.length}</p>
          <span className="text-[10px] text-slate-500">Immediate attention or service due</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-semibold">Hospital MTBF Reliability</span>
          <p className="text-2xl font-black text-emerald-600 mt-1">98.4%</p>
          <span className="text-[10px] text-slate-500">Mean Time Between Failures</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-semibold">Total YTD Downtime</span>
          <p className="text-2xl font-black text-slate-900 mt-1">{totalDowntimeHours.toFixed(1)} hrs</p>
          <span className="text-[10px] text-slate-500">Across all clinical departments</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-semibold">Preventive vs Reactive</span>
          <p className="text-2xl font-black text-teal-600 mt-1">92% : 8%</p>
          <span className="text-[10px] text-slate-500">AI-driven proactive servicing</span>
        </div>
      </div>

      {/* High-Risk Diagnostic Action Queue */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-rose-600" />
              <span>Predictive BioMed Risk Ranking &amp; Proactive Scheduling</span>
            </h3>
            <p className="text-xs text-slate-500">
              Ranked automatically using IoT sensor telemetry (temperature, vibration, runtime hours, past failures)
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {sortedByRisk.map((item) => (
            <div 
              key={item.equipmentId}
              className={`p-4 rounded-xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                item.maintenanceRisk.level === 'HIGH' || item.maintenanceRisk.scorePercent >= 40
                  ? 'bg-rose-50/40 border-rose-200'
                  : item.maintenanceRisk.level === 'MEDIUM'
                  ? 'bg-amber-50/40 border-amber-200'
                  : 'bg-slate-50/60 border-slate-200'
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-slate-900">{item.equipmentName}</span>
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-md border ${
                    item.maintenanceRisk.level === 'HIGH'
                      ? 'bg-rose-100 text-rose-800 border-rose-300'
                      : item.maintenanceRisk.level === 'MEDIUM'
                      ? 'bg-amber-100 text-amber-800 border-amber-300'
                      : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                  }`}>
                    {item.maintenanceRisk.level} RISK ({item.maintenanceRisk.scorePercent}%)
                  </span>
                  <span className="text-[10px] text-slate-500">{item.department}</span>
                </div>
                <p className="text-xs text-slate-600">{item.maintenanceRisk.summary}</p>
                <p className="text-[11px] text-slate-500">
                  <strong>Recommendation:</strong> {item.maintenanceRisk.recommendedAction} &bull; Inspection due in <strong className="text-slate-800">{item.maintenanceRisk.daysToRecommendedInspection} days</strong>
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => onSelectEquipment(item)}
                  className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                >
                  <Wrench className="w-3.5 h-3.5 text-teal-400" />
                  <span>Inspect BioMed State</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
