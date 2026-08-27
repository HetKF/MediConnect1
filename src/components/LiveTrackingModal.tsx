import React, { useState, useEffect } from 'react';
import { 
  X, 
  Siren, 
  Phone, 
  MessageSquare, 
  ShieldAlert, 
  Wind, 
  Activity, 
  HeartPulse, 
  BatteryCharging, 
  Gauge, 
  Thermometer, 
  Share2, 
  CheckCircle2, 
  Clock, 
  Hospital as HospitalIcon, 
  MapPin, 
  AlertTriangle,
  Send,
  Radio,
  FileText
} from 'lucide-react';
import { ActiveBooking, Hospital } from '../types';
import { InteractiveMap } from './InteractiveMap';

interface LiveTrackingModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: ActiveBooking;
  onCancelBooking: () => void;
  onToggleSiren: () => void;
  onUpdatePatientVitals?: (hr: number, spo2: number) => void;
}

export const LiveTrackingModal: React.FC<LiveTrackingModalProps> = ({
  isOpen,
  onClose,
  booking,
  onCancelBooking,
  onToggleSiren,
}) => {
  const [chatOpen, setChatOpen] = useState<boolean>(false);
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'user' | 'driver' | 'system'; text: string; time: string }>>([
    { sender: 'system', text: 'Ambulance dispatched with oxygen cylinder and ACLS paramedic kit.', time: 'Just now' },
    { sender: 'driver', text: 'Namaste, I have taken the Bandra Reclamation flyover. Reaching you in 3 minutes. Please keep patient on ground floor if possible.', time: '1 min ago' },
  ]);
  const [inputMessage, setInputMessage] = useState<string>('');
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [showVitalsModal, setShowVitalsModal] = useState<boolean>(false);

  if (!isOpen) return null;

  const { ambulance, destinationHospital } = booking;

  // Calculate simulated route progress percent based on ETA remaining
  const totalTripSeconds = 240; // 4 mins reference
  const elapsedSeconds = Math.max(totalTripSeconds - booking.liveEtaSeconds, 0);
  const progressPercent = Math.min((elapsedSeconds / totalTripSeconds) * 100, 100);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const newMsg = {
      sender: 'user' as const,
      text: inputMessage,
      time: 'Just now',
    };

    setChatMessages(prev => [...prev, newMsg]);
    setInputMessage('');

    // Driver quick auto-reply simulation
    setTimeout(() => {
      setChatMessages(prev => [
        ...prev,
        {
          sender: 'driver' as const,
          text: 'Understood. Paramedic Mr. Sawant is prepping the oxygen mask and stretcher right now.',
          time: 'Just now',
        }
      ]);
    }, 1200);
  };

  const handleShareTracking = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 animate-in fade-in">
      <div className="bg-slate-900 text-white rounded-3xl w-full max-w-5xl max-h-[96vh] flex flex-col shadow-2xl border border-slate-700 overflow-hidden">
        
        {/* Top Tracking Header */}
        <div className="p-4 sm:p-5 bg-slate-950 border-b border-slate-800 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-rose-600 flex items-center justify-center text-white shadow-lg shadow-rose-900/60 shrink-0">
              <Siren className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black font-sans text-white tracking-tight">
                  Live Ambulance Emergency Tracking
                </h2>
                <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  Telemetry Online
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Dispatch Code: <strong className="text-slate-200 font-mono">#MED-{booking.id.substring(0, 6).toUpperCase()}</strong> &bull; Plate: <strong className="text-emerald-400 font-mono">{ambulance.plateNumber}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="share-live-tracking-btn"
              onClick={handleShareTracking}
              className="p-2 sm:px-3 sm:py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Share live link with family or doctor"
            >
              <Share2 className="w-4 h-4 text-teal-400" />
              <span className="hidden sm:inline">{copiedLink ? 'Link Copied!' : 'Share Live Link'}</span>
            </button>

            <button
              id="close-tracking-modal-btn"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          
          {/* Main Vector Interactive Map */}
          <InteractiveMap
            ambulance={ambulance}
            destinationHospital={destinationHospital}
            userAddress={booking.pickupAddress}
            userCoords={booking.pickupCoords}
            driverProgressPercent={progressPercent}
            driverSpeedKmh={booking.driverSpeedKmh}
            liveDistanceKm={booking.liveDistanceKm}
            liveEtaSeconds={booking.liveEtaSeconds}
            sirenOn={booking.sirenOn}
            onToggleSiren={onToggleSiren}
          />

          {/* 2-Column Grid: Left is Driver & Hospital | Right is Live Equipment Telemetry */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            
            {/* Left Column: Driver Info & Receiving Hospital */}
            <div className="lg:col-span-5 space-y-4">
              {/* Driver Card */}
              <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-3">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Assigned Emergency Crew
                </div>

                <div className="flex items-center gap-3.5">
                  <div className="relative">
                    <img 
                      src={ambulance.crew.driver.photoUrl} 
                      alt={ambulance.crew.driver.name}
                      className="w-13 h-13 rounded-2xl object-cover border-2 border-emerald-500/50 shadow-md"
                      referrerPolicy="no-referrer"
                    />
                    <span className="absolute -bottom-1 -right-1 bg-emerald-500 w-4 h-4 rounded-full border-2 border-slate-900 flex items-center justify-center">
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                    </span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-white truncate">
                        {ambulance.crew.driver.name}
                      </h4>
                      <span className="text-xs font-black text-amber-400 bg-amber-950/80 px-2 py-0.5 rounded-md border border-amber-800/60">
                        ★ {ambulance.crew.driver.rating}
                      </span>
                    </div>
                    <p className="text-xs text-emerald-400 font-medium">
                      {ambulance.crew.driver.badge}
                    </p>
                    <p className="text-[11px] text-slate-400 truncate">
                      {ambulance.crew.driver.emergencyCert}
                    </p>
                  </div>
                </div>

                {/* Quick Call & Message Actions */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <a
                    href={`tel:${ambulance.crew.driver.phone}`}
                    className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Call Driver</span>
                  </a>

                  <button
                    id="open-driver-chat-btn"
                    onClick={() => setChatOpen(!chatOpen)}
                    className="py-2.5 px-3 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-teal-400" />
                    <span>Live Chat ({chatMessages.length})</span>
                  </button>
                </div>

                {/* Inline Chat Drawer if open */}
                {chatOpen && (
                  <div className="mt-3 p-3 bg-slate-950 rounded-xl border border-slate-700/80 space-y-2.5 animate-in fade-in">
                    <div className="text-[11px] font-bold text-slate-400 flex items-center justify-between">
                      <span>Emergency Direct Triage Channel</span>
                      <span className="text-emerald-400">● Active</span>
                    </div>
                    
                    <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1 text-xs">
                      {chatMessages.map((msg, idx) => (
                        <div 
                          key={idx} 
                          className={`p-2 rounded-xl text-xs ${
                            msg.sender === 'user' 
                              ? 'bg-teal-900/60 text-teal-100 ml-6 border border-teal-700/40' 
                              : msg.sender === 'system'
                              ? 'bg-slate-800/80 text-slate-300 text-[11px]'
                              : 'bg-slate-800 text-slate-100 mr-6 border border-slate-700'
                          }`}
                        >
                          <div className="font-bold text-[10px] text-slate-400 mb-0.5">
                            {msg.sender === 'user' ? 'You' : msg.sender === 'driver' ? ambulance.crew.driver.name : 'System'} &bull; {msg.time}
                          </div>
                          <div>{msg.text}</div>
                        </div>
                      ))}
                    </div>

                    <form onSubmit={handleSendMessage} className="flex gap-1.5 pt-1">
                      <input
                        type="text"
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        placeholder="Tell driver about floor / gate / patient condition..."
                        className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder:text-slate-500 focus:outline-hidden focus:border-teal-500"
                      />
                      <button
                        type="submit"
                        className="p-2 bg-teal-600 text-white rounded-lg hover:bg-teal-500 cursor-pointer"
                      >
                        <Send className="w-3.5 h-3.5" />
                      </button>
                    </form>
                  </div>
                )}
              </div>

              {/* Receiving Destination Hospital Status */}
              <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-400 uppercase tracking-wider">Destination Facility</span>
                  <span className="text-[11px] font-bold text-teal-400 bg-teal-950/80 px-2 py-0.5 rounded-full border border-teal-800/60">
                    Trauma Bay Alerted
                  </span>
                </div>

                <div className="flex items-start gap-2.5">
                  <HospitalIcon className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold text-white">
                      {destinationHospital.name}
                    </h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {destinationHospital.address}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
                  <div className="p-2 bg-slate-900 rounded-xl border border-slate-700/60">
                    <div className="text-[10px] text-slate-400 font-bold">ICU Bed Status</div>
                    <div className="text-emerald-400 font-black text-sm">
                      {destinationHospital.icuBedsAvailable} Beds Open
                    </div>
                  </div>
                  <div className="p-2 bg-slate-900 rounded-xl border border-slate-700/60">
                    <div className="text-[10px] text-slate-400 font-bold">Ventilators</div>
                    <div className="text-sky-400 font-black text-sm">
                      {destinationHospital.ventilatorsAvailable} Ready
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: LIVE EQUIPMENT TELEMETRY DASHBOARD */}
            <div className="lg:col-span-7 space-y-4">
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-800/90 border border-teal-500/30 space-y-4 shadow-xl">
                
                <div className="flex items-center justify-between border-b border-slate-700/80 pb-3">
                  <div className="flex items-center gap-2">
                    <Gauge className="w-5 h-5 text-teal-400" />
                    <div>
                      <h3 className="text-sm font-black text-white uppercase tracking-wider">
                        Live Onboard Medical Equipment Telemetry
                      </h3>
                      <p className="text-[11px] text-teal-300">
                        Real-time continuous sensor readings from vehicle {ambulance.plateNumber}
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono font-bold bg-slate-900 text-teal-400 px-2 py-1 rounded-md border border-teal-800">
                    FREQ: 1 Hz LIVE
                  </span>
                </div>

                {/* 4 Telemetry Gauges Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  
                  {/* Gauge 1: Oxygen Cylinder Status */}
                  <div className="p-3.5 rounded-xl bg-slate-950 border border-teal-800/50 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-300 flex items-center gap-1.5">
                        <Wind className="w-4 h-4 text-teal-400" />
                        O2 Cylinder Status
                      </span>
                      <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded-md border border-emerald-800">
                        Active
                      </span>
                    </div>

                    <div className="flex items-baseline justify-between">
                      <span className="text-2xl font-black text-teal-300 font-mono">
                        {booking.oxygenLiveLevel}%
                      </span>
                      <span className="text-xs text-slate-400 font-medium">
                        145 bar &bull; 12 L/min Max
                      </span>
                    </div>

                    {/* Visual Progress Bar */}
                    <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                      <div 
                        className="h-full bg-linear-to-r from-teal-500 to-emerald-400 transition-all duration-500" 
                        style={{ width: `${booking.oxygenLiveLevel}%` }}
                      />
                    </div>
                    <div className="text-[10px] text-slate-400 flex justify-between">
                      <span>Reserve: 4.5 Hours</span>
                      <span>Dual Manifold Ready</span>
                    </div>
                  </div>

                  {/* Gauge 2: Transport Ventilator */}
                  <div className="p-3.5 rounded-xl bg-slate-950 border border-blue-800/50 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-300 flex items-center gap-1.5">
                        <Activity className="w-4 h-4 text-blue-400" />
                        Ventilator Tele-Ready
                      </span>
                      <span className="text-[10px] font-bold text-blue-400 bg-blue-950 px-2 py-0.5 rounded-md border border-blue-800">
                        {ambulance.equipment.ventilator ? 'Standby (Pre-Set)' : 'Not Fitted'}
                      </span>
                    </div>

                    <div className="flex items-baseline justify-between">
                      <span className="text-lg font-black text-blue-300 font-mono">
                        {ambulance.equipment.ventilator ? 'Hamilton-T1' : 'Oxygen Mask Only'}
                      </span>
                      <span className="text-xs text-slate-400 font-medium">
                        {ambulance.equipment.ventilator ? 'FiO2 100% Ready' : 'BLS Flow'}
                      </span>
                    </div>

                    <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                      <div 
                        className="h-full bg-blue-500 transition-all duration-500" 
                        style={{ width: ambulance.equipment.ventilator ? '95%' : '0%' }}
                      />
                    </div>
                    <div className="text-[10px] text-slate-400 flex justify-between">
                      <span>Invasive/BIPAP Modes</span>
                      <span>Circuit: Sterilized</span>
                    </div>
                  </div>

                  {/* Gauge 3: Cardiac Telemetry & ECG Waveform */}
                  <div className="p-3.5 rounded-xl bg-slate-950 border border-rose-800/50 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-300 flex items-center gap-1.5">
                        <HeartPulse className="w-4 h-4 text-rose-400 animate-pulse" />
                        Live Vitals Sync Link
                      </span>
                      <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded-md border border-emerald-800">
                        Syncing
                      </span>
                    </div>

                    {/* Animated ECG Waveform Canvas */}
                    <div className="h-8 w-full bg-slate-900/90 rounded-md overflow-hidden relative border border-slate-800 flex items-center">
                      <svg viewBox="0 0 300 40" className="w-full h-full stroke-rose-500 fill-none" strokeWidth="2">
                        <path d="M 0 20 L 40 20 L 50 20 L 55 5 L 60 35 L 65 15 L 70 23 L 75 20 L 140 20 L 145 5 L 150 35 L 155 15 L 160 23 L 165 20 L 230 20 L 235 5 L 240 35 L 245 15 L 250 23 L 255 20 L 300 20" />
                      </svg>
                    </div>

                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400 text-[11px]">ECG: Normal Sinus</span>
                      <span className="font-black text-rose-400 font-mono">12-Lead Ready</span>
                    </div>
                  </div>

                  {/* Gauge 4: Medical UPS Power & Cabin Atmosphere */}
                  <div className="p-3.5 rounded-xl bg-slate-950 border border-amber-800/50 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-300 flex items-center gap-1.5">
                        <BatteryCharging className="w-4 h-4 text-amber-400" />
                        Power &amp; Cabin Climate
                      </span>
                      <span className="text-[10px] font-bold text-amber-400 bg-amber-950 px-2 py-0.5 rounded-md border border-amber-800">
                        {booking.batteryLiveLevel}% UPS
                      </span>
                    </div>

                    <div className="flex items-baseline justify-between">
                      <span className="text-2xl font-black text-amber-300 font-mono">
                        21.5°C
                      </span>
                      <span className="text-xs text-slate-400 font-medium">
                        230V Pure Sine Wave
                      </span>
                    </div>

                    <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                      <div 
                        className="h-full bg-linear-to-r from-amber-500 to-emerald-400" 
                        style={{ width: `${booking.batteryLiveLevel}%` }}
                      />
                    </div>
                    <div className="text-[10px] text-slate-400 flex justify-between">
                      <span>HEPA Air Filtration Active</span>
                      <span>Autoclave Sterilized</span>
                    </div>
                  </div>

                </div>

                {/* Dispatch Progress Timeline */}
                <div className="pt-2 border-t border-slate-700/80">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3">
                    Mission Timeline Stages
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full bg-emerald-500 text-slate-900 flex items-center justify-center font-bold text-[10px]">
                        ✓
                      </div>
                      <div className="flex-1 flex items-center justify-between">
                        <span className="font-bold text-white">Emergency Dispatched &amp; Driver Assigned</span>
                        <span className="text-slate-400 text-[11px]">00:00</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full bg-rose-500 text-white flex items-center justify-center font-bold text-[10px] animate-pulse">
                        2
                      </div>
                      <div className="flex-1 flex items-center justify-between">
                        <span className="font-bold text-rose-300">En Route to Pickup ({booking.liveDistanceKm.toFixed(1)} km away &bull; ETA {Math.ceil(booking.liveEtaSeconds / 60)}m)</span>
                        <span className="text-emerald-400 font-bold text-[11px]">ACTIVE</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 opacity-60">
                      <div className="w-5 h-5 rounded-full bg-slate-700 text-slate-400 flex items-center justify-center font-bold text-[10px]">
                        3
                      </div>
                      <div className="flex-1 flex items-center justify-between">
                        <span className="text-slate-300">Arrival at Pickup &amp; Oxygen / Vitals Stabilization</span>
                        <span className="text-slate-500 text-[11px]">Next</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 opacity-60">
                      <div className="w-5 h-5 rounded-full bg-slate-700 text-slate-400 flex items-center justify-center font-bold text-[10px]">
                        4
                      </div>
                      <div className="flex-1 flex items-center justify-between">
                        <span className="text-slate-300">Transferring to {destinationHospital.name} Trauma Center</span>
                        <span className="text-slate-500 text-[11px]">Pending</span>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer Controls */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <ShieldAlert className="w-4 h-4 text-emerald-400" />
            <span>Dedicated Emergency Medical Hotline Active: <strong className="text-white font-mono">108 / 112</strong></span>
          </div>

          <div className="flex items-center gap-3">
            <button
              id="cancel-booking-btn"
              onClick={onCancelBooking}
              className="px-4 py-2 rounded-xl text-rose-400 hover:text-rose-300 hover:bg-rose-950/50 border border-rose-900/50 text-xs font-bold transition-colors cursor-pointer"
            >
              Cancel Request
            </button>

            <button
              id="confirm-keep-tracking-btn"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold transition-colors shadow-md cursor-pointer"
            >
              Keep Tracking in Background
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
