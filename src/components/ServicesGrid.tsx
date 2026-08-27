import React from 'react';
import { 
  Siren, 
  ArrowRight, 
  Wind, 
  HeartPulse, 
  Activity, 
  Building2,
  BedDouble,
  Clock,
  ShieldCheck,
  Stethoscope,
  Radio,
  UserCheck
} from 'lucide-react';
import { Ambulance } from '../types';

interface ServicesGridProps {
  onOpenLiveDoctorsRoster: () => void;
  onOpenAmbulanceLocator: () => void;
  onOpenHospitalBedRegistry: () => void;
  nearbyAmbulanceCount: number;
  closestAmbulance: Ambulance | null;
}

export const ServicesGrid: React.FC<ServicesGridProps> = ({
  onOpenLiveDoctorsRoster,
  onOpenAmbulanceLocator,
  onOpenHospitalBedRegistry,
  nearbyAmbulanceCount,
  closestAmbulance,
}) => {
  return (
    <section className="w-full py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          
          {/* Card 1: 24/7 EMERGENCY AMBULANCE (High Priority) */}
          <div 
            id="service-card-ambulance"
            onClick={onOpenAmbulanceLocator}
            className="group relative rounded-3xl bg-[#ffecef] hover:bg-[#fedde2] p-6 sm:p-7 flex flex-col justify-between min-h-[290px] border-2 border-rose-300 shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer overflow-hidden"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-rose-800 bg-rose-200 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-500 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-600"></span>
                  </span>
                  GPS Active &bull; {nearbyAmbulanceCount} Ready
                </span>
                <span className="text-[11px] font-bold text-rose-700 bg-white/90 px-2.5 py-0.5 rounded-md border border-rose-200">
                  ~{closestAmbulance ? `${closestAmbulance.etaMinutes}m ETA` : '3m ETA'}
                </span>
              </div>

              <h3 className="text-2xl font-black text-rose-950 font-sans leading-tight">
                24/7 Emergency Ambulance
              </h3>
              <p className="text-xs sm:text-sm font-semibold text-rose-900/90 mt-1.5 leading-relaxed">
                Oxygen cylinders, portable ventilators, cardiac telemetry &amp; live GPS driver tracking.
              </p>
              
              {/* Equipment micro badges */}
              <div className="flex flex-wrap gap-1.5 mt-3">
                <span className="text-[10px] font-bold bg-white text-rose-800 px-2 py-0.5 rounded-md border border-rose-200 inline-flex items-center gap-1 shadow-2xs">
                  <Wind className="w-3 h-3 text-teal-600" /> O2 Cylinder
                </span>
                <span className="text-[10px] font-bold bg-white text-rose-800 px-2 py-0.5 rounded-md border border-rose-200 inline-flex items-center gap-1 shadow-2xs">
                  <Activity className="w-3 h-3 text-blue-600" /> Ventilator
                </span>
                <span className="text-[10px] font-bold bg-white text-rose-800 px-2 py-0.5 rounded-md border border-rose-200 inline-flex items-center gap-1 shadow-2xs">
                  <HeartPulse className="w-3 h-3 text-rose-600" /> CCU / ALS
                </span>
              </div>
            </div>

            <div className="relative flex items-end justify-between mt-4">
              <button 
                id="btn-emergency-ambulance"
                className="w-12 h-12 rounded-full bg-rose-600 group-hover:bg-rose-700 text-white flex items-center justify-center shadow-lg shadow-rose-900/20 transition-transform group-hover:scale-110 cursor-pointer"
              >
                <ArrowRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
              </button>

              {/* Minimal Line art ambulance icon with flashing siren */}
              <div className="w-20 h-20 opacity-90 group-hover:opacity-100 transition-opacity relative">
                <svg viewBox="0 0 100 100" className="w-full h-full stroke-rose-800 fill-none" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 65 H 25" />
                  <circle cx="35" cy="65" r="8" />
                  <path d="M43 65 H 65" />
                  <circle cx="73" cy="65" r="8" />
                  <path d="M81 65 H 88 V 50 L 75 35 H 20 C 17 35, 15 37, 15 40 V 65 Z" />
                  <path d="M60 35 V 50 H 83" />
                  <path d="M38 43 V 53" strokeWidth="3.5" />
                  <path d="M33 48 H 43" strokeWidth="3.5" />
                  <path d="M42 35 L 45 28 H 53 L 56 35" fill="#f43f5e" />
                </svg>
              </div>
            </div>
          </div>

          {/* Card 2: Hospital Bed & ICU Availability Registry */}
          <div 
            id="service-card-hospital-beds"
            onClick={onOpenHospitalBedRegistry}
            className="group relative rounded-3xl bg-[#e6f4f8] hover:bg-[#d8eef4] p-6 sm:p-7 flex flex-col justify-between min-h-[290px] border border-teal-300/80 shadow-xs hover:shadow-md transition-all duration-300 cursor-pointer overflow-hidden"
          >
            <div>
              <div className="inline-flex items-center gap-1 text-[11px] font-bold text-teal-950 bg-teal-200/80 px-2.5 py-0.5 rounded-full mb-3 uppercase tracking-wider">
                <BedDouble className="w-3 h-3 text-teal-700" />
                Hospital Capacity Registry
              </div>
              <h3 className="text-2xl font-bold text-slate-900 font-sans leading-tight">
                Hospital Bed Availability
              </h3>
              <p className="text-xs sm:text-sm font-medium text-teal-900/80 mt-1.5 leading-relaxed">
                Live view of available ICU beds, HDU step-down units, and ventilator status across verified facilities.
              </p>

              <div className="flex flex-wrap gap-1.5 mt-3">
                <span className="text-[10px] font-bold bg-white text-teal-900 px-2 py-0.5 rounded-md border border-teal-200 inline-flex items-center gap-1 shadow-2xs">
                  <ShieldCheck className="w-3 h-3 text-teal-600" /> NABH Verified
                </span>
                <span className="text-[10px] font-bold bg-white text-teal-900 px-2 py-0.5 rounded-md border border-teal-200 inline-flex items-center gap-1 shadow-2xs">
                  <Clock className="w-3 h-3 text-teal-600" /> Direct Intake
                </span>
              </div>
            </div>

            <div className="relative flex items-end justify-between mt-4">
              <button 
                id="btn-hospital-bed-registry"
                className="w-12 h-12 rounded-full bg-slate-900 group-hover:bg-slate-800 text-white flex items-center justify-center shadow-md transition-transform group-hover:scale-105 cursor-pointer"
              >
                <ArrowRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
              </button>

              {/* Minimal Line art hospital bed */}
              <div className="w-20 h-20 opacity-80 group-hover:opacity-100 transition-opacity">
                <svg viewBox="0 0 100 100" className="w-full h-full stroke-teal-800 fill-none" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 65 V 45 H 25 V 65" />
                  <path d="M25 55 H 85 V 65" />
                  <path d="M85 40 V 65" />
                  <path d="M25 35 H 40 L 48 20 L 56 45 L 64 30 L 70 35 H 85" strokeWidth="2.5" stroke="#0d9488" />
                  <circle cx="35" cy="45" r="5" fill="#0d9488" />
                </svg>
              </div>
            </div>
          </div>

          {/* Card 3: Live Hospital Doctors & Specialists Updates */}
          <div 
            id="service-card-hospital-doctors"
            onClick={onOpenLiveDoctorsRoster}
            className="group relative rounded-3xl bg-[#f0f9f6] hover:bg-[#e4f5ee] p-6 sm:p-7 flex flex-col justify-between min-h-[290px] border border-emerald-200 shadow-xs hover:shadow-md transition-all duration-300 cursor-pointer overflow-hidden"
          >
            <div>
              <div className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-900 bg-emerald-100/90 px-2.5 py-0.5 rounded-full mb-3 uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping mr-0.5" />
                Live Duty Roster by Hospital
              </div>
              <h3 className="text-2xl font-bold text-slate-900 font-sans leading-tight">
                Hospital Doctors Live Updates
              </h3>
              <p className="text-xs sm:text-sm font-medium text-slate-700 mt-1.5 leading-relaxed">
                Real-time duty status of ER triage doctors, ICU intensivists, trauma surgeons &amp; on-call specialists by hospital.
              </p>

              <div className="flex flex-wrap gap-1.5 mt-3">
                <span className="text-[10px] font-bold bg-white text-emerald-900 px-2 py-0.5 rounded-md border border-emerald-200 inline-flex items-center gap-1 shadow-2xs">
                  <UserCheck className="w-3 h-3 text-emerald-600" /> ER / ICU Live Presence
                </span>
                <span className="text-[10px] font-bold bg-white text-emerald-900 px-2 py-0.5 rounded-md border border-emerald-200 inline-flex items-center gap-1 shadow-2xs">
                  <Radio className="w-3 h-3 text-teal-600" /> Real-Time OT &amp; Triage
                </span>
              </div>
            </div>

            <div className="relative flex items-end justify-between mt-4">
              <button 
                id="btn-hospital-doctors-live"
                className="w-12 h-12 rounded-full bg-slate-900 group-hover:bg-slate-800 text-white flex items-center justify-center shadow-md transition-transform group-hover:scale-105 cursor-pointer"
              >
                <ArrowRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
              </button>

              {/* Minimal Line art icon for live stethoscope & hospital */}
              <div className="w-20 h-20 opacity-80 group-hover:opacity-100 transition-opacity">
                <svg viewBox="0 0 100 100" className="w-full h-full stroke-emerald-800 fill-none" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M30 25 V 45 C 30 55, 40 65, 50 65 C 60 65, 70 55, 70 45 V 25" />
                  <path d="M50 65 V 78" />
                  <circle cx="50" cy="84" r="6" fill="#10b981" />
                  <circle cx="30" cy="22" r="4" fill="#065f46" />
                  <circle cx="70" cy="22" r="4" fill="#065f46" />
                </svg>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
