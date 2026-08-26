import React, { useState } from 'react';
import { 
  AlertTriangle, 
  AlertCircle, 
  Info, 
  CheckCircle2, 
  ShieldAlert, 
  Filter, 
  Search, 
  Zap, 
  Bell, 
  RefreshCw, 
  Clock, 
  Building2,
  Check
} from 'lucide-react';
import { AlertItem, AlertSeverity } from '../types';

interface AlertsViewProps {
  alerts: AlertItem[];
  onAcknowledgeAlert: (id: string) => void;
  onResolveAlert: (id: string) => void;
  onSimulateSurgeAlert: () => void;
}

export const AlertsView: React.FC<AlertsViewProps> = ({
  alerts,
  onAcknowledgeAlert,
  onResolveAlert,
  onSimulateSurgeAlert,
}) => {
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [filterDepartment, setFilterDepartment] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredAlerts = alerts.filter(alert => {
    const matchesSeverity = filterSeverity === 'all' || alert.severity === filterSeverity;
    const matchesDept = filterDepartment === 'all' || alert.department === filterDepartment;
    const matchesSearch = 
      alert.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      alert.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      alert.department.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSeverity && matchesDept && matchesSearch;
  });

  const criticalCount = alerts.filter(a => a.severity === 'critical' && !a.resolved).length;
  const warningCount = alerts.filter(a => a.severity === 'warning' && !a.resolved).length;
  const infoCount = alerts.filter(a => a.severity === 'info' && !a.resolved).length;

  return (
    <div className="space-y-6">
      
      {/* Alert Center Header & Statistics */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded bg-red-100 text-red-800 font-mono">
              Live Incident Log
            </span>
            <span className="text-xs text-slate-500 font-mono">{alerts.length} Total Registered Alerts</span>
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 mt-1">
            Hospital Incident, Emergency & Safety Alert Management
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Severity-graded monitoring and automated protocol dispatch for clinical infrastructure.
          </p>
        </div>

        {/* Live Simulation Button */}
        <div className="flex items-center space-x-2">
          <button
            onClick={onSimulateSurgeAlert}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white text-xs font-bold transition shadow-sm flex items-center space-x-2 shrink-0"
          >
            <Zap className="w-4 h-4" />
            <span>Simulate Mass-Casualty Influx</span>
          </button>
        </div>
      </div>

      {/* Severity Counters & Filter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <button
          onClick={() => setFilterSeverity(filterSeverity === 'critical' ? 'all' : 'critical')}
          className={`p-4 rounded-xl border text-left transition ${
            filterSeverity === 'critical'
              ? 'bg-red-600 text-white border-red-600 shadow-md'
              : 'bg-red-50/50 border-red-200 hover:bg-red-50'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ShieldAlert className={`w-5 h-5 ${filterSeverity === 'critical' ? 'text-white' : 'text-red-600'}`} />
              <span className={`text-xs font-bold uppercase ${filterSeverity === 'critical' ? 'text-white' : 'text-red-900'}`}>
                Critical Alerts
              </span>
            </div>
            <span className={`text-2xl font-extrabold font-mono ${filterSeverity === 'critical' ? 'text-white' : 'text-red-700'}`}>
              {criticalCount}
            </span>
          </div>
          <p className={`text-[11px] mt-1 ${filterSeverity === 'critical' ? 'text-red-100' : 'text-slate-500'}`}>
            Requires immediate clinical/admin intervention
          </p>
        </button>

        <button
          onClick={() => setFilterSeverity(filterSeverity === 'warning' ? 'all' : 'warning')}
          className={`p-4 rounded-xl border text-left transition ${
            filterSeverity === 'warning'
              ? 'bg-amber-600 text-white border-amber-600 shadow-md'
              : 'bg-amber-50/50 border-amber-200 hover:bg-amber-50'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <AlertTriangle className={`w-5 h-5 ${filterSeverity === 'warning' ? 'text-white' : 'text-amber-600'}`} />
              <span className={`text-xs font-bold uppercase ${filterSeverity === 'warning' ? 'text-white' : 'text-amber-900'}`}>
                Warning Alerts
              </span>
            </div>
            <span className={`text-2xl font-extrabold font-mono ${filterSeverity === 'warning' ? 'text-white' : 'text-amber-700'}`}>
              {warningCount}
            </span>
          </div>
          <p className={`text-[11px] mt-1 ${filterSeverity === 'warning' ? 'text-amber-100' : 'text-slate-500'}`}>
            Threshold warnings & predicted bottlenecks
          </p>
        </button>

        <button
          onClick={() => setFilterSeverity(filterSeverity === 'info' ? 'all' : 'info')}
          className={`p-4 rounded-xl border text-left transition ${
            filterSeverity === 'info'
              ? 'bg-blue-600 text-white border-blue-600 shadow-md'
              : 'bg-blue-50/50 border-blue-200 hover:bg-blue-50'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Info className={`w-5 h-5 ${filterSeverity === 'info' ? 'text-white' : 'text-blue-600'}`} />
              <span className={`text-xs font-bold uppercase ${filterSeverity === 'info' ? 'text-white' : 'text-blue-900'}`}>
                Informational
              </span>
            </div>
            <span className={`text-2xl font-extrabold font-mono ${filterSeverity === 'info' ? 'text-white' : 'text-blue-700'}`}>
              {infoCount}
            </span>
          </div>
          <p className={`text-[11px] mt-1 ${filterSeverity === 'info' ? 'text-blue-100' : 'text-slate-500'}`}>
            Routine updates, maintenance & schedule logs
          </p>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search alerts by title, description or department..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <select
            value={filterDepartment}
            onChange={(e) => setFilterDepartment(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:outline-none"
          >
            <option value="all">All Departments</option>
            <option value="ICU">ICU & Critical Care</option>
            <option value="Emergency Department">Emergency Dept</option>
            <option value="Medical Gas Plant">Oxygen / Gas Plant</option>
            <option value="Radiology">Radiology / Imaging</option>
            <option value="Nephrology">Nephrology / Dialysis</option>
            <option value="General Operations">General Operations</option>
          </select>

          {filterSeverity !== 'all' && (
            <button
              onClick={() => setFilterSeverity('all')}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold whitespace-nowrap"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Alert Feed List */}
      <div className="space-y-3">
        {filteredAlerts.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 border border-slate-200 text-center text-slate-500">
            <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-500 mb-2" />
            <p className="font-bold text-slate-800">No active alerts match this filter.</p>
            <p className="text-xs text-slate-500">Hospital operations are running within configured tolerances.</p>
          </div>
        ) : (
          filteredAlerts.map((alert) => {
            const isCritical = alert.severity === 'critical';
            const isWarning = alert.severity === 'warning';
            return (
              <div
                key={alert.id}
                className={`bg-white rounded-xl p-4 sm:p-5 border transition-all ${
                  alert.resolved
                    ? 'opacity-60 bg-slate-50 border-slate-200'
                    : isCritical
                    ? 'border-red-300 bg-gradient-to-r from-red-50/40 to-white shadow-sm'
                    : isWarning
                    ? 'border-amber-300 bg-gradient-to-r from-amber-50/30 to-white'
                    : 'border-blue-200 bg-white'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="flex items-start space-x-3">
                    <div className={`p-2 rounded-lg shrink-0 mt-0.5 ${
                      isCritical ? 'bg-red-100 text-red-700' : isWarning ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
                    }`}>
                      {isCritical ? <ShieldAlert className="w-5 h-5" /> : isWarning ? <AlertTriangle className="w-5 h-5" /> : <Info className="w-5 h-5" />}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                          isCritical ? 'bg-red-100 text-red-800' : isWarning ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {alert.severity}
                        </span>
                        <span className="text-xs font-semibold text-slate-500">{alert.department}</span>
                        <span className="text-xs text-slate-400 font-mono">• {alert.timestamp}</span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900 mt-1">{alert.title}</h4>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">{alert.description}</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-2 self-end sm:self-center shrink-0">
                    {alert.resolved ? (
                      <span className="text-xs font-bold text-emerald-700 flex items-center bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
                        <Check className="w-4 h-4 mr-1" />
                        Resolved
                      </span>
                    ) : (
                      <>
                        {!alert.acknowledged && (
                          <button
                            onClick={() => onAcknowledgeAlert(alert.id)}
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition"
                          >
                            Acknowledge
                          </button>
                        )}
                        <button
                          onClick={() => onResolveAlert(alert.id)}
                          className="px-3.5 py-1.5 rounded-lg text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition shadow-sm"
                        >
                          Resolve Alert
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

    </div>
  );
};
