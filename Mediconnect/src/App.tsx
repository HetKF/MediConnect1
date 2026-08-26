import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Navigation } from './components/Navigation';
import { CommandCenterSummary } from './components/CommandCenterSummary';
import { OverviewView } from './components/OverviewView';
import { PatientFlowView } from './components/PatientFlowView';
import { EquipmentResourcesView } from './components/EquipmentResourcesView';
import { PredictionsBottlenecksView } from './components/PredictionsBottlenecksView';
import { AlertsView } from './components/AlertsView';
import { AnalyticsView } from './components/AnalyticsView';
import { AIOperationsAdvisorModal } from './components/AIOperationsAdvisorModal';
import { 
  NavigationTab, 
  KPIStats, 
  PatientJourneyStage, 
  OxygenStatus, 
  OperationTheatre, 
  DialysisMachineData, 
  ECMOMachineData, 
  ICUWardData, 
  MRIScannerData, 
  CTScannerData, 
  TriagePatient, 
  DischargeCandidate, 
  TransportTask, 
  BottleneckItem, 
  AIRecommendation, 
  AlertItem 
} from './types';
import { 
  initialKPIs, 
  initialJourneyStages, 
  initialOxygenStatus, 
  initialOTs, 
  initialDialysisData, 
  initialECMOData, 
  initialICUWards, 
  initialMRIScanners, 
  initialCTScanners, 
  initialTriagePatients, 
  initialDischargeCandidates, 
  initialTransportTasks, 
  initialBottlenecks, 
  initialAIRecommendations, 
  initialAlerts 
} from './data/mockHospitalData';
import { CheckCircle2, AlertTriangle, Info } from 'lucide-react';

export function App() {
  const [activeTab, setActiveTab] = useState<NavigationTab>('overview');
  const [isAdvisorOpen, setIsAdvisorOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isLiveSimulating, setIsLiveSimulating] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Core Reactive States
  const [kpis, setKpis] = useState<KPIStats>(initialKPIs);
  const [journeyStages, setJourneyStages] = useState<PatientJourneyStage[]>(initialJourneyStages);
  const [oxygen, setOxygen] = useState<OxygenStatus>(initialOxygenStatus);
  const [ots, setOts] = useState<OperationTheatre[]>(initialOTs);
  const [dialysis, setDialysis] = useState<DialysisMachineData>(initialDialysisData);
  const [ecmo, setEcmo] = useState<ECMOMachineData>(initialECMOData);
  const [icuWards, setIcuWards] = useState<ICUWardData[]>(initialICUWards);
  const [mriScanners, setMriScanners] = useState<MRIScannerData[]>(initialMRIScanners);
  const [ctScanners, setCtScanners] = useState<CTScannerData>(initialCTScanners);
  const [triagePatients, setTriagePatients] = useState<TriagePatient[]>(initialTriagePatients);
  const [dischargeCandidates, setDischargeCandidates] = useState<DischargeCandidate[]>(initialDischargeCandidates);
  const [transportTasks, setTransportTasks] = useState<TransportTask[]>(initialTransportTasks);
  const [bottlenecks, setBottlenecks] = useState<BottleneckItem[]>(initialBottlenecks);
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>(initialAIRecommendations);
  const [alerts, setAlerts] = useState<AlertItem[]>(initialAlerts);

  // Real-Time Simulation Interval (simulating subtle live heartbeat telemetry updates)
  useEffect(() => {
    if (!isLiveSimulating) return;
    const timer = setInterval(() => {
      // Periodic subtle fluctuation in ED wait times or active intake count
      setJourneyStages(prev => prev.map(stage => {
        if (stage.id === 'entry') {
          return { ...stage, activePatients: 65 + Math.floor(Math.random() * 5) };
        }
        return stage;
      }));
    }, 15000);

    return () => clearInterval(timer);
  }, [isLiveSimulating]);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Action Handlers
  const handleExecuteRecommendation = (id: string) => {
    setRecommendations(prev => prev.map(rec => {
      if (rec.id === id) {
        return { ...rec, status: 'accepted' as const };
      }
      return rec;
    }));

    // Trigger state changes based on recommendation
    if (id === 'rec-1') {
      // Allocate 4 ventilators to ICU A
      setIcuWards(prev => prev.map(w => {
        if (w.name === 'ICU Block A (Medical)') {
          return { ...w, ventilatorsInUse: 22, ventilatorsTotal: 26, riskLevel: 'Moderate' as const };
        }
        return w;
      }));
      showToast('Directive Executed: 4 emergency ventilators routed to ICU Block A.');
    } else if (id === 'rec-4') {
      // Transfer oxygen cylinders
      setOxygen(prev => ({
        ...prev,
        currentLevelPercent: 78,
        remainingReserveLiters: 4800,
        estimatedHoursToCritical: 14,
      }));
      showToast('Directive Executed: Cryogenic emergency manifold and 12 cylinders deployed.');
    } else {
      showToast('Directive Accepted: Corrective protocols initiated.');
    }
  };

  const handleDismissRecommendation = (id: string) => {
    setRecommendations(prev => prev.map(rec => {
      if (rec.id === id) {
        return { ...rec, status: 'dismissed' as const };
      }
      return rec;
    }));
    showToast('Recommendation dismissed.');
  };

  const handleTriagePatientAction = (patientId: string, newStatus: string) => {
    setTriagePatients(prev => prev.map(p => {
      if (p.id === patientId) {
        return { ...p, status: newStatus as any };
      }
      return p;
    }));

    // Free ED queue and adjust bed count
    setKpis(prev => ({
      ...prev,
      edPatients: Math.max(0, prev.edPatients - 1),
      availableBeds: Math.max(0, prev.availableBeds - 1),
    }));

    showToast(`Patient ${patientId} successfully routed to clinical unit.`);
  };

  const handleExpediteDischarge = (patientId: string) => {
    setDischargeCandidates(prev => prev.filter(c => c.patientId !== patientId));
    setKpis(prev => ({
      ...prev,
      availableBeds: prev.availableBeds + 1,
      currentPatients: prev.currentPatients - 1,
    }));
    showToast(`Discharge expedited for ${patientId}. 1 Inpatient Bed liberated for intake.`);
  };

  const handleTransferOxygen = () => {
    setOxygen(prev => ({
      ...prev,
      currentLevelPercent: Math.min(100, prev.currentLevelPercent + 8),
      remainingReserveLiters: prev.remainingReserveLiters + 1200,
      estimatedHoursToCritical: 13,
    }));
    showToast('Dispatched 12 oxygen cylinders to ICU Block B.');
  };

  const handleAllocateVentilators = () => {
    setIcuWards(prev => prev.map(w => {
      if (w.name === 'ICU Block A (Medical)') {
        return { ...w, ventilatorsTotal: w.ventilatorsTotal + 4, riskLevel: 'Moderate' as const };
      }
      return w;
    }));
    showToast('Allocated 4 reserve ventilators to ICU Block A.');
  };

  const handleAcknowledgeAlert = (alertId: string) => {
    setAlerts(prev => prev.map(a => {
      if (a.id === alertId) {
        return { ...a, acknowledged: true };
      }
      return a;
    }));
    showToast('Alert acknowledged by command.');
  };

  const handleResolveAlert = (alertId: string) => {
    setAlerts(prev => prev.map(a => {
      if (a.id === alertId) {
        return { ...a, resolved: true };
      }
      return a;
    }));
    setKpis(prev => ({
      ...prev,
      activeCriticalAlerts: Math.max(0, prev.activeCriticalAlerts - 1),
    }));
    showToast('Alert resolved and archived to incident history.');
  };

  const handleSimulateSurgeAlert = () => {
    const newAlert: AlertItem = {
      id: `alert-${Date.now()}`,
      title: 'Mass Casualty Influx Alert (Highway 101 Multi-Vehicle Collision)',
      department: 'Emergency Department',
      severity: 'critical',
      description: 'Paramedic dispatch reports 9 acute trauma victims incoming with ETA 12 minutes. STAT trauma bays requested.',
      timestamp: 'Just now',
      acknowledged: false,
      resolved: false,
    };
    setAlerts(prev => [newAlert, ...prev]);
    setKpis(prev => ({
      ...prev,
      edPatients: prev.edPatients + 9,
      activeCriticalAlerts: prev.activeCriticalAlerts + 1,
    }));
    showToast('🚨 SIMULATION TRIGGERED: 9 Acute trauma patients inbound.');
  };

  const criticalAlertsCount = alerts.filter(a => a.severity === 'critical' && !a.resolved).length;

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col font-sans antialiased selection:bg-blue-600 selection:text-white">
      
      {/* 1. Header with live status, timestamp, alert notifications, and AI Advisor trigger */}
      <Header
        kpis={kpis}
        alerts={alerts}
        isLiveSimulating={isLiveSimulating}
        onToggleLiveSimulation={() => setIsLiveSimulating(prev => !prev)}
        onOpenAiAdvisor={() => setIsAdvisorOpen(true)}
        onOpenAiOpsModal={() => setIsAdvisorOpen(true)}
        criticalAlertsCount={criticalAlertsCount}
        onNavigateToAlerts={() => setActiveTab('alerts')}
        onOpenAlerts={() => setActiveTab('alerts')}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* 2. Top-Level Tab Navigation */}
      <Navigation
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        criticalAlertsCount={criticalAlertsCount}
        hasSurgeWarning={true}
      />

      {/* 3. Main Dashboard Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Persistent Command Center Assessment Summary answering 3 core questions */}
        <CommandCenterSummary
          kpis={kpis}
          bottlenecks={bottlenecks}
          recommendations={recommendations}
          onExecuteRecommendation={handleExecuteRecommendation}
          onNavigateToTab={setActiveTab}
        />

        {/* Tab View Routing */}
        {activeTab === 'overview' && (
          <OverviewView
            kpis={kpis}
            journeyStages={journeyStages}
            oxygen={oxygen}
            icuWards={icuWards}
            recommendations={recommendations}
            alerts={alerts}
            onNavigateTab={setActiveTab}
            onExecuteRecommendation={handleExecuteRecommendation}
          />
        )}

        {activeTab === 'patient-flow' && (
          <PatientFlowView
            journeyStages={journeyStages}
            triagePatients={triagePatients}
            dischargeCandidates={dischargeCandidates}
            transportTasks={transportTasks}
            onTriagePatientAction={handleTriagePatientAction}
            onExpediteDischarge={handleExpediteDischarge}
          />
        )}

        {activeTab === 'equipment' && (
          <EquipmentResourcesView
            oxygen={oxygen}
            ots={ots}
            dialysis={dialysis}
            ecmo={ecmo}
            icuWards={icuWards}
            mriScanners={mriScanners}
            ctScanners={ctScanners}
            onTransferOxygen={handleTransferOxygen}
            onAllocateVentilators={handleAllocateVentilators}
          />
        )}

        {activeTab === 'predictions' && (
          <PredictionsBottlenecksView
            bottlenecks={bottlenecks}
            recommendations={recommendations}
            onAcceptRecommendation={handleExecuteRecommendation}
            onDismissRecommendation={handleDismissRecommendation}
            onExecuteBottleneckAction={handleExecuteRecommendation}
          />
        )}

        {activeTab === 'alerts' && (
          <AlertsView
            alerts={alerts}
            onAcknowledgeAlert={handleAcknowledgeAlert}
            onResolveAlert={handleResolveAlert}
            onSimulateSurgeAlert={handleSimulateSurgeAlert}
          />
        )}

        {activeTab === 'analytics' && (
          <AnalyticsView />
        )}

      </main>

      {/* 4. AI Operations Advisor Interactive Modal */}
      <AIOperationsAdvisorModal
        isOpen={isAdvisorOpen}
        onClose={() => setIsAdvisorOpen(false)}
        kpis={kpis}
        oxygen={oxygen}
        icuWards={icuWards}
        bottlenecks={bottlenecks}
      />

      {/* 5. Notification Toast Feedback */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl border border-slate-700 flex items-center space-x-2 text-xs font-semibold animate-in slide-in-from-bottom duration-300">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-slate-700">MediConnect Clinical Operations Command</span>
            <span>• HIPAA & ISO 27001 Certified Architecture</span>
          </div>
          <div className="flex items-center space-x-4 font-mono text-[11px]">
            <span>Telemetry: Online (0.4s sync)</span>
            <span>ML Engine: v4.2 Active</span>
          </div>
        </div>
      </footer>

    </div>
  );
}

export default App;
