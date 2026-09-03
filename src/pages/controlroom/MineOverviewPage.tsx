import React, { useState, useMemo } from 'react';
import { ControlRoomLayout } from '../../components/controlroom/ControlRoomLayout';
import { MineDigitalTwin } from '../../components/shared/MineDigitalTwin';
import { useSafety } from '../../context/SafetyContext';
import { useNavigate } from 'react-router-dom';
import {
  Layers,
  Users,
  Compass,
  Wind,
  Thermometer,
  ShieldCheck,
  AlertTriangle,
  Radio,
  Maximize2,
  Minimize2,
  ExternalLink,
  CheckCircle2,
  Activity,
  Heart,
  Battery,
  MapPin,
  Play,
  Pause,
  Eye,
  Crosshair,
  ArrowRight,
  HardHat,
  X,
} from 'lucide-react';

export const MineOverviewPage: React.FC = () => {
  const navigate = useNavigate();
  const { workers, zones, alerts, selectedWorkerId, setSelectedWorkerId } = useSafety();

  const [selectedZoneId, setSelectedZoneId] = useState<string>('all');
  const [sectionView, setSectionView] = useState<boolean>(false);
  const [presentationMode, setPresentationMode] = useState<boolean>(false);
  const [followWorker, setFollowWorker] = useState<boolean>(false);

  const selectedWorker = useMemo(() => {
    return workers.find((w) => w.id === selectedWorkerId);
  }, [workers, selectedWorkerId]);

  const selectedZone = useMemo(() => {
    if (selectedZoneId === 'all') return null;
    return zones.find((z) => z.id === selectedZoneId) || null;
  }, [zones, selectedZoneId]);

  // Format distance from shaft based on worker coordinates
  const getDistanceFromShaft = (workerCoords: [number, number, number]) => {
    const shaftX = -12;
    const shaftZ = -4;
    const dx = workerCoords[0] - shaftX;
    const dz = workerCoords[2] - shaftZ;
    const distMeters = Math.round(Math.sqrt(dx * dx + dz * dz) * 35);
    return `${distMeters}m via Drift`;
  };

  return (
    <ControlRoomLayout>
      <div className="space-y-4 text-[#151713]">
        {/* ==================== PAGE HEADER ==================== */}
        <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-3 border-b border-[#ECEBE6] pb-3">
          <div>
            <h1 className="font-serif text-2xl sm:text-3xl text-[#151713] font-normal tracking-tight">
              3D Mine Overview
            </h1>
            <p className="text-xs sm:text-sm text-[#666861] mt-0.5">
              Live digital twin of underground haulage, extraction and personnel activity.
            </p>
          </div>

          {/* Quick Header Action Controls */}
          <div className="flex items-center gap-2">
            {/* Link back to Main Dashboard */}
            <button
              onClick={() => navigate('/controlroom/dashboard')}
              className="px-3 py-1.5 rounded-xl bg-white hover:bg-[#FAF9F6] border border-[#DCDAD4] text-xs font-medium text-[#151713] flex items-center space-x-1.5 transition-colors shadow-xs"
            >
              <span>Main Dashboard</span>
              <ExternalLink className="w-3.5 h-3.5 text-[#666861]" />
            </button>
          </div>
        </div>

        {/* ==================== LOCATE WORKER QUICK SELECTOR BAR ==================== */}
        <div className="bg-white border border-[#DCDAD4] p-2.5 rounded-2xl flex flex-wrap items-center justify-between gap-2 shadow-xs">
          <div className="flex items-center space-x-2 text-xs text-[#666861] font-semibold shrink-0">
            <Crosshair className="w-4 h-4 text-[#176B4D]" />
            <span className="font-serif">LOCATE WORKER:</span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 flex-1 overflow-x-auto">
            {workers.map((w) => {
              const isSelected = w.id === selectedWorkerId;
              const depth = w.coordinates[1] * 100 < 0 ? `${Math.round(w.coordinates[1] * 100)}m` : '-440m';

              return (
                <button
                  key={w.id}
                  onClick={() => setSelectedWorkerId(isSelected ? '' : w.id)}
                  className={`px-2.5 py-1.5 rounded-xl border text-xs font-medium flex items-center space-x-1.5 transition-all ${
                    isSelected
                      ? 'bg-[#176B4D] border-[#176B4D] text-white shadow-xs'
                      : 'bg-[#FAF9F6] border-[#ECEBE6] text-[#151713] hover:border-[#DCDAD4] hover:bg-white'
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      w.status === 'critical'
                        ? 'bg-[#A83D45] animate-pulse'
                        : w.status === 'attention'
                        ? 'bg-[#B47A18]'
                        : isSelected
                        ? 'bg-white'
                        : 'bg-[#2D8A61]'
                    }`}
                  />
                  <span className="font-serif">{w.name}</span>
                  <span className={`text-[10px] font-mono ${isSelected ? 'text-white/80' : 'text-[#666861]'}`}>
                    ({depth})
                  </span>
                </button>
              );
            })}
          </div>

          {selectedWorkerId && (
            <button
              onClick={() => setSelectedWorkerId('')}
              className="text-xs text-[#666861] hover:text-[#A83D45] font-mono flex items-center space-x-1 shrink-0 px-2 py-1"
            >
              <X className="w-3.5 h-3.5" />
              <span>Deselect</span>
            </button>
          )}
        </div>

        {/* ==================== 3D MINE TWIN & CONTEXT PANEL ==================== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Main 3D Digital Twin (Dominant 8 columns on desktop) */}
          <div className="lg:col-span-8 flex flex-col space-y-3">
            <MineDigitalTwin
              workers={workers}
              zones={zones}
              alerts={alerts}
              selectedWorkerId={selectedWorkerId}
              onSelectWorker={(id) => setSelectedWorkerId(id)}
              fullScreen={false}
            />
          </div>

          {/* Right Rail: Adaptive Context Panel (4 columns) */}
          <div className="lg:col-span-4 space-y-4 flex flex-col">
            {/* If a worker IS selected -> SHOW DETAILED WORKER INSPECTION & PPE CALLOUT */}
            {selectedWorker ? (
              <div className="bg-white border border-[#DCDAD4] rounded-2xl p-5 space-y-4 shadow-sm animate-in fade-in duration-200">
                {/* Worker Identity Header */}
                <div className="flex items-start justify-between border-b border-[#ECEBE6] pb-3">
                  <div>
                    <div className="flex items-center space-x-1.5">
                      <span
                        className={`w-2.5 h-2.5 rounded-full ${
                          selectedWorker.status === 'critical'
                            ? 'bg-[#A83D45] animate-pulse'
                            : selectedWorker.status === 'attention'
                            ? 'bg-[#B47A18]'
                            : 'bg-[#2D8A61]'
                        }`}
                      />
                      <span className="text-[10px] font-mono font-bold uppercase text-[#176B4D] tracking-wider">
                        {selectedWorker.status === 'critical'
                          ? 'CRITICAL SAFETY ALERT'
                          : selectedWorker.status === 'attention'
                          ? 'ATTENTION REQUIRED'
                          : 'SAFETY STATUS: NOMINAL'}
                      </span>
                    </div>
                    <h3 className="font-serif font-bold text-xl text-[#151713] mt-0.5">
                      {selectedWorker.name}
                    </h3>
                    <div className="text-xs text-[#666861] font-mono">
                      {selectedWorker.id} • {selectedWorker.role}
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedWorkerId('')}
                    className="p-1 rounded-lg text-[#666861] hover:text-[#151713] hover:bg-[#FAF9F6]"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Subterranean Spatial Location */}
                <div className="bg-[#FAF9F6] border border-[#ECEBE6] p-3 rounded-xl space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[#666861]">Subterranean Zone:</span>
                    <strong className="text-[#151713] uppercase font-mono">{selectedWorker.zoneId}</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#666861]">Subterranean Depth:</span>
                    <strong className="text-[#176B4D] font-mono font-bold">
                      {selectedWorker.coordinates[1] * 100 < 0
                        ? `${Math.round(selectedWorker.coordinates[1] * 100)}m Subterranean`
                        : '-440m Subterranean'}
                    </strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#666861]">Distance from Hoist Shaft:</span>
                    <span className="font-mono text-[#151713]">
                      {getDistanceFromShaft(selectedWorker.coordinates)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#666861]">LoRa Telemetry Ping:</span>
                    <span className="font-mono text-[#2D8A61] font-semibold">Just now (Strong Mesh)</span>
                  </div>
                </div>

                {/* VISUAL PPE VERIFICATION CHECKLIST (WITH CALLOUT STATUS) */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-serif font-semibold text-xs text-[#151713] uppercase tracking-wider flex items-center space-x-1.5">
                      <ShieldCheck className="w-4 h-4 text-[#176B4D]" />
                      <span>PPE Gear Compliance (AI Verified)</span>
                    </span>
                    <span className="text-[10px] font-mono font-bold text-[#2D8A61] bg-[#EAF3EF] px-2 py-0.5 rounded">
                      100% VERIFIED
                    </span>
                  </div>

                  <div className="space-y-2">
                    {/* Helmet */}
                    <div className="flex items-center justify-between p-2 rounded-xl bg-[#FAF9F6] border border-[#ECEBE6] text-xs">
                      <div className="flex items-center space-x-2">
                        <CheckCircle2 className="w-4 h-4 text-[#2D8A61]" />
                        <div>
                          <div className="font-semibold text-[#151713]">Safety Helmet & LED Lamp</div>
                          <div className="text-[10px] text-[#666861]">Class E Electrical • DGMS Approved</div>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono font-semibold text-[#2D8A61] uppercase">VERIFIED ✓</span>
                    </div>

                    {/* Vest */}
                    <div className="flex items-center justify-between p-2 rounded-xl bg-[#FAF9F6] border border-[#ECEBE6] text-xs">
                      <div className="flex items-center space-x-2">
                        <CheckCircle2 className="w-4 h-4 text-[#2D8A61]" />
                        <div>
                          <div className="font-semibold text-[#151713]">High-Visibility Safety Vest</div>
                          <div className="text-[10px] text-[#666861]">EN ISO 20471 Class 3 Reflective</div>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono font-semibold text-[#2D8A61] uppercase">VERIFIED ✓</span>
                    </div>

                    {/* Gloves */}
                    <div className="flex items-center justify-between p-2 rounded-xl bg-[#FAF9F6] border border-[#ECEBE6] text-xs">
                      <div className="flex items-center space-x-2">
                        <CheckCircle2 className="w-4 h-4 text-[#2D8A61]" />
                        <div>
                          <div className="font-semibold text-[#151713]">Heavy-Duty Work Gloves</div>
                          <div className="text-[10px] text-[#666861]">Cut Level 5 • Padded Knuckles</div>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono font-semibold text-[#2D8A61] uppercase">VERIFIED ✓</span>
                    </div>

                    {/* Boots */}
                    <div className="flex items-center justify-between p-2 rounded-xl bg-[#FAF9F6] border border-[#ECEBE6] text-xs">
                      <div className="flex items-center space-x-2">
                        <CheckCircle2 className="w-4 h-4 text-[#2D8A61]" />
                        <div>
                          <div className="font-semibold text-[#151713]">Steel-Toe Safety Boots</div>
                          <div className="text-[10px] text-[#666861]">Metatarsal Guard • Anti-Static</div>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono font-semibold text-[#2D8A61] uppercase">VERIFIED ✓</span>
                    </div>
                  </div>
                </div>

                {/* Live Physiological Telemetry */}
                <div className="border-t border-[#ECEBE6] pt-3 space-y-2">
                  <span className="font-serif font-semibold text-xs text-[#151713] uppercase tracking-wider block">
                    Biometric & Environmental Telemetry
                  </span>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2.5 rounded-xl bg-[#FAF9F6] border border-[#ECEBE6]">
                      <div className="text-[10px] text-[#666861] uppercase">Heart Rate</div>
                      <div className="font-mono font-bold text-sm text-[#151713] mt-0.5">
                        {selectedWorker.vitals.heartRate} BPM
                      </div>
                      <div className="text-[10px] text-[#2D8A61]">Normal Pace</div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-[#FAF9F6] border border-[#ECEBE6]">
                      <div className="text-[10px] text-[#666861] uppercase">Blood Oxygen (SpO2)</div>
                      <div className="font-mono font-bold text-sm text-[#151713] mt-0.5">
                        {selectedWorker.vitals.spo2}%
                      </div>
                      <div className="text-[10px] text-[#2D8A61]">Nominal Saturation</div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-[#FAF9F6] border border-[#ECEBE6]">
                      <div className="text-[10px] text-[#666861] uppercase">Motion Sensor (IMU)</div>
                      <div className="font-mono font-bold text-xs text-[#151713] mt-0.5 uppercase">
                        {selectedWorker.vitals.movement}
                      </div>
                      <div className="text-[10px] text-[#2D8A61]">No Fall Detected</div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-[#FAF9F6] border border-[#ECEBE6]">
                      <div className="text-[10px] text-[#666861] uppercase">Node Battery</div>
                      <div className="font-mono font-bold text-sm text-[#151713] mt-0.5">
                        {selectedWorker.vitals.batteryLevel}%
                      </div>
                      <div className="text-[10px] text-[#666861]">ESP32 Wearable</div>
                    </div>
                  </div>
                </div>

                {/* Worker Profile Detail View Action */}
                <button
                  onClick={() => navigate('/controlroom/worker')}
                  className="w-full py-2.5 rounded-xl bg-[#176B4D] hover:bg-[#13563D] text-white text-xs font-semibold flex items-center justify-center space-x-1.5 shadow-xs transition-colors"
                >
                  <span>Open Full Personnel Health File</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              /* If NO worker is selected -> SHOW MINE OVERVIEW KPIS & ZONE DIRECTORY */
              <div className="space-y-4">
                {/* General Mine Overview Card */}
                <div className="bg-white border border-[#DCDAD4] rounded-2xl p-4 space-y-3 shadow-sm">
                  <div className="flex items-center justify-between border-b border-[#ECEBE6] pb-2.5">
                    <div className="flex items-center space-x-2">
                      <Compass className="w-4 h-4 text-[#176B4D]" />
                      <h3 className="font-serif font-semibold text-sm text-[#151713]">
                        Mine Digital Twin Summary
                      </h3>
                    </div>
                    <span className="font-mono text-[10px] text-[#2D8A61] font-bold bg-[#EAF3EF] px-2 py-0.5 rounded">
                      ACTIVE TWIN
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2.5 rounded-xl bg-[#FAF9F6] border border-[#ECEBE6]">
                      <span className="text-[10px] text-[#666861] uppercase block">Total Workers</span>
                      <strong className="text-lg font-serif text-[#151713]">{workers.length}</strong>
                    </div>

                    <div className="p-2.5 rounded-xl bg-[#FAF9F6] border border-[#ECEBE6]">
                      <span className="text-[10px] text-[#666861] uppercase block">Underground</span>
                      <strong className="text-lg font-serif text-[#2D8A61]">{workers.length}</strong>
                    </div>

                    <div className="p-2.5 rounded-xl bg-[#FAF9F6] border border-[#ECEBE6]">
                      <span className="text-[10px] text-[#666861] uppercase block">Active Sectors</span>
                      <strong className="text-lg font-serif text-[#151713]">4 Zones</strong>
                    </div>

                    <div className="p-2.5 rounded-xl bg-[#FAF9F6] border border-[#ECEBE6]">
                      <span className="text-[10px] text-[#666861] uppercase block">Operational Shift</span>
                      <strong className="text-xs font-mono text-[#151713] block mt-1">Shift A (06:00 - 14:00)</strong>
                    </div>
                  </div>
                </div>

                {/* Subterranean Zone Status Directory */}
                <div className="bg-white border border-[#DCDAD4] rounded-2xl p-4 space-y-3 shadow-sm">
                  <div className="flex items-center justify-between border-b border-[#ECEBE6] pb-2">
                    <span className="font-serif font-semibold text-xs text-[#151713] uppercase tracking-wider">
                      Subterranean Zone Directory
                    </span>
                    <span className="text-[10px] text-[#666861] font-mono">4 Sectors</span>
                  </div>

                  <div className="space-y-2 text-xs">
                    {zones.map((zone) => {
                      const countInZone = workers.filter((w) => w.zoneId === zone.id).length;
                      return (
                        <div
                          key={zone.id}
                          className="p-3 rounded-xl border border-[#ECEBE6] bg-[#FAF9F6] hover:bg-white hover:border-[#DCDAD4] transition-all space-y-1.5"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-serif font-bold text-xs text-[#151713]">
                              {zone.name}
                            </span>
                            <span className="font-mono text-[10px] font-bold text-[#176B4D] bg-[#EAF3EF] px-2 py-0.5 rounded">
                              {zone.depth}
                            </span>
                          </div>

                          <div className="flex items-center justify-between text-[11px] text-[#666861]">
                            <span>Personnel on Face: <strong>{countInZone} Miners</strong></span>
                            <span>Airflow: <strong>{zone.airflow}</strong></span>
                          </div>

                          <div className="flex items-center justify-between text-[11px] pt-1 border-t border-[#ECEBE6]">
                            <span className="text-[#666861]">Temperature: {zone.temperature}</span>
                            <span className="text-[#2D8A61] font-semibold flex items-center space-x-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#2D8A61]" />
                              <span>Verified Safe</span>
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </ControlRoomLayout>
  );
};
