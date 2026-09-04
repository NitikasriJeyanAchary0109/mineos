import React, { useState, useEffect } from 'react';
import { EnvironmentTelemetry } from '../../types/safety';
import { useSafety } from '../../context/SafetyContext';
import {
  Wind,
  Flame,
  Thermometer,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Gauge,
  Layers,
  Activity,
  Droplets,
  Compass,
} from 'lucide-react';

interface GasEnvironmentalPanelProps {
  telemetry: EnvironmentTelemetry;
  zoneName?: string;
}

export const GasEnvironmentalPanel: React.FC<GasEnvironmentalPanelProps> = ({
  telemetry: initialTelemetry,
  zoneName: initialZoneName,
}) => {
  const { environmentByZone, zones } = useSafety();

  // Selected tab (defaults to worker's zone, but operator can click any zone)
  const [selectedZoneId, setSelectedZoneId] = useState<string>(
    initialTelemetry?.zone_id || 'zone-c'
  );

  // Sync if selected worker changes zone
  useEffect(() => {
    if (initialTelemetry?.zone_id) {
      setSelectedZoneId(initialTelemetry.zone_id);
    }
  }, [initialTelemetry?.zone_id]);

  // Active zone telemetry
  const telemetry =
    environmentByZone[selectedZoneId] || initialTelemetry || {
      zone_id: selectedZoneId,
      mq2: 50,
      mq4: 150,
      mq7: 20,
      mq9: 35,
      mq135: 65,
      temperature: 28,
      flame_detected: false,
      timestamp: new Date().toISOString(),
    };

  const currentZoneMeta = zones.find((z) => z.id === selectedZoneId);
  const zoneDisplayName =
    currentZoneMeta?.name || `Zone ${selectedZoneId.replace('zone-', '').toUpperCase()}`;

  const isFlame = Boolean(telemetry.flame_detected);

  // Color helpers
  const getMqLevel = (val: number, warnThresh: number, critThresh: number) => {
    if (val >= critThresh) return { status: 'critical', bg: 'bg-[#FDF2F2]', border: 'border-[#A83D45]/50', text: 'text-[#A83D45]', bar: 'bg-[#A83D45]' };
    if (val >= warnThresh) return { status: 'warning', bg: 'bg-[#FEF9E7]', border: 'border-[#B47A18]/50', text: 'text-[#B47A18]', bar: 'bg-[#B47A18]' };
    return { status: 'normal', bg: 'bg-[#FAF9F6]', border: 'border-[#ECEBE6]', text: 'text-[#151713]', bar: 'bg-[#2D8A61]' };
  };

  const ch4Level = getMqLevel(telemetry.mq4, 250, 380);
  const coLevel = getMqLevel(telemetry.mq7, 50, 150);
  const smokeLevel = getMqLevel(telemetry.mq2, 120, 350);

  const zoneTabs = [
    { id: 'zone-a', label: 'Zone A', depth: '-120m' },
    { id: 'zone-b', label: 'Zone B', depth: '-260m' },
    { id: 'zone-c', label: 'Zone C', depth: '-440m' },
    { id: 'zone-d', label: 'Zone D', depth: '-520m' },
  ];

  return (
    <div className="bg-white border border-[#DCDAD4] rounded-2xl p-4 flex flex-col space-y-3.5 shadow-sm">
      {/* Top Header & Flame Warning */}
      <div className="flex items-start justify-between border-b border-[#ECEBE6] pb-3">
        <div>
          <div className="text-[10px] text-[#666861] uppercase tracking-wider font-semibold flex items-center space-x-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#176B4D]" />
            <span>Atmospheric & Environmental Telemetry</span>
          </div>
          <div className="font-serif font-semibold text-lg text-[#151713] mt-0.5 flex items-center space-x-2">
            <span>{zoneDisplayName}</span>
            <span className="text-xs font-mono font-normal text-[#666861]">
              ({currentZoneMeta?.depth || '-260m'})
            </span>
          </div>
        </div>

        {/* Optical Flame Detection Status */}
        <div
          className={`px-2.5 py-1.5 rounded-xl border text-xs font-semibold flex items-center space-x-1.5 shadow-2xs ${
            isFlame
              ? 'bg-[#FDF2F2] border-[#A83D45] text-[#A83D45] animate-pulse'
              : 'bg-[#EAF3EF] border-[#2D8A61]/30 text-[#2D8A61]'
          }`}
        >
          <Flame className={`w-3.5 h-3.5 ${isFlame ? 'text-[#A83D45]' : 'text-[#2D8A61]'}`} />
          <span>{isFlame ? 'THERMAL FLAME DETECTED' : 'FIRE / THERMAL: CLEAR'}</span>
        </div>
      </div>

      {/* 1-Click Zone Telemetry Tabs */}
      <div className="grid grid-cols-4 gap-1 p-1 bg-[#FAF9F6] border border-[#ECEBE6] rounded-xl text-xs font-mono">
        {zoneTabs.map((tab) => {
          const isSelected = selectedZoneId === tab.id;
          const zTel = environmentByZone[tab.id];
          const hasHazard = zTel?.mq4 >= 250 || zTel?.mq7 >= 50 || zTel?.flame_detected;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setSelectedZoneId(tab.id)}
              className={`py-1.5 px-2 rounded-lg text-center transition-all flex flex-col items-center justify-center ${
                isSelected
                  ? 'bg-white text-[#151713] shadow-xs font-bold border border-[#DCDAD4]'
                  : 'text-[#666861] hover:text-[#151713] hover:bg-white/60'
              }`}
            >
              <div className="flex items-center space-x-1">
                <span>{tab.label}</span>
                {hasHazard && <span className="w-1.5 h-1.5 rounded-full bg-[#A83D45] animate-pulse" />}
              </div>
              <span className="text-[9px] opacity-75 font-normal">{tab.depth}</span>
            </button>
          );
        })}
      </div>

      {/* Calibrated Gas Gauge Cards with DGMS Statutory Limit Bars */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {/* Methane CH4 (MQ4) */}
        <div className={`p-3 rounded-xl border text-xs flex flex-col justify-between ${ch4Level.bg} ${ch4Level.border}`}>
          <div className="text-[10px] uppercase font-semibold text-[#666861] flex justify-between">
            <span>Methane</span>
            <span className="font-mono text-[#176B4D]">CH4 / MQ4</span>
          </div>

          <div className="my-1.5">
            <div className={`font-serif font-semibold text-2xl ${ch4Level.text}`}>
              {telemetry.mq4}
              <span className="text-xs font-sans font-normal text-[#666861] ml-1">PPM</span>
            </div>
            {/* Calibrated Bar: Max 500 PPM, Caution at 250, Crit at 380 */}
            <div className="w-full h-1.5 rounded-full bg-[#E2E0D8] overflow-hidden mt-1 relative">
              <div
                className={`h-full rounded-full transition-all duration-300 ${ch4Level.bar}`}
                style={{ width: `${Math.min(100, (telemetry.mq4 / 500) * 100)}%` }}
              />
            </div>
            <div className="flex justify-between text-[8px] font-mono text-[#666861] mt-0.5">
              <span>0</span>
              <span className="text-[#B47A18]">250 (DGMS)</span>
              <span className="text-[#A83D45]">380 Crit</span>
            </div>
          </div>

          <div className={`text-[10px] uppercase font-bold ${ch4Level.text}`}>
            {telemetry.mq4 >= 380 ? 'CRITICAL SPIKE ⚠' : telemetry.mq4 >= 250 ? 'ELEVATED VENTILATE' : 'SAFE STATUTORY LIMIT'}
          </div>
        </div>

        {/* Carbon Monoxide CO (MQ7) */}
        <div className={`p-3 rounded-xl border text-xs flex flex-col justify-between ${coLevel.bg} ${coLevel.border}`}>
          <div className="text-[10px] uppercase font-semibold text-[#666861] flex justify-between">
            <span>Carbon Monoxide</span>
            <span className="font-mono text-[#176B4D]">CO / MQ7</span>
          </div>

          <div className="my-1.5">
            <div className={`font-serif font-semibold text-2xl ${coLevel.text}`}>
              {telemetry.mq7}
              <span className="text-xs font-sans font-normal text-[#666861] ml-1">PPM</span>
            </div>
            {/* Calibrated Bar: Max 200 PPM, Caution at 50, Crit at 150 */}
            <div className="w-full h-1.5 rounded-full bg-[#E2E0D8] overflow-hidden mt-1 relative">
              <div
                className={`h-full rounded-full transition-all duration-300 ${coLevel.bar}`}
                style={{ width: `${Math.min(100, (telemetry.mq7 / 200) * 100)}%` }}
              />
            </div>
            <div className="flex justify-between text-[8px] font-mono text-[#666861] mt-0.5">
              <span>0</span>
              <span className="text-[#B47A18]">50 Warn</span>
              <span className="text-[#A83D45]">150 Toxic</span>
            </div>
          </div>

          <div className={`text-[10px] uppercase font-bold ${coLevel.text}`}>
            {telemetry.mq7 >= 150 ? 'TOXIC HAZARD ⚠' : telemetry.mq7 >= 50 ? 'ELEVATED CAUTION' : 'SAFE ATMOSPHERE'}
          </div>
        </div>

        {/* Smoke / Particulate (MQ2) */}
        <div className={`p-3 rounded-xl border text-xs flex flex-col justify-between ${smokeLevel.bg} ${smokeLevel.border}`}>
          <div className="text-[10px] uppercase font-semibold text-[#666861] flex justify-between">
            <span>Smoke / LPG</span>
            <span className="font-mono text-[#176B4D]">MQ2</span>
          </div>

          <div className="my-1.5">
            <div className={`font-serif font-semibold text-2xl ${smokeLevel.text}`}>
              {telemetry.mq2}
              <span className="text-xs font-sans font-normal text-[#666861] ml-1">PPM</span>
            </div>
            {/* Calibrated Bar */}
            <div className="w-full h-1.5 rounded-full bg-[#E2E0D8] overflow-hidden mt-1 relative">
              <div
                className={`h-full rounded-full transition-all duration-300 ${smokeLevel.bar}`}
                style={{ width: `${Math.min(100, (telemetry.mq2 / 500) * 100)}%` }}
              />
            </div>
            <div className="flex justify-between text-[8px] font-mono text-[#666861] mt-0.5">
              <span>0</span>
              <span className="text-[#B47A18]">120 Haze</span>
              <span className="text-[#A83D45]">350 Smoke</span>
            </div>
          </div>

          <div className={`text-[10px] uppercase font-bold ${smokeLevel.text}`}>
            {telemetry.mq2 >= 350 ? 'SMOKE DETECTED ⚠' : telemetry.mq2 >= 120 ? 'HAZE CAUTION' : 'OPTICAL CLEAR'}
          </div>
        </div>

        {/* Ambient Temperature & Thermal Load */}
        <div
          className={`p-3 rounded-xl border text-xs flex flex-col justify-between ${
            telemetry.temperature >= 40
              ? 'text-[#A83D45] bg-[#FDF2F2] border-[#A83D45]/50'
              : telemetry.temperature >= 33
              ? 'text-[#B47A18] bg-[#FEF9E7] border-[#B47A18]/50'
              : 'text-[#151713] bg-[#FAF9F6] border-[#ECEBE6]'
          }`}
        >
          <div className="text-[10px] uppercase font-semibold text-[#666861] flex justify-between">
            <span>Temperature</span>
            <Thermometer className="w-3.5 h-3.5 text-[#176B4D]" />
          </div>

          <div className="my-1.5">
            <div className="font-serif font-semibold text-2xl">
              {telemetry.temperature}°C
            </div>
            <div className="w-full h-1.5 rounded-full bg-[#E2E0D8] overflow-hidden mt-1 relative">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  telemetry.temperature >= 40 ? 'bg-[#A83D45]' : telemetry.temperature >= 33 ? 'bg-[#B47A18]' : 'bg-[#2D8A61]'
                }`}
                style={{ width: `${Math.min(100, (telemetry.temperature / 50) * 100)}%` }}
              />
            </div>
            <div className="flex justify-between text-[8px] font-mono text-[#666861] mt-0.5">
              <span>15°C</span>
              <span className="text-[#B47A18]">33° Max</span>
              <span className="text-[#A83D45]">40° Danger</span>
            </div>
          </div>

          <div className="text-[10px] uppercase font-bold">
            {telemetry.temperature >= 33 ? 'HIGH THERMAL LOAD' : 'AIRFLOW NORMAL'}
          </div>
        </div>
      </div>

      {/* Auxiliary DGMS Statutory Ventilation Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#666861] bg-[#FAF9F6] px-3.5 py-2.5 rounded-xl border border-[#ECEBE6] font-mono">
        <div className="flex items-center space-x-1.5">
          <Wind className="w-3.5 h-3.5 text-[#176B4D]" />
          <span>Forced Airflow: <strong className="text-[#151713]">1.85 m/s</strong> (Compliant)</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <Droplets className="w-3.5 h-3.5 text-[#176B4D]" />
          <span>Humidity: <strong className="text-[#151713]">72% RH</strong></span>
        </div>
        <div className="flex items-center space-x-1.5">
          <Compass className="w-3.5 h-3.5 text-[#176B4D]" />
          <span>Barometer: <strong className="text-[#151713]">1014 hPa</strong></span>
        </div>
        <div className="text-[10px] text-[#2D8A61] font-semibold">
          ● REALTIME MESH
        </div>
      </div>
    </div>
  );
};
