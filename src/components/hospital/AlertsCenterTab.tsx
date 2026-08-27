import React, { useState } from 'react';
import { AlertTriangle, ShieldAlert, CheckCircle2, Clock, Check, Bell, RefreshCw } from 'lucide-react';
import { EquipmentAlert } from '../../types';

interface AlertsCenterTabProps {
  alerts: EquipmentAlert[];
  onResolveAlert: (alertId: string, action: 'acknowledge' | 'resolve') => Promise<void>;
  onSimulateEvent: (eventType: string) => Promise<void>;
}

export const AlertsCenterTab: React.FC<AlertsCenterTabProps> = ({
  alerts,
  onResolveAlert,
  onSimulateEvent,
}) => {
  const [filter, setFilter] = useState<'all' | 'unresolved' | 'critical'>('unresolved');

  const filteredAlerts = alerts.filter(alert => {
    if (filter === 'unresolved') return !alert.resolved;
    if (filter === 'critical') return alert.severity === 'critical' && !alert.resolved;
    return true;
  });

  return (
    <div className="space-y-6">
      
      {/* Alerts Summary Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-rose-600 animate-bounce" />
            <h3 className="text-base font-bold text-slate-900">
              Live Clinical &amp; Sensor Telemetry Alerts Center
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Automated alerts triggered by IoT hardware sensors, capacity thresholds, and neural demand forecasts.
          </p>
        </div>

        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs">
          <button
            onClick={() => setFilter('unresolved')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              filter === 'unresolved' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Active ({alerts.filter(a => !a.resolved).length})
          </button>
          <button
            onClick={() => setFilter('critical')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              filter === 'critical' ? 'bg-rose-600 text-white font-black shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Critical ({alerts.filter(a => a.severity === 'critical' && !a.resolved).length})
          </button>
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              filter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Logs ({alerts.length})
          </button>
        </div>
      </div>

      {/* Alerts List */}
      <div className="space-y-3">
        {filteredAlerts.map((alert) => (
          <div
            key={alert.id}
            className={`p-5 rounded-2xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
              alert.resolved
                ? 'bg-slate-50 border-slate-200 opacity-60'
                : alert.severity === 'critical'
                ? 'bg-rose-50/50 border-rose-300 shadow-xs'
                : alert.severity === 'warning'
                ? 'bg-amber-50/50 border-amber-300 shadow-xs'
                : 'bg-blue-50/40 border-blue-200'
            }`}
          >
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-md uppercase tracking-wider ${
                  alert.severity === 'critical'
                    ? 'bg-rose-600 text-white'
                    : alert.severity === 'warning'
                    ? 'bg-amber-500 text-slate-950 font-bold'
                    : 'bg-blue-600 text-white'
                }`}>
                  {alert.severity}
                </span>

                <span className="text-xs font-mono text-slate-500 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {alert.timestamp}
                </span>

                <span className="text-xs font-bold text-slate-600 bg-white/80 px-2 py-0.5 rounded-md border border-slate-200">
                  {alert.equipmentName}
                </span>
              </div>

              <h4 className="text-sm font-bold text-slate-900">{alert.title}</h4>
              <p className="text-xs text-slate-600 leading-relaxed">{alert.message}</p>
              
              {alert.actionRequired && (
                <p className="text-[11px] font-semibold text-slate-700 pt-1">
                  <strong>Required Protocol:</strong> {alert.actionRequired}
                </p>
              )}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {alert.resolved ? (
                <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-800 bg-emerald-100 px-3 py-1.5 rounded-xl">
                  <CheckCircle2 className="w-4 h-4" /> Resolved
                </span>
              ) : (
                <>
                  {!alert.acknowledged && (
                    <button
                      onClick={() => onResolveAlert(alert.id, 'acknowledge')}
                      className="px-3.5 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs transition-all cursor-pointer"
                    >
                      Acknowledge
                    </button>
                  )}
                  <button
                    onClick={() => onResolveAlert(alert.id, 'resolve')}
                    className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-all shadow-xs cursor-pointer flex items-center gap-1"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Resolve Alert</span>
                  </button>
                </>
              )}
            </div>
          </div>
        ))}

        {filteredAlerts.length === 0 && (
          <div className="bg-white rounded-2xl p-12 border border-slate-200 text-center space-y-3">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
            <h4 className="text-base font-bold text-slate-900">All Alerts Resolved &amp; Nominal</h4>
            <p className="text-xs text-slate-500">No active alerts matching the selected filter criteria.</p>
          </div>
        )}
      </div>

    </div>
  );
};
