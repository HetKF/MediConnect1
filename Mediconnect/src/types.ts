export type NavigationTab = 
  | 'overview'
  | 'patient-flow'
  | 'equipment'
  | 'predictions'
  | 'alerts'
  | 'analytics';

export type SeverityLevel = 'critical' | 'warning' | 'normal';
export type TriageCategory = 'Critical' | 'High Priority' | 'Moderate' | 'Low Priority';

export interface KPIStats {
  currentPatients: number;
  currentPatientsChange: number;
  edPatients: number;
  edCapacity: number;
  icuOccupancy: number; // 82%
  availableBeds: number; // 46
  totalBeds: number; // 500
  criticalEquipmentUtil: number; // 78%
  predictedPatientSurge: number; // +24%
  activeCriticalAlerts: number; // 5
  lastUpdated: string;
}

export interface PatientJourneyStage {
  id: string;
  name: string;
  subtitle: string;
  activePatients: number;
  avgDurationMinutes: number;
  status: 'normal' | 'warning' | 'bottleneck';
  statusText: string;
  iconName: string;
}

export interface TriagePatient {
  id: string;
  age: number;
  gender: 'M' | 'F' | 'Other';
  chiefComplaint: string;
  aiPriorityScore: number; // 0 - 100
  triageCategory: TriageCategory;
  recommendedDepartment: string;
  requiredResources: string[];
  estimatedWaitingMinutes: number;
  vitals: {
    hr: number;
    bp: string;
    spo2: number;
    temp: number;
  };
  arrivalTime: string;
  status: 'Waiting' | 'In Triage' | 'Assigned' | 'Admitted';
}

export interface OxygenStatus {
  currentLevelPercent: number; // 68%
  totalCapacityLiters: number; // 12000
  currentUtilLiters: number;
  consumptionRatePerHourPercent: number; // 4.2%
  remainingReserveLiters: number; // 3400
  icuDemandLevel: 'High' | 'Moderate' | 'Low';
  estimatedHoursToCritical: number; // 9 hours
  predictedFutureDemandText: string;
  aiRecommendation: string;
  trend24h: Array<{ hour: string; level: number; consumption: number }>;
}

export interface OperationTheatre {
  id: string;
  name: string;
  specialty: string;
  status: 'active' | 'available' | 'emergency_reserved' | 'turnover';
  currentProcedure?: string;
  surgeon?: string;
  minutesRemaining?: number;
  patientId?: string;
  scheduledSurgeries: number;
}

export interface DialysisMachineData {
  total: number; // 20
  inUse: number; // 16
  available: number; // 2
  maintenance: number; // 2
  utilizationPercent: number; // 80%
  upcomingAppointments: number;
  scheduleSlots: Array<{
    timeSlot: string;
    machineId: string;
    patientId: string;
    status: 'In-Progress' | 'Scheduled' | 'Available' | 'Sanitizing';
  }>;
}

export interface ECMOMachineData {
  total: number; // 6
  inUse: number; // 4
  available: number; // 1
  maintenance: number; // 1
  utilizationPercent: number;
  highPriorityQueue: Array<{
    patientId: string;
    acuity: string;
    condition: string;
    estNeedHours: number;
    matchScore: number;
  }>;
  units: Array<{
    id: string;
    name: string;
    status: 'In-Use' | 'Available' | 'Maintenance';
    patientId?: string;
    department?: string;
    durationHours?: number;
    estCompletionHours?: number;
  }>;
}

export interface ICUWardData {
  id: string;
  name: string;
  occupancyPercent: number; // e.g. 92%
  occupiedBeds: number;
  totalBeds: number;
  ventilatorUsagePercent: number; // e.g. 88%
  ventilatorsInUse: number;
  ventilatorsTotal: number;
  riskLevel: 'Critical' | 'Moderate' | 'Low';
  patientMonitorsActive: number;
  emergencyReserves: number;
}

export interface MRIScannerData {
  id: string;
  name: string;
  status: 'Operational' | 'Under Maintenance';
  utilizationPercent: number;
  currentPatientId?: string;
  currentQueue: number;
  estimatedWaitMinutes: number;
  maintenanceSchedule?: string;
}

export interface CTScannerData {
  total: number; // 4
  active: number; // 3
  available: number; // 1
  emergencyQueue: number; // 5 patients
  averageWaitMinutes: number; // 38 mins
  utilizationPercent: number; // 76%
  scanners: Array<{
    id: string;
    name: string;
    status: 'Active' | 'Available' | 'Maintenance';
    currentScan?: string;
    queueCount: number;
  }>;
}

export interface BottleneckItem {
  id: string;
  title: string;
  severity: 'critical' | 'warning' | 'moderate';
  horizon: string;
  department: string;
  description: string;
  impact: string;
  actionRequired: string;
}

export interface AIRecommendation {
  id: string;
  priority: 1 | 2 | 3 | 4 | 5;
  title: string;
  resourceAffected: string;
  reason: string;
  predictedImpact: string;
  department: string;
  category: 'Equipment' | 'Capacity' | 'Staffing' | 'Triage' | 'Scheduling';
  status: 'pending' | 'accepted' | 'dismissed';
  appliedAt?: string;
}

export type AlertSeverity = 'critical' | 'warning' | 'info';

export interface AlertItem {
  id: string;
  title: string;
  description: string;
  severity: SeverityLevel;
  department: string;
  resource?: string;
  timestamp: string;
  acknowledged: boolean;
  resolved?: boolean;
}

export interface DischargeCandidate {
  patientId: string;
  ward: string;
  bedNumber: string;
  diagnosis: string;
  predictedDischargeTime: string;
  pendingRequirements: string[];
  eligible: boolean;
  status: 'Ready' | 'Awaiting Lab' | 'Pharmacy Clearance' | 'Transport Needed';
}

export interface TransportTask {
  id: string;
  patientId: string;
  fromLocation: string;
  toLocation: string;
  urgency: 'STAT / Emergency' | 'High' | 'Routine';
  waitingPatientsCount: number;
  predictedDelayMinutes: number;
  aiRecommendation: string;
  status: 'Delayed' | 'En Route' | 'Scheduled';
}

export interface SimulatedImpactMetrics {
  losReductionMin: number;
  losReductionMax: number;
  losCurrentPercent: number;
  edWaitReductionMin: number;
  edWaitReductionMax: number;
  edWaitCurrentPercent: number;
  costReductionMin: number;
  costReductionMax: number;
  costCurrentPercent: number;
  stockoutReductionMin: number;
  stockoutReductionMax: number;
  stockoutCurrentPercent: number;
  disclaimer: string;
}
