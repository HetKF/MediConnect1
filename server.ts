import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';
import { createServer as createViteServer } from 'vite';
import { hospitalsRouter } from './routes/hospitals';
import { initializeDatabase } from './backend/db/database';

dotenv.config();
initializeDatabase();

const app = express();
const PORT = 3000;

// Enable CORS for frontend & API clients
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

app.use(express.json());

// Mount Hospital REST API routes
app.use('/api/hospitals', hospitalsRouter);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'MediConnect Hospital Operations API' });
});

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
