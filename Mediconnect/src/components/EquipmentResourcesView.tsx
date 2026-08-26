import React, { useState } from 'react';
import { 
  Wind, 
  Stethoscope, 
  Activity, 
  HeartPulse, 
  Cpu, 
  Scan, 
  Sparkles, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  ShieldAlert, 
  Wrench, 
  Layers, 
  BarChart3, 
  Sliders, 
  ArrowRight,
  TrendingUp
} from 'lucide-react';
import { 
  OxygenStatus, 
  OperationTheatre, 
  DialysisMachineData, 
  ECMOMachineData, 
  ICUWardData, 
  MRIScannerData, 
  CTScannerData 
} from '../types';
import { equipmentUtilizationComparisonData } from '../data/mockHospitalData';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';

interface EquipmentResourcesViewProps {
  oxygen: OxygenStatus;
  ots: OperationTheatre[];
  dialysis: DialysisMachineData;
  ecmo: ECMOMachineData;
  icuWards: ICUWardData[];
  mriScanners: MRIScannerData[];
  ctScanners: CTScannerData;
  onTransferOxygen: () => void;
  onAllocateVentilators: () => void;
}

export const EquipmentResourcesView: React.FC<EquipmentResourcesViewProps> = ({
  oxygen,
  ots,
  dialysis,
  ecmo,
  icuWards,
  mriScanners,
  ctScanners,
  onTransferOxygen,
  onAllocateVentilators,
}) => {
  const [selectedSubTab, setSelectedSubTab] = useState<'all' | 'oxygen' | 'ots' | 'dialysis' | 'ecmo' | 'icu-ventilators' | 'radiology' | 'analytics'>('all');
  const [ctAiPriorityActive, setCtAiPriorityActive] = useState<boolean>(true);
  const [oxygenTransferred, setOxygenTransferred] = useState<boolean>(false);

  // Aggregated Donut Chart Data
  const fleetStatusData = [
    { name: 'In Active Use', value: 168, color: '#2563eb' },
    { name: 'Available / Standby', value: 34, color: '#10b981' },
    { name: 'Under Maintenance', value: 12, color: '#f59e0b' },
  ];

  return (
    <div className="space-y-6">
      
      {/* Sub-navigation filter bar */}
      <div className="flex items-center space-x-1 sm:space-x-2 overflow-x-auto pb-2 scrollbar-none border-b border-slate-200">
        {[
          { id: 'all', label: 'All Equipment & Wards' },
          { id: 'oxygen', label: 'Oxygen Systems (68%)' },
          { id: 'ots', label: 'Operation Theatres (83%)' },
          { id: 'dialysis', label: 'Dialysis Units (80%)' },
          { id: 'ecmo', label: 'ECMO Critical (67%)' },
          { id: 'icu-ventilators', label: 'ICU & Ventilators (85%)' },
          { id: 'radiology', label: 'MRI & CT Scanners' },
          { id: 'analytics', label: 'Fleet Analytics Charts' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSelectedSubTab(tab.id as any)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${
              selectedSubTab === tab.id
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 1. OXYGEN SUPPLY SYSTEM */}
      {(selectedSubTab === 'all' || selectedSubTab === 'oxygen') && (
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div className="flex items-start space-x-3">
              <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-600">
                <Wind className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold uppercase text-blue-700 font-mono tracking-wider">
                    Medical Gas Plant Telemetry
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 font-mono">
                    High ICU Demand
                  </span>
                </div>
                <h3 className="text-lg font-extrabold text-slate-900 mt-0.5">
                  1. Central Cryogenic Oxygen Storage & Reserves
                </h3>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => {
                  setOxygenTransferred(true);
                  onTransferOxygen();
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition shadow-sm flex items-center space-x-1.5 ${
                  oxygenTransferred
                    ? 'bg-emerald-600 text-white cursor-default'
                    : 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{oxygenTransferred ? '12 Cylinders Dispatched to ICU B' : 'Transfer 12 Cylinders to ICU B'}</span>
              </button>
            </div>
          </div>

          {/* Oxygen Telemetry 4-Card Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
            <div className="p-4 rounded-xl bg-amber-50/50 border border-amber-200">
              <div className="text-xs font-bold text-amber-900">Current Storage Level</div>
              <div className="text-2xl font-extrabold text-amber-800 font-mono mt-1">{oxygen.currentLevelPercent}%</div>
              <div className="text-[10px] text-slate-500 mt-0.5 font-mono">{oxygen.currentUtilLiters}L / {oxygen.totalCapacityLiters}L</div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className="text-xs font-bold text-slate-600">Consumption Rate</div>
              <div className="text-2xl font-extrabold text-slate-900 font-mono mt-1">{oxygen.consumptionRatePerHourPercent}% <span className="text-xs font-normal text-slate-500">/ hour</span></div>
              <div className="text-[10px] text-red-600 font-semibold mt-0.5">+0.8% over morning rate</div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className="text-xs font-bold text-slate-600">Remaining Reserve</div>
              <div className="text-2xl font-extrabold text-slate-900 font-mono mt-1">{oxygen.remainingReserveLiters} L</div>
              <div className="text-[10px] text-slate-500 mt-0.5">High-Pressure Manifolds</div>
            </div>

            <div className="p-4 rounded-xl bg-red-50/50 border border-red-200">
              <div className="text-xs font-bold text-red-900">Est. Time to Critical</div>
              <div className="text-2xl font-extrabold text-red-600 font-mono mt-1">{oxygen.estimatedHoursToCritical} Hours</div>
              <div className="text-[10px] text-red-700 font-bold mt-0.5">Critical threshold: 23:00</div>
            </div>
          </div>

          {/* AI Recommendation Banner & 24h Trend Chart */}
          <div className="mt-4 p-3.5 bg-blue-900 text-white rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
              <div>
                <span className="font-bold text-cyan-300">AI Recommendation: </span>
                <span>"{oxygen.aiRecommendation}"</span>
              </div>
            </div>
            <span className="text-[10px] font-mono bg-blue-950 px-2 py-0.5 rounded text-cyan-200 shrink-0">
              Predicted demand +31% in 12h
            </span>
          </div>

          {/* 24-Hour Trend Chart */}
          <div className="mt-4 pt-3 border-t border-slate-100">
            <div className="text-xs font-bold text-slate-700 mb-2">24-Hour Oxygen Utilization & Reserve Level Forecast</div>
            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={oxygen.trend24h}>
                  <defs>
                    <linearGradient id="colorO2" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0284c7" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#0284c7" stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="hour" tick={{ fontSize: 10, fill: '#64748b' }} />
                  <YAxis tick={{ fontSize: 10, fill: '#64748b' }} domain={[0, 100]} unit="%" />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '11px' }} />
                  <Area type="monotone" dataKey="level" stroke="#0284c7" strokeWidth={2.5} fillOpacity={1} fill="url(#colorO2)" name="Reserve Level %" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* 2. OPERATION THEATRES (OTs) */}
      {(selectedSubTab === 'all' || selectedSubTab === 'ots') && (
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold uppercase text-blue-700 font-mono tracking-wider">
                  Surgical Suite Management
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800 font-mono">
                  83% Utilization
                </span>
              </div>
              <h3 className="text-lg font-extrabold text-slate-900 mt-0.5">
                2. Operation Theatres Fleet (12 Major Suites)
              </h3>
            </div>
            <div className="text-xs text-slate-500 font-mono">
              Total: <span className="font-bold text-slate-800">12</span> | Active: <span className="font-bold text-blue-600">8</span> | Avail: <span className="font-bold text-emerald-600">2</span> | Emergency Reserved: <span className="font-bold text-red-600">2</span>
            </div>
          </div>

          {/* AI Surgical Demand Insight */}
          <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start space-x-2">
            <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">AI Surgical Forecast: </span>
              "Surgical demand is expected to increase by 18% tomorrow. Consider rescheduling non-critical procedures or reserving additional OT capacity."
            </div>
          </div>

          {/* 12 OT Live Room Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mt-4">
            {ots.map((ot) => {
              const isActive = ot.status === 'active';
              const isReserved = ot.status === 'emergency_reserved';
              const isAvailable = ot.status === 'available';
              return (
                <div
                  key={ot.id}
                  className={`p-3 rounded-xl border transition ${
                    isActive
                      ? 'bg-blue-50/50 border-blue-200'
                      : isReserved
                      ? 'bg-red-50/50 border-red-200 ring-1 ring-red-300'
                      : 'bg-emerald-50/50 border-emerald-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-xs text-slate-900">{ot.name}</span>
                    <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded font-mono ${
                      isActive ? 'bg-blue-100 text-blue-800' : isReserved ? 'bg-red-100 text-red-800' : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {ot.status.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">{ot.specialty}</div>

                  {isActive && (
                    <div className="mt-2.5 pt-2 border-t border-slate-200/80 text-[11px]">
                      <div className="font-bold text-slate-800 truncate">{ot.currentProcedure}</div>
                      <div className="text-slate-500 text-[10px] flex justify-between mt-1">
                        <span>{ot.surgeon}</span>
                        <span className="font-mono font-bold text-blue-700">~{ot.minutesRemaining}m left</span>
                      </div>
                    </div>
                  )}

                  {isReserved && (
                    <div className="mt-2.5 pt-2 border-t border-red-200 text-[11px] font-semibold text-red-700">
                      Locked for STAT Trauma / Stroke Surgeries
                    </div>
                  )}

                  {isAvailable && (
                    <div className="mt-2.5 pt-2 border-t border-emerald-200 text-[11px] font-semibold text-emerald-700">
                      Cleaned & Sanitized — Ready for Immediate Case
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. DIALYSIS MACHINES & 4. ECMO MACHINES */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* 3. Dialysis Machines */}
        {(selectedSubTab === 'all' || selectedSubTab === 'dialysis') && (
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold uppercase text-blue-700 font-mono">Nephrology Fleet</span>
                  </div>
                  <h3 className="text-base font-extrabold text-slate-900 mt-0.5">
                    3. Dialysis Machine Telemetry & Schedule
                  </h3>
                </div>
                <span className="text-xs font-bold font-mono px-2 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200">
                  {dialysis.utilizationPercent}% Utilized
                </span>
              </div>

              {/* Stats Bar */}
              <div className="grid grid-cols-4 gap-2 mt-4 text-center">
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                  <div className="text-[10px] text-slate-500 font-semibold">Total</div>
                  <div className="text-lg font-bold font-mono text-slate-900">{dialysis.total}</div>
                </div>
                <div className="p-2.5 rounded-lg bg-blue-50 border border-blue-200">
                  <div className="text-[10px] text-blue-700 font-semibold">In Use</div>
                  <div className="text-lg font-bold font-mono text-blue-800">{dialysis.inUse}</div>
                </div>
                <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200">
                  <div className="text-[10px] text-emerald-700 font-semibold">Available</div>
                  <div className="text-lg font-bold font-mono text-emerald-800">{dialysis.available}</div>
                </div>
                <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200">
                  <div className="text-[10px] text-amber-700 font-semibold">Maint.</div>
                  <div className="text-lg font-bold font-mono text-amber-800">{dialysis.maintenance}</div>
                </div>
              </div>

              {/* Machine Availability Timeline */}
              <div className="mt-4 space-y-2">
                <div className="text-xs font-bold text-slate-700">Future Machine Availability Slots (Next Cycles)</div>
                <div className="max-h-48 overflow-y-auto divide-y divide-slate-100 border border-slate-200 rounded-xl">
                  {dialysis.scheduleSlots.slice(0, 5).map((slot, idx) => (
                    <div key={idx} className="p-2.5 text-xs flex items-center justify-between bg-slate-50/50">
                      <div>
                        <span className="font-bold text-slate-800">{slot.machineId}</span>
                        <span className="text-slate-500 ml-2">Patient: {slot.patientId}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-[10px] text-slate-500">{slot.timeSlot}</span>
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          slot.status === 'In-Progress' ? 'bg-blue-100 text-blue-800' : slot.status === 'Available' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {slot.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500 flex justify-between items-center">
              <span>Upcoming regular appointments: <span className="font-bold text-slate-800">{dialysis.upcomingAppointments}</span></span>
              <span className="text-amber-600 font-semibold">Morning deficit forecast active</span>
            </div>
          </div>
        )}

        {/* 4. ECMO Machines */}
        {(selectedSubTab === 'all' || selectedSubTab === 'ecmo') && (
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold uppercase text-red-600 font-mono">Ultra-Critical Life Support</span>
                  </div>
                  <h3 className="text-base font-extrabold text-slate-900 mt-0.5">
                    4. ECMO Machine Prioritization & Queue
                  </h3>
                </div>
                <span className="text-xs font-bold font-mono px-2 py-0.5 rounded bg-red-100 text-red-800 border border-red-300 animate-pulse">
                  Only 1 Avail / 6
                </span>
              </div>

              {/* Critical Alert Box */}
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-900">
                <div className="flex items-center space-x-1.5 font-bold mb-0.5">
                  <ShieldAlert className="w-4 h-4 text-red-600" />
                  <span>Critical ECMO Alert:</span>
                </div>
                "Critical Alert: Only 1 ECMO machine remains available. Two high-risk cases are predicted within the next 12 hours."
              </div>

              {/* High-Priority Demand Queue */}
              <div className="mt-4 space-y-2">
                <div className="text-xs font-bold text-slate-700">AI Priority Allocation Queue</div>
                {ecmo.highPriorityQueue.map((item, idx) => (
                  <div key={idx} className="p-3 rounded-xl border border-red-200 bg-red-50/40 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-red-950">{item.patientId} • {item.condition}</div>
                      <div className="text-[10px] text-slate-500 font-mono">Est. Run: {item.estNeedHours}h • Acuity: {item.acuity}</div>
                    </div>
                    <div className="text-right">
                      <span className="font-mono font-extrabold text-red-700 text-sm">{item.matchScore}% Match</span>
                      <div className="text-[10px] text-slate-400">AI Score</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* ECMO Units fleet table */}
              <div className="mt-4 text-xs space-y-1.5">
                <div className="text-[11px] font-bold text-slate-500 uppercase">Current 6 ECMO Units</div>
                <div className="grid grid-cols-2 gap-2">
                  {ecmo.units.map(u => (
                    <div key={u.id} className="p-2 rounded-lg bg-slate-50 border border-slate-200 text-[11px] flex justify-between">
                      <span className="font-semibold text-slate-800">{u.name}</span>
                      <span className={`px-1.5 py-0.2 rounded text-[10px] font-mono ${
                        u.status === 'In-Use' ? 'bg-blue-100 text-blue-800' : u.status === 'Available' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'
                      }`}>{u.status}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        )}

      </div>

      {/* 5. ICU RESOURCE MANAGEMENT & VENTILATORS */}
      {(selectedSubTab === 'all' || selectedSubTab === 'icu-ventilators') && (
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold uppercase text-blue-700 font-mono tracking-wider">
                  Critical Care Command
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-800 font-mono">
                  85% Ventilators Active
                </span>
              </div>
              <h3 className="text-lg font-extrabold text-slate-900 mt-0.5">
                5. ICU Ward Resource Heatmap & Ventilator Fleet
              </h3>
            </div>
            <button
              onClick={onAllocateVentilators}
              className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition"
            >
              Allocate 4 Ventilators to ICU A
            </button>
          </div>

          {/* Ventilator Fleet Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <div className="text-xs font-bold text-slate-600">Total Ventilators</div>
              <div className="text-2xl font-extrabold text-slate-900 font-mono mt-1">40 Units</div>
              <div className="text-[10px] text-slate-500">Servo-u & Hamilton G5</div>
            </div>
            <div className="p-3.5 rounded-xl bg-red-50/40 border border-red-200">
              <div className="text-xs font-bold text-red-900">In Active Use</div>
              <div className="text-2xl font-extrabold text-red-700 font-mono mt-1">34 Units</div>
              <div className="text-[10px] text-red-600 font-semibold">85% Fleet Utilization</div>
            </div>
            <div className="p-3.5 rounded-xl bg-emerald-50/40 border border-emerald-200">
              <div className="text-xs font-bold text-emerald-900">Available Standby</div>
              <div className="text-2xl font-extrabold text-emerald-700 font-mono mt-1">4 Units</div>
              <div className="text-[10px] text-emerald-600">Ready for acute admissions</div>
            </div>
            <div className="p-3.5 rounded-xl bg-amber-50/40 border border-amber-200">
              <div className="text-xs font-bold text-amber-900">Biomedical Maintenance</div>
              <div className="text-2xl font-extrabold text-amber-700 font-mono mt-1">2 Units</div>
              <div className="text-[10px] text-slate-500">Routine calibration</div>
            </div>
          </div>

          {/* ICU Ward Heatmap Cards */}
          <div className="mt-5">
            <div className="text-xs font-bold text-slate-700 mb-3">ICU Ward Resource Heatmap (Occupancy vs Ventilator Utilization)</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {icuWards.map(ward => (
                <div
                  key={ward.id}
                  className={`p-4 rounded-xl border ${
                    ward.riskLevel === 'Critical'
                      ? 'bg-red-50 border-red-300 ring-2 ring-red-400'
                      : ward.riskLevel === 'Moderate'
                      ? 'bg-amber-50 border-amber-300'
                      : 'bg-emerald-50 border-emerald-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-900">{ward.name}</span>
                    <span className={`text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded font-mono ${
                      ward.riskLevel === 'Critical' ? 'bg-red-200 text-red-900' : ward.riskLevel === 'Moderate' ? 'bg-amber-200 text-amber-900' : 'bg-emerald-200 text-emerald-900'
                    }`}>
                      {ward.riskLevel}
                    </span>
                  </div>

                  <div className="mt-3 space-y-2 text-xs">
                    <div>
                      <div className="flex justify-between text-[11px] text-slate-600">
                        <span>Bed Occupancy</span>
                        <span className="font-bold font-mono">{ward.occupancyPercent}% ({ward.occupiedBeds}/{ward.totalBeds})</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2 mt-1 overflow-hidden">
                        <div className={`h-2 rounded-full ${ward.occupancyPercent > 85 ? 'bg-red-500' : 'bg-blue-600'}`} style={{ width: `${ward.occupancyPercent}%` }}></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-[11px] text-slate-600">
                        <span>Ventilators</span>
                        <span className="font-bold font-mono">{ward.ventilatorUsagePercent}% ({ward.ventilatorsInUse}/{ward.ventilatorsTotal})</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2 mt-1 overflow-hidden">
                        <div className={`h-2 rounded-full ${ward.ventilatorUsagePercent > 80 ? 'bg-red-500' : 'bg-emerald-500'}`} style={{ width: `${ward.ventilatorUsagePercent}%` }}></div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-slate-200 text-[10px] text-slate-600 flex justify-between font-mono">
                    <span>Monitors: {ward.patientMonitorsActive}</span>
                    <span>Reserves: {ward.emergencyReserves}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 6. MRI & 7. CT SCAN RADIOLOGY MODALITIES */}
      {(selectedSubTab === 'all' || selectedSubTab === 'radiology') && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* 6. MRI Machines */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <span className="text-xs font-bold uppercase text-blue-700 font-mono">Radiology / MRI Center</span>
                  <h3 className="text-base font-extrabold text-slate-900 mt-0.5">6. MRI Scanner Fleet (3 Scanners)</h3>
                </div>
                <span className="text-xs font-bold font-mono px-2 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200">
                  82% Utilization
                </span>
              </div>

              {/* AI Insight Box */}
              <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start space-x-2">
                <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">AI Radiologic Insight: </span>
                  "MRI waiting time is predicted to exceed 2.5 hours between 2 PM and 6 PM."
                </div>
              </div>

              {/* MRI 1, 2, 3 details */}
              <div className="mt-4 space-y-3">
                {mriScanners.map(mri => (
                  <div key={mri.id} className="p-3 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-slate-900">{mri.name}</div>
                      <div className="text-[11px] text-slate-500">
                        {mri.status === 'Operational' ? `Queue: ${mri.currentQueue} pts • Est. Wait: ${mri.estimatedWaitMinutes}m` : mri.maintenanceSchedule}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                        mri.status === 'Operational' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {mri.status} ({mri.utilizationPercent}%)
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 7. CT Scan Machines */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <span className="text-xs font-bold uppercase text-blue-700 font-mono">Radiology / CT Trauma Suite</span>
                  <h3 className="text-base font-extrabold text-slate-900 mt-0.5">7. CT Scan Machines & Prioritization</h3>
                </div>
                <span className="text-xs font-bold font-mono px-2 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200">
                  {ctScanners.utilizationPercent}% Utilized
                </span>
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-3 gap-2 mt-4 text-center text-xs">
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="text-slate-500 text-[10px]">Total Scanners</span>
                  <div className="text-lg font-bold font-mono text-slate-900">{ctScanners.total} (3 Active, 1 Avail)</div>
                </div>
                <div className="p-2.5 rounded-lg bg-red-50 border border-red-200">
                  <span className="text-red-700 text-[10px]">Emergency Queue</span>
                  <div className="text-lg font-bold font-mono text-red-700">{ctScanners.emergencyQueue} patients</div>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="text-slate-500 text-[10px]">Average Wait</span>
                  <div className="text-lg font-bold font-mono text-slate-900">{ctScanners.averageWaitMinutes} mins</div>
                </div>
              </div>

              {/* AI Emergency Prioritization Toggle */}
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-blue-900 flex items-center space-x-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                    <span>AI Emergency Prioritization</span>
                  </div>
                  <p className="text-[11px] text-blue-800 mt-0.5">
                    Automatically preempts routine scans when acute stroke/trauma arrives.
                  </p>
                </div>
                <button
                  onClick={() => setCtAiPriorityActive(!ctAiPriorityActive)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                    ctAiPriorityActive ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {ctAiPriorityActive ? 'ENABLED' : 'MANUAL'}
                </button>
              </div>

              {/* CT Scanners List */}
              <div className="mt-4 space-y-2">
                {ctScanners.scanners.map(s => (
                  <div key={s.id} className="p-2.5 rounded-lg border border-slate-200 bg-slate-50/60 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-slate-800">{s.name}</span>
                      {s.currentScan && <span className="text-[10px] text-slate-500 block truncate max-w-[200px]">{s.currentScan}</span>}
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                      s.status === 'Active' ? 'bg-blue-100 text-blue-800' : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {s.status} (Queue: {s.queueCount})
                    </span>
                  </div>
                ))}
              </div>

            </div>
          </div>

        </div>
      )}

      {/* 8. EQUIPMENT UTILIZATION ANALYTICS CHARTS */}
      {(selectedSubTab === 'all' || selectedSubTab === 'analytics') && (
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center space-x-2">
                <BarChart3 className="w-4 h-4 text-blue-600" />
                <span className="text-xs font-bold uppercase text-blue-700 font-mono tracking-wider">
                  Modality Benchmarks
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-extrabold text-slate-900 mt-0.5">
                Critical Equipment Utilization Analytics
              </h3>
            </div>
            <span className="text-xs text-slate-500">Live Hospital Fleet Telemetry</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-5">
            {/* Bar chart for current utilization across 8 modalities */}
            <div className="lg:col-span-2">
              <div className="text-xs font-bold text-slate-700 mb-2">Fleet-Wide Utilization by Equipment Category (%)</div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={equipmentUtilizationComparisonData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                    <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10, fill: '#64748b' }} unit="%" />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#1e293b' }} width={130} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '11px' }} />
                    <Bar dataKey="utilization" fill="#2563eb" radius={[0, 4, 4, 0]} name="Utilization %" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Donut Chart: Available vs In Use vs Maintenance */}
            <div className="flex flex-col items-center justify-center p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div className="text-xs font-bold text-slate-700 mb-2">Fleet Availability Distribution</div>
              <div className="h-44 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={fleetStatusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={65}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {fleetStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '11px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-wrap justify-center gap-3 text-xs mt-2">
                {fleetStatusData.map(item => (
                  <div key={item.name} className="flex items-center space-x-1.5 text-[11px] font-medium text-slate-700">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></span>
                    <span>{item.name}: <strong className="font-mono">{item.value}</strong></span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
