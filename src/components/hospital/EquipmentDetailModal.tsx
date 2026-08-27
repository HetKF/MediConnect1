import React, { useState } from 'react';
import { 
  X, Activity, Cpu, Wrench, BarChart3, TrendingUp, AlertTriangle, 
  CheckCircle2, Clock, ShieldAlert, Sparkles, Thermometer, Radio, 
  BatteryCharging, Gauge, Layers, RefreshCw, Zap, ArrowUpRight, Check
} from 'lucide-react';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, 
  CartesianGrid, BarChart, Bar, LineChart, Line, Cell 
} from 'recharts';
import { HospitalEquipment, IndividualUnit } from '../../types';

interface EquipmentDetailModalProps {
  equipment: HospitalEquipment;
  onClose: () => void;
  onUpdateStatus: (equipmentId: string, status: string, available: number, occupied: number) => Promise<void>;
  onTriggerAiDiagnosis: (equipment: HospitalEquipment) => Promise<void>;
  aiDiagnosisLoading: boolean;
  aiDiagnosisResult: any | null;
}

export const EquipmentDetailModal: React.FC<EquipmentDetailModalProps> = ({
  equipment,
  onClose,
  onUpdateStatus,
  onTriggerAiDiagnosis,
  aiDiagnosisLoading,
  aiDiagnosisResult,
}) => {
  const [activeTab, setActiveTab] = useState<'telemetry' | 'analytics' | 'maintenance' | 'forecast' | 'fleet'>('telemetry');
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d' | '3m'>('7d');
  const [updatingUnitId, setUpdatingUnitId] = useState<string | null>(null);

  // Health score color
  const getHealthBadge = (score: number) => {
    if (score >= 85) return { bg: 'bg-emerald-100 text-emerald-800 border-emerald-300', label: 'OPTIMAL HEALTH' };
    if (score >= 70) return { bg: 'bg-amber-100 text-amber-800 border-amber-300', label: 'ATTENTION REQUIRED' };
    return { bg: 'bg-rose-100 text-rose-800 border-rose-300', label: 'CRITICAL RISK' };
  };

  const healthBadge = getHealthBadge(equipment.healthScore);

  // Time range chart data transformation
  const getChartData = () => {
    if (timeRange === '24h') {
      return (equipment.usageData?.hourlyPeakDemand || []).map(item => ({
        label: item.hour,
        utilization: item.usagePercent,
        metric: item.demandScore * 10,
      }));
    }
    if (timeRange === '7d') {
      return (equipment.usageData?.daily || []).map(item => ({
        label: item.date.slice(5),
        utilization: item.usagePercent,
        procedures: item.procedures,
        operatingHours: item.operatingHours,
      }));
    }
    if (timeRange === '30d') {
      return (equipment.usageData?.weeklyTrend || []).map(item => ({
        label: item.day,
        utilization: item.usagePercent,
      }));
    }
    return (equipment.usageData?.monthlyTrend || []).map(item => ({
      label: item.month,
      utilization: item.usagePercent,
    }));
  };

  const chartData = getChartData();

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-5xl w-full text-slate-100 shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        
        {/* MODAL HEADER */}
        <div className="p-5 sm:p-6 bg-slate-950 border-b border-slate-800 flex items-start justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="bg-blue-950 text-blue-300 border border-blue-700/60 text-[11px] font-bold px-2.5 py-0.5 rounded-md uppercase tracking-wider">
                {equipment.department}
              </span>
              <span className={`text-[11px] font-black px-2.5 py-0.5 rounded-md border ${healthBadge.bg}`}>
                HEALTH SCORE: {equipment.healthScore}/100 • {healthBadge.label}
              </span>
              {equipment.sensorConnected && (
                <span className="flex items-center gap-1 bg-emerald-950 text-emerald-400 border border-emerald-700/60 text-[10px] font-bold px-2 py-0.5 rounded-md">
                  <Radio className="w-3 h-3 animate-pulse" />
                  IoT SENSOR ONLINE ({equipment.sensorId})
                </span>
              )}
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
              <span>{equipment.equipmentName}</span>
            </h2>
            <p className="text-xs text-slate-400">
              Location: <strong className="text-slate-200">{equipment.location}</strong> • Total Fleet: <strong className="text-slate-200">{equipment.totalUnits} units</strong> ({equipment.availableUnits} Available, {equipment.occupiedUnits} In Use)
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* MODAL TAB NAVIGATION */}
        <div className="flex border-b border-slate-800 bg-slate-900/90 px-6 overflow-x-auto">
          <button
            onClick={() => setActiveTab('telemetry')}
            className={`py-3.5 px-4 text-xs font-black flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'telemetry'
                ? 'border-teal-400 text-teal-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>Live IoT Telemetry</span>
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`py-3.5 px-4 text-xs font-black flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'analytics'
                ? 'border-teal-400 text-teal-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Usage Analytics &amp; Trends</span>
          </button>

          <button
            onClick={() => setActiveTab('maintenance')}
            className={`py-3.5 px-4 text-xs font-black flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'maintenance'
                ? 'border-teal-400 text-teal-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Wrench className="w-4 h-4" />
            <span>Maintenance &amp; Reliability (BioMed AI)</span>
          </button>

          <button
            onClick={() => setActiveTab('forecast')}
            className={`py-3.5 px-4 text-xs font-black flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'forecast'
                ? 'border-teal-400 text-teal-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>AI Demand Forecast</span>
          </button>

          <button
            onClick={() => setActiveTab('fleet')}
            className={`py-3.5 px-4 text-xs font-black flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'fleet'
                ? 'border-teal-400 text-teal-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Individual Fleet Units ({equipment.individualUnits?.length || 0})</span>
          </button>
        </div>

        {/* MODAL BODY */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-6">
          
          {/* TAB 1: LIVE IOT TELEMETRY */}
          {activeTab === 'telemetry' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                
                {/* Temperature Card */}
                <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-2">
                  <div className="flex items-center justify-between text-slate-400 text-xs">
                    <span className="font-semibold">Core Temperature</span>
                    <Thermometer className="w-4 h-4 text-cyan-400" />
                  </div>
                  <div className="flex items-baseline gap-1.5">
                    <span className={`text-2xl font-black ${
                      equipment.sensorTelemetry?.temperatureStatus === 'hot'
                        ? 'text-rose-400'
                        : equipment.sensorTelemetry?.temperatureStatus === 'warm'
                        ? 'text-amber-400'
                        : 'text-emerald-400'
                    }`}>
                      {equipment.sensorTelemetry?.temperatureC ?? 22.5}°C
                    </span>
                    <span className="text-[10px] text-slate-400 font-bold uppercase">
                      {equipment.sensorTelemetry?.temperatureStatus ?? 'NORMAL'}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400">
                    Threshold: Safe under 42.0°C
                  </p>
                </div>

                {/* Vibration Card */}
                <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-2">
                  <div className="flex items-center justify-between text-slate-400 text-xs">
                    <span className="font-semibold">Mechanical Vibration</span>
                    <Activity className="w-4 h-4 text-purple-400" />
                  </div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-2xl font-black text-slate-100">
                      {equipment.sensorTelemetry?.vibrationMmS ?? 0.25} <span className="text-xs text-slate-400 font-normal">mm/s</span>
                    </span>
                    <span className="text-[10px] text-emerald-400 font-bold uppercase">
                      {equipment.sensorTelemetry?.vibrationStatus ?? 'NOMINAL'}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400">
                    ISO 10816-1 Mechanical Class I
                  </p>
                </div>

                {/* Power / Flow Card */}
                <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-2">
                  <div className="flex items-center justify-between text-slate-400 text-xs">
                    <span className="font-semibold">
                      {equipment.equipmentType === 'oxygen' || equipment.equipmentType === 'ventilator' ? 'Line Pressure' : 'Power Load'}
                    </span>
                    <Gauge className="w-4 h-4 text-amber-400" />
                  </div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-2xl font-black text-amber-300">
                      {equipment.equipmentType === 'oxygen' || equipment.equipmentType === 'ventilator'
                        ? `${equipment.sensorTelemetry?.pressureBar ?? 4.2} bar`
                        : `${equipment.sensorTelemetry?.powerKw ?? 24.0} kW`}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400">
                    Supply Line Nominal
                  </p>
                </div>

                {/* Telemetry Status Card */}
                <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-2">
                  <div className="flex items-center justify-between text-slate-400 text-xs">
                    <span className="font-semibold">Signal &amp; Duty</span>
                    <Radio className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-2xl font-black text-emerald-400">
                      {equipment.sensorTelemetry?.signalQualityPercent ?? 99}%
                    </span>
                    <span className="text-[10px] text-slate-400">Mesh Link</span>
                  </div>
                  <p className="text-[10px] text-slate-400">
                    {equipment.sensorTelemetry?.lastTelemetryTime ?? 'Live'}
                  </p>
                </div>

              </div>

              {/* LIVE SENSOR ARCHITECTURE BANNER */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-xl bg-teal-950 border border-teal-500/40 text-teal-300">
                    <Cpu className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">
                      IoT Sensor Stream &bull; Sensor ID: {equipment.sensorId}
                    </h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Edge telemetry is published via MQTT gateway into MediConnect Unified Resource Broker every 4 seconds.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-300 bg-slate-800 px-3 py-1.5 rounded-xl font-mono">
                    Today Operating Hours: <strong className="text-teal-300">{equipment.sensorTelemetry?.operatingHoursToday ?? 12}h</strong>
                  </span>
                </div>
              </div>

              {/* QUICK ALLOCATION STATUS EDIT */}
              <div className="p-5 rounded-2xl bg-slate-800/60 border border-slate-700 space-y-3">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-300">
                  Direct Fleet Allocation Controls (Synchronizes with Patient View)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-3 bg-slate-900 rounded-xl border border-slate-700/80">
                    <span className="text-[11px] text-slate-400">Total Units</span>
                    <p className="text-xl font-black text-white">{equipment.totalUnits}</p>
                  </div>
                  <div className="p-3 bg-slate-900 rounded-xl border border-emerald-700/60 flex items-center justify-between">
                    <div>
                      <span className="text-[11px] text-emerald-400 font-semibold">Available Units</span>
                      <p className="text-xl font-black text-emerald-300">{equipment.availableUnits}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onUpdateStatus(
                          equipment.equipmentId,
                          equipment.status,
                          Math.max(0, equipment.availableUnits - 1),
                          Math.min(equipment.totalUnits, equipment.occupiedUnits + 1)
                        )}
                        className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold flex items-center justify-center cursor-pointer"
                      >
                        -
                      </button>
                      <button
                        onClick={() => onUpdateStatus(
                          equipment.equipmentId,
                          equipment.status,
                          Math.min(equipment.totalUnits, equipment.availableUnits + 1),
                          Math.max(0, equipment.occupiedUnits - 1)
                        )}
                        className="w-7 h-7 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold flex items-center justify-center cursor-pointer"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <div className="p-3 bg-slate-900 rounded-xl border border-blue-700/60">
                    <span className="text-[11px] text-blue-400 font-semibold">In Active Use</span>
                    <p className="text-xl font-black text-blue-300">{equipment.occupiedUnits}</p>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: USAGE ANALYTICS & TRENDS */}
          {activeTab === 'analytics' && (
            <div className="space-y-6">
              
              {/* Controls bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-slate-800">
                <div>
                  <h3 className="text-sm font-bold text-white">Utilization &amp; Procedure Volume Over Time</h3>
                  <p className="text-xs text-slate-400">Historical duty-cycles and operational workload</p>
                </div>
                <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
                  {(['24h', '7d', '30d', '3m'] as const).map((range) => (
                    <button
                      key={range}
                      onClick={() => setTimeRange(range)}
                      className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                        timeRange === range
                          ? 'bg-teal-400 text-slate-950 shadow-sm'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {range.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Chart Visualizer */}
              <div className="h-64 sm:h-72 w-full bg-slate-950/80 p-4 rounded-2xl border border-slate-800">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="utilGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#00c99f" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#00c99f" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                    <XAxis dataKey="label" stroke="#94a3b8" fontSize={11} tickLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={11} domain={[0, 100]} tickLine={false} unit="%" />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', fontSize: '12px' }}
                      formatter={(val: any) => [`${val}%`, 'Utilization']}
                    />
                    <Area
                      type="monotone"
                      dataKey="utilization"
                      stroke="#00c99f"
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#utilGrad)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Key Usage Statistics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700">
                  <span className="text-slate-400">Avg Utilization</span>
                  <p className="text-lg font-black text-white mt-1">
                    {equipment.usageData?.averageUtilization ?? 84}%
                  </p>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700">
                  <span className="text-slate-400">Peak Utilization</span>
                  <p className="text-lg font-black text-rose-400 mt-1">
                    {equipment.usageData?.peakUtilization ?? 96}%
                  </p>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700">
                  <span className="text-slate-400">Idle Capacity Buffer</span>
                  <p className="text-lg font-black text-emerald-400 mt-1">
                    {equipment.usageData?.idleTimePercentage ?? 16}%
                  </p>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700">
                  <span className="text-slate-400">Total Procedures</span>
                  <p className="text-lg font-black text-cyan-300 mt-1">
                    {equipment.usageData?.totalProcedures ?? 158} scans/cases
                  </p>
                </div>
              </div>

              {/* Hourly Peak Load Distribution */}
              {equipment.usageData?.hourlyPeakDemand && (
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                  <h4 className="text-xs font-bold text-slate-300">
                    Hourly Demand Breakdown (06:00 - 24:00)
                  </h4>
                  <div className="grid grid-cols-3 sm:grid-cols-9 gap-2">
                    {equipment.usageData.hourlyPeakDemand.map((slot) => (
                      <div 
                        key={slot.hour}
                        className={`p-2 rounded-xl text-center border ${
                          slot.usagePercent >= 90
                            ? 'bg-rose-950/60 border-rose-600/60 text-rose-300'
                            : slot.usagePercent >= 80
                            ? 'bg-amber-950/60 border-amber-600/60 text-amber-300'
                            : 'bg-slate-800/60 border-slate-700 text-slate-300'
                        }`}
                      >
                        <span className="text-[10px] font-mono block text-slate-400">{slot.hour}</span>
                        <span className="text-xs font-bold">{slot.usagePercent}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          )}

          {/* TAB 3: MAINTENANCE & RELIABILITY (BIOMED AI) */}
          {activeTab === 'maintenance' && (
            <div className="space-y-6">
              
              {/* Predictive Risk Header */}
              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className={`w-5 h-5 ${
                      equipment.maintenanceRisk.level === 'HIGH' ? 'text-rose-400' : 'text-emerald-400'
                    }`} />
                    <h3 className="text-base font-black text-white">
                      Predictive Failure Risk: {equipment.maintenanceRisk.scorePercent}% ({equipment.maintenanceRisk.level} RISK)
                    </h3>
                  </div>
                  <p className="text-xs text-slate-400">
                    {equipment.maintenanceRisk.summary}
                  </p>
                </div>

                <button
                  onClick={() => onTriggerAiDiagnosis(equipment)}
                  disabled={aiDiagnosisLoading}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-400 hover:from-teal-400 hover:to-emerald-300 text-slate-950 font-black text-xs flex items-center gap-2 shadow-lg hover:scale-105 transition-all cursor-pointer disabled:opacity-50"
                >
                  <Sparkles className={`w-4 h-4 ${aiDiagnosisLoading ? 'animate-spin' : ''}`} />
                  <span>{aiDiagnosisLoading ? 'Analyzing Sensor Signals...' : 'Run Live Gemini BioMed Diagnosis'}</span>
                </button>
              </div>

              {/* AI Diagnosis Result if triggered */}
              {aiDiagnosisResult && (
                <div className="p-5 rounded-2xl bg-teal-950/70 border border-teal-500/50 space-y-3 animate-fadeIn">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-teal-300 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-teal-400" />
                      Gemini Clinical BioMed Diagnosis (Live Assessment)
                    </span>
                    <span className="text-[10px] font-bold text-teal-200 bg-teal-900 px-2 py-0.5 rounded-md">
                      Estimated Failure in {aiDiagnosisResult.estimatedDaysToFailureIfIgnored} days if neglected
                    </span>
                  </div>

                  <div className="space-y-2 text-xs text-slate-200">
                    <p><strong>Root Cause:</strong> {aiDiagnosisResult.rootCauseAnalysis}</p>
                    <p><strong>Recommended BioMed Action:</strong> {aiDiagnosisResult.recommendedAction}</p>
                    <div>
                      <strong className="text-teal-300 block mb-1">Preventive Engineering Protocol:</strong>
                      <ul className="list-disc pl-5 space-y-1 text-slate-300">
                        {aiDiagnosisResult.preventiveChecklist?.map((item: string, idx: number) => (
                          <li key={idx}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* Health Score Breakdown Matrix */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div className="p-4 rounded-xl bg-slate-800/70 border border-slate-700 space-y-1">
                  <span className="text-slate-400 font-semibold">Total Operating Hours</span>
                  <p className="text-xl font-black text-white">{equipment.totalUsageHours.toLocaleString()} hrs</p>
                  <span className="text-[10px] text-slate-400">Design Life: {equipment.designLifeHours.toLocaleString()} hrs</span>
                </div>

                <div className="p-4 rounded-xl bg-slate-800/70 border border-slate-700 space-y-1">
                  <span className="text-slate-400 font-semibold">Next Scheduled Service</span>
                  <p className="text-xl font-black text-amber-300">{equipment.nextMaintenanceDate}</p>
                  <span className="text-[10px] text-amber-400">Due in {equipment.maintenanceRisk.daysToRecommendedInspection} days</span>
                </div>

                <div className="p-4 rounded-xl bg-slate-800/70 border border-slate-700 space-y-1">
                  <span className="text-slate-400 font-semibold">Total Recorded Breakdowns</span>
                  <p className="text-xl font-black text-white">{equipment.failureCount} lifetime</p>
                  <span className="text-[10px] text-emerald-400">MTBF: 4,800 Operating Hours</span>
                </div>
              </div>

              {/* Service Logs */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-300">Maintenance &amp; Service History Logs</h4>
                <div className="space-y-2">
                  {equipment.maintenanceIntelligence?.records.map((rec) => (
                    <div key={rec.id} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white">{rec.type} Calibration</span>
                          <span className="text-[10px] text-slate-500 font-mono">{rec.date}</span>
                        </div>
                        <p className="text-slate-400 text-[11px] mt-0.5">{rec.description}</p>
                        <p className="text-[10px] text-slate-500">Tech: {rec.technician}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-emerald-400 font-bold">₹{rec.cost.toLocaleString()}</span>
                        <p className="text-[10px] text-slate-500">{rec.downtimeHours}h downtime</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* TAB 4: AI DEMAND FORECAST */}
          {activeTab === 'forecast' && (
            <div className="space-y-6">
              
              {/* Forecast Header Card */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-950 to-slate-900 border border-teal-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-teal-300 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-teal-400" />
                    AI Demand Forecast Matrix
                  </span>
                  <span className={`text-xs font-black px-2.5 py-0.5 rounded-md ${
                    equipment.aiForecast?.shortageRisk === 'HIGH'
                      ? 'bg-rose-950 text-rose-300 border border-rose-700'
                      : 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                  }`}>
                    SHORTAGE RISK: {equipment.aiForecast?.shortageRisk ?? 'LOW'}
                  </span>
                </div>

                <p className="text-sm font-bold text-slate-100">
                  {equipment.aiForecast?.insightSummary}
                </p>

                <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-teal-200">
                  <strong>Actionable Directive:</strong> {equipment.aiForecast?.recommendation}
                </div>
              </div>

              {/* Demand Projections Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 text-center">
                  <span className="text-slate-400">Today Baseline</span>
                  <p className="text-2xl font-black text-white mt-1">{equipment.aiForecast?.todayUsage ?? 85}%</p>
                </div>
                <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 text-center">
                  <span className="text-slate-400">Tomorrow Projection</span>
                  <p className="text-2xl font-black text-teal-300 mt-1">{equipment.aiForecast?.tomorrowPrediction ?? 88}%</p>
                </div>
                <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 text-center">
                  <span className="text-slate-400">Next 3 Days</span>
                  <p className="text-2xl font-black text-cyan-300 mt-1">{equipment.aiForecast?.next3DaysPrediction ?? 90}%</p>
                </div>
                <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 text-center">
                  <span className="text-slate-400">Peak Demand Window</span>
                  <p className="text-sm font-black text-amber-300 mt-2">{equipment.aiForecast?.peakHourWindow ?? '14:00 - 18:00'}</p>
                </div>
              </div>

            </div>
          )}

          {/* TAB 5: INDIVIDUAL FLEET UNITS */}
          {activeTab === 'fleet' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <h4 className="text-xs font-bold text-slate-300">
                  Physical Unit Assets &amp; Serial Number Inventory ({equipment.individualUnits?.length || 0} Units)
                </h4>
                <span className="text-[11px] text-slate-500">
                  Individual Asset Telemetry &amp; Location Tracking
                </span>
              </div>

              <div className="space-y-3">
                {equipment.individualUnits?.map((unit: IndividualUnit) => (
                  <div
                    key={unit.unitId}
                    className="p-4 rounded-2xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-black text-white">{unit.unitId}</span>
                        <span className="text-[10px] font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded-md border border-slate-800">
                          {unit.serialNumber}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                          unit.status === 'available'
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                            : unit.status === 'in_use'
                            ? 'bg-blue-950 text-blue-300 border border-blue-700'
                            : 'bg-amber-950 text-amber-300 border border-amber-700'
                        }`}>
                          {unit.status.toUpperCase().replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300">
                        {unit.model} &bull; Location: <strong className="text-slate-200">{unit.assignedLocation}</strong>
                      </p>
                      <p className="text-[11px] text-slate-400">
                        Telemetry: <strong className="text-teal-300">{unit.telemetryNote || 'Nominal operation'}</strong>
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right text-xs">
                        <span className="text-slate-400">Health: <strong className="text-white">{unit.healthScore}/100</strong></span>
                        <p className="text-[10px] text-slate-500">{unit.usageHours.toLocaleString()} runtime hrs</p>
                      </div>

                      {unit.status === 'available' ? (
                        <button
                          onClick={() => {
                            unit.status = 'in_use';
                            unit.currentPatientId = `PT-ALLOC-${Math.floor(1000 + Math.random() * 9000)}`;
                            onUpdateStatus(
                              equipment.equipmentId,
                              equipment.status,
                              Math.max(0, equipment.availableUnits - 1),
                              equipment.occupiedUnits + 1
                            );
                          }}
                          className="px-3.5 py-1.5 rounded-xl bg-teal-400 hover:bg-teal-300 text-slate-950 font-bold text-xs transition-all shadow-xs cursor-pointer"
                        >
                          Allocate
                        </button>
                      ) : unit.status === 'in_use' ? (
                        <button
                          onClick={() => {
                            unit.status = 'available';
                            unit.currentPatientId = undefined;
                            onUpdateStatus(
                              equipment.equipmentId,
                              equipment.status,
                              Math.min(equipment.totalUnits, equipment.availableUnits + 1),
                              Math.max(0, equipment.occupiedUnits - 1)
                            );
                          }}
                          className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition-all border border-slate-700 cursor-pointer"
                        >
                          Release
                        </button>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>

            </div>
          )}

        </div>

        {/* MODAL FOOTER */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <Radio className="w-3.5 h-3.5 text-teal-400" />
            <span>MediConnect Unified IoT Broker Active</span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold cursor-pointer"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};
