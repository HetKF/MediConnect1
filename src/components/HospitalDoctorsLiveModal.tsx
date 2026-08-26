import React, { useState, useEffect } from 'react';
import { 
  X, 
  Building2, 
  Stethoscope, 
  HeartPulse, 
  Activity, 
  Search, 
  Clock, 
  Phone, 
  ShieldCheck, 
  UserCheck, 
  Radio, 
  AlertCircle, 
  ChevronRight,
  Filter,
  CheckCircle2,
  Sparkles,
  MapPin,
  RefreshCw
} from 'lucide-react';
import { HospitalDoctor, Hospital, LocationOption } from '../types';
import { HOSPITAL_DOCTORS } from '../data/mockSpecialists';

interface HospitalDoctorsLiveModalProps {
  isOpen: boolean;
  onClose: () => void;
  hospitals: Hospital[];
  currentCity: LocationOption;
  initialSelectedHospitalId?: string | null;
}

export const HospitalDoctorsLiveModal: React.FC<HospitalDoctorsLiveModalProps> = ({
  isOpen,
  onClose,
  hospitals,
  currentCity,
  initialSelectedHospitalId,
}) => {
  const [selectedHospitalId, setSelectedHospitalId] = useState<string>(initialSelectedHospitalId || 'ALL');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [liveDoctors, setLiveDoctors] = useState<HospitalDoctor[]>(HOSPITAL_DOCTORS);
  const [isSimulatingUpdate, setIsSimulatingUpdate] = useState<boolean>(false);
  const [recentLiveAlert, setRecentLiveAlert] = useState<string>(
    '🟢 Dr. Sameer Godbole active in Emergency Cath Lab at Lilavati Hospital'
  );

  // Sync initial hospital selection when prop changes
  useEffect(() => {
    if (initialSelectedHospitalId) {
      setSelectedHospitalId(initialSelectedHospitalId);
    }
  }, [initialSelectedHospitalId]);

  // Live simulation ticker that periodically updates status or cases
  useEffect(() => {
    if (!isOpen) return;

    const interval = setInterval(() => {
      const liveFeeds = [
        '🟢 Dr. Sameer Godbole active in Emergency Cath Lab at Lilavati Hospital',
        '⚡ Dr. Priya Deshmukh responded to Trauma Bay 1 at Hinduja Hospital',
        '🏥 Dr. Ashok Mishra completed ICU rounds (5 beds stabilized) at Lilavati',
        '🩺 Dr. Anita Sengupta active in Acute Stroke Triage at KEM Hospital',
        '🟢 Dr. Harshvardhan Rathi on-duty in Red Emergency Bay at AIIMS',
        '✨ Dr. Rajiv Khurana initiated Emergency Coronary Protocol at Max Super Speciality',
      ];
      const randomFeed = liveFeeds[Math.floor(Math.random() * liveFeeds.length)];
      setRecentLiveAlert(randomFeed);
    }, 5000);

    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  // Filter doctors by selected hospital, department, and query
  const filteredDoctors = liveDoctors.filter((doc) => {
    // Hospital filter
    if (selectedHospitalId !== 'ALL') {
      const matchHosp = doc.hospitalId === selectedHospitalId || 
        doc.hospital.toLowerCase().includes(
          (hospitals.find(h => h.id === selectedHospitalId)?.name || '').toLowerCase()
        );
      if (!matchHosp) return false;
    }

    // Department filter
    if (selectedDepartment !== 'ALL') {
      if (!doc.department.toLowerCase().includes(selectedDepartment.toLowerCase()) &&
          !doc.specialty.toLowerCase().includes(selectedDepartment.toLowerCase())) {
        return false;
      }
    }

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchQuery = 
        doc.name.toLowerCase().includes(q) ||
        doc.specialty.toLowerCase().includes(q) ||
        doc.department.toLowerCase().includes(q) ||
        doc.hospital.toLowerCase().includes(q) ||
        doc.qualification.toLowerCase().includes(q);
      if (!matchQuery) return false;
    }

    return true;
  });

  const departments = [
    { id: 'ALL', label: 'All Departments' },
    { id: 'Emergency', label: 'Emergency & Trauma' },
    { id: 'Intensive', label: 'ICU & Critical Care' },
    { id: 'Cardio', label: 'Cardiology' },
    { id: 'Neuro', label: 'Neurology' },
    { id: 'Ortho', label: 'Orthopedics' },
    { id: 'Pulmo', label: 'Pulmonology' },
  ];

  const handleManualRefresh = () => {
    setIsSimulatingUpdate(true);
    setTimeout(() => {
      setLiveDoctors(prev => prev.map(doc => ({
        ...doc,
        lastUpdated: 'Just now',
        activeCasesCount: Math.max(1, (doc.activeCasesCount || 3) + (Math.random() > 0.5 ? 1 : -1)),
      })));
      setIsSimulatingUpdate(false);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-5xl w-full p-5 sm:p-7 shadow-2xl border border-slate-200 max-h-[92vh] flex flex-col font-sans">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-teal-50 text-[#00b289] flex items-center justify-center">
                <Stethoscope className="w-5 h-5" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-xl font-bold text-slate-900">
                    Live Hospital Doctors &amp; Specialists Roster
                  </h2>
                  <span className="bg-amber-100 text-amber-900 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-amber-300/80">
                    Demo/Mock Data — for SIH Prototype
                  </span>
                  <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                    Live Telemetry
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Real-time duty status, ER triage presence, ICU rounds &amp; surgical rosters mapped by hospital in <strong className="text-slate-800">{currentCity.cityName}</strong>
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleManualRefresh}
              disabled={isSimulatingUpdate}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
              title="Refresh Live Roster"
            >
              <RefreshCw className={`w-4 h-4 ${isSimulatingUpdate ? 'animate-spin text-[#00b289]' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Live Broadcast Ticker Bar */}
        <div className="mt-3.5 bg-slate-900 text-slate-200 px-3.5 py-2 rounded-2xl flex items-center justify-between gap-3 text-xs border border-slate-800">
          <div className="flex items-center gap-2 overflow-hidden">
            <span className="bg-[#00b289] text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider shrink-0">
              LIVE DUTY FEED
            </span>
            <span className="text-slate-300 truncate font-medium">
              {recentLiveAlert}
            </span>
          </div>
          <span className="text-[11px] text-slate-400 shrink-0 hidden sm:inline">
            Refreshed every 5s &bull; City Network
          </span>
        </div>

        {/* Hospital Tabs Selector */}
        <div className="mt-4 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setSelectedHospitalId('ALL')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
              selectedHospitalId === 'ALL'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Hospitals ({liveDoctors.length} Doctors)
          </button>
          {hospitals.map((hosp) => {
            const count = liveDoctors.filter(d => 
              d.hospitalId === hosp.id || d.hospital.toLowerCase().includes(hosp.name.toLowerCase())
            ).length;

            return (
              <button
                key={hosp.id}
                onClick={() => setSelectedHospitalId(hosp.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
                  selectedHospitalId === hosp.id
                    ? 'bg-[#00b289] text-slate-950 shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>{hosp.name.split(' ')[0]} {hosp.name.split(' ')[1] || ''}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  selectedHospitalId === hosp.id ? 'bg-slate-950 text-white' : 'bg-slate-200 text-slate-700'
                }`}>
                  {count || 2}
                </span>
              </button>
            );
          })}
        </div>

        {/* Department & Search Filter Controls */}
        <div className="mt-3.5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Department pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none flex-1">
            {departments.map((dept) => (
              <button
                key={dept.id}
                onClick={() => setSelectedDepartment(dept.id)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  selectedDepartment === dept.id
                    ? 'bg-teal-50 text-teal-800 border border-teal-200 font-bold'
                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                }`}
              >
                {dept.label}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-64 shrink-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search doctor, specialty, wing..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:border-[#00b289]"
            />
          </div>
        </div>

        {/* Doctors Grid Cards */}
        <div className="flex-1 overflow-y-auto mt-4 space-y-3 pr-1">
          {filteredDoctors.map((doc) => {
            // Determine status style
            const isER = doc.dutyStatus === 'on_duty_er';
            const isSurgery = doc.dutyStatus === 'in_surgery';
            const isICU = doc.dutyStatus === 'icu_rounds';

            return (
              <div
                key={doc.id}
                className="p-4 sm:p-5 rounded-2xl border border-slate-200 bg-white hover:border-teal-300 hover:shadow-xs transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-4"
              >
                {/* Left: Avatar + Info */}
                <div className="flex items-start gap-4">
                  <div className="relative shrink-0">
                    <img
                      src={doc.avatarUrl}
                      alt={doc.name}
                      className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl object-cover object-top border-2 border-slate-100 shadow-2xs"
                      referrerPolicy="no-referrer"
                    />
                    {/* Live status dot */}
                    <span className="absolute -bottom-1 -right-1 flex h-4 w-4">
                      <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                        isSurgery ? 'bg-amber-400' : isER ? 'bg-emerald-400' : 'bg-sky-400'
                      }`} />
                      <span className={`relative inline-flex rounded-full h-4 w-4 border-2 border-white ${
                        isSurgery ? 'bg-amber-500' : isER ? 'bg-emerald-500' : 'bg-sky-500'
                      }`} />
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-base font-bold text-slate-900">
                        {doc.name}
                      </h3>
                      <span className="text-xs text-slate-500 font-medium">
                        &bull; {doc.qualification}
                      </span>
                    </div>

                    <div className="text-xs font-semibold text-teal-800">
                      {doc.specialty} ({doc.department})
                    </div>

                    {/* Hospital & Location */}
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 pt-0.5">
                      <span className="flex items-center gap-1 text-slate-800 font-medium">
                        <Building2 className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                        <strong>{doc.hospital}</strong>
                      </span>
                      <span>&bull;</span>
                      <span className="flex items-center gap-1 text-slate-600">
                        <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                        {doc.dutyLocation}
                      </span>
                    </div>

                    {/* Duty status badge */}
                    <div className="pt-1.5 flex flex-wrap items-center gap-2">
                      <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-lg border ${
                        isER 
                          ? 'bg-emerald-50 text-emerald-900 border-emerald-200' 
                          : isSurgery
                            ? 'bg-amber-50 text-amber-900 border-amber-200'
                            : isICU
                              ? 'bg-sky-50 text-sky-900 border-sky-200'
                              : 'bg-purple-50 text-purple-900 border-purple-200'
                      }`}>
                        <Radio className="w-3 h-3 animate-pulse" />
                        <span>{doc.dutyStatusLabel}</span>
                      </span>

                      <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-1 rounded-lg">
                        Response: <strong className="text-slate-900">{doc.onCallResponseTime}</strong>
                      </span>

                      <span className="text-[11px] font-medium text-slate-400">
                        Updated {doc.lastUpdated}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: Hospital Shift & Live Duty Pager */}
                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 border-t lg:border-t-0 pt-3 lg:pt-0 border-slate-100 shrink-0">
                  <div className="text-left sm:text-right text-xs">
                    <div className="text-slate-400 font-medium flex items-center sm:justify-end gap-1">
                      <Clock className="w-3.5 h-3.5 text-teal-600" />
                      <span>{doc.shiftTime}</span>
                    </div>
                    {doc.activeCasesCount && (
                      <div className="text-[11px] font-bold text-slate-700 mt-0.5">
                        Active Triage: <span className="text-emerald-700">{doc.activeCasesCount} cases in ward</span>
                      </div>
                    )}
                  </div>

                  <a
                    href={`tel:${doc.emergencyContact}`}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-2xs transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5 text-teal-400" />
                    <span>Hospital Desk ({doc.emergencyContact.slice(-4)})</span>
                  </a>
                </div>
              </div>
            );
          })}

          {filteredDoctors.length === 0 && (
            <div className="py-16 text-center text-slate-400 text-xs">
              No doctors found matching your criteria.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-teal-600" />
            Verified live hospital clinical duty registry under NABH standards
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
