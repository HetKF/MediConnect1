import React, { useState } from 'react';
import { 
  X, 
  Siren, 
  Wind, 
  Activity, 
  HeartPulse, 
  Baby, 
  Accessibility, 
  UserCheck, 
  MapPin, 
  Navigation, 
  ChevronRight, 
  ShieldCheck, 
  Clock, 
  Hospital as HospitalIcon, 
  Info, 
  Phone, 
  Check, 
  Sparkles, 
  BatteryCharging, 
  Gauge
} from 'lucide-react';
import { Ambulance, Hospital, LocationOption } from '../types';

interface AmbulanceDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  ambulances: Ambulance[];
  hospitals: Hospital[];
  currentCity: LocationOption;
  userAddress: string;
  isDetectingGPS: boolean;
  onDetectGPS: () => void;
  onDispatchAmbulance: (ambulance: Ambulance, destinationHospital: Hospital, requiredEquipment: string[]) => void;
  onFastSosDispatch: () => void;
}

export const AmbulanceDrawer: React.FC<AmbulanceDrawerProps> = ({
  isOpen,
  onClose,
  ambulances,
  hospitals,
  currentCity,
  userAddress,
  isDetectingGPS,
  onDetectGPS,
  onDispatchAmbulance,
  onFastSosDispatch,
}) => {
  const [selectedFilter, setSelectedFilter] = useState<string>('ALL');
  const [selectedHospitalId, setSelectedHospitalId] = useState<string>(hospitals[0]?.id || '');
  const [expandedAmbulanceId, setExpandedAmbulanceId] = useState<string | null>(null);
  const [patientCondition, setPatientCondition] = useState<string>('Severe / Immediate Attention');

  if (!isOpen) return null;

  const filterChips = [
    { id: 'ALL', label: 'All Ambulances', count: ambulances.length },
    { id: 'OXYGEN', label: '🫁 Oxygen Cylinder', count: ambulances.filter(a => a.equipment.oxygenCylinder).length },
    { id: 'VENTILATOR', label: '💨 Transport Ventilator', count: ambulances.filter(a => a.equipment.ventilator).length },
    { id: 'CARDIAC', label: '💓 Cardiac / Defibrillator', count: ambulances.filter(a => a.equipment.cardiacMonitor || a.equipment.defibrillator).length },
    { id: 'DOCTOR', label: '👨‍⚕️ Doctor Onboard', count: ambulances.filter(a => a.crew.doctorOnBoard).length },
    { id: 'NEONATAL', label: '🍼 Incubator (NICU)', count: ambulances.filter(a => a.equipment.incubator).length },
    { id: 'WHEELCHAIR', label: '🦽 Wheelchair Ramp', count: ambulances.filter(a => a.equipment.wheelchairRamp).length },
  ];

  const filteredAmbulances = ambulances.filter((amb) => {
    if (selectedFilter === 'OXYGEN') return amb.equipment.oxygenCylinder;
    if (selectedFilter === 'VENTILATOR') return amb.equipment.ventilator;
    if (selectedFilter === 'CARDIAC') return amb.equipment.cardiacMonitor || amb.equipment.defibrillator;
    if (selectedFilter === 'DOCTOR') return amb.crew.doctorOnBoard;
    if (selectedFilter === 'NEONATAL') return amb.equipment.incubator;
    if (selectedFilter === 'WHEELCHAIR') return amb.equipment.wheelchairRamp;
    return true;
  });

  const selectedHospital = hospitals.find(h => h.id === selectedHospitalId) || hospitals[0];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity duration-300 animate-in fade-in"
      />

      <div className="absolute inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10">
        <div className="w-screen max-w-2xl bg-white shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out border-l border-slate-200">
          
          {/* Drawer Header (replaces 24/7 Pharmacy Header from Image 2) */}
          <div className="p-5 border-b border-slate-100 bg-slate-900 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-600/90 text-white flex items-center justify-center shadow-lg shadow-rose-900/50">
                <Siren className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-white font-sans tracking-tight">
                    24/7 Ambulance Dispatch
                  </h2>
                  <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    GPS Live
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-0.5">
                  Proximity tracking &bull; Oxygen &amp; equipment status verification
                </p>
              </div>
            </div>

            <button
              id="close-ambulance-drawer-btn"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Location & Destination Summary Banner */}
          <div className="bg-slate-50 p-4 border-b border-slate-200 space-y-3">
            {/* Pickup location row */}
            <div className="flex items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2 text-slate-700 min-w-0">
                <MapPin className="w-4 h-4 text-rose-600 shrink-0" />
                <span className="font-semibold text-slate-500">Pickup Location:</span>
                <span className="font-bold text-slate-900 truncate">{userAddress}</span>
              </div>
              <button
                id="drawer-detect-gps-btn"
                onClick={onDetectGPS}
                disabled={isDetectingGPS}
                className="shrink-0 text-teal-700 hover:text-teal-900 bg-teal-50 hover:bg-teal-100 border border-teal-200 px-2.5 py-1 rounded-lg font-bold text-[11px] flex items-center gap-1 cursor-pointer transition-colors"
              >
                <Navigation className={`w-3 h-3 ${isDetectingGPS ? 'animate-spin' : ''}`} />
                <span>{isDetectingGPS ? 'Detecting...' : 'Current GPS'}</span>
              </button>
            </div>

            {/* Destination Hospital Selector */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-slate-200/80">
              <div className="flex items-center gap-1.5 text-xs text-slate-700">
                <HospitalIcon className="w-4 h-4 text-blue-600 shrink-0" />
                <span className="font-semibold text-slate-500">Destination Hospital:</span>
              </div>
              
              <select
                id="drawer-hospital-select"
                value={selectedHospitalId}
                onChange={(e) => setSelectedHospitalId(e.target.value)}
                className="text-xs font-semibold bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-900 focus:outline-hidden focus:border-teal-600 cursor-pointer shadow-2xs max-w-xs"
              >
                {hospitals.map((hosp) => (
                  <option key={hosp.id} value={hosp.id}>
                    {hosp.name} ({hosp.icuBedsAvailable} ICU Beds &bull; {hosp.distanceKm} km)
                  </option>
                ))}
              </select>
            </div>

            {/* Hospital Bed Availability Live Badge */}
            {selectedHospital && (
              <div className="flex items-center justify-between bg-white px-3 py-1.5 rounded-xl border border-blue-100 text-[11px]">
                <span className="text-blue-950 font-medium">
                  {selectedHospital.emergencyTraumaLevel}
                </span>
                <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                  {selectedHospital.icuBedsAvailable} ICU Beds Open &bull; {selectedHospital.ventilatorsAvailable} Vents Ready
                </span>
              </div>
            )}
          </div>

          {/* Quick Filter Horizontal Scrollbar */}
          <div className="p-3 border-b border-slate-100 bg-white">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 px-1">
              Filter by Medical Equipment &amp; Crew Service
            </div>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
              {filterChips.map((chip) => (
                <button
                  key={chip.id}
                  id={`filter-chip-${chip.id.toLowerCase()}`}
                  onClick={() => setSelectedFilter(chip.id)}
                  className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                    selectedFilter === chip.id
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <span>{chip.label}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    selectedFilter === chip.id ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'
                  }`}>
                    {chip.count}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Ambulances List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
            {filteredAmbulances.length === 0 ? (
              <div className="text-center py-12 p-6 bg-white rounded-2xl border border-slate-200">
                <Siren className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <h4 className="text-slate-800 font-bold text-sm">No ambulances found with this specific filter</h4>
                <p className="text-slate-500 text-xs mt-1">Try selecting "All Ambulances" to see available rapid response units.</p>
                <button 
                  onClick={() => setSelectedFilter('ALL')}
                  className="mt-3 px-4 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-semibold cursor-pointer"
                >
                  Reset Filter
                </button>
              </div>
            ) : (
              filteredAmbulances.map((ambulance) => {
                const isExpanded = expandedAmbulanceId === ambulance.id;
                return (
                  <div
                    key={ambulance.id}
                    id={`ambulance-card-${ambulance.id}`}
                    className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all overflow-hidden"
                  >
                    {/* Main Card Header */}
                    <div className="p-4 sm:p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          {/* Ambulance Badge Icon */}
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                            ambulance.type === 'ALS' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                            ambulance.type === 'CARDIAC' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                            ambulance.type === 'NEONATAL' ? 'bg-purple-50 text-purple-700 border border-purple-200' :
                            ambulance.type === 'PATIENT_TRANSPORT' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                            'bg-blue-50 text-blue-700 border border-blue-200'
                          }`}>
                            <Siren className="w-6 h-6 animate-pulse" />
                          </div>

                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md ${
                                ambulance.type === 'ALS' ? 'bg-emerald-100 text-emerald-800' :
                                ambulance.type === 'CARDIAC' ? 'bg-rose-100 text-rose-800' :
                                ambulance.type === 'NEONATAL' ? 'bg-purple-100 text-purple-800' :
                                ambulance.type === 'PATIENT_TRANSPORT' ? 'bg-amber-100 text-amber-800' :
                                'bg-blue-100 text-blue-800'
                              }`}>
                                {ambulance.categoryLabel}
                              </span>
                              <span className="text-xs font-mono font-bold text-slate-500">
                                {ambulance.plateNumber}
                              </span>
                            </div>

                            <h3 className="text-base font-bold text-slate-900 mt-1">
                              {ambulance.title}
                            </h3>

                            <p className="text-xs text-slate-500 mt-0.5">
                              {ambulance.tagline}
                            </p>
                          </div>
                        </div>

                        {/* ETA & Distance Metric */}
                        <div className="text-right shrink-0">
                          <div className="inline-flex items-center gap-1 text-sm font-black text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-200">
                            <Clock className="w-3.5 h-3.5" />
                            <span>{ambulance.etaMinutes} mins</span>
                          </div>
                          <div className="text-[11px] text-slate-400 font-medium mt-1">
                            {ambulance.distanceKm} km away
                          </div>
                        </div>
                      </div>

                      {/* Equipment Capabilities Badges Row */}
                      <div className="mt-3.5 pt-3 border-t border-slate-100 flex flex-wrap gap-1.5 items-center">
                        {ambulance.equipment.oxygenCylinder && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-teal-50 text-teal-800 text-[11px] font-bold border border-teal-200">
                            <Wind className="w-3 h-3 text-teal-600" />
                            O2 Cylinder ({ambulance.equipment.oxygenLevelPercent}%)
                          </span>
                        )}

                        {ambulance.equipment.ventilator && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-800 text-[11px] font-bold border border-blue-200">
                            <Activity className="w-3 h-3 text-blue-600" />
                            Ventilator Onboard
                          </span>
                        )}

                        {(ambulance.equipment.cardiacMonitor || ambulance.equipment.defibrillator) && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-50 text-rose-800 text-[11px] font-bold border border-rose-200">
                            <HeartPulse className="w-3 h-3 text-rose-600" />
                            Cardiac Defibrillator
                          </span>
                        )}

                        {ambulance.crew.doctorOnBoard && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-800 text-[11px] font-bold border border-indigo-200">
                            <UserCheck className="w-3 h-3 text-indigo-600" />
                            Doctor On-Call
                          </span>
                        )}

                        {ambulance.equipment.incubator && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-purple-50 text-purple-800 text-[11px] font-bold border border-purple-200">
                            <Baby className="w-3 h-3 text-purple-600" />
                            NICU Incubator
                          </span>
                        )}

                        {ambulance.equipment.wheelchairRamp && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 text-[11px] font-bold border border-amber-200">
                            <Accessibility className="w-3 h-3 text-amber-600" />
                            Wheelchair Lift
                          </span>
                        )}

                        <button
                          id={`toggle-details-${ambulance.id}`}
                          onClick={() => setExpandedAmbulanceId(isExpanded ? null : ambulance.id)}
                          className="text-[11px] font-bold text-slate-500 hover:text-slate-900 ml-auto flex items-center gap-0.5 cursor-pointer py-1 px-2 rounded-md hover:bg-slate-100 transition-colors"
                        >
                          <span>{isExpanded ? 'Hide Specs' : 'Full Equipment Specs'}</span>
                          <ChevronRight className={`w-3 h-3 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                        </button>
                      </div>

                      {/* Expandable Deep Telemetry & Equipment Checklist */}
                      {isExpanded && (
                        <div className="mt-4 p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-3 animate-in fade-in duration-150">
                          <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                            <span className="flex items-center gap-1.5">
                              <Gauge className="w-4 h-4 text-teal-600" />
                              Live Verified Equipment Checklist
                            </span>
                            <span className="text-[10px] text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full font-bold">
                              Pre-Trip Tested
                            </span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                            {ambulance.detailedEquipmentList.map((item, idx) => (
                              <div key={idx} className="p-2 bg-white rounded-lg border border-slate-200/80">
                                <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                  <span className="truncate">{item.name}</span>
                                </div>
                                <div className="text-[11px] text-slate-500 pl-5">
                                  {item.statusText}
                                  {item.metric && (
                                    <span className="font-bold text-slate-700 ml-1">
                                      [{item.metric.label}: {item.metric.value} {item.metric.unit}]
                                    </span>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Crew Details */}
                          <div className="p-2.5 bg-white rounded-lg border border-slate-200 flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2.5">
                              <img
                                src={ambulance.crew.driver.photoUrl}
                                alt={ambulance.crew.driver.name}
                                className="w-8 h-8 rounded-full object-cover border border-slate-300"
                                referrerPolicy="no-referrer"
                              />
                              <div>
                                <div className="font-bold text-slate-900 flex items-center gap-1">
                                  {ambulance.crew.driver.name}
                                  <span className="text-[10px] text-amber-600 bg-amber-50 px-1.5 py-0.2 rounded-md font-extrabold">
                                    ★ {ambulance.crew.driver.rating}
                                  </span>
                                </div>
                                <div className="text-[11px] text-slate-500">
                                  {ambulance.crew.driver.badge} &bull; {ambulance.crew.driver.tripsCount}+ Emergency Runs
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-[10px] font-bold text-slate-400 uppercase">Emergency Level</div>
                              <div className="text-xs font-bold text-teal-700">{ambulance.crew.emtLevel}</div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Action & Pricing Bar */}
                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                        <div>
                          <div className="text-xs text-slate-400 font-medium">Estimated Dispatch Fare</div>
                          <div className="text-base font-black text-slate-900">
                            {ambulance.priceEstimate.currency}{ambulance.priceEstimate.baseFare.toLocaleString()}
                            <span className="text-xs font-normal text-slate-500 ml-1">
                              (+{ambulance.priceEstimate.currency}{ambulance.priceEstimate.perKm}/km)
                            </span>
                          </div>
                        </div>

                        <button
                          id={`dispatch-btn-${ambulance.id}`}
                          onClick={() => onDispatchAmbulance(ambulance, selectedHospital, [selectedFilter])}
                          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-rose-600 text-white font-bold text-xs transition-all shadow-xs hover:shadow-md cursor-pointer group"
                        >
                          <Siren className="w-3.5 h-3.5 text-white animate-pulse" />
                          <span>Dispatch &amp; Track Live</span>
                          <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Drawer Footer with Instant 1-Click Fast SOS Dispatch */}
          <div className="p-4 border-t border-slate-200 bg-white">
            <button
              id="instant-fast-sos-btn"
              onClick={onFastSosDispatch}
              className="w-full py-3.5 px-4 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-black text-sm flex items-center justify-center gap-2.5 shadow-lg shadow-rose-900/30 transition-all cursor-pointer"
            >
              <Siren className="w-5 h-5 animate-bounce" />
              <span>1-Tap Urgent SOS Dispatch (Fastest Closest Ambulance)</span>
            </button>
            <p className="text-center text-[11px] text-slate-400 mt-2">
              Automatically assigns nearest available Oxygen + Life Support unit to <span className="font-semibold text-slate-600">{userAddress}</span>.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};
