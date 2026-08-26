import React, { useState, useEffect, useCallback } from 'react';
import { 
  X, 
  Hospital as HospitalIcon, 
  BedDouble, 
  Wind, 
  Activity, 
  Phone, 
  ShieldCheck, 
  Search, 
  Navigation,
  CheckCircle2,
  AlertCircle,
  Stethoscope,
  Radio,
  UserCheck,
  Loader2
} from 'lucide-react';
import { Hospital, LocationOption } from '../types';
import { HOSPITAL_DOCTORS } from '../data/mockSpecialists';

interface HospitalBedModalProps {
  isOpen: boolean;
  onClose: () => void;
  hospitals: Hospital[];
  currentCity: LocationOption;
  onDispatchToHospital: (hospital: Hospital) => void;
  onViewHospitalDoctors?: (hospitalId: string) => void;
}

export const HospitalBedModal: React.FC<HospitalBedModalProps> = ({
  isOpen,
  onClose,
  hospitals,
  currentCity,
  onDispatchToHospital,
  onViewHospitalDoctors,
}) => {
  const [filterQuery, setFilterQuery] = useState('');
  const [apiHospitals, setApiHospitals] = useState<Hospital[]>(hospitals);
  const [isLoadingApi, setIsLoadingApi] = useState(false);

  // Sync initial hospitals prop to internal state
  useEffect(() => {
    if (hospitals && hospitals.length > 0) {
      setApiHospitals(hospitals);
    }
  }, [hospitals]);

  // Fetch hospitals from backend API based on search/location
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    const fetchTimer = setTimeout(async () => {
      try {
        setIsLoadingApi(true);
        let endpoint = '/api/hospitals';
        
        const trimmed = filterQuery.trim();
        if (trimmed) {
          endpoint = `/api/hospitals?location=${encodeURIComponent(trimmed)}`;
        } else if (currentCity?.id) {
          endpoint = `/api/hospitals?location=${encodeURIComponent(currentCity.id)}`;
        }

        const res = await fetch(endpoint);
        if (res.ok) {
          const json = await res.json();
          const list: Hospital[] = Array.isArray(json) ? json : json.data || [];
          if (isMounted) {
            setApiHospitals(list);
          }
        } else if (res.status === 404 && trimmed) {
          // If location query 404s, try general search parameter
          const searchRes = await fetch(`/api/hospitals?search=${encodeURIComponent(trimmed)}`);
          if (searchRes.ok) {
            const searchJson = await searchRes.json();
            const list: Hospital[] = Array.isArray(searchJson) ? searchJson : searchJson.data || [];
            if (isMounted) setApiHospitals(list);
          } else if (isMounted) {
            // Local client-side fallback if backend returns empty
            const localMatches = hospitals.filter(h => 
              h.name.toLowerCase().includes(trimmed.toLowerCase()) ||
              h.address.toLowerCase().includes(trimmed.toLowerCase()) ||
              h.emergencyTraumaLevel.toLowerCase().includes(trimmed.toLowerCase())
            );
            setApiHospitals(localMatches);
          }
        }
      } catch (err) {
        console.warn('Hospital API fetch notice:', err);
        if (isMounted) {
          // Graceful fallback to prop hospitals
          const trimmed = filterQuery.trim().toLowerCase();
          if (trimmed) {
            setApiHospitals(
              hospitals.filter(h =>
                h.name.toLowerCase().includes(trimmed) ||
                h.address.toLowerCase().includes(trimmed) ||
                h.emergencyTraumaLevel.toLowerCase().includes(trimmed)
              )
            );
          } else {
            setApiHospitals(hospitals);
          }
        }
      } finally {
        if (isMounted) setIsLoadingApi(false);
      }
    }, 180);

    return () => {
      isMounted = false;
      clearTimeout(fetchTimer);
    };
  }, [isOpen, filterQuery, currentCity?.id, hospitals]);

  // Handle hospital selection with backend /api/hospitals/:id lookup
  const handleSelectHospitalForDispatch = async (hospital: Hospital) => {
    try {
      const res = await fetch(`/api/hospitals/${encodeURIComponent(hospital.id)}`);
      if (res.ok) {
        const json = await res.json();
        const freshData: Hospital = json.data || json;
        onDispatchToHospital(freshData);
        return;
      }
    } catch (err) {
      console.warn('Fetch hospital by ID error, falling back to cached:', err);
    }
    onDispatchToHospital(hospital);
  };

  const handleSelectHospitalForRoster = async (hospitalId: string) => {
    try {
      await fetch(`/api/hospitals/${encodeURIComponent(hospitalId)}`);
    } catch (e) {
      // non-blocking
    }
    if (onViewHospitalDoctors) {
      onViewHospitalDoctors(hospitalId);
    }
  };

  if (!isOpen) return null;

  const displayList = apiHospitals;

  const totalIcuBeds = displayList.reduce((acc, h) => acc + h.icuBedsAvailable, 0);
  const totalVents = displayList.reduce((acc, h) => acc + h.ventilatorsAvailable, 0);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-4xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 max-h-[92vh] flex flex-col font-sans">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-bold text-slate-900">
                Hospital Bed &amp; Critical Care Registry
              </h2>
              <span className="bg-amber-100 text-amber-900 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-amber-300/80">
                Demo/Mock Data — for SIH Prototype
              </span>
              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                Live Synced
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Verified capacity &amp; on-duty clinical rosters across facilities in <strong className="text-slate-800">{currentCity.cityName}</strong>
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Summary Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 my-4">
          <div className="p-3.5 bg-teal-50/70 border border-teal-200/70 rounded-2xl">
            <div className="text-xs text-teal-800 font-semibold">Ready ICU Beds</div>
            <div className="text-2xl font-black text-teal-950 mt-0.5">{totalIcuBeds} Beds</div>
            <div className="text-[11px] text-teal-700/90 font-medium mt-0.5">
              Available for admission
            </div>
          </div>
          <div className="p-3.5 bg-blue-50/70 border border-blue-200/70 rounded-2xl">
            <div className="text-xs text-blue-800 font-semibold">Ventilators Online</div>
            <div className="text-2xl font-black text-blue-950 mt-0.5">{totalVents} Units</div>
            <div className="text-[11px] text-blue-700/90 font-medium mt-0.5">
              High-flow oxygen equipped
            </div>
          </div>
          <div className="p-3.5 bg-emerald-50/70 border border-emerald-200/70 rounded-2xl col-span-2 sm:col-span-1">
            <div className="text-xs text-emerald-800 font-semibold">Emergency Intake</div>
            <div className="text-2xl font-black text-emerald-950 mt-0.5">&lt; 45 Secs</div>
            <div className="text-[11px] text-emerald-700/90 font-medium mt-0.5">
              Direct telemetry handoff
            </div>
          </div>
        </div>

        {/* Search & Location Filter Chips */}
        <div className="space-y-2 mb-4">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              placeholder="Search Vidyavihar, Ghatkopar, Vikhroli, Kurla, Powai, hospital name, or ICU beds..."
              className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:border-[#00b289]"
            />
            {isLoadingApi && (
              <Loader2 className="absolute right-9 top-1/2 -translate-y-1/2 w-4 h-4 text-teal-600 animate-spin" />
            )}
            {filterQuery && (
              <button
                onClick={() => setFilterQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-700 font-semibold cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>

          {/* Quick Suburb Shortcut Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            <span className="text-[11px] font-semibold text-slate-400 whitespace-nowrap">Filter Location:</span>
            {['All', 'Vidyavihar', 'Ghatkopar', 'Vikhroli', 'Kurla', 'Powai'].map((loc) => (
              <button
                key={loc}
                type="button"
                onClick={() => setFilterQuery(loc === 'All' ? '' : loc)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  (loc === 'All' && !filterQuery) || (loc !== 'All' && filterQuery.toLowerCase() === loc.toLowerCase())
                    ? 'bg-teal-700 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {loc}
              </button>
            ))}
          </div>
        </div>

        {/* Hospitals List */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {displayList.map((hospital) => {
            // Find on-duty doctors belonging to this hospital
            const hospitalDoctors = HOSPITAL_DOCTORS.filter(d => 
              d.hospitalId === hospital.id || d.hospital.toLowerCase().includes(hospital.name.toLowerCase())
            );

            return (
              <div
                key={hospital.id}
                className="p-4 sm:p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs hover:shadow-xs transition-all space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <HospitalIcon className="w-4 h-4 text-teal-600 shrink-0" />
                      <h3 className="text-base font-bold text-slate-900">{hospital.name}</h3>
                      <span className="text-[10px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md">
                        {hospital.emergencyTraumaLevel}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 flex items-center gap-1.5">
                      <Navigation className="w-3 h-3 text-slate-400" />
                      <span>{hospital.address} &bull; <strong className="text-slate-700">{hospital.distanceKm} km away (~{hospital.etaMinutes} mins)</strong></span>
                    </p>

                    <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                      <span className="flex items-center gap-1 font-semibold text-teal-800 bg-teal-50 px-2.5 py-0.5 rounded-md border border-teal-200">
                        <BedDouble className="w-3.5 h-3.5 text-teal-600" />
                        <strong>{hospital.icuBedsAvailable}</strong> ICU Beds Ready
                      </span>
                      <span className="flex items-center gap-1 font-semibold text-blue-800 bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-200">
                        <Wind className="w-3.5 h-3.5 text-blue-600" />
                        <strong>{hospital.ventilatorsAvailable}</strong> Ventilators Available
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <a
                      href={`tel:${hospital.contactNumber}`}
                      className="p-2.5 rounded-xl border border-slate-200 hover:border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors"
                      title="Direct Call Hospital Emergency Desk"
                    >
                      <Phone className="w-4 h-4 text-teal-600" />
                    </a>

                    <button
                      id={`btn-route-to-${hospital.id}`}
                      onClick={() => handleSelectHospitalForDispatch(hospital)}
                      className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>Dispatch Ambulance</span>
                    </button>
                  </div>
                </div>

                {/* On-Duty Doctors Live Status Strip for this Hospital */}
                <div className="pt-2.5 border-t border-slate-100 bg-slate-50/70 p-3 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <div className="flex items-center gap-2 overflow-hidden">
                    <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-900 text-[10px] font-extrabold px-2 py-0.5 rounded-md uppercase tracking-wider shrink-0">
                      <Radio className="w-2.5 h-2.5 text-emerald-600 animate-pulse" />
                      {hospitalDoctors.length} On-Duty Doctors
                    </span>
                    <div className="text-xs text-slate-600 truncate">
                      {hospitalDoctors.length > 0 ? (
                        <span>
                          {hospitalDoctors.map(d => `${d.name} (${d.specialty.split('&')[0].trim()})`).join(' • ')}
                        </span>
                      ) : (
                        <span>ER Triage Specialists &amp; On-Call Trauma Leads active</span>
                      )}
                    </div>
                  </div>

                  {onViewHospitalDoctors && (
                    <button
                      onClick={() => handleSelectHospitalForRoster(hospital.id)}
                      className="text-xs font-bold text-teal-700 hover:text-teal-900 underline flex items-center gap-1 shrink-0 cursor-pointer"
                    >
                      <Stethoscope className="w-3.5 h-3.5 text-teal-600" />
                      <span>View Live Roster</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          {displayList.length === 0 && !isLoadingApi && (
            <div className="py-12 text-center text-slate-400 text-xs">
              No hospitals found matching your filter "{filterQuery}".
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-4 h-4 text-teal-600" />
            Verified under State Emergency Healthcare Protocol
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

