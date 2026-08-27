import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { ServicesGrid } from './components/ServicesGrid';
import { AmbulanceDrawer } from './components/AmbulanceDrawer';
import { LiveTrackingModal } from './components/LiveTrackingModal';
import { HospitalBedModal } from './components/HospitalBedModal';
import { HospitalDoctorsLiveModal } from './components/HospitalDoctorsLiveModal';
import { AuthPortal } from './components/AuthPortal';
import { HospitalAdminView } from './components/HospitalAdminView';
import { CITIES, HOSPITALS_BY_CITY } from './data/mockHospitals';
import { GET_INITIAL_AMBULANCES } from './data/mockAmbulances';
import { HOSPITAL_DOCTORS } from './data/mockSpecialists';
import { Ambulance, Hospital, LocationOption, ActiveBooking, TrackingStep, AuthUser, HospitalDoctor } from './types';
import { toggleSirenAudio } from './utils/audioSiren';
import { MediConnectLogo } from './components/MediConnectLogo';
import { 
  Siren, 
  BedDouble, 
  Building2,
  UserCheck,
  Stethoscope
} from 'lucide-react';

export default function App() {
  // Auth state: Gate website with login page first
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);

  const [currentCity, setCurrentCity] = useState<LocationOption>(CITIES[0]);
  const [userAddress, setUserAddress] = useState<string>(CITIES[0].defaultArea + ', ' + CITIES[0].cityName);
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number }>(CITIES[0].coords);
  const [isDetectingGPS, setIsDetectingGPS] = useState<boolean>(false);
  const [gpsStatusMessage, setGpsStatusMessage] = useState<string>('');

  const [ambulances, setAmbulances] = useState<Ambulance[]>(() => GET_INITIAL_AMBULANCES(CITIES[0].coords));
  const [hospitals, setHospitals] = useState<Hospital[]>(() => HOSPITALS_BY_CITY[CITIES[0].id] || HOSPITALS_BY_CITY['mumbai']);

  // Modals & Drawers state
  const [isAmbulanceDrawerOpen, setIsAmbulanceDrawerOpen] = useState<boolean>(false);
  const [isLiveTrackingOpen, setIsLiveTrackingOpen] = useState<boolean>(false);
  const [isHospitalBedModalOpen, setIsHospitalBedModalOpen] = useState<boolean>(false);
  const [isLiveDoctorsModalOpen, setIsLiveDoctorsModalOpen] = useState<boolean>(false);
  const [selectedHospitalForDoctorsModal, setSelectedHospitalForDoctorsModal] = useState<string | null>(null);
  
  // Active Dispatch & Tracking Session
  const [activeBooking, setActiveBooking] = useState<ActiveBooking | null>(null);
  const [sirenOn, setSirenOn] = useState<boolean>(false);

  // When city changes, update coordinates, ambulances, and hospitals
  const handleSelectCity = (city: LocationOption) => {
    setCurrentCity(city);
    setUserCoords(city.coords);
    setUserAddress(`${city.defaultArea}, ${city.cityName}`);
    setAmbulances(GET_INITIAL_AMBULANCES(city.coords));
    setHospitals(HOSPITALS_BY_CITY[city.id] || HOSPITALS_BY_CITY['mumbai']);
    setGpsStatusMessage(`Location set to ${city.cityName}`);
  };

  // Live GPS Browser Geolocation Detection
  const handleDetectGPS = () => {
    setIsDetectingGPS(true);
    setGpsStatusMessage('Acquiring high-accuracy GPS lock...');

    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          const newCoords = { lat, lng };
          setUserCoords(newCoords);
          setUserAddress(`GPS Location (${lat.toFixed(4)}, ${lng.toFixed(4)}), ${currentCity.cityName}`);
          setAmbulances(GET_INITIAL_AMBULANCES(newCoords));
          setIsDetectingGPS(false);
          setGpsStatusMessage('GPS coordinates locked successfully!');
        },
        (error) => {
          console.warn('Geolocation fallback:', error.message);
          const fallbackCoords = {
            lat: currentCity.coords.lat + 0.003,
            lng: currentCity.coords.lng - 0.002,
          };
          setUserCoords(fallbackCoords);
          setUserAddress(`Exact GPS Spot near ${currentCity.defaultArea}`);
          setAmbulances(GET_INITIAL_AMBULANCES(fallbackCoords));
          setIsDetectingGPS(false);
          setGpsStatusMessage('GPS pinpointed to your local sector.');
        },
        { enableHighAccuracy: true, timeout: 6000 }
      );
    } else {
      setIsDetectingGPS(false);
      setGpsStatusMessage('Geolocation not supported in browser, using default.');
    }
  };

  // Dispatch an Ambulance
  const handleDispatchAmbulance = (
    ambulance: Ambulance,
    destinationHospital: Hospital,
    requiredEquipment: string[] = []
  ) => {
    const initialTimeline: TrackingStep[] = [
      {
        id: 'dispatched',
        label: 'Dispatched & Paramedics Assigned',
        description: `Vehicle ${ambulance.plateNumber} dispatched with certified EMTs`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        completed: true,
        active: false,
      },
      {
        id: 'en_route_pickup',
        label: 'En Route to Location',
        description: `Approaching ${userAddress}`,
        timestamp: 'Live (~3m)',
        completed: false,
        active: true,
      },
      {
        id: 'arrived_pickup',
        label: 'Arrival & Vitals Stabilization',
        description: 'Patient transfer to stretcher with Oxygen backup',
        timestamp: 'Pending',
        completed: false,
        active: false,
      },
      {
        id: 'en_route_hospital',
        label: `Transferring to ${destinationHospital.name}`,
        description: 'Emergency green-corridor route active',
        timestamp: 'Pending',
        completed: false,
        active: false,
      },
    ];

    const newBooking: ActiveBooking = {
      id: 'DISP-' + Math.floor(100000 + Math.random() * 900000),
      bookingTime: new Date().toISOString(),
      ambulance,
      pickupAddress: userAddress,
      pickupCoords: userCoords,
      destinationHospital,
      patientCondition: 'Emergency Ambulance Requested',
      requiredEquipmentFilters: requiredEquipment,
      currentStatus: 'en_route_pickup',
      currentDriverCoords: ambulance.coords,
      liveDistanceKm: ambulance.distanceKm,
      liveEtaSeconds: ambulance.etaMinutes * 60,
      driverSpeedKmh: ambulance.speedKmh,
      oxygenLiveLevel: ambulance.equipment.oxygenLevelPercent,
      heartRateTelemetry: 78,
      spo2Telemetry: 98,
      batteryLiveLevel: 96,
      timeline: initialTimeline,
      sirenOn: false,
    };

    setActiveBooking(newBooking);
    setIsAmbulanceDrawerOpen(false);
    setIsLiveTrackingOpen(true);
  };

  // 1-Tap Fast SOS Dispatch
  const handleFastSosDispatch = () => {
    const closest = ambulances.find(a => a.equipment.oxygenCylinder) || ambulances[0];
    const topHospital = hospitals[0];
    handleDispatchAmbulance(closest, topHospital, ['OXYGEN']);
  };

  // Toggle Siren sound
  const handleToggleSiren = () => {
    const nextState = !sirenOn;
    setSirenOn(nextState);
    toggleSirenAudio(nextState);
    if (activeBooking) {
      setActiveBooking({
        ...activeBooking,
        sirenOn: nextState,
      });
    }
  };

  // Real-time dynamic GPS telemetry ticker simulation
  useEffect(() => {
    if (!activeBooking) return;

    const interval = setInterval(() => {
      setActiveBooking(prev => {
        if (!prev) return null;
        
        const nextEtaSeconds = Math.max(prev.liveEtaSeconds - 1, 0);
        const distanceRatio = nextEtaSeconds / (prev.ambulance.etaMinutes * 60);
        const nextDistance = Math.max(prev.ambulance.distanceKm * distanceRatio, 0.05);
        const jitterSpeed = Math.floor(48 + Math.sin(Date.now() / 2000) * 8);

        return {
          ...prev,
          liveEtaSeconds: nextEtaSeconds,
          liveDistanceKm: nextDistance,
          driverSpeedKmh: nextEtaSeconds === 0 ? 0 : jitterSpeed,
          oxygenLiveLevel: 94,
          batteryLiveLevel: 96,
        };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [activeBooking]);

  // Open live doctors roster modal optionally filtered by specific hospital
  const handleOpenLiveDoctorsRoster = (hospitalId?: string) => {
    setSelectedHospitalForDoctorsModal(hospitalId || 'ALL');
    setIsLiveDoctorsModalOpen(true);
  };

  // 1. If not authenticated, render Login Portal first
  if (!currentUser) {
    return <AuthPortal onLogin={(user) => setCurrentUser(user)} />;
  }

  // 2. If Hospital Admin is logged in, render Hospital Admin View
  if (currentUser.role === 'hospital') {
    return (
      <>
        <HospitalAdminView
          user={currentUser}
          onLogout={() => setCurrentUser(null)}
          onSwitchToPatientView={() => setCurrentUser({ ...currentUser, role: 'patient' })}
          hospitals={hospitals}
          ambulances={ambulances}
          onOpenAmbulanceDrawer={() => setIsAmbulanceDrawerOpen(true)}
        />
        
        {/* Ambulance drawer for inspecting fleet details */}
        <AmbulanceDrawer
          isOpen={isAmbulanceDrawerOpen}
          onClose={() => setIsAmbulanceDrawerOpen(false)}
          ambulances={ambulances}
          hospitals={hospitals}
          currentCity={currentCity}
          userAddress={userAddress}
          isDetectingGPS={isDetectingGPS}
          onDetectGPS={handleDetectGPS}
          onDispatchAmbulance={handleDispatchAmbulance}
          onFastSosDispatch={handleFastSosDispatch}
        />
      </>
    );
  }

  const closestAmbulance = ambulances[0] || null;
  const leadDoctor = HOSPITAL_DOCTORS[0];

  // 3. Patient / Customer View
  return (
    <div className="min-h-screen bg-slate-100/60 font-sans text-slate-900 flex flex-col selection:bg-teal-500 selection:text-white">
      
      {/* Header with Location Picker, Live Network Status, Search & User Profile */}
      <Header
        currentUser={currentUser}
        onLogout={() => setCurrentUser(null)}
        currentCity={currentCity}
        onSelectCity={handleSelectCity}
        onDetectGPS={handleDetectGPS}
        isDetectingGPS={isDetectingGPS}
        gpsStatusMessage={gpsStatusMessage}
        onOpenAmbulanceDrawer={() => setIsAmbulanceDrawerOpen(true)}
        activeBooking={activeBooking}
        onOpenLiveTracking={() => setIsLiveTrackingOpen(true)}
        onOpenEmergencyHotline={() => {
          alert("Emergency Hotline: Dialing 108 (National Ambulance) & 112 (Emergency Response Center).");
        }}
      />

      {/* Main Content Body */}
      <main className="flex-1 pb-16">
        
        {/* Hero Section */}
        <HeroSection
          onOpenAmbulanceLocator={() => setIsAmbulanceDrawerOpen(true)}
          onOpenHospitalAvailability={() => setIsHospitalBedModalOpen(true)}
          onOpenLiveDoctorsRoster={() => handleOpenLiveDoctorsRoster()}
          leadDoctor={leadDoctor}
        />

        {/* 3 Clean Service Cards Grid: Ambulance, Bed Availability, Hospital Doctors Live Updates */}
        <ServicesGrid
          onOpenLiveDoctorsRoster={() => handleOpenLiveDoctorsRoster()}
          onOpenAmbulanceLocator={() => setIsAmbulanceDrawerOpen(true)}
          onOpenHospitalBedRegistry={() => setIsHospitalBedModalOpen(true)}
          nearbyAmbulanceCount={ambulances.length}
          closestAmbulance={closestAmbulance}
        />

      </main>

      {/* Floating Emergency SOS Action Pill */}
      <aside aria-label="Emergency quick action" className="fixed bottom-5 right-5 z-40 flex flex-col items-end gap-2.5">
        {activeBooking && (
          <button
            id="floating-live-tracker-btn"
            onClick={() => setIsLiveTrackingOpen(true)}
            className="flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-slate-900 text-white border-2 border-emerald-500 shadow-2xl hover:bg-slate-800 transition-transform hover:scale-105 cursor-pointer animate-pulse"
          >
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-bold font-mono">
              Ambulance {Math.ceil(activeBooking.liveEtaSeconds / 60)}m away
            </span>
          </button>
        )}

        <div className="flex items-center gap-2">
          <button
            id="floating-live-doctors-btn"
            onClick={() => handleOpenLiveDoctorsRoster()}
            className="flex items-center gap-2 px-4 py-3.5 rounded-full bg-slate-900 hover:bg-slate-800 text-emerald-300 font-bold text-xs shadow-xl border border-emerald-500/40 transition-all hover:scale-105 cursor-pointer"
          >
            <Stethoscope className="w-4 h-4 text-emerald-400" />
            <span className="hidden sm:inline">Live Doctors Roster</span>
            <span className="sm:hidden">Doctors</span>
          </button>

          <button
            id="floating-bed-check-btn"
            onClick={() => setIsHospitalBedModalOpen(true)}
            className="flex items-center gap-2 px-4 py-3.5 rounded-full bg-slate-900 hover:bg-slate-800 text-teal-300 font-bold text-xs shadow-xl border border-teal-500/40 transition-all hover:scale-105 cursor-pointer"
          >
            <BedDouble className="w-4 h-4 text-teal-400" />
            <span className="hidden sm:inline">Bed Registry</span>
            <span className="sm:hidden">Beds</span>
          </button>

          <button
            id="floating-sos-dispatch-btn"
            onClick={() => setIsAmbulanceDrawerOpen(true)}
            className="flex items-center gap-3 px-5 py-3.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs uppercase tracking-wider shadow-2xl shadow-rose-900/50 border-2 border-white/20 transition-all hover:scale-105 cursor-pointer"
          >
            <Siren className="w-5 h-5 animate-bounce" />
            <span>Ambulance ({ambulances.length} Nearby)</span>
          </button>
        </div>
      </aside>

      {/* Footer */}
      <footer className="w-full bg-slate-900 text-slate-400 text-xs py-8 px-4 sm:px-6 lg:px-8 border-t border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <MediConnectLogo size="sm" animated={true} />
            <span className="text-lg font-black text-white">Medi<span className="text-[#00b289]">Connect</span></span>
            <span className="text-[11px] text-slate-500 hidden md:inline">&bull; Critical Care, Bed Registry &amp; Hospital Doctors Live Telemetry</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400 text-xs">
            <span>🚨 Hotline: 108 / 112</span>
            <span>🛡 NABH Certified</span>
            <span>© {new Date().getFullYear()} MediConnect</span>
          </div>
        </div>
      </footer>

      {/* 24/7 Ambulance Nearby Locator & Dispatch Drawer */}
      <AmbulanceDrawer
        isOpen={isAmbulanceDrawerOpen}
        onClose={() => setIsAmbulanceDrawerOpen(false)}
        ambulances={ambulances}
        hospitals={hospitals}
        currentCity={currentCity}
        userAddress={userAddress}
        isDetectingGPS={isDetectingGPS}
        onDetectGPS={handleDetectGPS}
        onDispatchAmbulance={handleDispatchAmbulance}
        onFastSosDispatch={handleFastSosDispatch}
      />

      {/* Real-time Tracking Interface Modal with Live Driver Proximity & Equipment Telemetry */}
      {activeBooking && (
        <LiveTrackingModal
          isOpen={isLiveTrackingOpen}
          onClose={() => setIsLiveTrackingOpen(false)}
          booking={activeBooking}
          onCancelBooking={() => {
            if (confirm("Are you sure you want to cancel this emergency ambulance dispatch?")) {
              setActiveBooking(null);
              setIsLiveTrackingOpen(false);
              toggleSirenAudio(false);
              setSirenOn(false);
            }
          }}
          onToggleSiren={handleToggleSiren}
        />
      )}

      {/* Hospital Bed Availability Modal */}
      <HospitalBedModal
        isOpen={isHospitalBedModalOpen}
        onClose={() => setIsHospitalBedModalOpen(false)}
        hospitals={hospitals}
        currentCity={currentCity}
        onDispatchToHospital={(hospital) => {
          setIsHospitalBedModalOpen(false);
          const closest = ambulances.find(a => a.equipment.oxygenCylinder) || ambulances[0];
          handleDispatchAmbulance(closest, hospital, ['OXYGEN']);
        }}
        onViewHospitalDoctors={(hospitalId) => {
          setIsHospitalBedModalOpen(false);
          handleOpenLiveDoctorsRoster(hospitalId);
        }}
      />

      {/* Live Hospital Doctors & Specialists Roster Modal */}
      <HospitalDoctorsLiveModal
        isOpen={isLiveDoctorsModalOpen}
        onClose={() => setIsLiveDoctorsModalOpen(false)}
        hospitals={hospitals}
        currentCity={currentCity}
        initialSelectedHospitalId={selectedHospitalForDoctorsModal}
      />

    </div>
  );
}
