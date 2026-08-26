import React, { useState } from 'react';
import { 
  GitFork, 
  Activity, 
  Clock, 
  AlertTriangle, 
  Sparkles, 
  ArrowRight, 
  BedDouble, 
  Ambulance, 
  Stethoscope, 
  CheckCircle2, 
  TrendingUp, 
  Search, 
  Filter, 
  ShieldAlert, 
  SlidersHorizontal,
  RefreshCw,
  UserCheck,
  Send,
  Zap
} from 'lucide-react';
import { 
  PatientJourneyStage, 
  TriagePatient, 
  DischargeCandidate, 
  TransportTask, 
  TriageCategory 
} from '../types';
import { hourlyPredictedEDArrivals, mlFactors } from '../data/mockHospitalData';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart, 
  Line,
  Area,
  AreaChart
} from 'recharts';

interface PatientFlowViewProps {
  journeyStages: PatientJourneyStage[];
  triagePatients: TriagePatient[];
  dischargeCandidates: DischargeCandidate[];
  transportTasks: TransportTask[];
  onTriagePatientAction: (id: string, newStatus: string) => void;
  onExpediteDischarge: (patientId: string) => void;
}

export const PatientFlowView: React.FC<PatientFlowViewProps> = ({
  journeyStages,
  triagePatients,
  dischargeCandidates,
  transportTasks,
  onTriagePatientAction,
  onExpediteDischarge,
}) => {
  const [triageFilter, setTriageFilter] = useState<string>('All');
  const [patientSearch, setPatientSearch] = useState<string>('');
  const [showMlModal, setShowMlModal] = useState<boolean>(false);
  const [selectedPatient, setSelectedPatient] = useState<TriagePatient | null>(null);

  // Triage count categories
  const triageStats = {
    Critical: 8,
    HighPriority: 17,
    Moderate: 26,
    LowPriority: 16,
  };

  const filteredPatients = triagePatients.filter(patient => {
    const matchesCategory = 
      triageFilter === 'All' || 
      (triageFilter === 'Critical' && patient.triageCategory === 'Critical') ||
      (triageFilter === 'High' && patient.triageCategory === 'High Priority') ||
      (triageFilter === 'Moderate' && patient.triageCategory === 'Moderate') ||
      (triageFilter === 'Low' && patient.triageCategory === 'Low Priority');

    const matchesSearch = 
      patient.id.toLowerCase().includes(patientSearch.toLowerCase()) ||
      patient.chiefComplaint.toLowerCase().includes(patientSearch.toLowerCase()) ||
      patient.recommendedDepartment.toLowerCase().includes(patientSearch.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6">
      
      {/* AI Surge Alert Banner */}
      <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-red-600 text-white rounded-2xl p-4 sm:p-5 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4 border border-amber-400">
        <div className="flex items-start space-x-3.5">
          <div className="p-2.5 rounded-xl bg-white/20 backdrop-blur border border-white/30 text-white shrink-0 mt-0.5">
            <Sparkles className="w-6 h-6 text-yellow-200 animate-spin" style={{ animationDuration: '6s' }} />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider rounded bg-white text-orange-900 font-mono">
                Predictive Surge Forecast
              </span>
              <span className="text-xs font-semibold text-amber-100">8 - 24 Hours Lead Time</span>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-white mt-1 leading-snug">
              AI Alert: A 24% increase in emergency admissions is predicted between 6 PM and 11 PM. Additional ICU capacity and emergency resources may be required.
            </h3>
            <p className="text-xs text-amber-100 mt-1">
              Model inputs: Temperature drop (16°C), Festival traffic surge, and 5-year Tuesday epidemiological baseline.
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowMlModal(true)}
          className="self-start md:self-center px-4 py-2 rounded-xl bg-white hover:bg-amber-50 text-orange-900 text-xs font-extrabold transition shadow-md whitespace-nowrap"
        >
          View ML Forecast Factors
        </button>
      </div>

      {/* Visual Patient Journey Flow with Continuous Feedback Loop */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded bg-blue-100 text-blue-800 font-mono">
                End-to-End Workflow
              </span>
              <span className="text-xs text-slate-500 font-mono">Closed-Loop Bed Feedback Active</span>
            </div>
            <h2 className="text-lg font-extrabold text-slate-900 mt-1">
              Visual Patient Journey & Bottleneck Detection
            </h2>
          </div>
          <div className="flex items-center space-x-2 text-xs text-slate-600">
            <span className="flex items-center"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500 mr-1"></span> Normal</span>
            <span className="flex items-center"><span className="w-2.5 h-2.5 rounded-full bg-amber-500 mr-1"></span> Warning</span>
            <span className="flex items-center"><span className="w-2.5 h-2.5 rounded-full bg-red-500 mr-1"></span> Bottleneck</span>
          </div>
        </div>

        {/* The 5-stage sequential journey pipeline */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 mt-5 relative">
          {journeyStages.map((stage, idx) => {
            const isBottleneck = stage.status === 'bottleneck';
            const isWarning = stage.status === 'warning';
            return (
              <div
                key={stage.id}
                className={`p-4 rounded-xl border relative transition-all ${
                  isBottleneck
                    ? 'bg-red-50/60 border-red-300 shadow-sm ring-1 ring-red-400'
                    : isWarning
                    ? 'bg-amber-50/60 border-amber-300'
                    : 'bg-slate-50/90 border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-bold font-mono text-slate-500">STAGE 0{idx + 1}</span>
                  <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded font-mono ${
                    isBottleneck ? 'bg-red-200 text-red-900' : isWarning ? 'bg-amber-200 text-amber-900' : 'bg-emerald-100 text-emerald-900'
                  }`}>
                    {stage.status}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-slate-900">{stage.name}</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">{stage.subtitle}</p>

                <div className="mt-3 pt-2.5 border-t border-slate-200/80 flex items-center justify-between">
                  <div>
                    <span className="text-xl font-extrabold text-slate-900 font-mono">{stage.activePatients}</span>
                    <span className="text-[10px] text-slate-500 ml-1">in queue</span>
                  </div>
                  <div className="text-[11px] font-mono text-slate-600 flex items-center">
                    <Clock className="w-3 h-3 mr-1 text-slate-400" />
                    {stage.avgDurationMinutes}m avg
                  </div>
                </div>

                <div className={`mt-2.5 text-[10px] font-medium p-1.5 rounded ${
                  isBottleneck ? 'bg-red-100/80 text-red-900' : isWarning ? 'bg-amber-100/80 text-amber-900' : 'bg-slate-100 text-slate-700'
                }`}>
                  {stage.statusText}
                </div>
              </div>
            );
          })}
        </div>

        {/* Continuous Feedback Loop Visualization Bar */}
        <div className="mt-4 p-3 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-2">
            <RefreshCw className="w-4 h-4 text-cyan-400 animate-spin" style={{ animationDuration: '10s' }} />
            <span className="font-semibold text-slate-200">
              Continuous Capacity Feedback Loop:
            </span>
            <span className="text-cyan-300">
              Discharge clearance automatically unlocks ICU bed step-downs and relieves ED intake pressure.
            </span>
          </div>
          <span className="text-[11px] font-mono bg-blue-950/80 px-2.5 py-1 rounded border border-blue-700 text-cyan-200 shrink-0">
            Current Loop Efficiency: 94.2%
          </span>
        </div>
      </div>

      {/* Hourly Predicted ED Arrivals Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Predicted Arrival Horizons */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold uppercase text-indigo-600 font-mono tracking-wider">
                  Emergency Demand Forecast
                </span>
              </div>
              <h3 className="text-base font-extrabold text-slate-900 mt-0.5">
                Hourly Predicted ED Arrivals (Next 4, 8, 12, 24 Hours)
              </h3>
            </div>
            <span className="text-xs text-slate-500 font-mono">Confidence Level: 96.4%</span>
          </div>

          {/* 4 Horizon Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
            {hourlyPredictedEDArrivals.map((h, i) => (
              <div key={i} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-indigo-300 transition">
                <div className="text-[11px] font-bold text-slate-500">{h.hourLabel}</div>
                <div className="text-2xl font-extrabold text-indigo-950 font-mono mt-1">{h.arrivals} <span className="text-xs font-normal text-slate-500">patients</span></div>
                <div className="text-[10px] text-red-600 font-semibold mt-1">~{h.highAcuity} High Acuity</div>
                <div className="text-[9px] text-slate-400 mt-1 font-mono">{h.timeRange}</div>
              </div>
            ))}
          </div>

          {/* Chart of Predicted Arrivals */}
          <div className="mt-5 h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={hourlyPredictedEDArrivals}>
                <defs>
                  <linearGradient id="colorArrivals" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="hourLabel" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="arrivals" stroke="#2563eb" strokeWidth={2.5} fillOpacity={1} fill="url(#colorArrivals)" name="Predicted Patients" />
                <Line type="monotone" dataKey="highAcuity" stroke="#dc2626" strokeWidth={2} dot={{ r: 4 }} name="High Acuity / Critical" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right 1 Col: Adaptive Patient Transport Logistics & Bottleneck */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <Ambulance className="w-4 h-4 text-blue-600" />
                <h3 className="text-base font-bold text-slate-900">Adaptive Transport & Flow</h3>
              </div>
              <span className="text-[10px] font-mono bg-red-100 text-red-800 px-1.5 py-0.5 rounded font-bold">
                1 Bottleneck
              </span>
            </div>

            {/* Emergency Dept to ICU Bottleneck Callout */}
            <div className="mt-4 p-3.5 rounded-xl bg-red-50 border border-red-200">
              <div className="flex items-center justify-between text-xs font-bold text-red-900 mb-1">
                <span>Bottleneck: ED → ICU Transfer</span>
                <span className="bg-red-200 text-red-900 px-1.5 py-0.5 rounded font-mono text-[10px]">Delay: 42 min</span>
              </div>
              <div className="text-xs text-red-800 mt-1">
                <span className="font-semibold">Current Waiting Patients: 7</span>
              </div>
              <div className="mt-2.5 p-2 bg-white/90 rounded-lg border border-red-200 text-[11px] text-slate-700 leading-snug">
                <span className="font-bold text-red-700">AI Recommendation: </span>
                "Allocate available capacity from ICU B or prioritize discharge of eligible patients to free additional beds."
              </div>
            </div>

            {/* Other Active Transport Tasks */}
            <div className="mt-3 space-y-2 text-xs">
              <div className="text-[11px] font-bold text-slate-500 uppercase">Active Logistics Queues</div>
              {transportTasks.map((t) => (
                <div key={t.id} className="p-2.5 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-slate-800">{t.patientId}: {t.fromLocation} → {t.toLocation}</div>
                    <div className="text-[10px] text-slate-500">Wait: {t.predictedDelayMinutes} min • {t.urgency}</div>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                    t.status === 'Delayed' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {t.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* AI-Enabled Triage Scoring Section */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded bg-cyan-100 text-cyan-800 font-mono">
                ML Triage Classification
              </span>
              <span className="text-xs text-slate-500">Total Active In-Queue: 67 Patients</span>
            </div>
            <h3 className="text-lg font-extrabold text-slate-900 mt-1">
              AI-Enabled Triage Scoring & Priority Routing
            </h3>
          </div>

          {/* Triage Category Filter Pills */}
          <div className="flex items-center flex-wrap gap-2">
            <button
              onClick={() => setTriageFilter('All')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                triageFilter === 'All' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All (67)
            </button>
            <button
              onClick={() => setTriageFilter('Critical')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1 ${
                triageFilter === 'Critical' ? 'bg-red-600 text-white' : 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200'
              }`}
            >
              <span>Critical</span>
              <span className="bg-white/30 px-1 rounded text-[10px] ml-1">{triageStats.Critical}</span>
            </button>
            <button
              onClick={() => setTriageFilter('High')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1 ${
                triageFilter === 'High' ? 'bg-amber-600 text-white' : 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200'
              }`}
            >
              <span>High Priority</span>
              <span className="bg-white/30 px-1 rounded text-[10px] ml-1">{triageStats.HighPriority}</span>
            </button>
            <button
              onClick={() => setTriageFilter('Moderate')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1 ${
                triageFilter === 'Moderate' ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200'
              }`}
            >
              <span>Moderate</span>
              <span className="bg-white/30 px-1 rounded text-[10px] ml-1">{triageStats.Moderate}</span>
            </button>
            <button
              onClick={() => setTriageFilter('Low')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1 ${
                triageFilter === 'Low' ? 'bg-slate-700 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300'
              }`}
            >
              <span>Low Priority</span>
              <span className="bg-white/30 px-1 rounded text-[10px] ml-1">{triageStats.LowPriority}</span>
            </button>
          </div>
        </div>

        {/* Triage Search & Filters */}
        <div className="mt-4 flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={patientSearch}
              onChange={(e) => setPatientSearch(e.target.value)}
              placeholder="Search by Patient ID (e.g. P-1042), complaint, or department..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Triage Patient Cards / Table */}
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-600 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
                <th className="py-2.5 px-3">Patient ID</th>
                <th className="py-2.5 px-3">AI Priority Score</th>
                <th className="py-2.5 px-3">Risk Level</th>
                <th className="py-2.5 px-3">Chief Complaint & Vitals</th>
                <th className="py-2.5 px-3">Recommended Dept</th>
                <th className="py-2.5 px-3">Required Resources</th>
                <th className="py-2.5 px-3">Est. Wait</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPatients.map((pt) => {
                const isCritical = pt.triageCategory === 'Critical';
                const isHigh = pt.triageCategory === 'High Priority';
                return (
                  <tr 
                    key={pt.id}
                    className={`hover:bg-slate-50/80 transition ${
                      isCritical ? 'bg-red-50/30' : isHigh ? 'bg-amber-50/20' : ''
                    }`}
                  >
                    <td className="py-3 px-3 font-mono font-bold text-slate-900 whitespace-nowrap">
                      {pt.id}
                      <span className="block text-[10px] text-slate-400 font-normal">{pt.age}y / {pt.gender}</span>
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <div className="flex items-center space-x-1.5">
                        <span className={`font-mono font-extrabold text-sm ${
                          pt.aiPriorityScore >= 90 ? 'text-red-600' : pt.aiPriorityScore >= 75 ? 'text-amber-600' : 'text-blue-600'
                        }`}>
                          {pt.aiPriorityScore}/100
                        </span>
                        <div className="w-12 bg-slate-200 rounded-full h-1.5 overflow-hidden">
                          <div 
                            className={`h-1.5 rounded-full ${pt.aiPriorityScore >= 90 ? 'bg-red-500' : pt.aiPriorityScore >= 75 ? 'bg-amber-500' : 'bg-blue-500'}`}
                            style={{ width: `${pt.aiPriorityScore}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold font-mono uppercase ${
                        isCritical
                          ? 'bg-red-100 text-red-800 border border-red-300'
                          : isHigh
                          ? 'bg-amber-100 text-amber-800 border border-amber-300'
                          : pt.triageCategory === 'Moderate'
                          ? 'bg-blue-100 text-blue-800 border border-blue-200'
                          : 'bg-slate-100 text-slate-700'
                      }`}>
                        {pt.triageCategory}
                      </span>
                    </td>
                    <td className="py-3 px-3 max-w-[220px]">
                      <div className="font-semibold text-slate-800 truncate" title={pt.chiefComplaint}>{pt.chiefComplaint}</div>
                      <div className="text-[10px] font-mono text-slate-500 mt-0.5">
                        HR: {pt.vitals.hr} | BP: {pt.vitals.bp} | SpO2: {pt.vitals.spo2}%
                      </div>
                    </td>
                    <td className="py-3 px-3 font-semibold text-blue-900 whitespace-nowrap">
                      {pt.recommendedDepartment}
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex flex-wrap gap-1">
                        {pt.requiredResources.map((res, i) => (
                          <span key={i} className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 text-[10px] text-slate-700 whitespace-nowrap">
                            {res}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap font-mono text-slate-700">
                      {pt.estimatedWaitingMinutes === 0 ? (
                        <span className="font-bold text-red-600 bg-red-100 px-1.5 py-0.5 rounded text-[10px]">STAT / 0m</span>
                      ) : (
                        `${pt.estimatedWaitingMinutes} mins`
                      )}
                    </td>
                    <td className="py-3 px-3 text-right whitespace-nowrap">
                      <button
                        onClick={() => onTriagePatientAction(pt.id, 'Admitted')}
                        className={`px-2.5 py-1 rounded text-[11px] font-bold transition ${
                          isCritical
                            ? 'bg-red-600 hover:bg-red-700 text-white shadow-sm'
                            : 'bg-blue-600 hover:bg-blue-700 text-white'
                        }`}
                      >
                        {isCritical ? 'Direct ICU Admit' : 'Route to Ward'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Automated Discharge Planning Section */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded bg-emerald-100 text-emerald-800 font-mono">
                Bed Turnover Optimization
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-extrabold text-slate-900 mt-0.5">
              Automated Discharge Planning & Capacity Liberation
            </h3>
          </div>
          <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold">
            AI Insight: Completing the pending discharge procedures could increase available bed capacity by 11%.
          </div>
        </div>

        {/* Discharge Metrics 3-Pack */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-xs font-semibold text-slate-500">Predicted Discharges Today</span>
            <div className="text-2xl font-extrabold text-slate-900 font-mono mt-1">14 patients</div>
            <span className="text-[11px] text-emerald-600 font-medium">On track for release</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-xs font-semibold text-slate-500">Beds Expected Free by 6 PM</span>
            <div className="text-2xl font-extrabold text-emerald-700 font-mono mt-1">8 beds</div>
            <span className="text-[11px] text-slate-500">Ahead of evening ED surge</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-xs font-semibold text-slate-500">Awaiting Final Lab/Test Clearance</span>
            <div className="text-2xl font-extrabold text-amber-700 font-mono mt-1">5 patients</div>
            <span className="text-[11px] text-amber-600 font-medium">Expedited lab tag attached</span>
          </div>
        </div>

        {/* Discharge Candidates List */}
        <div className="mt-5 space-y-2.5">
          <div className="text-xs font-bold uppercase text-slate-500 tracking-wider">Eligible Discharge Pipeline</div>
          {dischargeCandidates.map((dc) => (
            <div key={dc.patientId} className="p-3 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-slate-50 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold font-mono text-xs">
                  {dc.bedNumber.replace('Bed ', '')}
                </div>
                <div>
                  <div className="font-bold text-slate-900">{dc.patientId} • {dc.diagnosis}</div>
                  <div className="text-[11px] text-slate-500">{dc.ward} • Expected: {dc.predictedDischargeTime}</div>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-200 text-slate-700">
                    Pending: {dc.pendingRequirements.join(', ')}
                  </span>
                </div>
                <button
                  onClick={() => onExpediteDischarge(dc.patientId)}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition whitespace-nowrap"
                >
                  Expedite Clearance
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ML Forecast Factors Modal */}
      {showMlModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-bold text-slate-900">Machine Learning Admission Surge Model Factors</h3>
              </div>
              <button onClick={() => setShowMlModal(false)} className="text-slate-400 hover:text-slate-600 text-lg font-bold">×</button>
            </div>
            <p className="text-xs text-slate-600 mt-2">
              The MediConnect ML Engine correlates real-time hospital parameters and regional variables to forecast patient surges 8 to 24 hours in advance.
            </p>

            <div className="mt-4 divide-y divide-slate-100">
              {mlFactors.map((factor, i) => (
                <div key={i} className="py-2.5 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-bold text-slate-800">{factor.name}</div>
                    <div className="text-[11px] text-slate-500">{factor.trend}</div>
                  </div>
                  <div className="text-right">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                      Weight: {factor.weight} (r={factor.correlation})
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5 pt-3 border-t border-slate-200 text-right">
              <button
                onClick={() => setShowMlModal(false)}
                className="px-4 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-slate-800"
              >
                Close Factors Matrix
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
