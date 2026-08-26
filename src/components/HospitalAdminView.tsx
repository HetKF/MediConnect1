import React, { useState } from 'react';
import { 
  Building2, 
  BedDouble, 
  Wind, 
  HeartPulse, 
  Activity, 
  Siren, 
  Plus, 
  Minus, 
  CheckCircle2, 
  Clock, 
  Phone, 
  MapPin, 
  LogOut, 
  UserCheck, 
  ShieldCheck, 
  Radio, 
  Droplet, 
  AlertTriangle,
  Layers,
  ArrowRight,
  Eye
} from 'lucide-react';
import { AuthUser, Hospital, Ambulance, HospitalDoctor, DoctorDutyStatus } from '../types';
import { HOSPITAL_DOCTORS } from '../data/mockSpecialists';

interface HospitalAdminViewProps {
  user: AuthUser;
  onLogout: () => void;
  onSwitchToPatientView: () => void;
  hospitals: Hospital[];
  ambulances: Ambulance[];
  onOpenAmbulanceDrawer: () => void;
}

interface InboundCase {
  id: string;
  ambulancePlate: string;
  ambulanceType: string;
  patientCondition: string;
  etaMinutes: number;
  assignedParamedic: string;
  spo2: number;
  heartRate: number;
  o2Litres: number;
  assignedBed: string | null;
  status: 'en_route' | 'prepared' | 'admitted';
}

export const HospitalAdminView: React.FC<HospitalAdminViewProps> = ({
  user,
  onLogout,
  onSwitchToPatientView,
  hospitals,
  ambulances,
  onOpenAmbulanceDrawer,
}) => {
  // Live capacity state managed by Hospital Admin
  const [icuBeds, setIcuBeds] = useState(14);
  const [totalIcuBeds] = useState(20);
  
  const [hduBeds, setHduBeds] = useState(22);
  const [totalHduBeds] = useState(30);

  const [ventilators, setVentilators] = useState(8);
  const [totalVentilators] = useState(12);

  const [o2PressureBar, setO2PressureBar] = useState(4.2);
  const [o2Cylinders, setO2Cylinders] = useState(38);

  const [bloodUnitsO_Neg, setBloodUnitsO_Neg] = useState(16);

  // Inbound emergency transport queue
  const [inboundCases, setInboundCases] = useState<InboundCase[]>([
    {
      id: 'CASE-8821',
      ambulancePlate: ambulances[0]?.plateNumber || 'KA-01-EA-9911',
      ambulanceType: 'ALS / Cardiac Mobile ICU',
      patientCondition: 'Acute Coronary Syndrome & Dyspnea',
      etaMinutes: 4,
      assignedParamedic: 'EMT Rajesh Kumar (Level 3)',
      spo2: 94,
      heartRate: 108,
      o2Litres: 6,
      assignedBed: null,
      status: 'en_route',
    },
    {
      id: 'CASE-8824',
      ambulancePlate: ambulances[1]?.plateNumber || 'KA-04-MB-4420',
      ambulanceType: 'Trauma & Spine Unit',
      patientCondition: 'Polytrauma / Road Traffic Incident',
      etaMinutes: 9,
      assignedParamedic: 'EMT Priya Sharma',
      spo2: 98,
      heartRate: 88,
      o2Litres: 2,
      assignedBed: 'Bay T-01',
      status: 'prepared',
    },
  ]);

  // Handle Bed assignment
  const handleAssignBed = (caseId: string, bedNumber: string) => {
    setInboundCases(prev => prev.map(c => {
      if (c.id === caseId) {
        return { ...c, assignedBed: bedNumber, status: 'prepared' };
      }
      return c;
    }));
    // decrement bed count
    setIcuBeds(prev => Math.max(0, prev - 1));
  };

  const handleAdmitPatient = (caseId: string) => {
    setInboundCases(prev => prev.map(c => {
      if (c.id === caseId) {
        return { ...c, status: 'admitted' };
      }
      return c;
    }));
  };

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 flex flex-col font-sans selection:bg-teal-500 selection:text-white">
      
      {/* Top Hospital Admin Navigation Bar */}
      <header className="bg-slate-900 text-white sticky top-0 z-40 shadow-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#00b289] text-slate-950 flex items-center justify-center shadow-md">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base sm:text-lg font-black tracking-tight text-white font-sans">
                  {user.hospitalName || 'City Care Multi-Specialty Hospital'}
                </span>
                <span className="bg-[#00b289]/20 text-[#00b289] border border-[#00b289]/40 text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Admin Console
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Logged in as <strong className="text-slate-200">{user.name}</strong> ({user.email})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Switch to Patient View button */}
            <button
              onClick={onSwitchToPatientView}
              className="hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
            >
              <Eye className="w-4 h-4 text-teal-400" />
              <span>Preview Patient Portal</span>
            </button>

            {/* Emergency Ambulance locator shortcut */}
            <button
              onClick={onOpenAmbulanceDrawer}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#00b289] hover:bg-[#009e7a] text-slate-950 text-xs font-bold transition-colors cursor-pointer shadow-xs"
            >
              <Radio className="w-3.5 h-3.5 animate-pulse text-slate-950" />
              <span>Fleet Status ({ambulances.length})</span>
            </button>

            {/* Logout Button */}
            <button
              onClick={onLogout}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-950/80 hover:bg-rose-900 border border-rose-800/80 text-rose-300 hover:text-white text-xs font-semibold transition-colors cursor-pointer"
              title="Log out and return to portal selection"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden md:inline">Sign out</span>
            </button>
          </div>

        </div>
      </header>

      {/* Main Admin Dashboard */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Banner Alert: Live Inbound Ambulance Telemetry Stream */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-xs border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center shrink-0">
              <Siren className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900">
                  Active Emergency Intake Dispatch Stream
                </h2>
                <span className="bg-rose-100 text-rose-800 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider animate-pulse">
                  {inboundCases.filter(c => c.status !== 'admitted').length} En Route
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Real-time patient telemetry received from mobile intensive care ambulances en route to your emergency department.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
              Emergency Code: <strong className="text-emerald-700">GREEN CORRIDOR OPEN</strong>
            </span>
          </div>
        </div>

        {/* Live Ward Capacity & Bed Controls Grid */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Hospital Ward &amp; Bed Capacity Management
              </h3>
              <p className="text-xs text-slate-500">
                Changes made here reflect instantly across the city-wide MediConnect emergency network.
              </p>
            </div>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
              Network Synced
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* ICU Bed Card */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="w-10 h-10 rounded-xl bg-teal-50 text-[#00b289] flex items-center justify-center">
                    <BedDouble className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-teal-100/70 text-teal-800">
                    Critical Care
                  </span>
                </div>
                <h4 className="text-sm font-bold text-slate-900">ICU Beds Available</h4>
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="text-3xl font-black text-slate-900">{icuBeds}</span>
                  <span className="text-xs text-slate-400 font-semibold">/ {totalIcuBeds} Total Beds</span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-500 font-medium">Update Live Count:</span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setIcuBeds(prev => Math.max(0, prev - 1))}
                    className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-sm cursor-pointer transition-colors"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setIcuBeds(prev => Math.min(totalIcuBeds, prev + 1))}
                    className="w-8 h-8 rounded-lg bg-[#00b289] hover:bg-[#009e7a] text-white flex items-center justify-center font-bold text-sm cursor-pointer transition-colors shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* HDU Step Down Bed Card */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
                    <Layers className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-sky-100/70 text-sky-800">
                    Step-Down
                  </span>
                </div>
                <h4 className="text-sm font-bold text-slate-900">HDU Ward Beds</h4>
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="text-3xl font-black text-slate-900">{hduBeds}</span>
                  <span className="text-xs text-slate-400 font-semibold">/ {totalHduBeds} Total Beds</span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-500 font-medium">Update Live Count:</span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setHduBeds(prev => Math.max(0, prev - 1))}
                    className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-sm cursor-pointer transition-colors"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setHduBeds(prev => Math.min(totalHduBeds, prev + 1))}
                    className="w-8 h-8 rounded-lg bg-[#00b289] hover:bg-[#009e7a] text-white flex items-center justify-center font-bold text-sm cursor-pointer transition-colors shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Ventilators Available */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Wind className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-blue-100/70 text-blue-800">
                    Invasive &amp; BiPAP
                  </span>
                </div>
                <h4 className="text-sm font-bold text-slate-900">Mechanical Ventilators</h4>
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="text-3xl font-black text-slate-900">{ventilators}</span>
                  <span className="text-xs text-slate-400 font-semibold">/ {totalVentilators} Ready Units</span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-500 font-medium">Update Live Count:</span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setVentilators(prev => Math.max(0, prev - 1))}
                    className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-sm cursor-pointer transition-colors"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setVentilators(prev => Math.min(totalVentilators, prev + 1))}
                    className="w-8 h-8 rounded-lg bg-[#00b289] hover:bg-[#009e7a] text-white flex items-center justify-center font-bold text-sm cursor-pointer transition-colors shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Central Oxygen & Reserves */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                    <Activity className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-emerald-100/70 text-emerald-800">
                    Nominal 4.2 Bar
                  </span>
                </div>
                <h4 className="text-sm font-bold text-slate-900">Oxygen Manifold Line</h4>
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="text-3xl font-black text-slate-900">{o2PressureBar}</span>
                  <span className="text-xs text-slate-400 font-semibold">bar &bull; {o2Cylinders} Cylinders</span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-500 font-medium">Backup Cylinders:</span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setO2Cylinders(prev => Math.max(0, prev - 1))}
                    className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-sm cursor-pointer transition-colors"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setO2Cylinders(prev => prev + 1)}
                    className="w-8 h-8 rounded-lg bg-[#00b289] hover:bg-[#009e7a] text-white flex items-center justify-center font-bold text-sm cursor-pointer transition-colors shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Inbound Ambulances Live Queue */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Siren className="w-5 h-5 text-rose-600" />
                <span>Inbound Emergency Patient Telemetry</span>
              </h3>
              <p className="text-xs text-slate-500">
                Paramedic live telemetry streaming prior to physical arrival at emergency triage.
              </p>
            </div>
            <span className="text-xs font-semibold text-slate-500">
              Auto-refreshed via GPS gateway
            </span>
          </div>

          <div className="space-y-3">
            {inboundCases.map((patientCase) => (
              <div
                key={patientCase.id}
                className={`p-4 rounded-2xl border transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-4 ${
                  patientCase.status === 'admitted'
                    ? 'bg-slate-50 border-slate-200 opacity-75'
                    : patientCase.status === 'prepared'
                      ? 'bg-emerald-50/50 border-emerald-200'
                      : 'bg-white border-rose-200/80 shadow-2xs'
                }`}
              >
                {/* Left: Case details */}
                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-black text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md">
                      {patientCase.id}
                    </span>
                    <span className="font-bold text-sm text-slate-900">
                      {patientCase.patientCondition}
                    </span>
                    <span className="text-[11px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-md">
                      ETA: ~{patientCase.etaMinutes} mins
                    </span>
                  </div>

                  <div className="text-xs text-slate-500 flex flex-wrap items-center gap-3">
                    <span>Ambulance: <strong className="text-slate-700">{patientCase.ambulancePlate}</strong> ({patientCase.ambulanceType})</span>
                    <span>&bull;</span>
                    <span>Lead Paramedic: <strong className="text-slate-700">{patientCase.assignedParamedic}</strong></span>
                  </div>

                  {/* Telemetry Chips */}
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-sky-800 bg-sky-50 px-2.5 py-1 rounded-lg border border-sky-200">
                      <HeartPulse className="w-3.5 h-3.5 text-sky-600" />
                      HR: {patientCase.heartRate} bpm
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                      <Activity className="w-3.5 h-3.5 text-emerald-600" />
                      SpO2: {patientCase.spo2}%
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-teal-800 bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-200">
                      <Wind className="w-3.5 h-3.5 text-teal-600" />
                      O2: {patientCase.o2Litres} L/min
                    </span>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 shrink-0 border-t lg:border-t-0 pt-3 lg:pt-0 border-slate-100">
                  {patientCase.status === 'en_route' ? (
                    <>
                      <button
                        onClick={() => handleAssignBed(patientCase.id, 'ICU-Bed 03')}
                        className="px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                      >
                        <BedDouble className="w-4 h-4" />
                        <span>Reserve Bed ICU-03</span>
                      </button>
                    </>
                  ) : patientCase.status === 'prepared' ? (
                    <>
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-3 py-1.5 rounded-xl border border-emerald-200 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Assigned: {patientCase.assignedBed}
                      </span>
                      <button
                        onClick={() => handleAdmitPatient(patientCase.id)}
                        className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors cursor-pointer"
                      >
                        Mark Admitted
                      </button>
                    </>
                  ) : (
                    <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-xl">
                      Patient Admitted to Ward
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live On-Duty Medical Staff & Specialists Management */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-[#00b289]" />
                <span>On-Duty Clinical Specialists &amp; ER Physicians</span>
              </h3>
              <p className="text-xs text-slate-500">
                Live duty assignment, OT status, and on-call response telemetry for this hospital facility.
              </p>
            </div>
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Live Shift Roster
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {HOSPITAL_DOCTORS.slice(0, 6).map((doc) => (
              <div 
                key={doc.id}
                className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-teal-300 transition-all flex flex-col justify-between"
              >
                <div className="flex items-start gap-3">
                  <img
                    src={doc.avatarUrl}
                    alt={doc.name}
                    className="w-12 h-12 rounded-xl object-cover border border-slate-200"
                    referrerPolicy="no-referrer"
                  />
                  <div className="space-y-0.5 flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-slate-900 truncate">{doc.name}</h4>
                    <p className="text-xs text-teal-800 font-semibold truncate">{doc.specialty}</p>
                    <p className="text-[11px] text-slate-500 truncate">{doc.dutyLocation}</p>
                  </div>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-200/60 flex items-center justify-between">
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${
                    doc.dutyStatus === 'on_duty_er' 
                      ? 'bg-emerald-100 text-emerald-800'
                      : doc.dutyStatus === 'in_surgery'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-sky-100 text-sky-800'
                  }`}>
                    {doc.dutyStatusLabel}
                  </span>
                  <span className="text-[11px] text-slate-400 font-medium">
                    Shift: {doc.shiftTime.split(' ')[0]}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </main>

      {/* Footer */}
      <footer className="w-full bg-slate-900 text-slate-400 text-xs py-6 px-4 sm:px-6 lg:px-8 border-t border-slate-800 mt-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-base font-black text-white">Medi<span className="text-[#00b289]">Connect</span></span>
            <span className="text-[11px] text-slate-500">&bull; Hospital Facility Administration &amp; Emergency Coordination</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400 text-xs">
            <span>Emergency Operations Center: 108 / 112</span>
            <span>&bull;</span>
            <span>NABH Level 3 Certified</span>
          </div>
        </div>
      </footer>

    </div>
  );
};
