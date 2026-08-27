import React from 'react';
import { X, Scale, Activity, Thermometer, ShieldAlert, Cpu, CheckCircle2 } from 'lucide-react';
import { HospitalEquipment } from '../../types';

interface EquipmentComparisonModalProps {
  equipment1: HospitalEquipment;
  equipment2: HospitalEquipment;
  onClose: () => void;
}

export const EquipmentComparisonModal: React.FC<EquipmentComparisonModalProps> = ({
  equipment1,
  equipment2,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-4xl w-full text-slate-100 shadow-2xl p-6 sm:p-8 space-y-6 my-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <Scale className="w-6 h-6 text-teal-400" />
            <div>
              <h3 className="text-lg font-black text-white">Side-by-Side Equipment Intelligence Comparison</h3>
              <p className="text-xs text-slate-400">Comparing operational health, IoT telemetry, duty cycles, and maintenance risk</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Comparison Grid */}
        <div className="grid grid-cols-2 gap-4">
          
          {/* Card 1 */}
          <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
            <div className="border-b border-slate-800 pb-3">
              <span className="text-[10px] font-bold text-teal-400 uppercase tracking-wider">{equipment1.department}</span>
              <h4 className="text-base font-bold text-white mt-1">{equipment1.equipmentName}</h4>
              <p className="text-xs text-slate-400">{equipment1.location}</p>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between py-1.5 border-b border-slate-850">
                <span className="text-slate-400">Health Score</span>
                <span className="text-base font-black text-emerald-400">{equipment1.healthScore}/100</span>
              </div>

              <div className="flex items-center justify-between py-1.5 border-b border-slate-850">
                <span className="text-slate-400">Current Utilization</span>
                <span className="font-bold text-white">{equipment1.usagePercentage}%</span>
              </div>

              <div className="flex items-center justify-between py-1.5 border-b border-slate-850">
                <span className="text-slate-400">Fleet Units (Avail / Total)</span>
                <span className="font-bold text-emerald-300">{equipment1.availableUnits} / {equipment1.totalUnits}</span>
              </div>

              <div className="flex items-center justify-between py-1.5 border-b border-slate-850">
                <span className="text-slate-400">Sensor Temperature</span>
                <span className="font-bold text-cyan-300">{equipment1.sensorTelemetry?.temperatureC ?? 'N/A'}°C</span>
              </div>

              <div className="flex items-center justify-between py-1.5 border-b border-slate-850">
                <span className="text-slate-400">Vibration (ISO standard)</span>
                <span className="font-bold text-slate-200">{equipment1.sensorTelemetry?.vibrationMmS ?? 'N/A'} mm/s</span>
              </div>

              <div className="flex items-center justify-between py-1.5 border-b border-slate-850">
                <span className="text-slate-400">Total Runtime Hours</span>
                <span className="font-mono text-slate-300">{equipment1.totalUsageHours.toLocaleString()} hrs</span>
              </div>

              <div className="flex items-center justify-between py-1.5 border-b border-slate-850">
                <span className="text-slate-400">Maintenance Risk</span>
                <span className={`font-bold px-2 py-0.5 rounded text-[10px] ${
                  equipment1.maintenanceRisk.level === 'HIGH' ? 'bg-rose-950 text-rose-300' : 'bg-emerald-950 text-emerald-300'
                }`}>
                  {equipment1.maintenanceRisk.level} RISK ({equipment1.maintenanceRisk.scorePercent}%)
                </span>
              </div>
            </div>
          </div>

          {/* Card 2 */}
          <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
            <div className="border-b border-slate-800 pb-3">
              <span className="text-[10px] font-bold text-teal-400 uppercase tracking-wider">{equipment2.department}</span>
              <h4 className="text-base font-bold text-white mt-1">{equipment2.equipmentName}</h4>
              <p className="text-xs text-slate-400">{equipment2.location}</p>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between py-1.5 border-b border-slate-850">
                <span className="text-slate-400">Health Score</span>
                <span className="text-base font-black text-emerald-400">{equipment2.healthScore}/100</span>
              </div>

              <div className="flex items-center justify-between py-1.5 border-b border-slate-850">
                <span className="text-slate-400">Current Utilization</span>
                <span className="font-bold text-white">{equipment2.usagePercentage}%</span>
              </div>

              <div className="flex items-center justify-between py-1.5 border-b border-slate-850">
                <span className="text-slate-400">Fleet Units (Avail / Total)</span>
                <span className="font-bold text-emerald-300">{equipment2.availableUnits} / {equipment2.totalUnits}</span>
              </div>

              <div className="flex items-center justify-between py-1.5 border-b border-slate-850">
                <span className="text-slate-400">Sensor Temperature</span>
                <span className="font-bold text-cyan-300">{equipment2.sensorTelemetry?.temperatureC ?? 'N/A'}°C</span>
              </div>

              <div className="flex items-center justify-between py-1.5 border-b border-slate-850">
                <span className="text-slate-400">Vibration (ISO standard)</span>
                <span className="font-bold text-slate-200">{equipment2.sensorTelemetry?.vibrationMmS ?? 'N/A'} mm/s</span>
              </div>

              <div className="flex items-center justify-between py-1.5 border-b border-slate-850">
                <span className="text-slate-400">Total Runtime Hours</span>
                <span className="font-mono text-slate-300">{equipment2.totalUsageHours.toLocaleString()} hrs</span>
              </div>

              <div className="flex items-center justify-between py-1.5 border-b border-slate-850">
                <span className="text-slate-400">Maintenance Risk</span>
                <span className={`font-bold px-2 py-0.5 rounded text-[10px] ${
                  equipment2.maintenanceRisk.level === 'HIGH' ? 'bg-rose-950 text-rose-300' : 'bg-emerald-950 text-emerald-300'
                }`}>
                  {equipment2.maintenanceRisk.level} RISK ({equipment2.maintenanceRisk.scorePercent}%)
                </span>
              </div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-teal-400 text-slate-950 font-black text-xs shadow-lg hover:bg-teal-300 cursor-pointer"
          >
            Close Comparison
          </button>
        </div>

      </div>
    </div>
  );
};
