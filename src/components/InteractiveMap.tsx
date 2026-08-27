import React, { useState, useEffect } from 'react';
import { 
  Navigation, 
  MapPin, 
  Hospital as HospitalIcon, 
  Siren, 
  Compass, 
  Plus, 
  Minus, 
  Layers, 
  Maximize2,
  Minimize2,
  Volume2,
  VolumeX,
  Radio,
  Clock,
  Gauge
} from 'lucide-react';
import { Ambulance, Hospital } from '../types';

interface InteractiveMapProps {
  ambulance: Ambulance;
  destinationHospital: Hospital;
  userAddress: string;
  userCoords: { lat: number; lng: number };
  driverProgressPercent: number; // 0 to 100
  driverSpeedKmh: number;
  liveDistanceKm: number;
  liveEtaSeconds: number;
  sirenOn: boolean;
  onToggleSiren: () => void;
}

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  ambulance,
  destinationHospital,
  userAddress,
  userCoords,
  driverProgressPercent,
  driverSpeedKmh,
  liveDistanceKm,
  liveEtaSeconds,
  sirenOn,
  onToggleSiren,
}) => {
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [mapTheme, setMapTheme] = useState<'emergency-dark' | 'standard'>('emergency-dark');
  const [centerTarget, setCenterTarget] = useState<'driver' | 'user' | 'hospital'>('driver');

  // Format ETA minutes & seconds
  const mins = Math.floor(liveEtaSeconds / 60);
  const secs = liveEtaSeconds % 60;
  const etaFormatted = `${mins}m ${secs < 10 ? '0' : ''}${secs}s`;

  // Calculate vehicle SVG position along a simulated realistic curved urban route
  // Path starts at ambulance origin (x: 120, y: 110) -> turns at (x: 320, y: 160) -> arrives at user (x: 480, y: 340) -> to hospital (x: 740, y: 220)
  const pathD = "M 110 90 Q 220 120, 310 180 T 480 340 T 630 260 T 780 200";

  // Interpolate position along the first leg (approaching user) or second leg
  // When driverProgressPercent goes 0 -> 100:
  // Let's compute a 2D interpolated point on canvas (850 x 500)
  const p = driverProgressPercent / 100;
  
  // Interpolated ambulance coordinates
  let ambX = 110 + (480 - 110) * Math.min(p, 1);
  let ambY = 90 + (340 - 90) * Math.min(p, 1);

  if (p > 1) {
    // en route to hospital
    const p2 = Math.min((p - 1) / 1, 1);
    ambX = 480 + (780 - 480) * p2;
    ambY = 340 + (200 - 340) * p2;
  }

  // Calculate dynamic rotation angle for the ambulance icon
  const angleDeg = p <= 1 ? 42 : -32;

  return (
    <div className="relative w-full h-[400px] sm:h-[480px] rounded-3xl overflow-hidden shadow-inner border border-slate-700 select-none bg-slate-950">
      
      {/* Interactive Map Visual Layer (SVG + Canvas Grid) */}
      <svg 
        id="live-tracking-map-svg"
        viewBox="0 0 900 500" 
        className="w-full h-full object-cover transition-transform duration-500"
        style={{ transform: `scale(${zoomLevel})` }}
      >
        {/* Dark / Street Map Background */}
        <defs>
          <pattern id="grid-pattern" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke={mapTheme === 'emergency-dark' ? '#162238' : '#e2e8f0'} strokeWidth="0.8" />
          </pattern>
          <pattern id="dots-pattern" width="20" height="20" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1" fill={mapTheme === 'emergency-dark' ? '#1e293b' : '#cbd5e1'} />
          </pattern>

          {/* Route Gradient */}
          <linearGradient id="route-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="60%" stopColor="#f43f5e" />
            <stop offset="100%" stopColor="#0284c7" />
          </linearGradient>

          {/* Glow filter for active beacon */}
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Base Map fill */}
        <rect width="900" height="500" fill={mapTheme === 'emergency-dark' ? '#09111e' : '#f8fafc'} />
        <rect width="900" height="500" fill="url(#grid-pattern)" />
        <rect width="900" height="500" fill="url(#dots-pattern)" opacity="0.4" />

        {/* Simulated City Roads & Avenues */}
        <g stroke={mapTheme === 'emergency-dark' ? '#1e2d42' : '#cbd5e1'} strokeWidth="18" strokeLinecap="round" strokeLinejoin="round" fill="none">
          {/* Main Arterials */}
          <path d="M 0 100 L 900 100" />
          <path d="M 0 250 L 900 250" />
          <path d="M 0 400 L 900 400" />
          <path d="M 150 0 L 150 500" />
          <path d="M 380 0 L 380 500" />
          <path d="M 600 0 L 600 500" />
          <path d="M 780 0 L 780 500" />

          {/* Diagonal highways & bridges */}
          <path d="M 60 40 L 450 480" strokeWidth="24" stroke={mapTheme === 'emergency-dark' ? '#27384f' : '#cbd5e1'} />
          <path d="M 300 40 L 880 440" strokeWidth="24" stroke={mapTheme === 'emergency-dark' ? '#27384f' : '#cbd5e1'} />
        </g>

        {/* Road center lines */}
        <g stroke={mapTheme === 'emergency-dark' ? '#0f172a' : '#ffffff'} strokeWidth="2" strokeDasharray="8 8" fill="none">
          <path d="M 60 40 L 450 480" />
          <path d="M 300 40 L 880 440" />
          <path d="M 0 250 L 900 250" />
        </g>

        {/* Green Corridor Clear Route for Ambulance */}
        <path 
          d={pathD} 
          fill="none" 
          stroke="#059669" 
          strokeWidth="12" 
          opacity="0.25"
          strokeLinecap="round" 
        />
        
        {/* Dynamic Route Line with moving dash animation */}
        <path 
          d={pathD} 
          fill="none" 
          stroke="url(#route-gradient)" 
          strokeWidth="5" 
          strokeLinecap="round"
          strokeDasharray="10 6"
          className="animate-pulse"
        />

        {/* User / Patient Pickup Point (Beacon at 480, 340) */}
        <g transform="translate(480, 340)">
          {/* Sonar Pulsing Radar Rings */}
          <circle r="36" fill="none" stroke="#f43f5e" strokeWidth="1.5" opacity="0.3" className="animate-ping" />
          <circle r="22" fill="#f43f5e" opacity="0.2" />
          <circle r="14" fill="#f43f5e" opacity="0.4" />
          <circle r="8" fill="#f43f5e" />
          <circle r="3" fill="#ffffff" />

          {/* User Location Label Card */}
          <g transform="translate(-80, -48)">
            <rect width="160" height="34" rx="8" fill="#0f172a" stroke="#f43f5e" strokeWidth="1.5" opacity="0.95" />
            <text x="80" y="16" fill="#f8fafc" fontSize="10" fontWeight="bold" textAnchor="middle">
              YOU &bull; Pickup Spot
            </text>
            <text x="80" y="28" fill="#fda4af" fontSize="9" textAnchor="middle">
              {userAddress.length > 22 ? userAddress.substring(0, 22) + '...' : userAddress}
            </text>
          </g>
        </g>

        {/* Destination Hospital Marker (at 780, 200) */}
        <g transform="translate(780, 200)">
          <circle r="28" fill="#0284c7" opacity="0.15" />
          <circle r="16" fill="#0284c7" />
          {/* Hospital Cross */}
          <rect x="-8" y="-3" width="16" height="6" fill="#ffffff" rx="1" />
          <rect x="-3" y="-8" width="6" height="16" fill="#ffffff" rx="1" />

          {/* Hospital Label Card */}
          <g transform="translate(-100, -52)">
            <rect width="200" height="38" rx="8" fill="#0f172a" stroke="#0284c7" strokeWidth="1.5" opacity="0.95" />
            <text x="100" y="16" fill="#38bdf8" fontSize="10" fontWeight="bold" textAnchor="middle">
              🏥 {destinationHospital.name.substring(0, 24)}
            </text>
            <text x="100" y="30" fill="#a7f3d0" fontSize="9" fontWeight="bold" textAnchor="middle">
              {destinationHospital.icuBedsAvailable} ICU Beds Open &bull; Trauma Ready
            </text>
          </g>
        </g>

        {/* Moving Ambulance Vehicle Marker (Interpolated at ambX, ambY) */}
        <g transform={`translate(${ambX}, ${ambY})`}>
          {/* Headlights Cone Projection in dark mode */}
          {mapTheme === 'emergency-dark' && (
            <path 
              d="M 0 0 L 50 -30 L 50 30 Z" 
              fill="#fef08a" 
              opacity="0.2" 
              transform={`rotate(${angleDeg})`} 
            />
          )}

          {/* Siren Light Flash Halo */}
          <circle 
            r="28" 
            fill={sirenOn ? "#f43f5e" : "#059669"} 
            opacity="0.3" 
            className={sirenOn ? "animate-ping" : ""} 
          />

          {/* Vehicle Body Rectangle */}
          <g transform={`rotate(${angleDeg})`}>
            <rect x="-18" y="-10" width="36" height="20" rx="4" fill="#ffffff" stroke="#e11d48" strokeWidth="2.5" />
            {/* Front windshield */}
            <rect x="8" y="-8" width="6" height="16" rx="2" fill="#0f172a" />
            {/* Red cross on vehicle roof */}
            <rect x="-8" y="-2" width="10" height="4" fill="#e11d48" />
            <rect x="-5" y="-5" width="4" height="10" fill="#e11d48" />
            {/* Siren Roof Light */}
            <circle cx="-1" cy="0" r="3" fill="#f43f5e" className={sirenOn ? "animate-pulse" : ""} />
          </g>

          {/* Vehicle Floating Info Banner */}
          <g transform="translate(-75, -50)">
            <rect width="150" height="34" rx="8" fill="#111827" stroke="#10b981" strokeWidth="1.5" opacity="0.95" />
            <text x="75" y="15" fill="#34d399" fontSize="10" fontWeight="bold" textAnchor="middle">
              🚑 {ambulance.callSign} ({ambulance.type})
            </text>
            <text x="75" y="27" fill="#e2e8f0" fontSize="9" textAnchor="middle">
              Speed: {driverSpeedKmh} km/h &bull; {liveDistanceKm.toFixed(1)} km away
            </text>
          </g>
        </g>
      </svg>

      {/* Top Left Live Proximity & Speed HUD Overlay */}
      <div className="absolute top-3 left-3 flex flex-wrap items-center gap-2 z-10">
        <div className="bg-slate-900/90 backdrop-blur-md border border-slate-700 text-white px-3 py-2 rounded-2xl shadow-xl flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            <div className="text-left">
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Live ETA</div>
              <div className="text-sm font-black text-emerald-400 font-mono">
                {etaFormatted}
              </div>
            </div>
          </div>

          <div className="w-px h-7 bg-slate-700" />

          <div className="text-left">
            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Distance</div>
            <div className="text-sm font-black text-white font-mono">
              {liveDistanceKm.toFixed(1)} km
            </div>
          </div>

          <div className="w-px h-7 bg-slate-700" />

          <div className="text-left">
            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Live Speed</div>
            <div className="text-sm font-black text-amber-400 font-mono">
              {driverSpeedKmh} km/h
            </div>
          </div>
        </div>
      </div>

      {/* Top Right Map Style & Siren Toggle Controls */}
      <div className="absolute top-3 right-3 flex items-center gap-2 z-10">
        {/* Siren Sound toggle */}
        <button
          id="toggle-siren-btn"
          onClick={onToggleSiren}
          className={`px-3 py-2 rounded-2xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-lg cursor-pointer ${
            sirenOn 
              ? 'bg-rose-600 text-white animate-pulse shadow-rose-900/50' 
              : 'bg-slate-900/90 text-slate-300 hover:text-white border border-slate-700'
          }`}
          title="Toggle Ambulance Siren Sound Simulator"
        >
          {sirenOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          <span>{sirenOn ? 'Siren ON' : 'Siren Audio'}</span>
        </button>

        {/* Map Theme Toggle */}
        <button
          id="toggle-map-theme-btn"
          onClick={() => setMapTheme(mapTheme === 'emergency-dark' ? 'standard' : 'emergency-dark')}
          className="p-2 rounded-2xl bg-slate-900/90 hover:bg-slate-800 text-slate-300 border border-slate-700 shadow-lg cursor-pointer"
          title="Toggle Night / Day Map"
        >
          <Layers className="w-4 h-4" />
        </button>
      </div>

      {/* Bottom Right Map Zoom & Reset Controls */}
      <div className="absolute bottom-3 right-3 flex flex-col gap-1.5 z-10">
        <button
          id="map-zoom-in-btn"
          onClick={() => setZoomLevel(Math.min(zoomLevel + 0.2, 1.8))}
          className="w-8 h-8 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-white flex items-center justify-center border border-slate-700 shadow-md cursor-pointer"
        >
          <Plus className="w-4 h-4" />
        </button>
        <button
          id="map-zoom-out-btn"
          onClick={() => setZoomLevel(Math.max(zoomLevel - 0.2, 0.8))}
          className="w-8 h-8 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-white flex items-center justify-center border border-slate-700 shadow-md cursor-pointer"
        >
          <Minus className="w-4 h-4" />
        </button>
        <button
          id="map-reset-btn"
          onClick={() => setZoomLevel(1)}
          className="w-8 h-8 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-white flex items-center justify-center border border-slate-700 shadow-md cursor-pointer"
          title="Reset Zoom"
        >
          <Compass className="w-4 h-4 text-teal-400" />
        </button>
      </div>

      {/* Bottom Left Green Corridor / Traffic Clearance Notification */}
      <div className="absolute bottom-3 left-3 z-10 max-w-xs">
        <div className="bg-slate-900/95 backdrop-blur-md border border-emerald-500/40 text-slate-200 px-3 py-1.5 rounded-xl shadow-lg flex items-center gap-2 text-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping shrink-0" />
          <span className="text-[11px] text-emerald-300 font-semibold">
            🚦 Smart Traffic Green Light Priority Active on route to {userAddress.split(',')[0]}
          </span>
        </div>
      </div>

    </div>
  );
};
