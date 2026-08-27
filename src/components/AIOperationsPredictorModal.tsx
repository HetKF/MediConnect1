import React, { useState, useEffect } from 'react';
import { 
  X, 
  Brain, 
  BedDouble, 
  Clock, 
  CheckCircle2, 
  ShieldCheck, 
  HeartPulse, 
  Building2,
  Wind,
  Activity,
  Zap,
  Droplet,
  Scan,
  Syringe,
  Layers,
  Sparkles,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { Hospital, LocationOption } from '../types';

interface AIOperationsPredictorModalProps {
  isOpen: boolean;
  onClose: () => void;
  hospitals: Hospital[];
  currentCity?: LocationOption;
}

type EquipmentCategory = 'all' | 'beds' | 'respiratory' | 'cardiac' | 'diagnostics';

interface AiEquipmentItem {
  id: string;
  name: string;
  category: 'beds' | 'respiratory' | 'cardiac' | 'diagnostics';
  categoryLabel: string;
  total: number;
  predictedAvailable: number;
  unit: string;
  telemetry: string;
  aiRecommendation: string;
  burnRate?: string;
}

interface AiPredictionResponse {
  overview: string;
  riskStatus: string;
  projectedDischarges: number;
  turnaroundMinutes: number;
  items: AiEquipmentItem[];
  aiInsights: {
    triageNote: string;
    equipmentNote: string;
    staffingNote: string;
  };
}

export const AIOperationsPredictorModal: React.FC<AIOperationsPredictorModalProps> = ({
  isOpen,
  onClose,
  hospitals,
  currentCity,
}) => {
  const [selectedHospitalId, setSelectedHospitalId] = useState<string>(hospitals[0]?.id || '');
  const [surgeLevel, setSurgeLevel] = useState<'normal' | 'moderate' | 'high'>('normal');
  const [selectedCategory, setSelectedCategory] = useState<EquipmentCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isLiveAi, setIsLiveAi] = useState<boolean>(true);
  const [predictionData, setPredictionData] = useState<AiPredictionResponse | null>(null);

  const currentHospital = hospitals.find(h => h.id === selectedHospitalId) || hospitals[0] || {
    id: 'hosp-1',
    name: 'City Hospital',
    icuBedsAvailable: 8,
    ventilatorsAvailable: 6,
    address: 'Central Medical District',
    distanceKm: 2.4,
    etaMinutes: 10,
  };

  // Fetch AI Predictions from Gemini API server-side endpoint
  const fetchAiPredictions = async (hospId = selectedHospitalId, scenario = surgeLevel) => {
    setIsLoading(true);
    const targetHosp = hospitals.find(h => h.id === hospId) || currentHospital;
    
    try {
      const response = await fetch('/api/ai/predict-equipment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hospitalName: targetHosp.name,
          city: currentCity?.name || 'Bengaluru',
          scenario: scenario,
          baseIcu: targetHosp.icuBedsAvailable || 8,
          baseVents: targetHosp.ventilatorsAvailable || 6,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.data) {
          setPredictionData(result.data);
          setIsLiveAi(Boolean(result.isLiveAi));
        }
      }
    } catch (err) {
      console.warn('AI prediction fetch warning, using calculated state:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial load or when hospital/scenario changes
  useEffect(() => {
    if (isOpen) {
      fetchAiPredictions(selectedHospitalId, surgeLevel);
    }
  }, [isOpen, selectedHospitalId, surgeLevel]);

  if (!isOpen) return null;

  // Fallback defaults if loading initial
  const displayItems = predictionData?.items || [
    {
      id: 'icu-beds',
      name: 'ICU & Critical Care Beds',
      category: 'beds' as const,
      categoryLabel: 'Beds & Units',
      total: 16,
      predictedAvailable: currentHospital.icuBedsAvailable || 8,
      unit: 'Beds',
      telemetry: 'Motorized & Cardiac Monitored',
      aiRecommendation: 'Preserve 2 beds for inbound red-triage ambulance arrivals.',
    },
    {
      id: 'invasive-vents',
      name: 'Invasive Mechanical Ventilators',
      category: 'respiratory' as const,
      categoryLabel: 'Respiratory & O2',
      total: 12,
      predictedAvailable: currentHospital.ventilatorsAvailable || 6,
      unit: 'Units',
      telemetry: 'Servo-Controlled Airflow',
      aiRecommendation: 'Circuits sterilized and ready at Bedside 4 & 7.',
    }
  ];

  const getEquipmentIcon = (category: string, id: string) => {
    if (category === 'beds') return <BedDouble className="w-5 h-5 text-teal-600" />;
    if (category === 'respiratory') return <Wind className="w-5 h-5 text-sky-600" />;
    if (category === 'cardiac') {
      if (id.includes('defib')) return <Zap className="w-5 h-5 text-rose-600" />;
      return <HeartPulse className="w-5 h-5 text-rose-600" />;
    }
    if (category === 'diagnostics') {
      if (id.includes('blood')) return <Droplet className="w-5 h-5 text-rose-600" />;
      return <Scan className="w-5 h-5 text-indigo-600" />;
    }
    return <Layers className="w-5 h-5 text-slate-600" />;
  };

  const filteredEquipment = displayItems.filter(item => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.categoryLabel.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.aiRecommendation?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Calculate summary figures
  const bedsAvailable = displayItems
    .filter(i => i.category === 'beds')
    .reduce((sum, i) => sum + i.predictedAvailable, 0);

  const respiratoryAvailable = displayItems
    .filter(i => i.category === 'respiratory')
    .reduce((sum, i) => sum + i.predictedAvailable, 0);

  const cardiacAvailable = displayItems
    .filter(i => i.category === 'cardiac')
    .reduce((sum, i) => sum + i.predictedAvailable, 0);

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white text-slate-800 rounded-3xl max-w-4xl w-full p-5 sm:p-7 shadow-2xl border border-slate-200/80 max-h-[92vh] flex flex-col">
        
        {/* Header - Clean, gentle & soothing */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-100 gap-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-700 border border-teal-200/70 flex items-center justify-center shadow-xs shrink-0">
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                  Predictive Capacity &amp; Equipment Analysis
                </h2>
                <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-teal-800 bg-teal-50 border border-teal-200/80 px-2 py-0.5 rounded-full">
                  <Sparkles className="w-2.5 h-2.5 text-teal-600" />
                  Gemini AI Powered
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Real-time clinical forecasting for hospital beds, ventilators, and emergency resources.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Hospital Selector & Scenario Simulation Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mt-4 p-3 bg-slate-50/80 rounded-2xl border border-slate-200/60 shrink-0">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-teal-600 shrink-0" />
            <span className="text-xs font-semibold text-slate-700">Facility:</span>
            <select
              value={selectedHospitalId}
              onChange={(e) => setSelectedHospitalId(e.target.value)}
              className="bg-white border border-slate-300 text-xs font-bold text-slate-800 rounded-lg px-2.5 py-1.5 focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 cursor-pointer max-w-[200px] sm:max-w-none truncate"
            >
              {hospitals.map(h => (
                <option key={h.id} value={h.id}>
                  {h.name}
                </option>
              ))}
            </select>
          </div>

          {/* Scenario & Recalculate Button */}
          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            <span className="text-xs text-slate-500 font-medium">AI Surge Simulation:</span>
            <div className="inline-flex items-center bg-white p-1 rounded-xl border border-slate-200 shadow-2xs">
              <button
                type="button"
                onClick={() => setSurgeLevel('normal')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                  surgeLevel === 'normal' 
                    ? 'bg-teal-600 text-white' 
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                Normal
              </button>
              <button
                type="button"
                onClick={() => setSurgeLevel('moderate')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                  surgeLevel === 'moderate' 
                    ? 'bg-teal-600 text-white' 
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                Moderate
              </button>
              <button
                type="button"
                onClick={() => setSurgeLevel('high')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                  surgeLevel === 'high' 
                    ? 'bg-teal-600 text-white' 
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                Peak Surge
              </button>
            </div>

            <button
              type="button"
              onClick={() => fetchAiPredictions(selectedHospitalId, surgeLevel)}
              disabled={isLoading}
              className="p-1.5 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-teal-700 hover:border-teal-300 transition-colors cursor-pointer disabled:opacity-50"
              title="Re-run AI Analysis"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-teal-600' : ''}`} />
            </button>
          </div>
        </div>

        {/* AI Executive Summary Banner */}
        {predictionData?.overview && (
          <div className="mt-3 p-3 bg-teal-50/50 border border-teal-100 rounded-2xl flex items-start gap-2.5 shrink-0">
            <Sparkles className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
            <div className="flex-1 text-xs text-teal-950 font-medium leading-relaxed">
              <span className="font-bold text-teal-900">AI Assessment: </span>
              {predictionData.overview}
            </div>
            <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded-full shrink-0">
              {predictionData.riskStatus || 'Optimal'}
            </span>
          </div>
        )}

        {/* 3 High-Level Soothing Summary Cards */}
        <div className="grid grid-cols-3 gap-2.5 sm:gap-3.5 my-3 shrink-0">
          <div className="p-3 sm:p-3.5 bg-teal-50/70 border border-teal-200/70 rounded-2xl">
            <div className="flex items-center justify-between text-xs text-teal-800 font-semibold">
              <span>Ready Beds</span>
              <BedDouble className="w-4 h-4 text-teal-600 hidden sm:inline" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-teal-950 mt-1">
              {bedsAvailable} <span className="text-xs font-normal text-teal-700">Available</span>
            </div>
            <p className="text-[10px] sm:text-[11px] text-teal-700/80 mt-0.5 truncate">
              {predictionData?.projectedDischarges ? `~${predictionData.projectedDischarges} discharges predicted in 24h` : 'ICU + HDU Step-Down'}
            </p>
          </div>

          <div className="p-3 sm:p-3.5 bg-sky-50/70 border border-sky-200/70 rounded-2xl">
            <div className="flex items-center justify-between text-xs text-sky-800 font-semibold">
              <span>Ventilators &amp; O2</span>
              <Wind className="w-4 h-4 text-sky-600 hidden sm:inline" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-sky-950 mt-1">
              {respiratoryAvailable} <span className="text-xs font-normal text-sky-700">Units</span>
            </div>
            <p className="text-[10px] sm:text-[11px] text-sky-700/80 mt-0.5 truncate">
              Invasive &amp; BiPAP Active
            </p>
          </div>

          <div className="p-3 sm:p-3.5 bg-rose-50/70 border border-rose-200/70 rounded-2xl">
            <div className="flex items-center justify-between text-xs text-rose-800 font-semibold">
              <span>Cardiac &amp; Trauma</span>
              <Zap className="w-4 h-4 text-rose-600 hidden sm:inline" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-rose-950 mt-1">
              {cardiacAvailable} <span className="text-xs font-normal text-rose-700">Ready</span>
            </div>
            <p className="text-[10px] sm:text-[11px] text-rose-700/80 mt-0.5 truncate">
              Defibs &amp; Vital Monitors
            </p>
          </div>
        </div>

        {/* Category Tabs & Quick Search */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 shrink-0">
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-colors cursor-pointer ${
                selectedCategory === 'all'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All ({displayItems.length})
            </button>
            <button
              onClick={() => setSelectedCategory('beds')}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-colors cursor-pointer ${
                selectedCategory === 'beds'
                  ? 'bg-teal-700 text-white'
                  : 'bg-teal-50 text-teal-800 hover:bg-teal-100'
              }`}
            >
              Beds &amp; Units
            </button>
            <button
              onClick={() => setSelectedCategory('respiratory')}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-colors cursor-pointer ${
                selectedCategory === 'respiratory'
                  ? 'bg-sky-700 text-white'
                  : 'bg-sky-50 text-sky-800 hover:bg-sky-100'
              }`}
            >
              Respiratory &amp; O2
            </button>
            <button
              onClick={() => setSelectedCategory('cardiac')}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-colors cursor-pointer ${
                selectedCategory === 'cardiac'
                  ? 'bg-rose-700 text-white'
                  : 'bg-rose-50 text-rose-800 hover:bg-rose-100'
              }`}
            >
              Cardiac &amp; Emergency
            </button>
            <button
              onClick={() => setSelectedCategory('diagnostics')}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-colors cursor-pointer ${
                selectedCategory === 'diagnostics'
                  ? 'bg-indigo-700 text-white'
                  : 'bg-indigo-50 text-indigo-800 hover:bg-indigo-100'
              }`}
            >
              Diagnostics &amp; Blood
            </button>
          </div>

          <input
            type="text"
            placeholder="Filter equipment..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 w-full sm:w-44"
          />
        </div>

        {/* Scrollable Equipment Cards Grid */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-2.5 my-2">
          {isLoading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-2 text-slate-400">
              <RefreshCw className="w-6 h-6 animate-spin text-teal-600" />
              <span className="text-xs font-medium text-slate-600">Generating AI capacity prediction...</span>
            </div>
          ) : filteredEquipment.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              No equipment found matching "{searchQuery}".
            </div>
          ) : (
            filteredEquipment.map((item) => {
              const available = item.predictedAvailable;
              const percentage = Math.round((available / item.total) * 100);
              const isLow = percentage < 35;

              return (
                <div
                  key={item.id}
                  className="p-3.5 bg-white border border-slate-200/80 hover:border-slate-300 rounded-2xl transition-all shadow-2xs hover:shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  {/* Left info */}
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 mt-0.5">
                      {getEquipmentIcon(item.category, item.id)}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="text-sm font-bold text-slate-900 tracking-tight truncate">
                          {item.name}
                        </h4>
                        <span className="text-[10px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                          {item.categoryLabel}
                        </span>
                      </div>

                      {/* AI Recommendation */}
                      <p className="text-xs text-slate-600 mt-1 flex items-start gap-1.5">
                        <Sparkles className="w-3 h-3 text-teal-600 shrink-0 mt-0.5" />
                        <span>{item.aiRecommendation}</span>
                      </p>

                      <div className="flex items-center gap-2 mt-1.5 text-[11px] text-slate-400">
                        <span className="inline-flex items-center gap-1 text-slate-500">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          {item.telemetry}
                        </span>
                        {item.burnRate && (
                          <span className="text-slate-400 text-[10px]">
                            &bull; {item.burnRate}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right metrics & progress */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between gap-1.5 sm:min-w-[140px] shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100">
                    <div className="text-right">
                      <span className="text-base font-extrabold text-slate-900">
                        {available}
                      </span>
                      <span className="text-xs text-slate-400 font-medium">
                        {' '}/ {item.total} {item.unit}
                      </span>
                    </div>

                    <div className="w-28 bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isLow 
                            ? 'bg-amber-500' 
                            : percentage > 70 
                              ? 'bg-emerald-500' 
                              : 'bg-teal-500'
                        }`}
                        style={{ width: `${Math.min(100, Math.max(8, percentage))}%` }}
                      />
                    </div>

                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                      isLow 
                        ? 'bg-amber-50 text-amber-700 border border-amber-200' 
                        : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    }`}>
                      {percentage}% Available
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* AI Operational Insights */}
        {predictionData?.aiInsights && (
          <div className="mt-2 pt-2 border-t border-slate-100 shrink-0">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
              <div className="p-2 bg-slate-50 rounded-xl border border-slate-200/60">
                <span className="font-bold text-slate-800">Triage: </span>
                <span className="text-slate-600">{predictionData.aiInsights.triageNote}</span>
              </div>
              <div className="p-2 bg-slate-50 rounded-xl border border-slate-200/60">
                <span className="font-bold text-slate-800">Equipment: </span>
                <span className="text-slate-600">{predictionData.aiInsights.equipmentNote}</span>
              </div>
              <div className="p-2 bg-slate-50 rounded-xl border border-slate-200/60">
                <span className="font-bold text-slate-800">Staffing: </span>
                <span className="text-slate-600">{predictionData.aiInsights.staffingNote}</span>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <div className="flex items-center gap-1.5 text-slate-500 text-[11px] sm:text-xs">
            <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
            <span>AI model forecasts updated dynamically based on active ward intake</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};
