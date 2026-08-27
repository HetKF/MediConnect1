import React, { useState, useEffect } from 'react';
import { 
  Building2, BedDouble, Activity, Siren, CheckCircle2, Clock, 
  MapPin, LogOut, ShieldCheck, Radio, AlertTriangle, Layers, 
  Search, Sparkles, Flame, TrendingUp, Zap, Cpu, Users, Bell, 
  Check, ChevronRight, FileText, Filter, RefreshCw, X, Stethoscope, 
  Wind, Scale, Wrench, Eye
} from 'lucide-react';
import { AuthUser, Hospital, Ambulance, HospitalEquipment, EquipmentAlert } from '../types';
import { MediConnectLogo } from './MediConnectLogo';
import { initialEquipmentList, initialEquipmentAlerts } from '../data/mockHospitalEquipment';
import { SimulatedIotToolbar } from './hospital/SimulatedIotToolbar';
import { EquipmentIntelligenceTab } from './hospital/EquipmentIntelligenceTab';
import { EquipmentDetailModal } from './hospital/EquipmentDetailModal';
import { EquipmentComparisonModal } from './hospital/EquipmentComparisonModal';
import { MaintenanceCenterTab } from './hospital/MaintenanceCenterTab';
import { AiPredictionsTab } from './hospital/AiPredictionsTab';
import { AlertsCenterTab } from './hospital/AlertsCenterTab';

interface HospitalAdminViewProps {
  user: AuthUser;
  onLogout: () => void;
  onSwitchToPatientView: () => void;
  hospitals: Hospital[];
  ambulances: Ambulance[];
  onOpenAmbulanceDrawer: () => void;
}

interface PriorityAction {
  id: string;
  number: number;
  title: string;
  category: 'Equipment' | 'Staffing' | 'Beds' | 'Resource';
  description: string;
  impact: string;
  status: 'pending' | 'executed';
}

export const HospitalAdminView: React.FC<HospitalAdminViewProps> = ({
  user,
  onLogout,
  onSwitchToPatientView,
  hospitals,
  ambulances,
  onOpenAmbulanceDrawer,
}) => {
  // Navigation tabs
  const [activeTab, setActiveTab] = useState<'overview' | 'flow' | 'equipment' | 'maintenance' | 'predictions' | 'alerts' | 'analytics'>('overview');
  
  // Real-time live state & SSE
  const [liveMode, setLiveMode] = useState<boolean>(true);
  const [currentTime, setCurrentTime] = useState<string>('09:22:45 IST');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sseConnected, setSseConnected] = useState<boolean>(false);
  const [lastSyncTime, setLastSyncTime] = useState<string>('Just now');
  const [isSimulating, setIsSimulating] = useState<boolean>(false);

  // Equipment & Alerts Data (Synced from backend single-source-of-truth)
  const [equipmentList, setEquipmentList] = useState<HospitalEquipment[]>(initialEquipmentList);
  const [alerts, setAlerts] = useState<EquipmentAlert[]>(initialEquipmentAlerts);
  const [selectedEquipment, setSelectedEquipment] = useState<HospitalEquipment | null>(null);
  const [compareEquipment, setCompareEquipment] = useState<{ eq1: HospitalEquipment; eq2: HospitalEquipment } | null>(null);

  // AI Gemini Diagnosis State
  const [aiDiagnosisLoading, setAiDiagnosisLoading] = useState<boolean>(false);
  const [aiDiagnosisResult, setAiDiagnosisResult] = useState<any | null>(null);

  // Modals state
  const [isAdvisorModalOpen, setIsAdvisorModalOpen] = useState<boolean>(false);
  const [isForecastModalOpen, setIsForecastModalOpen] = useState<boolean>(false);
  const [isAlertsModalOpen, setIsAlertsModalOpen] = useState<boolean>(false);
  const [notificationToast, setNotificationToast] = useState<string | null>(null);

  // Dynamic Hospital Census Telemetry
  const [inpatientCount, setInpatientCount] = useState<number>(428);
  const [edActiveCount, setEdActiveCount] = useState<number>(67);
  const [icuOccupancyPercent, setIcuOccupancyPercent] = useState<number>(82);
  const [availableBedsCount, setAvailableBedsCount] = useState<number>(46);
  const [oxygenCapacityPercent, setOxygenCapacityPercent] = useState<number>(68);

  // Priority Actions State (Interactive Execution)
  const [priorityActions, setPriorityActions] = useState<PriorityAction[]>([
    {
      id: 'act-1',
      number: 1,
      title: 'Allocate 4 additional ventilators to ICU A',
      category: 'Equipment',
      description: 'ICU A ventilator usage is 88% and 3 acute respiratory distress arrivals are en route in ED.',
      impact: 'Prevents ventilator deficit, reduces acute respiratory delay from 45 min to 0 min.',
      status: 'pending',
    },
    {
      id: 'act-2',
      number: 2,
      title: 'Transfer 2 available dialysis machines from low-utilization ward',
      category: 'Equipment',
      description: 'Nephrology morning demand will exceed active stations by 20% due to acute ESRD admissions.',
      impact: 'Eliminates acute ESRD queue delay and preserves emergency dialysis buffer.',
      status: 'pending',
    },
    {
      id: 'act-3',
      number: 3,
      title: 'Expedite 6 low-acuity general ward discharges before 3 PM',
      category: 'Beds',
      description: 'Frees up 6 step-down telemetry beds for incoming ICU transfers and incoming emergency admissions.',
      impact: 'Clears ED boarding bottleneck and accelerates emergency transfer flow.',
      status: 'pending',
    },
    {
      id: 'act-4',
      number: 4,
      title: 'Mobilize on-call Trauma Surgeon team for 7 PM surge',
      category: 'Staffing',
      description: 'Forecast predicts 12+ multi-trauma admissions between 7 PM - 11 PM due to local festival transit.',
      impact: 'Reduces OT pre-op wait from 35m to 8m during peak surge window.',
      status: 'pending',
    },
    {
      id: 'act-5',
      number: 5,
      title: 'Procure 30 backup Type O-Negative blood units from Regional Bank',
      category: 'Resource',
      description: 'Anticipated trauma surge creates an 85% probability of O-Neg critical threshold trigger by 21:00.',
      impact: 'Secures emergency massive transfusion protocol reserves.',
      status: 'pending',
    },
  ]);

  // Fetch initial data from backend API
  const fetchHospitalData = async () => {
    try {
      const eqRes = await fetch('/api/hospitals/hosp-1/equipment');
      if (eqRes.ok) {
        const data = await eqRes.json();
        if (data && data.equipment) {
          setEquipmentList(data.equipment);
        }
      }

      const alRes = await fetch('/api/hospitals/hosp-1/alerts');
      if (alRes.ok) {
        const alData = await alRes.json();
        if (alData && alData.alerts) {
          setAlerts(alData.alerts);
        }
      }
    } catch (err) {
      console.warn('Backend API fetch fallback to mock store:', err);
    }
  };

  useEffect(() => {
    fetchHospitalData();
  }, []);

  // Server-Sent Events (SSE) Live Real-Time Integration
  useEffect(() => {
    if (!liveMode) return;

    let eventSource: EventSource | null = null;
    try {
      eventSource = new EventSource('/api/events');

      eventSource.onopen = () => {
        setSseConnected(true);
      };

      eventSource.onmessage = (e) => {
        try {
          const payload = JSON.parse(e.data);
          setLastSyncTime(new Date().toLocaleTimeString());

          if (payload.type === 'IOT_TELEMETRY_UPDATE' || payload.type === 'INITIAL_SYNC' || payload.type === 'EVENT_TRIGGERED') {
            if (payload.equipment) {
              setEquipmentList(payload.equipment);

              // If an equipment modal is currently open, keep it in sync
              if (selectedEquipment) {
                const updatedItem = payload.equipment.find((i: HospitalEquipment) => i.equipmentId === selectedEquipment.equipmentId);
                if (updatedItem) {
                  setSelectedEquipment(updatedItem);
                }
              }
            }

            if (payload.alerts) {
              setAlerts(payload.alerts);
            }
          }
        } catch (err) {
          console.error('Error parsing SSE event:', err);
        }
      };

      eventSource.onerror = () => {
        setSseConnected(false);
      };
    } catch (err) {
      console.error('SSE connection setup error:', err);
    }

    return () => {
      if (eventSource) {
        eventSource.close();
      }
    };
  }, [liveMode, selectedEquipment]);

  // Live timer tick
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const timeStr = now.toLocaleTimeString('en-IN', { hour12: false }) + ' IST';
      setCurrentTime(timeStr);
      
      if (liveMode) {
        // Minor telemetry micro-fluctuations for realistic live command feed
        if (Math.random() > 0.8) {
          setInpatientCount(prev => prev + (Math.random() > 0.5 ? 1 : -1));
        }
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [liveMode]);

  // Simulator Handler
  const handleSimulateEvent = async (eventType: string) => {
    setIsSimulating(true);
    try {
      const res = await fetch('/api/iot/simulate-event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventType, hospitalId: 'hosp-1' }),
      });

      if (res.ok) {
        const data = await res.json();
        setNotificationToast(`⚡ Sensor Event Broadcasted: ${eventType.replace(/_/g, ' ').toUpperCase()}`);
        setTimeout(() => setNotificationToast(null), 4000);

        if (data.equipment) {
          setEquipmentList(data.equipment);
        }
        if (data.alerts) {
          setAlerts(data.alerts);
        }
      }
    } catch (err) {
      console.error('Simulation error:', err);
    } finally {
      setIsSimulating(false);
    }
  };

  // Status & Allocation Update Handler
  const handleUpdateEquipmentStatus = async (
    equipmentId: string,
    status: string,
    available: number,
    occupied: number
  ) => {
    try {
      const res = await fetch(`/api/hospitals/hosp-1/equipment/${equipmentId}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, availableUnits: available, occupiedUnits: occupied }),
      });

      if (res.ok) {
        const data = await res.json();
        setNotificationToast(`✓ Fleet Unit Allocation Synchronized with Patient Portal`);
        setTimeout(() => setNotificationToast(null), 3000);

        if (data.equipment) {
          setEquipmentList(prev => prev.map(e => e.equipmentId === equipmentId ? data.equipment : e));
          if (selectedEquipment && selectedEquipment.equipmentId === equipmentId) {
            setSelectedEquipment(data.equipment);
          }
        }
      }
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  // Resolve Alert Handler
  const handleResolveAlert = async (alertId: string, action: 'acknowledge' | 'resolve') => {
    try {
      const res = await fetch(`/api/alerts/${alertId}/resolve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });

      if (res.ok) {
        const data = await res.json();
        setNotificationToast(`✓ Alert ${action === 'resolve' ? 'Resolved' : 'Acknowledged'}`);
        setTimeout(() => setNotificationToast(null), 3000);

        if (data.alert) {
          setAlerts(prev => prev.map(a => a.id === alertId ? data.alert : a));
        }
      }
    } catch (err) {
      console.error('Failed to resolve alert:', err);
    }
  };

  // Gemini AI BioMed Risk Analysis
  const handleTriggerAiDiagnosis = async (equipment: HospitalEquipment) => {
    setAiDiagnosisLoading(true);
    setAiDiagnosisResult(null);
    try {
      const res = await fetch('/api/ai/maintenance-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ equipment }),
      });

      if (res.ok) {
        const data = await res.json();
        setAiDiagnosisResult(data.analysis);
      }
    } catch (err) {
      console.error('AI diagnosis error:', err);
    } finally {
      setAiDiagnosisLoading(false);
    }
  };

  // Execute a Priority Action
  const handleExecuteAction = (actionId: string) => {
    setPriorityActions(prev => prev.map(a => {
      if (a.id === actionId) {
        return { ...a, status: 'executed' };
      }
      return a;
    }));

    const targetAction = priorityActions.find(a => a.id === actionId);
    if (targetAction) {
      setNotificationToast(`✓ Directive Executed: ${targetAction.title}`);
      setTimeout(() => setNotificationToast(null), 4000);

      // If action 1 is executed, simulate reduction in ICU load
      if (actionId === 'act-1') {
        setIcuOccupancyPercent(79);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f7fb] font-sans text-slate-900 flex flex-col selection:bg-teal-500 selection:text-white">
      
      {/* 1. TOP LIVE IOT TELEMETRY STATUS BAR */}
      <div className="bg-[#050c18] text-slate-300 text-[11px] font-mono tracking-wider px-4 sm:px-8 py-1.5 flex flex-wrap items-center justify-between border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            LIVE IOT TELEMETRY CONNECTED
          </span>
          <span className="text-slate-600">|</span>
          <span className="text-slate-400">Sensors Online: <span className="text-white font-semibold">142/142</span></span>
          <span className="text-slate-600">|</span>
          <span className="text-slate-400">EMR Sync: <span className="text-emerald-400 font-semibold">0.8s latency</span></span>
        </div>
        
        <div className="flex items-center gap-4 text-slate-400">
          <span className="hidden sm:inline">📅 Thu, Aug 27, 2026</span>
          <span className="text-slate-600 hidden sm:inline">|</span>
          <span className="text-cyan-400 font-bold">⏰ {currentTime}</span>
        </div>
      </div>

      {/* 2. MAIN OPS COMMAND NAVIGATION HEADER */}
      <header className="bg-[#0b192c] text-white border-b border-slate-800/80 sticky top-0 z-30 shadow-md">
        <div className="max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-4">
          
          {/* Logo & Facility Title */}
          <div className="flex items-center gap-3.5">
            <div className="flex items-center gap-2">
              <MediConnectLogo size="sm" animated={true} />
              <span className="text-xl font-black tracking-tight text-white font-sans">
                Medi<span className="text-[#00b289]">Connect</span>
              </span>
            </div>

            <span className="bg-[#00c99f]/15 border border-[#00c99f]/40 text-[#00e5b5] text-[10px] font-black tracking-widest uppercase px-2 py-0.5 rounded-sm">
              OPS COMMAND
            </span>

            <div className="hidden lg:flex items-center gap-2 text-xs text-slate-400 pl-2 border-l border-slate-700">
              <span className="font-semibold text-slate-200">CityCare Multi-Speciality Hospital</span>
              <span>&bull;</span>
              <span className="flex items-center gap-1 text-slate-400 text-[11px]">
                <MapPin className="w-3 h-3 text-teal-400" />
                Mumbai Campus
              </span>
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-md hidden md:block">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search patient, equipment, telemetry..."
                className="w-full bg-[#13233a] border border-slate-700/80 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-hidden focus:border-teal-400 focus:ring-1 focus:ring-teal-400 transition-all"
              />
            </div>
          </div>

          {/* Action Tools & User Profile */}
          <div className="flex items-center gap-3">
            
            {/* AI Operations Advisor Button */}
            <button
              id="ai-ops-advisor-btn"
              onClick={() => setIsAdvisorModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#00b289] to-[#0284c7] hover:from-[#00c99f] hover:to-[#0369a1] text-white text-xs font-bold shadow-lg shadow-teal-900/30 transition-all hover:scale-105 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-200" />
              <span>AI Operations Advisor</span>
            </button>

            {/* Live Mode Toggle */}
            <button
              id="live-mode-toggle-btn"
              onClick={() => setLiveMode(!liveMode)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                liveMode 
                  ? 'bg-emerald-950/60 border-emerald-500/60 text-emerald-400'
                  : 'bg-slate-800 border-slate-700 text-slate-400'
              }`}
            >
              <Radio className={`w-3.5 h-3.5 ${liveMode ? 'animate-pulse text-emerald-400' : ''}`} />
              <span>Live Mode</span>
            </button>

            {/* Notification Bell */}
            <button 
              id="alerts-bell-btn"
              onClick={() => setIsAlertsModalOpen(true)}
              className="relative p-2 rounded-xl bg-[#13233a] hover:bg-slate-800 border border-slate-700 text-slate-300 transition-all cursor-pointer"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-600 text-white text-[10px] font-bold flex items-center justify-center">
                {alerts.filter(a => !a.resolved).length}
              </span>
            </button>

            {/* User Profile / Admin Badge */}
            <div className="flex items-center gap-2.5 pl-2 border-l border-slate-700">
              <div className="w-8 h-8 rounded-full bg-teal-900 border border-teal-500/50 text-teal-300 font-black text-xs flex items-center justify-center">
                AM
              </div>
              <div className="hidden xl:flex flex-col text-left">
                <span className="text-xs font-bold text-slate-200 leading-tight">Dr. Ashok Mishra, MD</span>
                <span className="text-[10px] text-teal-400 font-medium flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  Hospital Operations Admin
                </span>
              </div>
            </div>

            {/* Switch to Patient View or Logout */}
            <div className="flex items-center gap-1.5 pl-2">
              <button
                id="switch-patient-view-btn"
                onClick={onSwitchToPatientView}
                title="Switch to Patient Portal"
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-all cursor-pointer flex items-center gap-1"
              >
                <Eye className="w-4 h-4 text-teal-400" />
                <span className="hidden md:inline text-xs">Patient App</span>
              </button>
              <button
                id="logout-btn"
                onClick={onLogout}
                title="Log Out"
                className="p-2 rounded-xl bg-rose-950/60 hover:bg-rose-900 border border-rose-800/60 text-rose-300 text-xs font-medium transition-all cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>

          </div>

        </div>

        {/* 3. SUB-NAVIGATION TABS ROW */}
        <div className="bg-[#0e1e35] border-t border-slate-800/80 px-4 sm:px-6 lg:px-8">
          <div className="max-w-[1700px] mx-auto flex items-center gap-2 overflow-x-auto py-2 scrollbar-none">
            
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'overview'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Command Overview</span>
            </button>

            <button
              onClick={() => setActiveTab('equipment')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'equipment'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>Equipment &amp; IoT Intelligence</span>
              <span className="bg-teal-400/20 text-teal-300 text-[10px] font-black px-2 py-0.5 rounded-md">
                {equipmentList.length} Connected
              </span>
            </button>

            <button
              onClick={() => setActiveTab('maintenance')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'maintenance'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Wrench className="w-3.5 h-3.5" />
              <span>Maintenance &amp; BioMed Center</span>
              <span className="bg-amber-400/20 text-amber-300 text-[10px] font-black px-2 py-0.5 rounded-md">
                Predictive Risk
              </span>
            </button>

            <button
              onClick={() => setActiveTab('predictions')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'predictions'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-300" />
              <span>AI Predictions &amp; Scenarios</span>
              <span className="bg-purple-400/20 text-purple-300 text-[10px] font-black px-2 py-0.5 rounded-md">
                Gemini ML
              </span>
            </button>

            <button
              onClick={() => setActiveTab('alerts')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'alerts'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5 text-rose-300" />
              <span>Alerts Center</span>
              <span className="bg-rose-400/20 text-rose-300 text-[10px] font-black px-2 py-0.5 rounded-md">
                {alerts.filter(a => !a.resolved).length} Active
              </span>
            </button>

            <button
              onClick={() => setActiveTab('flow')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'flow'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Patient Flow Pipeline</span>
            </button>

          </div>
        </div>
      </header>

      {/* Floating Action Toast */}
      {notificationToast && (
        <div className="fixed top-20 right-6 z-50 bg-emerald-900 border border-emerald-500 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-emerald-300 shrink-0" />
          <span className="text-xs font-bold">{notificationToast}</span>
        </div>
      )}

      {/* MAIN CONTENT BODY */}
      <main className="max-w-[1700px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 flex-1">
        
        {/* SIMULATED IOT TOOLBAR (Test IoT spikes & triggers in real time) */}
        <SimulatedIotToolbar
          onSimulateEvent={handleSimulateEvent}
          isSimulating={isSimulating}
          sseConnected={sseConnected}
          lastSyncTime={lastSyncTime}
        />

        {/* TAB 1: COMMAND OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            
            {/* 4. HOSPITAL COMMAND DIRECTIVE - DARK HERO BANNER */}
            <section className="bg-[#0b192c] text-white rounded-3xl p-6 sm:p-7 border border-slate-800 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

              <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-800/80">
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-2xl bg-blue-950/80 border border-blue-500/40 text-blue-400 flex items-center justify-center shadow-inner">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2.5">
                      <span className="text-[11px] font-black tracking-widest text-cyan-400 uppercase">
                        HOSPITAL COMMAND DIRECTIVE
                      </span>
                      <span className="bg-rose-950/80 border border-rose-500/50 text-rose-300 text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse">
                        High Surge Alert Active
                      </span>
                    </div>
                    <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-0.5">
                      Real-Time Operational Assessment &amp; Prioritization
                    </h1>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setActiveTab('equipment')}
                    className="px-4 py-2 rounded-xl bg-teal-500/20 text-teal-300 border border-teal-500/40 hover:bg-teal-500/30 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <Cpu className="w-4 h-4" />
                    <span>Manage IoT Equipment</span>
                  </button>
                </div>
              </div>

              {/* Directive Statement */}
              <p className="text-sm text-slate-300 max-w-4xl leading-relaxed">
                Hospital operating at <strong>82% ICU Capacity</strong> with an expected <strong>+24% Emergency Influx</strong> between 18:00 and 23:00. Unified IoT Broker is streaming telemetry across all 8 modalities to ensure zero divergence between patient reservations and internal clinical assets.
              </p>
            </section>

            {/* 5. TOP ROW 4 METRIC CARDS */}
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              
              {/* Card 1: Inpatient Census */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-slate-500 uppercase tracking-wider">TOTAL INPATIENT CENSUS</span>
                  <Users className="w-4 h-4 text-blue-600" />
                </div>
                <div className="my-3 flex items-baseline justify-between">
                  <span className="text-3xl font-black text-slate-900 tracking-tight">{inpatientCount}</span>
                  <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">85.6% Capacity</span>
                </div>
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span>Admissions Today: <strong>+42</strong></span>
                  <span>Discharges: <strong>28</strong></span>
                </div>
              </div>

              {/* Card 2: ED Active Cases */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-slate-500 uppercase tracking-wider">ED ACTIVE CASUALTY</span>
                  <Siren className="w-4 h-4 text-rose-600 animate-bounce" />
                </div>
                <div className="my-3 flex items-baseline justify-between">
                  <span className="text-3xl font-black text-rose-600 tracking-tight">{edActiveCount}</span>
                  <span className="text-xs font-bold text-rose-800 bg-rose-50 px-2 py-0.5 rounded-md">+18 vs 2h ago</span>
                </div>
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span>Triage Level 1: <strong>7</strong></span>
                  <span>Avg Wait: <strong>28m</strong></span>
                </div>
              </div>

              {/* Card 3: ICU Occupancy */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-slate-500 uppercase tracking-wider">ICU BED OCCUPANCY</span>
                  <Building2 className="w-4 h-4 text-amber-500" />
                </div>
                <div className="my-3 flex items-baseline justify-between">
                  <span className="text-3xl font-black text-amber-600 tracking-tight">{icuOccupancyPercent}%</span>
                  <span className="text-xs font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md">Critical Threshold</span>
                </div>
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span>Available ICU Beds: <strong>9/50</strong></span>
                  <span>Ventilator Load: <strong>88%</strong></span>
                </div>
              </div>

              {/* Card 4: Bed Fleet */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-slate-500 uppercase tracking-wider">GENERAL AVAILABLE BEDS</span>
                  <BedDouble className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="my-3 flex items-baseline justify-between">
                  <span className="text-3xl font-black text-slate-900 tracking-tight">{availableBedsCount}</span>
                  <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md">+14 pending</span>
                </div>
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span>Total Fleet: <strong>500 Beds</strong></span>
                  <span>Staffed Ready: <strong>46</strong></span>
                </div>
              </div>

            </section>

            {/* 6. SECOND KPI ROW (3 WIDE CARDS) */}
            <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              
              {/* Card 1: Critical Equipment Utilization */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs flex flex-col justify-between">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-blue-600" />
                    <span className="text-xs font-black text-slate-900 uppercase tracking-wider">
                      CRITICAL EQUIPMENT UTILIZATION
                    </span>
                  </div>
                  <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                    Heavy Demand
                  </span>
                </div>

                <div className="my-2 flex items-baseline justify-between">
                  <span className="text-3xl font-black text-slate-900">78%</span>
                  <span className="text-xs text-slate-500 font-medium">Across 8 Medical Modalities</span>
                </div>

                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden my-2">
                  <div className="bg-blue-600 h-full rounded-full transition-all duration-700" style={{ width: '78%' }} />
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                  <span>Ventilators (85%)</span>
                  <span>OTs (83%)</span>
                  <span>Dialysis (80%)</span>
                </div>
              </div>

              {/* Card 2: Predicted Patient Surge */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs flex flex-col justify-between">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-purple-600" />
                    <span className="text-xs font-black text-slate-900 uppercase tracking-wider">
                      PREDICTED PATIENT SURGE
                    </span>
                  </div>
                  <span className="text-[11px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
                    ML Model v4.2
                  </span>
                </div>

                <div className="my-2 flex items-baseline justify-between">
                  <span className="text-3xl font-black text-blue-600">+24%</span>
                  <span className="text-xs text-slate-500 font-semibold">Next 12 Hours (6 PM - 11 PM)</span>
                </div>

                <p className="text-xs text-slate-600 my-1">
                  Forecasted admissions: <strong>71 patients</strong> (Weather &amp; Festival surge)
                </p>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-purple-700 font-medium">
                  <span>Confidence: 94.2%</span>
                  <span>Peak Window: 20:30</span>
                </div>
              </div>

              {/* Card 3: Active Critical Alerts */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs flex flex-col justify-between">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                    <span className="text-xs font-black text-rose-900 uppercase tracking-wider">
                      ACTIVE CRITICAL ALERTS
                    </span>
                  </div>
                  <span className="text-[11px] font-bold text-rose-800 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                    Requires Action
                  </span>
                </div>

                <div className="my-2 flex items-baseline justify-between">
                  <span className="text-3xl font-black text-rose-600">{alerts.filter(a => !a.resolved).length}</span>
                  <button 
                    onClick={() => setActiveTab('alerts')}
                    className="text-xs text-rose-600 hover:text-rose-700 font-bold flex items-center gap-1 cursor-pointer"
                  >
                    Resolve in Alerts Center &rarr;
                  </button>
                </div>

                <p className="text-xs text-slate-600 my-1 truncate">
                  Top: <strong>ICU A Capacity (92%) &amp; Oxygen Reserves (68%, 9h)</strong>
                </p>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                  <span>3 Immediate Dispatches</span>
                  <span>2 Supply Alerts</span>
                </div>
              </div>

            </section>

            {/* 7. FIVE-STEP PATIENT JOURNEY FLOW ROW */}
            <section className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div>
                  <h2 className="text-sm font-black text-slate-900 tracking-tight flex items-center gap-2">
                    <Activity className="w-4 h-4 text-blue-600" />
                    <span>Real-Time Patient Flow &amp; Clinical Pipeline</span>
                  </h2>
                  <p className="text-xs text-slate-500">
                    End-to-end telemetry across emergency intake, diagnostics, interventions, and discharge.
                  </p>
                </div>
                <span className="text-xs font-bold text-slate-500 font-mono">
                  Cycle Time: 467m avg
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
                
                {/* Step 01 */}
                <div className="p-4 rounded-xl border border-rose-200 bg-rose-50/40 flex flex-col justify-between space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-500">Step 01</span>
                    <span className="bg-rose-100 text-rose-800 text-[10px] font-black px-2 py-0.5 rounded-md">
                      BOTTLENECK
                    </span>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Patient Entry &amp; ED Triage</h4>
                    <p className="text-[11px] text-slate-500">Emergency Intake &amp; Walk-ins</p>
                  </div>
                  <div className="flex items-baseline justify-between pt-1">
                    <span className="text-xl font-black text-slate-900">69 <span className="text-xs font-normal text-slate-500">pts</span></span>
                    <span className="text-xs text-slate-600 flex items-center gap-1 font-medium">
                      <Clock className="w-3 h-3 text-slate-400" /> 28m
                    </span>
                  </div>
                  <p className="text-[10px] text-rose-700 font-semibold pt-1 border-t border-rose-200/60">
                    Surge +24% Predicted (6 PM - 11 PM)
                  </p>
                </div>

                {/* Step 02 */}
                <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/40 flex flex-col justify-between space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-500">Step 02</span>
                    <span className="bg-amber-100 text-amber-800 text-[10px] font-black px-2 py-0.5 rounded-md">
                      WARNING
                    </span>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Diagnosis &amp; Testing</h4>
                    <p className="text-[11px] text-slate-500">Stat Labs, MRI, CT &amp; Ultrasound</p>
                  </div>
                  <div className="flex items-baseline justify-between pt-1">
                    <span className="text-xl font-black text-slate-900">84 <span className="text-xs font-normal text-slate-500">pts</span></span>
                    <span className="text-xs text-slate-600 flex items-center gap-1 font-medium">
                      <Clock className="w-3 h-3 text-slate-400" /> 44m
                    </span>
                  </div>
                  <p className="text-[10px] text-amber-800 font-semibold pt-1 border-t border-amber-200/60">
                    CT queue elevated (5 emergency)
                  </p>
                </div>

                {/* Step 03 */}
                <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/40 flex flex-col justify-between space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-500">Step 03</span>
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2 py-0.5 rounded-md">
                      NORMAL
                    </span>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Treatment &amp; Care Delivery</h4>
                    <p className="text-[11px] text-slate-500">OTs, Trauma Bays &amp; Infusions</p>
                  </div>
                  <div className="flex items-baseline justify-between pt-1">
                    <span className="text-xl font-black text-slate-900">142 <span className="text-xs font-normal text-slate-500">pts</span></span>
                    <span className="text-xs text-slate-600 flex items-center gap-1 font-medium">
                      <Clock className="w-3 h-3 text-slate-400" /> 120m
                    </span>
                  </div>
                  <p className="text-[10px] text-emerald-800 font-semibold pt-1 border-t border-emerald-200/60">
                    OTs operating at 83% capacity
                  </p>
                </div>

                {/* Step 04 */}
                <div className="p-4 rounded-xl border border-rose-200 bg-rose-50/40 flex flex-col justify-between space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-500">Step 04</span>
                    <span className="bg-rose-100 text-rose-800 text-[10px] font-black px-2 py-0.5 rounded-md">
                      BOTTLENECK
                    </span>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Bed &amp; Capacity Management</h4>
                    <p className="text-[11px] text-slate-500">ICU, Step-down &amp; General Wards</p>
                  </div>
                  <div className="flex items-baseline justify-between pt-1">
                    <span className="text-xl font-black text-slate-900">198 <span className="text-xs font-normal text-slate-500">pts</span></span>
                    <span className="text-xs text-slate-600 flex items-center gap-1 font-medium">
                      <Clock className="w-3 h-3 text-slate-400" /> 240m
                    </span>
                  </div>
                  <p className="text-[10px] text-rose-700 font-semibold pt-1 border-t border-rose-200/60">
                    ICU A at 92% occupancy
                  </p>
                </div>

                {/* Step 05 */}
                <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/40 flex flex-col justify-between space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-500">Step 05</span>
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2 py-0.5 rounded-md">
                      NORMAL
                    </span>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Discharge &amp; Follow-Up</h4>
                    <p className="text-[11px] text-slate-500">Expedited Pharmacy &amp; Clearance</p>
                  </div>
                  <div className="flex items-baseline justify-between pt-1">
                    <span className="text-xl font-black text-slate-900">14 <span className="text-xs font-normal text-slate-500">pts</span></span>
                    <span className="text-xs text-slate-600 flex items-center gap-1 font-medium">
                      <Clock className="w-3 h-3 text-slate-400" /> 35m
                    </span>
                  </div>
                  <p className="text-[10px] text-emerald-800 font-semibold pt-1 border-t border-emerald-200/60">
                    14 patients queued today
                  </p>
                </div>

              </div>
            </section>

            {/* 8. TWO-COLUMN BOTTOM SECTION: ICU RESOURCE STATUS & AI PRIORITY ENGINE */}
            <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* LEFT 7-COLUMN: ICU & HIGH-ACUITY WARD STATUS */}
              <div className="lg:col-span-7 bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <Building2 className="w-5 h-5 text-blue-600" />
                      <span>ICU &amp; High-Acuity Ward Resource Status</span>
                    </h3>
                    <p className="text-xs text-slate-500">
                      Live occupancy, ventilator load and clinical risk classification
                    </p>
                  </div>
                  <button 
                    onClick={() => setActiveTab('equipment')}
                    className="text-xs text-blue-600 hover:text-blue-700 font-bold flex items-center gap-1 cursor-pointer"
                  >
                    Equipment Telemetry &rarr;
                  </button>
                </div>

                {/* 2x2 Grid of ICU Blocks */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  
                  {/* Block A */}
                  <div className="p-4 rounded-xl border border-rose-200 bg-rose-50/20 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">ICU Block A (Medical &amp; Respiratory)</h4>
                        <span className="inline-block mt-1 bg-rose-100 text-rose-800 text-[10px] font-black px-2 py-0.5 rounded-sm">
                          CRITICAL RISK
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-lg font-black text-slate-900">{icuOccupancyPercent}%</span>
                        <p className="text-[11px] text-slate-500">23/25 beds</p>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-600">Ventilator Utilization</span>
                        <span className="font-bold text-rose-600">88% (22/25)</span>
                      </div>
                      <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                        <div className="bg-rose-500 h-full rounded-full" style={{ width: '88%' }} />
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-500">
                      <span>Monitors Active: 25</span>
                      <span className="font-semibold text-rose-700">Reserves: 1</span>
                    </div>
                  </div>

                  {/* Block B */}
                  <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/20 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">ICU Block B (Surgical &amp; Cardiac)</h4>
                        <span className="inline-block mt-1 bg-amber-100 text-amber-800 text-[10px] font-black px-2 py-0.5 rounded-sm">
                          MODERATE RISK
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-lg font-black text-slate-900">76%</span>
                        <p className="text-[11px] text-slate-500">19/25 beds</p>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-600">Ventilator Utilization</span>
                        <span className="font-bold text-amber-600">70% (7/10)</span>
                      </div>
                      <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                        <div className="bg-amber-500 h-full rounded-full" style={{ width: '70%' }} />
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-500">
                      <span>Monitors Active: 22</span>
                      <span className="font-semibold text-slate-700">Reserves: 3</span>
                    </div>
                  </div>

                  {/* Block C */}
                  <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/20 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">ICU Block C (Neuro &amp; Step-Down)</h4>
                        <span className="inline-block mt-1 bg-emerald-100 text-emerald-800 text-[10px] font-black px-2 py-0.5 rounded-sm">
                          STABLE
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-lg font-black text-slate-900">64%</span>
                        <p className="text-[11px] text-slate-500">16/25 beds</p>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-600">Ventilator Utilization</span>
                        <span className="font-bold text-emerald-600">40% (4/10)</span>
                      </div>
                      <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                        <div className="bg-emerald-500 h-full rounded-full" style={{ width: '40%' }} />
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-500">
                      <span>Monitors Active: 20</span>
                      <span className="font-semibold text-emerald-700">Reserves: 6</span>
                    </div>
                  </div>

                  {/* Block D */}
                  <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/20 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">ICU Block D (Trauma &amp; Burn Unit)</h4>
                        <span className="inline-block mt-1 bg-amber-100 text-amber-800 text-[10px] font-black px-2 py-0.5 rounded-sm">
                          HIGH LOAD
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-lg font-black text-slate-900">84%</span>
                        <p className="text-[11px] text-slate-500">21/25 beds</p>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-600">Ventilator Utilization</span>
                        <span className="font-bold text-amber-600">80% (8/10)</span>
                      </div>
                      <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                        <div className="bg-amber-500 h-full rounded-full" style={{ width: '80%' }} />
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-500">
                      <span>Monitors Active: 24</span>
                      <span className="font-semibold text-amber-700">Reserves: 2</span>
                    </div>
                  </div>

                </div>
              </div>

              {/* RIGHT 5-COLUMN: AI PRIORITY ENGINE */}
              <div className="lg:col-span-5 bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs space-y-4 flex flex-col justify-between">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Zap className="w-5 h-5 text-emerald-600" />
                    <span>AI Priority Engine</span>
                  </h3>
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2.5 py-1 rounded-full">
                    Active Queue ({priorityActions.filter(a => a.status === 'pending').length})
                  </span>
                </div>

                {/* Directives List */}
                <div className="space-y-3 flex-1 overflow-y-auto max-h-[460px] pr-1">
                  {priorityActions.map((action) => (
                    <div 
                      key={action.id}
                      className={`p-4 rounded-xl border transition-all ${
                        action.status === 'executed'
                          ? 'bg-slate-50 border-slate-200 opacity-75'
                          : 'bg-slate-50/70 hover:bg-white border-slate-200 hover:border-teal-400'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2">
                          <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
                            {action.number}
                          </span>
                          <div>
                            <h4 className="text-xs font-bold text-slate-900 leading-tight">
                              {action.title}
                            </h4>
                            <span className="text-[10px] font-semibold text-slate-500">
                              {action.category}
                            </span>
                          </div>
                        </div>
                      </div>

                      <p className="text-[11px] text-slate-600 mt-2 leading-relaxed">
                        {action.description}
                      </p>

                      <div className="mt-3 pt-2 border-t border-slate-200/60 flex items-center justify-between gap-2">
                        <span className="text-[10px] text-emerald-700 font-medium truncate">
                          <strong>⚡ Impact:</strong> {action.impact}
                        </span>

                        {action.status === 'executed' ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-md shrink-0">
                            <Check className="w-3.5 h-3.5" /> Executed
                          </span>
                        ) : (
                          <button
                            onClick={() => handleExecuteAction(action.id)}
                            className="px-3.5 py-1 rounded-md bg-[#00c99f] hover:bg-[#00b289] text-slate-950 font-bold text-xs transition-all shadow-xs hover:scale-105 shrink-0 cursor-pointer"
                          >
                            Accept
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-3 border-t border-slate-100 text-center">
                  <button 
                    onClick={() => setIsForecastModalOpen(true)}
                    className="text-xs text-blue-600 hover:text-blue-800 font-bold"
                  >
                    Inspect All Simulated Neural Predictions &rarr;
                  </button>
                </div>

              </div>

            </section>

          </div>
        )}

        {/* TAB 2: EQUIPMENT & IOT INTELLIGENCE */}
        {activeTab === 'equipment' && (
          <EquipmentIntelligenceTab
            equipmentList={equipmentList}
            onSelectEquipment={(eq) => setSelectedEquipment(eq)}
            onOpenCompare={(eq1, eq2) => setCompareEquipment({ eq1, eq2 })}
            onSimulateEvent={handleSimulateEvent}
            isLoading={isSimulating}
          />
        )}

        {/* TAB 3: MAINTENANCE & BIOMED CENTER */}
        {activeTab === 'maintenance' && (
          <MaintenanceCenterTab
            equipmentList={equipmentList}
            onSelectEquipment={(eq) => setSelectedEquipment(eq)}
            onTriggerAiDiagnosis={handleTriggerAiDiagnosis}
          />
        )}

        {/* TAB 4: AI PREDICTIONS & SCENARIOS */}
        {activeTab === 'predictions' && (
          <AiPredictionsTab
            equipmentList={equipmentList}
            onOpenAdvisorModal={() => setIsAdvisorModalOpen(true)}
            onOpenForecastModal={() => setIsForecastModalOpen(true)}
          />
        )}

        {/* TAB 5: ALERTS CENTER */}
        {activeTab === 'alerts' && (
          <AlertsCenterTab
            alerts={alerts}
            onResolveAlert={handleResolveAlert}
            onSimulateEvent={handleSimulateEvent}
          />
        )}

        {/* TAB 6: PATIENT FLOW PIPELINE */}
        {activeTab === 'flow' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
              <h3 className="text-base font-bold text-slate-900">
                End-to-End Clinical Flow &amp; Bottleneck Mitigations
              </h3>
              <p className="text-xs text-slate-600">
                Detailed telemetry tracking across every transition point from ambulance dispatch to outpatient follow-up.
              </p>
              {/* Reuse the 5-step detailed view */}
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-3.5 pt-4">
                <div className="p-4 rounded-xl bg-rose-50 border border-rose-200">
                  <span className="text-xs font-bold text-rose-800">ED Triage</span>
                  <p className="text-2xl font-black text-rose-900 mt-2">69 pts</p>
                  <p className="text-xs text-rose-700 mt-1">28m avg wait time</p>
                </div>
                <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
                  <span className="text-xs font-bold text-amber-800">Diagnostic Scans</span>
                  <p className="text-2xl font-black text-amber-900 mt-2">84 pts</p>
                  <p className="text-xs text-amber-700 mt-1">44m turnaround</p>
                </div>
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
                  <span className="text-xs font-bold text-emerald-800">Surgical OTs</span>
                  <p className="text-2xl font-black text-emerald-900 mt-2">142 pts</p>
                  <p className="text-xs text-emerald-700 mt-1">120m procedure</p>
                </div>
                <div className="p-4 rounded-xl bg-rose-50 border border-rose-200">
                  <span className="text-xs font-bold text-rose-800">ICU &amp; Step-Down</span>
                  <p className="text-2xl font-black text-rose-900 mt-2">198 pts</p>
                  <p className="text-xs text-rose-700 mt-1">92% occupancy</p>
                </div>
                <div className="p-4 rounded-xl bg-teal-50 border border-teal-200">
                  <span className="text-xs font-bold text-teal-800">Discharges</span>
                  <p className="text-2xl font-black text-teal-900 mt-2">14 pts</p>
                  <p className="text-xs text-teal-700 mt-1">35m clearance</p>
                </div>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* EQUIPMENT DETAIL MODAL (Deep Telemetry, Usage Graphs, BioMed AI, Fleet Units) */}
      {selectedEquipment && (
        <EquipmentDetailModal
          equipment={selectedEquipment}
          onClose={() => {
            setSelectedEquipment(null);
            setAiDiagnosisResult(null);
          }}
          onUpdateStatus={handleUpdateEquipmentStatus}
          onTriggerAiDiagnosis={handleTriggerAiDiagnosis}
          aiDiagnosisLoading={aiDiagnosisLoading}
          aiDiagnosisResult={aiDiagnosisResult}
        />
      )}

      {/* EQUIPMENT COMPARISON MODAL */}
      {compareEquipment && (
        <EquipmentComparisonModal
          equipment1={compareEquipment.eq1}
          equipment2={compareEquipment.eq2}
          onClose={() => setCompareEquipment(null)}
        />
      )}

      {/* AI OPERATIONS ADVISOR MODAL */}
      {isAdvisorModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-2xl w-full text-white shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-5 h-5 text-teal-400" />
                <h3 className="text-base font-black">AI Operations Advisor (Gemini Clinical Engine)</h3>
              </div>
              <button 
                onClick={() => setIsAdvisorModalOpen(false)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs text-slate-300">
              <div className="p-3.5 rounded-xl bg-teal-950/60 border border-teal-500/40 text-teal-200">
                <strong>Current High-Confidence Recommendation:</strong> Activate Level-2 Surge Protocol for the 18:00–23:00 window. Predictive algorithms estimate 71 acute admissions, with peak ventilator demand in ICU Block A.
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-100">Live Resource Redistribution Plan:</h4>
                <ul className="list-disc pl-5 space-y-1.5 text-slate-300">
                  <li>Transfer 4 ventilators from reserve depot to ICU Block A.</li>
                  <li>Clear 6 low-acuity general beds to prevent ED boarding delays.</li>
                  <li>Pre-call surgical trauma standby team for expected 20:30 influx.</li>
                  <li>Route low-priority non-emergency ambulances to Hinduja National Hospital.</li>
                </ul>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end gap-2.5">
              <button
                onClick={() => setIsAdvisorModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={() => {
                  priorityActions.forEach(a => handleExecuteAction(a.id));
                  setIsAdvisorModalOpen(false);
                }}
                className="px-4 py-2 rounded-xl bg-[#00c99f] text-slate-950 text-xs font-extrabold shadow-lg cursor-pointer hover:bg-[#00b289]"
              >
                Apply All AI Directives
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FULL AI FORECAST MATRIX MODAL */}
      {isForecastModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-4xl w-full text-white shadow-2xl p-6 sm:p-8 space-y-6 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <h3 className="text-lg font-black flex items-center gap-2">
                  <Cpu className="w-5 h-5 text-cyan-400" />
                  <span>Full AI Forecast Matrix &amp; Bottleneck Analysis</span>
                </h3>
                <p className="text-xs text-slate-400">
                  12-Hour predictive neural simulations combining regional weather, festival transit, and hospital census telemetry.
                </p>
              </div>
              <button 
                onClick={() => setIsForecastModalOpen(false)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Matrix Data Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-slate-800/70 border border-slate-700 space-y-2">
                <h4 className="font-bold text-amber-300">ED Influx Model (+24% Surge)</h4>
                <p className="text-slate-300">Expected: 71 patients across triage levels 1 through 3. Peak arrival rate: 14 patients/hour between 20:00 and 22:00.</p>
                <div className="pt-2 text-[11px] text-slate-400 font-mono">
                  Confidence Score: 94.8% (R2 = 0.91)
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-800/70 border border-slate-700 space-y-2">
                <h4 className="font-bold text-rose-300">Respiratory &amp; Ventilator Deficit</h4>
                <p className="text-slate-300">Without intervention, ICU A ventilator demand will hit 100% capacity by 19:45, generating a 45-minute ventilator wait time.</p>
                <div className="pt-2 text-[11px] text-slate-400 font-mono">
                  Simulated Impact: Prevented by Directive #1
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-800/70 border border-slate-700 space-y-2">
                <h4 className="font-bold text-purple-300">Radiology (CT / MRI) Queue</h4>
                <p className="text-slate-300">Stat trauma scans will exceed scanner capacity by 35% starting at 19:00. Recommendation: Defer non-urgent outpatients.</p>
                <div className="pt-2 text-[11px] text-slate-400 font-mono">
                  Estimated delay: 18m per emergency scan
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-800/70 border border-slate-700 space-y-2">
                <h4 className="font-bold text-emerald-300">Pharmacy &amp; Discharge Clearance</h4>
                <p className="text-slate-300">Discharge pipeline operating smoothly. 14 pending discharges will release 14 beds before 17:00.</p>
                <div className="pt-2 text-[11px] text-slate-400 font-mono">
                  Discharge Turnaround: 35 minutes avg
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setIsForecastModalOpen(false)}
                className="px-5 py-2.5 rounded-xl bg-[#00c99f] text-slate-950 font-bold text-xs shadow-lg cursor-pointer hover:bg-[#00b289]"
              >
                Acknowledge Matrix
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ALERTS CENTER MODAL */}
      {isAlertsModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-xl w-full text-white shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-rose-400" />
                <h3 className="text-base font-black">{alerts.filter(a => !a.resolved).length} Active Clinical &amp; Sensor Alerts</h3>
              </div>
              <button 
                onClick={() => setIsAlertsModalOpen(false)}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-400 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2.5 text-xs max-h-96 overflow-y-auto">
              {alerts.map((alert) => (
                <div 
                  key={alert.id}
                  className={`p-3 rounded-xl border flex items-center justify-between ${
                    alert.severity === 'critical'
                      ? 'bg-rose-950/50 border-rose-500/40 text-rose-200'
                      : alert.severity === 'warning'
                      ? 'bg-amber-950/50 border-amber-500/40 text-amber-200'
                      : 'bg-slate-800 border-slate-700 text-slate-300'
                  }`}
                >
                  <div>
                    <strong>{alert.title}</strong>
                    <p className="text-[11px] opacity-80 mt-0.5">{alert.message}</p>
                  </div>
                  {!alert.resolved && (
                    <button
                      onClick={() => handleResolveAlert(alert.id, 'resolve')}
                      className="px-2.5 py-1 rounded bg-emerald-600 text-white font-bold text-[10px] shrink-0 ml-2 cursor-pointer"
                    >
                      Resolve
                    </button>
                  )}
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-between items-center">
              <button
                onClick={() => {
                  setIsAlertsModalOpen(false);
                  setActiveTab('alerts');
                }}
                className="text-xs text-teal-400 hover:underline font-bold"
              >
                Open Full Alerts Tab &rarr;
              </button>
              <button
                onClick={() => setIsAlertsModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
