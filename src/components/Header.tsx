import React, { useState } from 'react';
import { 
  MapPin, 
  Search, 
  ChevronDown, 
  PhoneCall, 
  Siren, 
  ShieldCheck, 
  Clock, 
  User, 
  Radio, 
  CheckCircle2, 
  Navigation,
  LogOut,
  Building2,
  Sparkles
} from 'lucide-react';
import { LocationOption, ActiveBooking, AuthUser } from '../types';
import { CITIES } from '../data/mockHospitals';
import { MediConnectLogo } from './MediConnectLogo';

interface HeaderProps {
  currentUser: AuthUser | null;
  onLogout: () => void;
  currentCity: LocationOption;
  onSelectCity: (city: LocationOption) => void;
  onDetectGPS: () => void;
  isDetectingGPS: boolean;
  gpsStatusMessage: string;
  onOpenAmbulanceDrawer: () => void;
  activeBooking: ActiveBooking | null;
  onOpenLiveTracking: () => void;
  onOpenEmergencyHotline: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  onLogout,
  currentCity,
  onSelectCity,
  onDetectGPS,
  isDetectingGPS,
  gpsStatusMessage,
  onOpenAmbulanceDrawer,
  activeBooking,
  onOpenLiveTracking,
  onOpenEmergencyHotline,
}) => {
  const [isLocationOpen, setIsLocationOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showOffersModal, setShowOffersModal] = useState(false);

  return (
    <header className="w-full sticky top-0 z-40 bg-white shadow-xs border-b border-slate-100 font-sans">
      {/* Live Network Top Alert Bar */}
      <div className="bg-slate-900 text-slate-200 text-xs px-4 py-2 flex flex-wrap items-center justify-between gap-2 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 font-semibold text-emerald-400 bg-emerald-950/80 px-2.5 py-0.5 rounded-full border border-emerald-800/60 tracking-wide text-[11px]">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            LIVE NETWORK
          </span>
          <span className="text-slate-300 hidden sm:inline text-[13px]">
            Real-time hospital bed registry &amp; 24/7 ambulance triage active for <span className="font-semibold text-white">{currentCity.cityName}</span>
          </span>
        </div>

        <div className="flex items-center gap-4 text-slate-400 text-[12px]">
          <div className="hidden md:flex items-center gap-1 text-slate-300">
            <Clock className="w-3.5 h-3.5 text-teal-400" />
            <span>Average Dispatch ETA: <strong className="text-white">3m 40s</strong></span>
          </div>
          <div className="hidden lg:flex items-center gap-1 text-slate-300">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>HIPAA &amp; NABH Compliant</span>
          </div>
          <button 
            id="emergency-hotline-btn"
            onClick={onOpenEmergencyHotline}
            className="flex items-center gap-1.5 bg-rose-600 hover:bg-rose-700 text-white font-medium px-3 py-1 rounded-full text-xs transition-colors cursor-pointer"
          >
            <PhoneCall className="w-3 h-3 animate-pulse" />
            <span>Emergency 108 / 112</span>
          </button>
        </div>
      </div>

      {/* Main Header Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">
        
        {/* Logo */}
        <div className="flex items-center gap-5">
          <div 
            id="logo-brand" 
            className="flex items-center gap-2 cursor-pointer select-none group"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            <MediConnectLogo size="md" animated={true} />
            <div className="flex flex-col">
              <span className="text-2xl font-black tracking-tight text-slate-900 font-sans">
                Medi<span className="text-[#00b289]">Connect</span>
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 -mt-1">
                Healthcare Network
              </span>
            </div>
          </div>

          {/* Location Selector Dropdown */}
          <div className="relative">
            <button
              id="location-picker-btn"
              onClick={() => setIsLocationOpen(!isLocationOpen)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-sm font-medium transition-colors cursor-pointer"
            >
              <MapPin className="w-4 h-4 text-[#00b289]" />
              <span className="text-xs text-slate-500 font-normal">Location:</span>
              <span className="font-semibold text-slate-900">{currentCity.cityName}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {isLocationOpen && (
              <div className="absolute left-0 top-full mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="p-2 border-b border-slate-100">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Your Current Location
                  </div>
                  <button
                    id="gps-auto-detect-btn"
                    onClick={() => {
                      onDetectGPS();
                      setIsLocationOpen(false);
                    }}
                    disabled={isDetectingGPS}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-900 text-xs font-semibold transition-colors cursor-pointer border border-teal-200"
                  >
                    <div className="flex items-center gap-2">
                      <Navigation className={`w-4 h-4 text-[#00b289] ${isDetectingGPS ? 'animate-spin' : ''}`} />
                      <span>{isDetectingGPS ? 'Detecting GPS...' : 'Use Precise GPS Location'}</span>
                    </div>
                    <span className="text-[10px] bg-[#00b289] text-white px-2 py-0.5 rounded-full font-bold">Auto</span>
                  </button>
                  {gpsStatusMessage && (
                    <div className="text-[11px] text-teal-700 mt-1.5 px-1 font-medium">
                      {gpsStatusMessage}
                    </div>
                  )}
                </div>

                <div className="py-2">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider px-2 mb-1">
                    Major Metropolitan Hubs
                  </div>
                  {CITIES.map((city) => (
                    <button
                      key={city.id}
                      id={`select-city-${city.id}`}
                      onClick={() => {
                        onSelectCity(city);
                        setIsLocationOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 text-xs rounded-xl transition-colors cursor-pointer text-left ${
                        currentCity.id === city.id 
                          ? 'bg-teal-50 text-teal-800 font-bold' 
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <div>
                        <div className="font-semibold text-slate-900">{city.cityName}</div>
                        <div className="text-[11px] text-slate-500 font-normal">{city.defaultArea}</div>
                      </div>
                      {currentCity.id === city.id && (
                        <CheckCircle2 className="w-4 h-4 text-[#00b289]" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Global Search Bar */}
        <div className="hidden lg:flex flex-1 max-w-md mx-4">
          <div className="relative w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              id="global-header-search"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search emergency services, oxygen ambulance, ICU beds..."
              className="w-full pl-10 pr-4 py-2 rounded-full bg-slate-100/90 focus:bg-white text-xs border border-transparent focus:border-[#00b289] focus:outline-hidden transition-all text-slate-900 placeholder:text-slate-400"
            />
          </div>
        </div>

        {/* Navigation & Action Links */}
        <div className="flex items-center gap-3">
          {/* Active Booking Tracker Notification */}
          {activeBooking && (
            <button
              id="active-booking-pill"
              onClick={onOpenLiveTracking}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 transition-all text-xs font-semibold shadow-xs cursor-pointer animate-pulse"
            >
              <Siren className="w-4 h-4 text-rose-600 animate-spin" />
              <span>Ambulance En Route ({Math.ceil(activeBooking.liveEtaSeconds / 60)}m)</span>
            </button>
          )}

          {/* Quick Ambulance Dispatch CTA button */}
          <button
            id="header-ambulance-locator-btn"
            onClick={onOpenAmbulanceDrawer}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-xs hover:shadow-md transition-all cursor-pointer"
          >
            <Radio className="w-3.5 h-3.5 text-white animate-pulse" />
            <span className="hidden sm:inline">Nearby Ambulances</span>
            <span className="sm:hidden">Ambulance</span>
          </button>

          {/* Offers */}
          <button
            id="offers-btn"
            onClick={() => setShowOffersModal(true)}
            className="hidden lg:flex items-center gap-1 text-xs font-semibold text-slate-700 hover:text-teal-600 px-2 py-1.5 rounded-lg cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Offers</span>
          </button>

          {/* Active User / Portal Role Pill & Logout */}
          {currentUser && (
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
              <div className="hidden sm:flex flex-col text-right">
                <span className="text-xs font-bold text-slate-900 leading-tight">
                  {currentUser.name}
                </span>
                <span className="text-[10px] text-[#00a884] font-semibold">
                  {currentUser.role === 'hospital' ? 'Hospital Admin' : 'Patient Portal'}
                </span>
              </div>

              <div className="w-8 h-8 rounded-full bg-teal-50 text-[#00b289] border border-teal-200 flex items-center justify-center">
                {currentUser.role === 'hospital' ? (
                  <Building2 className="w-4 h-4" />
                ) : (
                  <User className="w-4 h-4" />
                )}
              </div>

              <button
                id="header-logout-btn"
                onClick={onLogout}
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
                title="Log out and switch portal"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Offers Modal */}
      {showOffersModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500" />
                Active Emergency &amp; Health Benefits
              </h3>
              <button 
                onClick={() => setShowOffersModal(false)}
                className="text-slate-400 hover:text-slate-600 text-xl font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>
            <div className="space-y-3 text-sm text-slate-700">
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                <div className="font-bold text-emerald-800">100% Free Emergency ALS Triage</div>
                <div className="text-xs text-emerald-700 mt-0.5">Zero dispatch surcharge for verified cardiac & stroke emergencies across city network.</div>
              </div>
              <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl">
                <div className="font-bold text-teal-800">Senior Citizen Subsidized Transfer</div>
                <div className="text-xs text-teal-700 mt-0.5">Flat ₹500 off on wheelchair van and regular dialysis hospital trips. Code: CARE500</div>
              </div>
            </div>
            <button
              onClick={() => setShowOffersModal(false)}
              className="mt-5 w-full py-2.5 bg-slate-900 text-white rounded-xl font-semibold text-xs cursor-pointer hover:bg-slate-800"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
