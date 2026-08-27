import React from 'react';
import { 
  ArrowRight, 
  Activity, 
  BedDouble, 
  Stethoscope, 
  Siren, 
  Radio, 
  Building2,
  Phone,
  UserCheck
} from 'lucide-react';
import { HospitalDoctor } from '../types';

interface HeroSectionProps {
  onOpenAmbulanceLocator: () => void;
  onOpenHospitalAvailability: () => void;
  onOpenLiveDoctorsRoster: () => void;
  leadDoctor: HospitalDoctor;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onOpenAmbulanceLocator,
  onOpenHospitalAvailability,
  onOpenLiveDoctorsRoster,
  leadDoctor,
}) => {
  return (
    <section className="w-full py-4 sm:py-6 px-4 sm:px-6 lg:px-8">
      <div 
        id="hero-banner"
        className="max-w-7xl mx-auto rounded-3xl bg-[#0e1d33] text-white p-6 sm:p-10 lg:p-12 relative overflow-hidden shadow-2xl border border-slate-800"
      >
        {/* Subtle background glow effect */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Heading, Badges, Tagline, CTAs */}
          <div className="lg:col-span-7 space-y-6">
            {/* Title with Gradient accent */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white font-sans">
              Medi<span className="text-[#00b289]">Connect</span>
            </h1>

            {/* Health & Network Feature Pills */}
            <div className="flex flex-wrap gap-2.5 pt-1">
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-800/80 border border-slate-700 text-xs font-semibold text-slate-200">
                <BedDouble className="w-3.5 h-3.5 text-sky-400" />
                <span><strong className="text-white font-bold">175+</strong> Live Hospital Beds</span>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-950/90 border border-emerald-500/40 text-xs font-semibold text-emerald-300">
                <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                <span>Emergency Dispatch Active</span>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-teal-950/80 border border-teal-500/40 text-xs font-semibold text-teal-300">
                <Stethoscope className="w-3.5 h-3.5 text-teal-400" />
                <span>Live Hospital Doctors Roster</span>
              </div>
            </div>

            {/* Tagline */}
            <p className="text-slate-300 text-xs sm:text-sm uppercase tracking-wider font-extrabold italic leading-relaxed pt-2">
              REAL-TIME BED REGISTRY &bull; 24/7 AMBULANCE LOCATOR &bull; HOSPITAL DOCTORS LIVE ROSTER
            </p>

            {/* Explanatory description */}
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-xl font-normal">
              Check real-time hospital bed availability across verified medical centers, monitor live on-duty hospital doctors &amp; specialists, and dispatch GPS-tracked emergency ambulances equipped with certified EMTs and oxygen telemetry.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                id="hero-ambulance-dispatch-btn"
                onClick={onOpenAmbulanceLocator}
                className="group flex items-center gap-3 px-6 py-3.5 rounded-full bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm sm:text-base shadow-lg shadow-rose-900/30 transition-all transform hover:-translate-y-0.5 cursor-pointer"
              >
                <Siren className="w-5 h-5 animate-pulse text-white" />
                <span>Locate Nearby Ambulance</span>
                <span className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center group-hover:translate-x-1 transition-transform">
                  <ArrowRight className="w-4 h-4 text-white" />
                </span>
              </button>

              <button
                id="hero-hospital-availability-btn"
                onClick={onOpenHospitalAvailability}
                className="flex items-center gap-2.5 px-5 py-3.5 rounded-full bg-[#00b289]/20 hover:bg-[#00b289]/30 text-teal-300 hover:text-white border border-[#00b289]/50 font-semibold text-sm transition-all cursor-pointer shadow-xs"
              >
                <BedDouble className="w-4 h-4 text-[#00b289]" />
                <span>Check Bed Availability</span>
              </button>

              <button
                id="hero-live-doctors-btn"
                onClick={onOpenLiveDoctorsRoster}
                className="flex items-center gap-2.5 px-5 py-3.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 font-semibold text-sm transition-all cursor-pointer shadow-xs"
              >
                <Stethoscope className="w-4 h-4 text-teal-400" />
                <span>Live Doctors Roster</span>
              </button>
            </div>
          </div>

          {/* Right Column: Live On-Duty Hospital Doctor Showcase Card */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end">
            <div 
              id="hero-doctor-card"
              className="w-full max-w-sm rounded-3xl bg-slate-800/60 p-3 border border-slate-700/60 backdrop-blur-md shadow-2xl relative group"
            >
              <div className="relative rounded-2xl overflow-hidden bg-slate-900 aspect-4/5 sm:aspect-square lg:aspect-4/5">
                <img 
                  src={leadDoctor.avatarUrl} 
                  alt={leadDoctor.name}
                  className="w-full h-full object-cover object-top group-hover:scale-103 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />

                {/* Live Doctor Overlay Badge & Hospital Affiliation */}
                <div className="absolute bottom-3 left-3 right-3 p-3.5 rounded-xl bg-slate-900/90 backdrop-blur-md border border-slate-800 text-left">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <h2 className="text-white font-bold text-sm truncate">
                      {leadDoctor.name}
                    </h2>
                    <span className="inline-flex items-center gap-1 bg-emerald-950 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-800">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Live On-Duty
                    </span>
                  </div>

                  <p className="text-teal-400 text-xs font-semibold truncate">
                    {leadDoctor.specialty}
                  </p>

                  <div className="flex items-center gap-1.5 text-slate-300 text-[11px] mt-1 truncate">
                    <Building2 className="w-3 h-3 text-slate-400 shrink-0" />
                    <span className="truncate">{leadDoctor.hospital}</span>
                  </div>
                  
                  <div className="mt-2.5 pt-2 border-t border-slate-800 flex items-center justify-between">
                    <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                      <UserCheck className="w-3 h-3" />
                      {leadDoctor.dutyLocation}
                    </span>
                    <button
                      id="hero-view-roster-btn"
                      onClick={onOpenLiveDoctorsRoster}
                      className="text-[11px] font-bold text-slate-950 bg-[#00b289] hover:bg-[#009e7a] px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1 shadow-xs"
                    >
                      <span>Live Roster</span>
                      <ArrowRight className="w-3 h-3 text-slate-950" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
