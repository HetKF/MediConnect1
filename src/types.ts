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

