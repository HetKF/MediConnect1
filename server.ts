import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';
import { createServer as createViteServer } from 'vite';
import { INITIAL_EQUIPMENT_DATA, INITIAL_ALERTS } from './src/data/mockHospitalEquipment';
import { HOSPITALS_BY_CITY } from './src/data/mockHospitals';
import { HospitalEquipment, EquipmentAlert, Hospital } from './src/types';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

// In-memory data store for live synchronized state
let hospitalsStore: Record<string, Hospital[]> = JSON.parse(JSON.stringify(HOSPITALS_BY_CITY));
let equipmentStore: Record<string, HospitalEquipment[]> = JSON.parse(JSON.stringify(INITIAL_EQUIPMENT_DATA));
let alertsStore: EquipmentAlert[] = JSON.parse(JSON.stringify(INITIAL_ALERTS));
// Append-only telemetry history is kept separately from the current shared resource
// record. A database adapter can replace these in-memory collections without changing
// the API contract.
const sensorHistoryStore: Record<string, Array<{ timestamp: string; telemetry: any; healthScore: number }>> = {};

// Active SSE client connections for real-time live push
interface SseClient {
  id: number;
  res: express.Response;
}
let sseClients: SseClient[] = [];
let nextClientId = 1;

function broadcastSseEvent(eventType: string, data: any) {
  const payload = `event: ${eventType}\ndata: ${JSON.stringify(data)}\n\n`;
  sseClients.forEach((client) => {
    try {
      client.res.write(payload);
    } catch {
      // client may be closed
    }
  });
}

const patientResource = (item: HospitalEquipment) => ({
  equipmentId: item.equipmentId,
  hospitalId: item.hospitalId,
  equipmentName: item.equipmentName,
  equipmentType: item.equipmentType,
  availableUnits: item.availableUnits,
  status: item.status,
  lastUpdated: item.lastUpdated,
  location: item.location,
  patientVisible: item.patientVisible,
});

function requireHospitalAccess(req: express.Request, res: express.Response, next: express.NextFunction) {
  // Existing UI does not yet send credentials, so anonymous requests retain legacy
  // compatibility. When a role is supplied, patients are explicitly denied access.
  if (String(req.header('x-user-role') || '').toLowerCase() === 'patient') {
    return res.status(403).json({ success: false, error: 'Hospital staff access required' });
  }
  next();
}

function calculateHealthAndRisk(item: HospitalEquipment) {
  const telemetry = item.sensorTelemetry;
  let deductions = Math.min(24, item.usagePercentage * 0.16) + Math.min(18, item.failureCount * 5);
  if (telemetry?.temperatureC > 42) deductions += 18;
  else if (telemetry?.temperatureC > 39) deductions += 8;
  if (telemetry?.vibrationMmS > 1.5) deductions += 12;
  else if (telemetry?.vibrationMmS > 1.1) deductions += 5;
  deductions += Math.min(14, telemetry?.errorCount24h * 4 || 0);
  if (!telemetry?.connected) deductions += 8;
  if (item.underMaintenanceUnits > 0) deductions += 5;
  item.healthScore = Math.max(25, Math.min(100, Math.round(100 - deductions)));
  const score = Math.max(0, Math.min(100, 100 - item.healthScore));
  const level = score >= 70 ? 'CRITICAL' : score >= 50 ? 'HIGH' : score >= 28 ? 'MEDIUM' : 'LOW';
  item.maintenanceRisk = {
    ...item.maintenanceRisk,
    scorePercent: score,
    level,
    summary: level === 'CRITICAL' ? 'Simulated telemetry indicates an immediate inspection threshold.' :
      level === 'HIGH' ? 'Simulated telemetry and utilization indicate elevated maintenance risk.' :
      level === 'MEDIUM' ? 'Usage and service interval should be reviewed during the next maintenance window.' : 'Current simulated readings are within expected operational bands.',
    recommendedAction: level === 'CRITICAL' || level === 'HIGH' ? 'Schedule a biomedical engineering inspection within 7 days.' : 'Continue scheduled preventive maintenance.',
    daysToRecommendedInspection: level === 'CRITICAL' ? 1 : level === 'HIGH' ? 7 : level === 'MEDIUM' ? 21 : 60,
    criticalFactor: telemetry?.temperatureC > 42 ? 'Elevated operating temperature' : telemetry?.vibrationMmS > 1.5 ? 'Elevated vibration' : 'Utilization and service history',
    simulatedDataNotice: 'Prototype calculation based on simulated IoT telemetry; not a medically validated prediction.',
  };
}

function hospitalAnalytics(hospitalId: string) {
  const items = equipmentStore[hospitalId] || equipmentStore['hosp-1'] || [];
  const sum = (field: keyof HospitalEquipment) => items.reduce((total, item) => total + (Number(item[field]) || 0), 0);
  const totalUnits = sum('totalUnits');
  return {
    hospitalId,
    generatedAt: new Date().toISOString(),
    dataSource: 'Simulated IoT Sensors',
    kpis: {
      totalEquipment: totalUnits,
      operationalEquipment: sum('operationalUnits'),
      equipmentInUse: sum('occupiedUnits'),
      equipmentAvailable: sum('availableUnits'),
      equipmentUnderMaintenance: sum('underMaintenanceUnits'),
      criticalAlertsCount: alertsStore.filter(a => a.hospitalId === hospitalId && a.severity === 'critical' && !a.resolved).length,
      sensorConnectivityPercent: items.length ? Math.round((items.filter(i => i.sensorTelemetry?.connected).length / items.length) * 100) : 0,
      overallUtilizationPercent: totalUnits ? Math.round((sum('occupiedUnits') / totalUnits) * 100) : 0,
    },
    rankings: {
      mostUsed: [...items].sort((a, b) => b.usagePercentage - a.usagePercentage).slice(0, 5).map(item => ({ equipmentId: item.equipmentId, equipmentName: item.equipmentName, usagePercentage: item.usagePercentage })),
      highestMaintenanceRisk: [...items].sort((a, b) => b.maintenanceRisk.scorePercent - a.maintenanceRisk.scorePercent).slice(0, 5).map(item => ({ equipmentId: item.equipmentId, equipmentName: item.equipmentName, risk: item.maintenanceRisk.level, score: item.maintenanceRisk.scorePercent })),
    },
  };
}

// Background IoT Sensor Simulation Ticker (subtle realistic jitter every 4s)
setInterval(() => {
  const lilavatiEquipment = equipmentStore['hosp-1'];
  if (!lilavatiEquipment) return;

  lilavatiEquipment.forEach((eq) => {
    if (eq.sensorTelemetry && eq.sensorTelemetry.connected) {
      // Subtle fluctuations
      if (eq.equipmentType === 'ct') {
        const delta = (Math.random() - 0.48) * 0.4;
        eq.sensorTelemetry.temperatureC = Math.round((eq.sensorTelemetry.temperatureC + delta) * 10) / 10;
        eq.sensorTelemetry.temperatureStatus = eq.sensorTelemetry.temperatureC > 42 ? 'hot' : eq.sensorTelemetry.temperatureC > 39 ? 'warm' : 'normal';
      } else if (eq.equipmentType === 'ventilator') {
        const delta = (Math.random() - 0.5) * 0.1;
        eq.sensorTelemetry.pressureBar = Math.round(((eq.sensorTelemetry.pressureBar || 4.1) + delta) * 10) / 10;
        eq.sensorTelemetry.oxygenFlowLpm = Math.round(((eq.sensorTelemetry.oxygenFlowLpm || 38.5) + (Math.random() - 0.5) * 1.5) * 10) / 10;
      } else if (eq.equipmentType === 'oxygen') {
        // Slow burn
        const flow = 640 + Math.floor(Math.random() * 20);
        eq.sensorTelemetry.oxygenFlowLpm = flow;
      }
      eq.sensorTelemetry.lastTelemetryTime = 'Live (just now)';
      calculateHealthAndRisk(eq);
      const key = `hosp-1:${eq.equipmentId}`;
      const history = sensorHistoryStore[key] || (sensorHistoryStore[key] = []);
      history.push({ timestamp: new Date().toISOString(), telemetry: { ...eq.sensorTelemetry }, healthScore: eq.healthScore });
      if (history.length > 288) history.shift();
    }
  });

  // Broadcast telemetry tick to connected dashboards
  broadcastSseEvent('telemetry_tick', {
    timestamp: new Date().toISOString(),
    hospitalId: 'hosp-1',
    equipmentSummary: lilavatiEquipment.map(e => ({
      equipmentId: e.equipmentId,
      usagePercentage: e.usagePercentage,
      availableUnits: e.availableUnits,
      occupiedUnits: e.occupiedUnits,
      sensorTelemetry: e.sensorTelemetry,
      healthScore: e.healthScore,
      maintenanceRisk: e.maintenanceRisk,
    })),
    analytics: hospitalAnalytics('hosp-1'),
  });
}, 4000);

// Lazy-initialize Gemini AI client
let aiClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// ----------------------------------------------------
// REAL-TIME SERVER-SENT EVENTS (SSE) STREAM
// ----------------------------------------------------
app.get('/api/events', (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
  });

  const clientId = nextClientId++;
  const client: SseClient = { id: clientId, res };
  sseClients.push(client);

  // Send initial handshake
  res.write(`event: connected\ndata: ${JSON.stringify({ clientId, timestamp: new Date().toISOString() })}\n\n`);

  req.on('close', () => {
    sseClients = sseClients.filter((c) => c.id !== clientId);
  });
});

// ----------------------------------------------------
// HOSPITALS & RESOURCE PERSISTENCE API
// ----------------------------------------------------
app.get('/api/hospitals', (req, res) => {
  const city = (req.query.city as string) || 'mumbai';
  const list = hospitalsStore[city] || hospitalsStore['mumbai'] || [];
  res.json({ success: true, data: list });
});

// Patient dashboard contract: intentionally omits telemetry, maintenance and AI data.
app.get('/api/patient/hospitals/:hospitalId/resources', (req, res) => {
  const items = equipmentStore[req.params.hospitalId] || equipmentStore['hosp-1'] || [];
  res.json({ success: true, data: items.filter(item => item.patientVisible).map(patientResource) });
});

// Direct synchronization endpoint when beds or ventilators are allocated
app.post('/api/hospitals/:hospitalId/resources/update', (req, res) => {
  const { hospitalId } = req.params;
  const { icuBedsAvailable, ventilatorsAvailable } = req.body;

  let foundHospital: Hospital | null = null;
  for (const city in hospitalsStore) {
    const idx = hospitalsStore[city].findIndex((h) => h.id === hospitalId);
    if (idx !== -1) {
      if (typeof icuBedsAvailable === 'number') {
        hospitalsStore[city][idx].icuBedsAvailable = Math.max(0, icuBedsAvailable);
      }
      if (typeof ventilatorsAvailable === 'number') {
        hospitalsStore[city][idx].ventilatorsAvailable = Math.max(0, ventilatorsAvailable);
      }
      foundHospital = hospitalsStore[city][idx];
      break;
    }
  }

  // Also sync corresponding equipment item if hosp-1
  if (equipmentStore[hospitalId]) {
    const icuEq = equipmentStore[hospitalId].find((e) => e.equipmentType === 'icu_bed');
    if (icuEq && typeof icuBedsAvailable === 'number') {
      icuEq.availableUnits = icuBedsAvailable;
      icuEq.occupiedUnits = icuEq.totalUnits - icuBedsAvailable;
      icuEq.usagePercentage = Math.round((icuEq.occupiedUnits / icuEq.totalUnits) * 100);
    }
    const ventEq = equipmentStore[hospitalId].find((e) => e.equipmentType === 'ventilator');
    if (ventEq && typeof ventilatorsAvailable === 'number') {
      ventEq.availableUnits = ventilatorsAvailable;
      ventEq.occupiedUnits = ventEq.totalUnits - ventEq.availableUnits;
      ventEq.usagePercentage = Math.round((ventEq.occupiedUnits / ventEq.totalUnits) * 100);
    }
  }

  // Broadcast resource sync to patient & hospital dashboards
  broadcastSseEvent('resource_updated', {
    hospitalId,
    hospital: foundHospital,
    equipment: equipmentStore[hospitalId] || [],
  });

  res.json({ success: true, hospital: foundHospital });
});

// ----------------------------------------------------
// EQUIPMENT INTELLIGENCE API
// ----------------------------------------------------
app.get('/api/hospitals/:hospitalId/equipment', requireHospitalAccess, (req, res) => {
  const { hospitalId } = req.params;
  const eqList = equipmentStore[hospitalId] || equipmentStore['hosp-1'] || [];
  res.json({ success: true, data: eqList });
});

app.get('/api/hospitals/:hospitalId/equipment/:equipmentId', requireHospitalAccess, (req, res) => {
  const { hospitalId, equipmentId } = req.params;
  const eqList = equipmentStore[hospitalId] || equipmentStore['hosp-1'] || [];
  const item = eqList.find((e) => e.equipmentId === equipmentId);

  if (!item) {
    return res.status(404).json({ success: false, error: 'Equipment not found' });
  }

  res.json({ success: true, data: item });
});

app.get('/api/hospitals/:hospitalId/equipment/:equipmentId/usage', requireHospitalAccess, (req, res) => {
  const item = (equipmentStore[req.params.hospitalId] || equipmentStore['hosp-1'] || []).find(e => e.equipmentId === req.params.equipmentId);
  if (!item) return res.status(404).json({ success: false, error: 'Equipment not found' });
  res.json({ success: true, simulated: true, data: item.usageData });
});

app.get('/api/hospitals/:hospitalId/equipment/:equipmentId/maintenance', requireHospitalAccess, (req, res) => {
  const item = (equipmentStore[req.params.hospitalId] || equipmentStore['hosp-1'] || []).find(e => e.equipmentId === req.params.equipmentId);
  if (!item) return res.status(404).json({ success: false, error: 'Equipment not found' });
  res.json({ success: true, simulated: true, data: { healthScore: item.healthScore, maintenanceRisk: item.maintenanceRisk, maintenance: item.maintenanceIntelligence } });
});

app.get('/api/hospitals/:hospitalId/equipment/:equipmentId/sensors', requireHospitalAccess, (req, res) => {
  const item = (equipmentStore[req.params.hospitalId] || equipmentStore['hosp-1'] || []).find(e => e.equipmentId === req.params.equipmentId);
  if (!item) return res.status(404).json({ success: false, error: 'Equipment not found' });
  res.json({ success: true, source: item.sensorConnected ? 'simulated-iot' : 'offline', data: item.sensorTelemetry, history: sensorHistoryStore[`${req.params.hospitalId}:${item.equipmentId}`] || [] });
});

app.get('/api/hospitals/:hospitalId/equipment/:equipmentId/predictions', requireHospitalAccess, (req, res) => {
  const item = (equipmentStore[req.params.hospitalId] || equipmentStore['hosp-1'] || []).find(e => e.equipmentId === req.params.equipmentId);
  if (!item) return res.status(404).json({ success: false, error: 'Equipment not found' });
  res.json({ success: true, simulated: true, disclaimer: 'Prototype predictions are rule-based simulated analytics, not medically validated predictions.', data: { maintenanceRisk: item.maintenanceRisk, demandForecast: item.aiForecast } });
});

app.get('/api/hospitals/:hospitalId/analytics', requireHospitalAccess, (req, res) => {
  res.json({ success: true, data: hospitalAnalytics(req.params.hospitalId) });
});

// Update equipment status / allocation
app.post('/api/hospitals/:hospitalId/equipment/:equipmentId/status', requireHospitalAccess, (req, res) => {
  const { hospitalId, equipmentId } = req.params;
  const { status, availableUnits, occupiedUnits, underMaintenanceUnits } = req.body;

  const eqList = equipmentStore[hospitalId] || equipmentStore['hosp-1'];
  if (!eqList) {
    return res.status(404).json({ success: false, error: 'Hospital equipment not found' });
  }

  const item = eqList.find((e) => e.equipmentId === equipmentId);
  if (!item) {
    return res.status(404).json({ success: false, error: 'Equipment not found' });
  }

  if (status) item.status = status;
  if (typeof availableUnits === 'number') item.availableUnits = availableUnits;
  if (typeof occupiedUnits === 'number') item.occupiedUnits = occupiedUnits;
  if (typeof underMaintenanceUnits === 'number') item.underMaintenanceUnits = underMaintenanceUnits;

  item.usagePercentage = Math.round((item.occupiedUnits / item.totalUnits) * 100);
  item.lastUpdated = 'Just now';
  calculateHealthAndRisk(item);

  // Synchronize to patient-facing hospital record if it is beds or ventilators
  if (item.equipmentType === 'icu_bed' || item.equipmentType === 'ventilator') {
    for (const city in hospitalsStore) {
      const hIdx = hospitalsStore[city].findIndex((h) => h.id === hospitalId);
      if (hIdx !== -1) {
        if (item.equipmentType === 'icu_bed') {
          hospitalsStore[city][hIdx].icuBedsAvailable = item.availableUnits;
        }
        if (item.equipmentType === 'ventilator') {
          hospitalsStore[city][hIdx].ventilatorsAvailable = item.availableUnits;
        }
      }
    }
  }

  broadcastSseEvent('equipment_updated', {
    hospitalId,
    equipmentId,
    item,
    analytics: hospitalAnalytics(hospitalId),
  });

  res.json({ success: true, data: item });
});

// Ingest IoT Telemetry
app.post('/api/hospitals/:hospitalId/equipment/:equipmentId/telemetry', requireHospitalAccess, (req, res) => {
  const { hospitalId, equipmentId } = req.params;
  const { temperatureC, vibrationMmS, powerKw, pressureBar, oxygenFlowLpm, errorStatus } = req.body;

  const eqList = equipmentStore[hospitalId] || equipmentStore['hosp-1'];
  const item = eqList?.find((e) => e.equipmentId === equipmentId);

  if (!item) {
    return res.status(404).json({ success: false, error: 'Equipment not found' });
  }

  if (item.sensorTelemetry) {
    if (typeof temperatureC === 'number') {
      item.sensorTelemetry.temperatureC = temperatureC;
      item.sensorTelemetry.temperatureStatus = temperatureC > 42 ? 'hot' : temperatureC > 39 ? 'warm' : 'normal';
    }
    if (typeof vibrationMmS === 'number') {
      item.sensorTelemetry.vibrationMmS = vibrationMmS;
      item.sensorTelemetry.vibrationStatus = vibrationMmS > 1.5 ? 'elevated' : 'normal';
    }
    if (typeof powerKw === 'number') item.sensorTelemetry.powerKw = powerKw;
    if (typeof pressureBar === 'number') item.sensorTelemetry.pressureBar = pressureBar;
    if (typeof oxygenFlowLpm === 'number') item.sensorTelemetry.oxygenFlowLpm = oxygenFlowLpm;
    item.sensorTelemetry.lastTelemetryTime = 'Live (just now)';
  }

  calculateHealthAndRisk(item);
  const historyKey = `${hospitalId}:${equipmentId}`;
  const history = sensorHistoryStore[historyKey] || (sensorHistoryStore[historyKey] = []);
  history.push({ timestamp: new Date().toISOString(), telemetry: { ...item.sensorTelemetry }, healthScore: item.healthScore });
  if (history.length > 288) history.shift();

  broadcastSseEvent('telemetry_updated', {
    hospitalId,
    equipmentId,
    telemetry: item.sensorTelemetry,
    healthScore: item.healthScore,
    maintenanceRisk: item.maintenanceRisk,
  });

  res.json({ success: true, data: item });
});

// ----------------------------------------------------
// SIMULATE IOT EVENTS (For Real-Time Testing)
// ----------------------------------------------------
app.post('/api/sensor-data/simulate-event', (req, res) => {
  const { eventType, hospitalId = 'hosp-1' } = req.body;
  const eqList = equipmentStore[hospitalId] || equipmentStore['hosp-1'];

  let eventMessage = '';

  switch (eventType) {
    case 'ct_temp_spike': {
      const ct = eqList?.find((e) => e.equipmentType === 'ct');
      if (ct && ct.sensorTelemetry) {
        ct.sensorTelemetry.temperatureC = 44.5;
        ct.sensorTelemetry.temperatureStatus = 'hot';
        ct.sensorTelemetry.errorCount24h += 1;
        ct.healthScore = 68;
        ct.maintenanceStatus = 'Urgent Attention';
        ct.maintenanceRisk.level = 'HIGH';
        ct.maintenanceRisk.scorePercent = 68;
        ct.maintenanceRisk.summary = 'X-Ray Tube heat dissipation warning: sensor reads 44.5°C.';

        // Add alert
        const alert: EquipmentAlert = {
          id: `alt-sim-${Date.now()}`,
          hospitalId,
          equipmentId: ct.equipmentId,
          equipmentName: ct.equipmentName,
          type: 'SENSOR_WARNING',
          title: '🚨 CRITICAL: CT Scanner Tube Temperature Spike (44.5°C)',
          message: 'Thermal overload threshold exceeded during emergency contrast series. Tube protection active.',
          severity: 'critical',
          timestamp: 'Just now',
          acknowledged: false,
          resolved: false,
          actionRequired: 'Allow 15m Gantry Cooling Cycle & Dispatch BioMed Engineer',
        };
        alertsStore.unshift(alert);
        eventMessage = 'Simulated CT Scanner thermal surge to 44.5°C & triggered alert.';
      }
      break;
    }

    case 'ventilator_surge': {
      const vent = eqList?.find((e) => e.equipmentType === 'ventilator');
      if (vent) {
        vent.availableUnits = Math.max(1, vent.availableUnits - 4);
        vent.occupiedUnits = vent.totalUnits - vent.availableUnits;
        vent.usagePercentage = Math.round((vent.occupiedUnits / vent.totalUnits) * 100);
        vent.maintenanceRisk.level = 'HIGH';

        // Synchronize hospital
        for (const c in hospitalsStore) {
          const h = hospitalsStore[c].find((item) => item.id === hospitalId);
          if (h) h.ventilatorsAvailable = vent.availableUnits;
        }

        const alert: EquipmentAlert = {
          id: `alt-sim-${Date.now()}`,
          hospitalId,
          equipmentId: vent.equipmentId,
          equipmentName: vent.equipmentName,
          type: 'CRITICAL_USAGE',
          title: '🚨 Ventilator Allocation Surge: 4 Units Deployed',
          message: 'Ventilator capacity dropped to critical levels. 4 patients placed on mechanical ventilation.',
          severity: 'critical',
          timestamp: 'Just now',
          acknowledged: false,
          resolved: false,
          actionRequired: 'Request 4 Additional Units from Central Depot',
        };
        alertsStore.unshift(alert);
        eventMessage = `Simulated 4 ventilator deployments. Available: ${vent.availableUnits}`;
      }
      break;
    }

    case 'icu_patient_discharge': {
      const icuBed = eqList?.find((e) => e.equipmentType === 'icu_bed');
      if (icuBed) {
        icuBed.availableUnits = Math.min(icuBed.totalUnits, icuBed.availableUnits + 3);
        icuBed.occupiedUnits = icuBed.totalUnits - icuBed.availableUnits;
        icuBed.usagePercentage = Math.round((icuBed.occupiedUnits / icuBed.totalUnits) * 100);

        for (const c in hospitalsStore) {
          const h = hospitalsStore[c].find((item) => item.id === hospitalId);
          if (h) h.icuBedsAvailable = icuBed.availableUnits;
        }
        eventMessage = `Simulated 3 ICU discharges. Available beds: ${icuBed.availableUnits}`;
      }
      break;
    }

    case 'o2_refill_completed': {
      const o2 = eqList?.find((e) => e.equipmentType === 'oxygen');
      if (o2 && o2.sensorTelemetry) {
        o2.usagePercentage = 95;
        o2.sensorTelemetry.oxygenReservePercent = 95;
        o2.maintenanceStatus = 'Normal';
        o2.maintenanceRisk.level = 'LOW';
        o2.maintenanceRisk.scorePercent = 14;
        o2.maintenanceRisk.summary = 'Bulk liquid cryo-tank refilled to 95% capacity. Header pressure 4.3 bar.';
        eventMessage = 'Simulated Oxygen Tank Refill to 95% capacity.';
      }
      break;
    }

    case 'reset_nominal': {
      equipmentStore = JSON.parse(JSON.stringify(INITIAL_EQUIPMENT_DATA));
      alertsStore = JSON.parse(JSON.stringify(INITIAL_ALERTS));
      hospitalsStore = JSON.parse(JSON.stringify(HOSPITALS_BY_CITY));
      eventMessage = 'Reset all hospital telemetry, resources, and alerts to baseline nominal values.';
      break;
    }

    default:
      eventMessage = `Unrecognized event type: ${eventType}`;
  }

  broadcastSseEvent('state_refresh', {
    message: eventMessage,
    equipment: equipmentStore[hospitalId] || [],
    alerts: alertsStore,
    hospitals: hospitalsStore['mumbai'] || [],
  });

  res.json({ success: true, message: eventMessage, eventType });
});

// ----------------------------------------------------
// ALERTS API
// ----------------------------------------------------
app.get('/api/hospitals/:hospitalId/alerts', requireHospitalAccess, (req, res) => {
  const { hospitalId } = req.params;
  const filtered = alertsStore.filter((a) => !a.hospitalId || a.hospitalId === hospitalId);
  res.json({ success: true, data: filtered });
});

app.post('/api/alerts/:alertId/resolve', (req, res) => {
  const { alertId } = req.params;
  const { action = 'resolve' } = req.body;

  const alert = alertsStore.find((a) => a.id === alertId);
  if (!alert) {
    return res.status(404).json({ success: false, error: 'Alert not found' });
  }

  if (action === 'acknowledge') {
    alert.acknowledged = true;
  } else {
    alert.resolved = true;
    alert.acknowledged = true;
  }

  broadcastSseEvent('alert_updated', { alertId, alert });
  res.json({ success: true, data: alert });
});

// ----------------------------------------------------
// AI MAINTENANCE & INTELLIGENCE ANALYSIS (GEMINI 3.7 FLASH)
// ----------------------------------------------------
app.post('/api/ai/maintenance-analysis', async (req, res) => {
  try {
    const { equipmentName, telemetry, usageHours, healthScore, failureCount } = req.body;

    const ai = getAiClient();
    if (ai) {
      const prompt = `You are a clinical bio-medical engineering AI system.
Analyze the following medical device reliability state:
- Equipment: ${equipmentName || 'Hospital Equipment'}
- Current Health Score: ${healthScore || 85}/100
- Operating Hours: ${usageHours || 3500} hrs
- Past Failure Count: ${failureCount || 1}
- Live Telemetry: ${JSON.stringify(telemetry || {})}

Provide a comprehensive predictive maintenance analysis. Return JSON:
1. "riskScore": integer (0 to 100)
2. "riskLevel": "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"
3. "rootCauseAnalysis": string (concise engineering diagnosis)
4. "recommendedAction": string (actionable bio-medical technician recommendation)
5. "estimatedDaysToFailureIfIgnored": integer
6. "preventiveChecklist": array of 4 specific engineering action items
7. "costEstimateInr": integer (preventive vs breakdown savings)`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.7-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              riskScore: { type: Type.INTEGER },
              riskLevel: { type: Type.STRING },
              rootCauseAnalysis: { type: Type.STRING },
              recommendedAction: { type: Type.STRING },
              estimatedDaysToFailureIfIgnored: { type: Type.INTEGER },
              preventiveChecklist: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              costEstimateInr: { type: Type.INTEGER },
            },
            required: ['riskScore', 'riskLevel', 'rootCauseAnalysis', 'recommendedAction', 'estimatedDaysToFailureIfIgnored', 'preventiveChecklist', 'costEstimateInr'],
          },
        },
      });

      const parsed = JSON.parse(response.text?.trim() || '{}');
      return res.json({ success: true, isLiveAi: true, data: parsed });
    }

    // Mathematical Fallback
    const score = Math.max(10, Math.min(85, 100 - (Number(healthScore) || 85)));
    return res.json({
      success: true,
      isLiveAi: false,
      data: {
        riskScore: score,
        riskLevel: score > 60 ? 'HIGH' : score > 35 ? 'MEDIUM' : 'LOW',
        rootCauseAnalysis: 'Thermal duty cycling and continuous runtime have accelerated component heat dissipation requirements.',
        recommendedAction: 'Execute preventive transducer recalibration and cooling filter replacement.',
        estimatedDaysToFailureIfIgnored: score > 60 ? 8 : 28,
        preventiveChecklist: [
          'Verify sensor calibration against secondary biomedical standard',
          'Inspect cooling manifold and clean intake filter grills',
          'Check electrical grounding and load voltage ripple',
          'Perform automated factory diagnostics self-test cycle',
        ],
        costEstimateInr: 18500,
      },
    });
  } catch (error: any) {
    console.error('Maintenance AI error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// AI Equipment & Bed Capacity Prediction Route
app.post('/api/ai/predict-equipment', async (req, res) => {
  try {
    const { hospitalName, city, scenario, baseIcu, baseVents } = req.body;

    const targetHospital = hospitalName || 'City Hospital';
    const targetCity = city || 'Bengaluru';
    const targetScenario = scenario || 'normal';
    const icuCount = Number(baseIcu) || 8;
    const ventCount = Number(baseVents) || 6;

    const ai = getAiClient();

    if (ai) {
      const prompt = `You are a clinical hospital operations AI forecasting demand for ${targetHospital} located in ${targetCity}.
Current baseline: ${icuCount} available ICU beds, ${ventCount} invasive ventilators.
Simulate the "${targetScenario}" scenario (normal, moderate surge, or peak emergency surge).

Analyze and forecast operational capacity and equipment inventory readiness for the next 24 hours.
Return a structured JSON with:
1. "overview": A soothing, 1-2 sentence executive assessment of capacity.
2. "riskStatus": "Stable & Nominal" | "Moderate Strain" | "Surge Allocation Active"
3. "projectedDischarges": integer estimate of patient discharges in 24h
4. "turnaroundMinutes": average bed sanitization/turnaround time in minutes (e.g. 20-35)
5. "items": array of predicted equipment items:
   - "id": string key (e.g. "icu-beds", "hdu-beds", "invasive-vents", "o2-cylinders", "bipap-units", "defibrillators", "cardiac-monitors", "infusion-pumps", "blood-bank", "pocus")
   - "name": string equipment title
   - "category": "beds" | "respiratory" | "cardiac" | "diagnostics"
   - "categoryLabel": string (e.g. "Beds & Units", "Respiratory & O2", "Cardiac & Emergency", "Diagnostics & Blood")
   - "total": total institutional inventory number
   - "predictedAvailable": integer available count under this scenario
   - "unit": unit name (e.g. "Beds", "Units", "Cylinders", "Monitors", "Scanners")
   - "telemetry": short hardware status (e.g. "Continuous SpO2 link", "150 bar pressure certified", "Daily self-test passed")
   - "aiRecommendation": short actionable 1-sentence tip
   - "burnRate": string (e.g. "Net +2 available by 18:00" or "-1.5 units/hr demand")
6. "aiInsights": 3 concise bullet summaries:
   - "triageNote": intelligent admission guidance
   - "equipmentNote": oxygen/respiratory telemetry summary
   - "staffingNote": nursing & intensivist ratio optimization`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.7-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              overview: { type: Type.STRING },
              riskStatus: { type: Type.STRING },
              projectedDischarges: { type: Type.INTEGER },
              turnaroundMinutes: { type: Type.INTEGER },
              items: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    name: { type: Type.STRING },
                    category: { type: Type.STRING },
                    categoryLabel: { type: Type.STRING },
                    total: { type: Type.INTEGER },
                    predictedAvailable: { type: Type.INTEGER },
                    unit: { type: Type.STRING },
                    telemetry: { type: Type.STRING },
                    aiRecommendation: { type: Type.STRING },
                    burnRate: { type: Type.STRING },
                  },
                  required: ['id', 'name', 'category', 'categoryLabel', 'total', 'predictedAvailable', 'unit', 'telemetry', 'aiRecommendation'],
                },
              },
              aiInsights: {
                type: Type.OBJECT,
                properties: {
                  triageNote: { type: Type.STRING },
                  equipmentNote: { type: Type.STRING },
                  staffingNote: { type: Type.STRING },
                },
                required: ['triageNote', 'equipmentNote', 'staffingNote'],
              },
            },
            required: ['overview', 'riskStatus', 'projectedDischarges', 'turnaroundMinutes', 'items', 'aiInsights'],
          },
        },
      });

      const parsedData = JSON.parse(response.text?.trim() || '{}');
      return res.json({
        success: true,
        isLiveAi: true,
        data: parsedData,
      });
    }

    // Fallback if API key is not present
    const mult = targetScenario === 'normal' ? 1 : targetScenario === 'moderate' ? 0.7 : 0.45;
    return res.json({
      success: true,
      isLiveAi: false,
      data: {
        overview: `Forecast for ${targetHospital} indicates steady operational buffer with priority emergency channels open.`,
        riskStatus: targetScenario === 'normal' ? 'Stable & Nominal' : targetScenario === 'moderate' ? 'Moderate Strain' : 'Surge Allocation Active',
        projectedDischarges: targetScenario === 'normal' ? 14 : 19,
        turnaroundMinutes: targetScenario === 'normal' ? 22 : 28,
        items: [
          {
            id: 'icu-beds',
            name: 'ICU & Critical Care Beds',
            category: 'beds',
            categoryLabel: 'Beds & Units',
            total: 16,
            predictedAvailable: Math.max(1, Math.round(icuCount * mult)),
            unit: 'Beds',
            telemetry: 'Motorized & Cardiac Monitored',
            aiRecommendation: 'Preserve 2 beds for inbound red-triage ambulance arrivals.',
            burnRate: 'Net +3 available after 16:00 discharge round',
          },
          {
            id: 'hdu-beds',
            name: 'HDU & Step-Down Beds',
            category: 'beds',
            categoryLabel: 'Beds & Units',
            total: 24,
            predictedAvailable: Math.max(2, Math.round(14 * mult)),
            unit: 'Beds',
            telemetry: 'Continuous SpO2 & NIBP',
            aiRecommendation: 'Transfer stable post-op patients to open acute ICU capacity.',
            burnRate: 'Stable turnover',
          },
          {
            id: 'invasive-vents',
            name: 'Invasive Mechanical Ventilators',
            category: 'respiratory',
            categoryLabel: 'Respiratory & O2',
            total: 12,
            predictedAvailable: Math.max(1, Math.round(ventCount * mult)),
            unit: 'Units',
            telemetry: 'Servo-Controlled Airflow',
            aiRecommendation: 'Calibrated circuits sterilized and ready at Bedside 4 & 7.',
            burnRate: 'Zero supply deficit forecasted',
          },
          {
            id: 'o2-cylinders',
            name: 'Medical Oxygen Cylinders (D-Type)',
            category: 'respiratory',
            categoryLabel: 'Respiratory & O2',
            total: 45,
            predictedAvailable: Math.max(8, Math.round(38 * mult)),
            unit: 'Cylinders',
            telemetry: 'Full Pressure (150 bar)',
            aiRecommendation: 'Depot manifold backup pressure nominal at 4.2 bar.',
            burnRate: 'Consuming ~1.8 cylinders/hr in ED',
          },
          {
            id: 'bipap-units',
            name: 'BiPAP / CPAP Respiratory Systems',
            category: 'respiratory',
            categoryLabel: 'Respiratory & O2',
            total: 14,
            predictedAvailable: Math.max(2, Math.round(9 * mult)),
            unit: 'Units',
            telemetry: 'Humidified Heated Circuits',
            aiRecommendation: 'Non-invasive step-up ready for acute respiratory cases.',
            burnRate: 'Available on immediate call',
          },
          {
            id: 'defibrillators',
            name: 'Biphasic Defibrillators & AEDs',
            category: 'cardiac',
            categoryLabel: 'Cardiac & Emergency',
            total: 8,
            predictedAvailable: Math.max(2, Math.round(7 * mult)),
            unit: 'Units',
            telemetry: '100% Battery Charged',
            aiRecommendation: 'All resuscitation crash carts verified with pediatric paddles.',
            burnRate: 'Instant emergency readiness',
          },
          {
            id: 'cardiac-monitors',
            name: 'Multiparameter Cardiac Monitors',
            category: 'cardiac',
            categoryLabel: 'Cardiac & Emergency',
            total: 30,
            predictedAvailable: Math.max(5, Math.round(22 * mult)),
            unit: 'Monitors',
            telemetry: '12-Lead ECG + EtCO2 + Temp',
            aiRecommendation: 'Wireless gateway streaming vitals to nursing station.',
            burnRate: 'High operational buffer',
          },
          {
            id: 'infusion-pumps',
            name: 'Precision Syringe & Infusion Pumps',
            category: 'cardiac',
            categoryLabel: 'Cardiac & Emergency',
            total: 40,
            predictedAvailable: Math.max(6, Math.round(31 * mult)),
            unit: 'Pumps',
            telemetry: 'Dose Error Reduction (DERS)',
            aiRecommendation: 'Preset libraries calibrated for pressors and inotropes.',
            burnRate: 'Stocked at central pharmacy',
          },
          {
            id: 'blood-bank',
            name: 'Emergency Blood Reserves (O- / Plasma)',
            category: 'diagnostics',
            categoryLabel: 'Diagnostics & Blood',
            total: 50,
            predictedAvailable: Math.max(10, Math.round(42 * mult)),
            unit: 'Units',
            telemetry: 'Screened & Chilled (4°C)',
            aiRecommendation: 'Universal emergency units reserved for rapid-transfusion protocol.',
            burnRate: 'Cold-chain telemetry stable',
          },
          {
            id: 'pocus',
            name: 'Point-of-Care Ultrasound (POCUS / FAST)',
            category: 'diagnostics',
            categoryLabel: 'Diagnostics & Blood',
            total: 6,
            predictedAvailable: Math.max(1, Math.round(5 * mult)),
            unit: 'Scanners',
            telemetry: 'Cardiac & Abdominal Probes',
            aiRecommendation: 'Mobile probes sanitized for rapid bedside trauma assessment.',
            burnRate: 'Fully charged wireless units',
          },
        ],
        aiInsights: {
          triageNote: 'Prioritize non-emergent ambulatory discharges before 14:00 to free up monitored telemetry slots.',
          equipmentNote: 'All ventilators calibrated with backup battery health at 98%.',
          staffingNote: 'Shift nurse-to-patient ratio optimal at 1:1 in ICU and 1:3 in HDU.',
        },
      },
    });
  } catch (error: any) {
    console.error('AI Prediction error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to generate AI predictions',
    });
  }
});

// Setup Vite or Static File Serving
async function setupServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on port ${PORT}`);
  });
}

setupServer();
