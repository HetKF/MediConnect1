import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  Search, 
  Sparkles, 
  Activity, 
  Clock, 
  Calendar, 
  RefreshCw, 
  ChevronDown, 
  User, 
  CheckCircle2, 
  AlertTriangle,
  Play,
  Pause,
  Layers,
  MapPin
} from 'lucide-react';
import { AlertItem, KPIStats } from '../types';

interface HeaderProps {
  kpis?: KPIStats;
  alerts?: AlertItem[];
  criticalAlertsCount?: number;
  isLiveSimulating?: boolean;
  onToggleLiveSimulation?: () => void;
  onOpenAiOpsModal?: () => void;
  onOpenAiAdvisor?: () => void;
  onOpenAlerts?: () => void;
  onNavigateToAlerts?: () => void;
  searchQuery?: string;
  onSearchChange?: (q: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  kpis,
  alerts = [],
  criticalAlertsCount: propCriticalCount,
  isLiveSimulating = true,
  onToggleLiveSimulation = () => {},
  onOpenAiOpsModal,
  onOpenAiAdvisor,
  onOpenAlerts,
  onNavigateToAlerts,
  searchQuery = '',
  onSearchChange = (_q: string) => {},
}) => {
  const [time, setTime] = useState<string>('');
  const [dateStr, setDateStr] = useState<string>('');
  const [showAlertsDropdown, setShowAlertsDropdown] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState('Mumbai Campus - Main');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      setDateStr(now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const safeAlerts = alerts || [];
  const criticalAlertsCount = propCriticalCount !== undefined 
    ? propCriticalCount 
    : safeAlerts.filter(a => a.severity === 'critical' && !a.acknowledged && !a.resolved).length;

  const handleOpenAi = () => {
    if (onOpenAiOpsModal) onOpenAiOpsModal();
    else if (onOpenAiAdvisor) onOpenAiAdvisor();
  };

  const handleOpenAlerts = () => {
    setShowAlertsDropdown(false);
    if (onOpenAlerts) onOpenAlerts();
    else if (onNavigateToAlerts) onNavigateToAlerts();
  };

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-40 shadow-lg">
      {/* Top micro status bar */}
      <div className="bg-slate-950 px-4 py-1 text-xs text-slate-400 flex items-center justify-between border-b border-slate-800/80">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1.5">
            <span className="relative flex h-2 w-2">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isLiveSimulating ? 'bg-emerald-400' : 'bg-amber-400'}`}></span>
              <span className={`relative inline-flex rounded-full h-2 w-2 ${isLiveSimulating ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
            </span>
            <span className="font-mono font-medium text-slate-300">
              {isLiveSimulating ? 'LIVE IOT TELEMETRY CONNECTED' : 'STREAM PAUSED'}
            </span>
          </div>
          <span className="hidden sm:inline text-slate-600">|</span>
          <span className="hidden sm:inline text-slate-400 font-mono">Sensors Online: 142/142</span>
          <span className="hidden md:inline text-slate-600">|</span>
          <span className="hidden md:inline text-slate-400">EMR Sync: 0.8s latency</span>
        </div>
        <div className="flex items-center space-x-3 font-mono">
          <div className="flex items-center space-x-1 text-slate-400">
            <Calendar className="w-3 h-3 text-cyan-400" />
            <span>{dateStr || 'Aug 25, 2026'}</span>
          </div>
          <span className="text-slate-600">|</span>
          <div className="flex items-center space-x-1 text-cyan-300 font-semibold">
            <Clock className="w-3 h-3 text-cyan-400" />
            <span>{time || '14:16:40'} IST</span>
          </div>
        </div>
      </div>

      {/* Main command center header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          
          {/* Logo & Hospital Branding */}
          <div className="flex items-center space-x-4">
            {/* Custom Syringe + Cross Icon */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-emerald-500 flex items-center justify-center shadow-md shadow-cyan-500/20 text-white p-2">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
                  <path d="m18 2 4 4" />
                  <path d="m17 7 3-3" />
                  <path d="M19 9 8.7 19.3c-1 1-2.5 1-3.4 0l-.6-.6c-1-1-1-2.5 0-3.4L15 5" />
                  <path d="m9 11 4 4" />
                  <path d="m5 19-3 3" />
                  <path d="m14 4 6 6" />
                </svg>
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h1 className="text-xl font-bold tracking-tight text-white flex items-center">
                    Medi<span className="text-emerald-400 font-extrabold">Connect</span>
                  </h1>
                  <span className="px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded bg-cyan-950 text-cyan-400 border border-cyan-800">
                    Ops Command
                  </span>
                </div>
                <div className="flex items-center text-xs text-slate-400 space-x-1.5 mt-0.5">
                  <span className="font-semibold text-slate-200">CityCare Multi-Speciality Hospital</span>
                  <span className="text-slate-600">•</span>
                  <span className="flex items-center text-slate-400">
                    <MapPin className="w-3 h-3 mr-0.5 text-cyan-400 inline" />
                    Mumbai Campus
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Search, Action Controls & User Profile */}
          <div className="flex items-center flex-wrap gap-2.5 justify-between md:justify-end">
            {/* Global Search Bar */}
            <div className="relative min-w-[200px] sm:min-w-[260px]">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search patient, equipment, ward..."
                className="w-full bg-slate-800/90 border border-slate-700 text-sm text-slate-200 pl-9 pr-3 py-1.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition placeholder:text-slate-500"
              />
            </div>

            {/* AI Advisor Trigger Button */}
            <button
              onClick={handleOpenAi}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-semibold shadow-md shadow-cyan-900/30 transition border border-cyan-400/30"
              title="Launch Gemini AI Operations Diagnostic"
            >
              <Sparkles className="w-3.5 h-3.5 text-yellow-300 animate-pulse" />
              <span>AI Operations Advisor</span>
            </button>

            {/* Live Ticker Toggle */}
            <button
              onClick={onToggleLiveSimulation}
              className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition ${
                isLiveSimulating
                  ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800 hover:bg-emerald-900/50'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
              }`}
              title="Toggle continuous telemetry simulation"
            >
              {isLiveSimulating ? (
                <>
                  <Pause className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="hidden sm:inline">Live Mode</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 text-amber-400" />
                  <span className="hidden sm:inline">Resume Sim</span>
                </>
              )}
            </button>

            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowAlertsDropdown(!showAlertsDropdown);
                }}
                className="relative p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
                aria-label="Open critical alerts"
              >
                <Bell className="w-4 h-4" />
                {criticalAlertsCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-bounce">
                    {criticalAlertsCount}
                  </span>
                )}
              </button>

              {/* Quick Alerts Dropdown */}
              {showAlertsDropdown && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-50 overflow-hidden">
                  <div className="px-4 py-2.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <AlertTriangle className="w-4 h-4 text-red-400" />
                      <span className="text-xs font-bold text-slate-200">Active Critical Alerts ({criticalAlertsCount})</span>
                    </div>
                    <button 
                      onClick={handleOpenAlerts}
                      className="text-xs text-cyan-400 hover:underline"
                    >
                      View All
                    </button>
                  </div>
                  <div className="max-h-64 overflow-y-auto divide-y divide-slate-800">
                    {safeAlerts.slice(0, 4).map((alert) => (
                      <div key={alert.id} className="p-3 hover:bg-slate-800/60 transition text-xs">
                        <div className="flex items-start justify-between gap-2">
                          <span className={`font-semibold ${alert.severity === 'critical' ? 'text-red-400' : alert.severity === 'warning' ? 'text-amber-400' : 'text-emerald-400'}`}>
                            {alert.title}
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono whitespace-nowrap">{alert.timestamp}</span>
                        </div>
                        <p className="text-slate-400 text-[11px] mt-1 line-clamp-2">{alert.description}</p>
                      </div>
                    ))}
                  </div>
                  <div className="p-2 bg-slate-950/80 border-t border-slate-800 text-center">
                    <button
                      onClick={handleOpenAlerts}
                      className="w-full py-1 text-xs text-center text-cyan-400 font-medium hover:text-cyan-300"
                    >
                      Open Full Alerts Command Panel →
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Administrator Profile */}
            <div className="flex items-center space-x-2.5 pl-2 border-l border-slate-800">
              <div className="w-8 h-8 rounded-full bg-cyan-950 border border-cyan-700 flex items-center justify-center text-cyan-300 font-bold text-xs">
                AM
              </div>
              <div className="hidden lg:block text-left">
                <div className="text-xs font-semibold text-slate-200 leading-tight">Dr. Ashok Mishra, MD</div>
                <div className="text-[10px] text-emerald-400 leading-tight flex items-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block mr-1"></span>
                  Hospital Operations Admin
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </header>
  );
};
