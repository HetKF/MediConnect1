export type AmbulanceType = 'BLS' | 'ALS' | 'CARDIAC' | 'NEONATAL' | 'PATIENT_TRANSPORT';

export interface EquipmentStatus {
  name: string;
  category: 'respiratory' | 'cardiac' | 'trauma' | 'monitoring' | 'power';
  available: boolean;
  statusText: string;
  metric?: {
    label: string;
    value: string | number;
    unit: string;
    level: 'normal' | 'warning' | 'critical';
  };
}

export interface DriverInfo {
  name: string;
  photoUrl: string;
  rating: number;
  tripsCount: number;
  phone: string;
  badge: string;
  emergencyCert: string;
}

export interface Ambulance {
  id: string;
  callSign: string;
  plateNumber: string;
  type: AmbulanceType;
  title: string;
  categoryLabel: string;
  tagline: string;
  operator: string;
  baseHospital: string;
  etaMinutes: number;
  distanceKm: number;
  speedKmh: number;
  coords: {
    lat: number;
    lng: number;
  };
  priceEstimate: {
    baseFare: number;
    perKm: number;
    currency: string;
  };
  crew: {
    doctorOnBoard: boolean;
    paramedicCount: number;
    emtLevel: string;
    driver: DriverInfo;
  };
  equipment: {
    oxygenCylinder: boolean;
    oxygenLevelPercent: number;
    oxygenFlowMaxLpm: number;
    ventilator: boolean;
    ventilatorModel?: string;
    cardiacMonitor: boolean;
    defibrillator: boolean;
    suctionUnit: boolean;
    infusionPump: boolean;
    incubator: boolean;
    wheelchairRamp: boolean;
    spineBoard: boolean;
    firstAidTraumaKit: boolean;
    aclsKit: boolean;
  };
  detailedEquipmentList: EquipmentStatus[];
  isAvailable: boolean;
  badgeColor: string;
}

export interface Hospital {
  id: string;
  name: string;
  address: string;
  distanceKm: number;
  etaMinutes: number;
  icuBedsAvailable: number;
  ventilatorsAvailable: number;
  emergencyTraumaLevel: string;
  contactNumber: string;
  coords: {
    lat: number;
    lng: number;
  };
}

export interface TrackingStep {
  id: 'dispatched' | 'en_route_pickup' | 'arrived_pickup' | 'patient_onboard' | 'en_route_hospital' | 'arrived_hospital';
  label: string;
  description: string;
  timestamp: string;
  completed: boolean;
  active: boolean;
}

export interface ActiveBooking {
  id: string;
  bookingTime: string;
  ambulance: Ambulance;
  pickupAddress: string;
  pickupCoords: {
    lat: number;
    lng: number;
  };
  destinationHospital: Hospital;
  patientCondition: string;
  requiredEquipmentFilters: string[];
  currentStatus: TrackingStep['id'];
  currentDriverCoords: {
    lat: number;
    lng: number;
  };
  liveDistanceKm: number;
  liveEtaSeconds: number;
  driverSpeedKmh: number;
  oxygenLiveLevel: number;
  heartRateTelemetry?: number;
  spo2Telemetry?: number;
  batteryLiveLevel: number;
  timeline: TrackingStep[];
  sirenOn: boolean;
}

export interface LocationOption {
  id: string;
  cityName: string;
  state: string;
  defaultArea: string;
  coords: {
    lat: number;
    lng: number;
  };
}

export type UserRole = 'patient' | 'hospital';

export interface AuthUser {
  role: UserRole;
  email: string;
  name: string;
  hospitalName?: string;
  phone?: string;
}

export type DoctorDutyStatus = 'on_duty_er' | 'in_surgery' | 'icu_rounds' | 'on_call' | 'consultation';

export interface HospitalDoctor {
  id: string;
  name: string;
  specialty: string;
  department: string;
  qualification: string;
  hospital: string;
  hospitalId?: string;
  experienceYears: number;
  dutyStatus: DoctorDutyStatus;
  dutyStatusLabel: string;
  dutyLocation: string;
  shiftTime: string;
  onCallResponseTime: string;
  emergencyContact: string;
  avatarUrl: string;
  lastUpdated: string;
  activeCasesCount?: number;
}

// -------------------------------------------------------------
// HOSPITAL EQUIPMENT & SHARED RESOURCE DATA MODELS
// -------------------------------------------------------------

export type EquipmentCategoryType = 
  | 'mri'
  | 'ct'
  | 'ventilator'
  | 'oxygen'
  | 'dialysis'
  | 'ecmo'
  | 'patient_monitor'
  | 'ot'
  | 'icu_bed'
  | 'general_bed'
  | 'emergency_bed'
  | 'defibrillator'
  | 'infusion_pump'
  | 'blood_bank'
  | 'pocus';

export type EquipmentOperationalStatus = 'operational' | 'degraded' | 'maintenance' | 'offline';
export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type MaintenanceStatusType = 'Normal' | 'Attention Required' | 'Maintenance Due' | 'Overdue' | 'Urgent Attention';

export interface IndividualUnit {
  unitId: string;
  serialNumber: string;
  model: string;
  status: 'in_use' | 'available' | 'maintenance' | 'offline';
  currentPatientId?: string;
  assignedLocation?: string;
  usageHours: number;
  healthScore: number;
  lastServiceDate: string;
  nextServiceDate: string;
  temperatureC: number;
  vibrationMmS: number;
  errorStatus: string;
  riskLevel: RiskLevel;
  telemetryNote: string;
}

export interface SensorTelemetry {
  temperatureC: number;
  temperatureStatus: 'normal' | 'warm' | 'hot' | 'critical';
  vibrationMmS: number;
  vibrationStatus: 'normal' | 'elevated' | 'critical';
  powerKw: number;
  pressureBar?: number;
  oxygenFlowLpm?: number;
  oxygenReservePercent?: number;
  scanCountToday?: number;
  sessionCountToday?: number;
  operatingHoursToday: number;
  errorCount24h: number;
  lastTelemetryTime: string;
  batteryLevelPercent?: number;
  signalQualityPercent: number;
  connected: boolean;
}

export interface UsageHistoryPoint {
  date: string;
  usagePercent: number;
  procedures: number;
  operatingHours: number;
  idleHours: number;
}

export interface HourlyPeakPoint {
  hour: string;
  usagePercent: number;
  demandScore: number;
}

export interface EquipmentUsageData {
  daily: UsageHistoryPoint[];
  hourlyPeakDemand: HourlyPeakPoint[];
  weeklyTrend: Array<{ day: string; usagePercent: number }>;
  monthlyTrend: Array<{ month: string; usagePercent: number }>;
  averageUtilization: number;
  peakUtilization: number;
  lowestUtilization: number;
  idleTimePercentage: number;
  totalProcedures: number;
  averageOperatingHoursPerDay: number;
}

export interface MaintenanceRecord {
  id: string;
  date: string;
  type: 'Preventive' | 'Corrective' | 'Calibration' | 'Emergency Repair';
  description: string;
  technician: string;
  downtimeHours: number;
  replacedParts?: string[];
  cost?: number;
  status: 'completed' | 'scheduled' | 'in_progress';
}

export interface MaintenanceIntelligence {
  status: MaintenanceStatusType;
  lastMaintenance: string;
  nextScheduledMaintenance: string;
  daysToNextMaintenance: number;
  usageHoursSinceLastService: number;
  maintenanceFrequencyDays: number;
  historicalBreakdownsCount: number;
  totalDowntimeHours: number;
  averageDowntimeHours: number;
  maintenancePriority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  records: MaintenanceRecord[];
}

export interface PredictiveMaintenanceInsight {
  scorePercent: number;
  level: RiskLevel;
  summary: string;
  recommendedAction: string;
  daysToRecommendedInspection: number;
  criticalFactor: string;
  simulatedDataNotice?: string;
}

export interface AiDemandForecast {
  todayUsage: number;
  tomorrowPrediction: number;
  next3DaysPrediction: number;
  nextWeekPrediction: number;
  peakHourWindow: string;
  expectedPeakDemandPercent: number;
  shortageRisk: RiskLevel;
  predictedShortageUnits: number;
  recommendation: string;
  insightSummary: string;
}

export interface HospitalEquipment {
  equipmentId: string;
  hospitalId: string;
  equipmentName: string;
  equipmentType: EquipmentCategoryType;
  department: string;
  totalUnits: number;
  availableUnits: number;
  occupiedUnits: number;
  operationalUnits: number;
  underMaintenanceUnits: number;
  status: EquipmentOperationalStatus;
  usagePercentage: number;
  lastUpdated: string;
  maintenanceStatus: MaintenanceStatusType;
  nextMaintenanceDate: string;
  usageHours: number;
  totalUsageHours: number;
  designLifeHours: number;
  failureCount: number;
  sensorConnected: boolean;
  sensorId: string;
  location: string;
  patientVisible: boolean;
  
  // Health & Risk
  healthScore: number; // 0 - 100
  maintenanceRisk: PredictiveMaintenanceInsight;
  
  // Live Telemetry & History
  sensorTelemetry: SensorTelemetry;
  individualUnits: IndividualUnit[];
  usageData: EquipmentUsageData;
  maintenanceIntelligence: MaintenanceIntelligence;
  aiForecast: AiDemandForecast;
}

export interface EquipmentAlert {
  id: string;
  hospitalId: string;
  equipmentId: string;
  equipmentName: string;
  type: 'CRITICAL_USAGE' | 'MAINTENANCE_DUE' | 'SENSOR_WARNING' | 'LOW_CAPACITY' | 'PREDICTIVE_SHORTAGE';
  title: string;
  message: string;
  severity: 'info' | 'warning' | 'critical';
  timestamp: string;
  acknowledged: boolean;
  resolved: boolean;
  actionRequired: string;
}

export interface HospitalOverviewKpis {
  totalEquipment: number;
  operationalEquipment: number;
  equipmentInUse: number;
  equipmentAvailable: number;
  equipmentUnderMaintenance: number;
  criticalAlertsCount: number;
  sensorConnectivityPercent: number;
  overallUtilizationPercent: number;
  inpatientCount: number;
  edActiveCount: number;
  icuOccupancyPercent: number;
  availableBedsCount: number;
  oxygenCapacityPercent: number;
}

