import React from 'react';
import { 
  LayoutDashboard, 
  GitFork, 
  Stethoscope, 
  Sparkles, 
  BarChart3,
  AlertCircle
} from 'lucide-react';
import { NavigationTab } from '../types';

interface NavigationProps {
  activeTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  criticalAlertsCount: number;
  hasSurgeWarning: boolean;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onSelectTab,
  criticalAlertsCount,
  hasSurgeWarning,
}) => {
  const tabs = [
    {
      id: 'overview' as NavigationTab,
      label: 'Overview',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'patient-flow' as NavigationTab,
      label: 'Patient Flow',
      icon: GitFork,
      badge: hasSurgeWarning ? 'Surge +24%' : null,
      badgeColor: 'bg-amber-100 text-amber-800 border-amber-300',
    },
    {
      id: 'equipment' as NavigationTab,
      label: 'Equipment & Resources',
      icon: Stethoscope,
      badge: '78% Util',
      badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
    },
    {
      id: 'predictions' as NavigationTab,
      label: 'AI Predictions',
      icon: Sparkles,
      badge: '5 Bottlenecks',
      badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    },
    {
      id: 'alerts' as NavigationTab,
      label: 'Alerts',
      icon: AlertCircle,
      badge: criticalAlertsCount > 0 ? `${criticalAlertsCount} Critical` : 'Normal',
      badgeColor: criticalAlertsCount > 0 ? 'bg-red-100 text-red-800 border-red-300 animate-pulse' : 'bg-emerald-100 text-emerald-800 border-emerald-200',
    },
    {
      id: 'analytics' as NavigationTab,
      label: 'Analytics',
      icon: BarChart3,
      badge: 'Simulated Impact',
      badgeColor: 'bg-slate-100 text-slate-700 border-slate-200',
    },
  ];

  return (
    <nav className="bg-white border-b border-slate-200 shadow-sm sticky top-[69px] z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-1 sm:space-x-2 overflow-x-auto py-2 scrollbar-none">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onSelectTab(tab.id)}
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all whitespace-nowrap border ${
                  isActive
                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm shadow-blue-500/20'
                    : 'bg-slate-50 text-slate-600 border-slate-200/80 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span
                    className={`ml-1.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full border ${
                      isActive
                        ? 'bg-white/20 text-white border-white/30'
                        : tab.badgeColor
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
