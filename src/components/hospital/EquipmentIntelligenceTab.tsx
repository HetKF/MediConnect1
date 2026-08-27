import React, { useState } from 'react';
import { 
  Activity, Search, Filter, Cpu, Wrench, AlertTriangle, CheckCircle2, 
  ChevronRight, Radio, Thermometer, Gauge, Sparkles, Scale, Layers, 
  SlidersHorizontal, Check, RefreshCw
} from 'lucide-react';
import { HospitalEquipment } from '../../types';

interface EquipmentIntelligenceTabProps {
  equipmentList: HospitalEquipment[];
  onSelectEquipment: (equipment: HospitalEquipment) => void;
  onOpenCompare: (eq1: HospitalEquipment, eq2: HospitalEquipment) => void;
  onSimulateEvent: (eventType: string) => Promise<void>;
  isLoading: boolean;
}

export const EquipmentIntelligenceTab: React.FC<EquipmentIntelligenceTabProps> = ({
  equipmentList,
  onSelectEquipment,
  onOpenCompare,
  onSimulateEvent,
  isLoading,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('All');
  const [selectedRisk, setSelectedRisk] = useState<string>('All');
  const [selectedForCompare, setSelectedForCompare] = useState<HospitalEquipment[]>([]);

  // Unique departments
  const departments = ['All', ...Array.from(new Set(equipmentList.map(e => e.department)))];

  // Filtering
  const filteredEquipment = equipmentList.filter(item => {
    const matchesSearch = item.equipmentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.location && item.location.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.sensorId && item.sensorId.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesDept = selectedDepartment === 'All' || item.department === selectedDepartment;
    const matchesRisk = selectedRisk === 'All' || 
      (selectedRisk === 'High' && (item.maintenanceRisk.level === 'HIGH' || item.usagePercentage >= 85)) ||
      (selectedRisk === 'Medium' && item.maintenanceRisk.level === 'MEDIUM') ||
      (selectedRisk === 'Low' && item.maintenanceRisk.level === 'LOW');

    return matchesSearch && matchesDept && matchesRisk;
  });

  // KPI Calculations
  const totalAssets = equipmentList.reduce((acc, curr) => acc + curr.totalUnits, 0);
  const totalOccupied = equipmentList.reduce((acc, curr) => acc + curr.occupiedUnits, 0);
  const totalAvailable = equipmentList.reduce((acc, curr) => acc + curr.availableUnits, 0);
  const connectedSensors = equipmentList.filter(e => e.sensorConnected).length;
  const highRiskCount = equipmentList.filter(e => e.maintenanceRisk.level === 'HIGH' || e.usagePercentage >= 85).length;
  const averageHealthScore = Math.round(
    equipmentList.reduce((acc, curr) => acc + curr.healthScore, 0) / (equipmentList.length || 1)
  );

  const toggleCompare = (equipment: HospitalEquipment) => {
    if (selectedForCompare.some(e => e.equipmentId === equipment.equipmentId)) {
      setSelectedForCompare(selectedForCompare.filter(e => e.equipmentId !== equipment.equipmentId));
    } else {
      if (selectedForCompare.length >= 2) {
        setSelectedForCompare([selectedForCompare[1], equipment]);
      } else {
        setSelectedForCompare([...selectedForCompare, equipment]);
      }
    }
  };

  return (
    <div className="space-y-6">
      
      {/* 1. TOP STATS BAR */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
        
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span className="font-semibold">Total Hospital Assets</span>
            <Layers className="w-4 h-4 text-blue-600" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-black text-slate-900">{totalAssets}</span>
            <span className="text-xs text-slate-500">{equipmentList.length} Categories</span>
          </div>
          <p className="text-[10px] text-slate-500 mt-1">
            {totalAvailable} available &bull; {totalOccupied} deployed
          </p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span className="font-semibold">Live IoT Connected</span>
            <Radio className="w-4 h-4 text-emerald-600 animate-pulse" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-black text-emerald-600">{connectedSensors}/{equipmentList.length}</span>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">100% ONLINE</span>
          </div>
          <p className="text-[10px] text-slate-500 mt-1">
            Streaming edge telemetry every 4s
          </p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span className="font-semibold">Fleet Health Score</span>
            <Activity className="w-4 h-4 text-teal-600" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-black text-slate-900">{averageHealthScore}/100</span>
            <span className="text-xs font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md">NOMINAL</span>
          </div>
          <p className="text-[10px] text-slate-500 mt-1">
            AI calculated reliability index
          </p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span className="font-semibold">High Load / Attention</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-black text-amber-600">{highRiskCount}</span>
            <span className="text-xs font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md">MONITORED</span>
          </div>
          <p className="text-[10px] text-slate-500 mt-1">
            Ventilator, CT &amp; ECMO high usage
          </p>
        </div>

        <div className="col-span-2 lg:col-span-1 bg-gradient-to-br from-slate-900 to-slate-800 text-white p-4 rounded-2xl border border-slate-700 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-teal-300 text-xs font-bold">
            <span>Patient-Side Sync</span>
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping"></span>
          </div>
          <div>
            <p className="text-xs text-slate-300">
              Allocations made here instantly reflect on patient emergency finder.
            </p>
          </div>
          <span className="text-[10px] text-teal-300/80 font-mono">
            Zero Data Divergence
          </span>
        </div>

      </div>

      {/* 2. SEARCH & FILTER CONTROLS */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by equipment name, department, serial # or room location..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <div className="flex items-center gap-1">
            <span className="text-slate-500 font-semibold text-[11px]">Dept:</span>
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              {departments.map((dept) => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1">
            <span className="text-slate-500 font-semibold text-[11px]">Risk:</span>
            <select
              value={selectedRisk}
              onChange={(e) => setSelectedRisk(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="All">All Risk Levels</option>
              <option value="High">High Risk / Heavy Load</option>
              <option value="Medium">Medium Risk</option>
              <option value="Low">Low Risk (Nominal)</option>
            </select>
          </div>

          {selectedForCompare.length === 2 && (
            <button
              onClick={() => onOpenCompare(selectedForCompare[0], selectedForCompare[1])}
              className="px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Scale className="w-3.5 h-3.5" />
              <span>Compare Selected (2)</span>
            </button>
          )}
        </div>
      </div>

      {/* 3. EQUIPMENT CARDS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredEquipment.map((item) => {
          const isSelectedForCompare = selectedForCompare.some(e => e.equipmentId === item.equipmentId);
          
          return (
            <div
              key={item.equipmentId}
              className={`bg-white rounded-2xl border transition-all duration-200 shadow-xs flex flex-col justify-between overflow-hidden ${
                item.maintenanceRisk.level === 'HIGH' || item.usagePercentage >= 85
                  ? 'border-amber-200/90 hover:border-amber-400'
                  : 'border-slate-200 hover:border-teal-400'
              }`}
            >
              {/* Card Header */}
              <div className="p-5 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                      {item.department}
                    </span>
                    <h3 className="text-sm font-bold text-slate-900 leading-tight mt-0.5">
                      {item.equipmentName}
                    </h3>
                  </div>

                  {/* Health Score Pill */}
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-md border shrink-0 ${
                    item.healthScore >= 85
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : item.healthScore >= 70
                      ? 'bg-amber-50 text-amber-800 border-amber-200'
                      : 'bg-rose-50 text-rose-800 border-rose-200'
                  }`}>
                    {item.healthScore}/100 HEALTH
                  </span>
                </div>

                {/* Utilization Progress Bar */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Utilization Rate</span>
                    <span className={`font-black ${
                      item.usagePercentage >= 85 ? 'text-rose-600' : item.usagePercentage >= 75 ? 'text-amber-600' : 'text-slate-700'
                    }`}>
                      {item.usagePercentage}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        item.usagePercentage >= 85 ? 'bg-rose-500' : item.usagePercentage >= 75 ? 'bg-amber-500' : 'bg-[#00c99f]'
                      }`}
                      style={{ width: `${item.usagePercentage}%` }}
                    />
                  </div>
                </div>

                {/* Units Available vs Total */}
                <div className="grid grid-cols-3 gap-2 text-center text-xs pt-1">
                  <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-[10px] text-slate-500 block">Total</span>
                    <span className="font-bold text-slate-900">{item.totalUnits}</span>
                  </div>
                  <div className="p-2 rounded-xl bg-emerald-50/70 border border-emerald-100">
                    <span className="text-[10px] text-emerald-800 font-semibold block">Available</span>
                    <span className="font-bold text-emerald-900">{item.availableUnits}</span>
                  </div>
                  <div className="p-2 rounded-xl bg-blue-50/70 border border-blue-100">
                    <span className="text-[10px] text-blue-800 font-semibold block">In Use</span>
                    <span className="font-bold text-blue-900">{item.occupiedUnits}</span>
                  </div>
                </div>

                {/* Live IoT Sensor Pills */}
                {item.sensorTelemetry && (
                  <div className="p-2.5 rounded-xl bg-slate-900 text-slate-300 text-[11px] flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Thermometer className="w-3.5 h-3.5 text-cyan-400" />
                      <span className={`font-mono font-bold ${
                        item.sensorTelemetry.temperatureStatus === 'hot'
                          ? 'text-rose-400'
                          : item.sensorTelemetry.temperatureStatus === 'warm'
                          ? 'text-amber-400'
                          : 'text-emerald-300'
                      }`}>
                        {item.sensorTelemetry.temperatureC}°C
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <Activity className="w-3.5 h-3.5 text-purple-400" />
                      <span className="font-mono text-slate-300">
                        {item.sensorTelemetry.vibrationMmS} mm/s
                      </span>
                    </div>

                    <div className="flex items-center gap-1 text-[10px] text-emerald-400">
                      <Radio className="w-3 h-3 animate-pulse" />
                      <span>{item.sensorTelemetry.lastTelemetryTime}</span>
                    </div>
                  </div>
                )}

                {/* AI Recommendation Snippet */}
                {item.aiForecast && (
                  <div className="p-2.5 rounded-xl bg-teal-50/60 border border-teal-200/70 text-xs text-teal-900 space-y-1">
                    <div className="flex items-center justify-between text-[10px] font-bold text-teal-800">
                      <span className="flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-teal-600" />
                        AI FORECAST INSIGHT
                      </span>
                      <span>Peak: {item.aiForecast.peakHourWindow}</span>
                    </div>
                    <p className="text-[11px] text-slate-700 line-clamp-2 leading-relaxed">
                      {item.aiForecast.recommendation}
                    </p>
                  </div>
                )}
              </div>

              {/* Card Footer Actions */}
              <div className="p-4 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  onClick={() => toggleCompare(item)}
                  className={`text-[11px] font-bold px-2.5 py-1.5 rounded-lg border transition-colors cursor-pointer flex items-center gap-1 ${
                    isSelectedForCompare
                      ? 'bg-teal-100 text-teal-900 border-teal-300 font-black'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <Scale className="w-3 h-3" />
                  <span>{isSelectedForCompare ? 'Compared' : 'Compare'}</span>
                </button>

                <button
                  onClick={() => onSelectEquipment(item)}
                  className="text-xs font-bold text-slate-950 bg-[#00c99f] hover:bg-[#00b289] px-3.5 py-1.5 rounded-xl transition-all shadow-xs hover:scale-105 flex items-center gap-1 cursor-pointer"
                >
                  <span>Deep Telemetry</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

            </div>
          );
        })}
      </div>

      {filteredEquipment.length === 0 && (
        <div className="bg-white rounded-2xl p-12 border border-slate-200 text-center space-y-3">
          <AlertTriangle className="w-8 h-8 text-slate-400 mx-auto" />
          <h4 className="text-base font-bold text-slate-800">No equipment found matching criteria</h4>
          <p className="text-xs text-slate-500">Try adjusting your search query or department filter.</p>
        </div>
      )}

    </div>
  );
};
