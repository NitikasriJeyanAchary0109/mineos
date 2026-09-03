import React from 'react';
import { EnvironmentTelemetry } from '../../types/safety';
import { Wind, Flame, Thermometer, ShieldAlert, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface GasEnvironmentalPanelProps {
  telemetry: EnvironmentTelemetry;
  zoneName?: string;
}

export const GasEnvironmentalPanel: React.FC<GasEnvironmentalPanelProps> = ({
  telemetry,
  zoneName,
}) => {
  const isFlame = Boolean(telemetry.flame_detected);

  const getMqColor = (val: number, warnThresh: number, critThresh: number) => {
    if (val >= critThresh) return 'text-[#A83D45] bg-[#FDF2F2] border-[#A83D45]/50';
    if (val >= warnThresh) return 'text-[#B47A18] bg-[#FEF9E7] border-[#B47A18]/50';
    return 'text-[#151713] bg-[#FAF9F6] border-[#ECEBE6]';
  };

  return (
    <div className="bg-white border border-[#DCDAD4] rounded-2xl p-4 flex flex-col space-y-3.5 shadow-sm">
      {/* Panel Header Scoped to Selected Worker's Zone */}
      <div className="flex items-center justify-between border-b border-[#ECEBE6] pb-3">
        <div>
          <div className="text-[10px] text-[#666861] uppercase tracking-wider font-semibold">
            Atmospheric & Environmental Telemetry
          </div>
          <div className="font-serif font-semibold text-base text-[#151713] mt-0.5">
            {zoneName || `Zone ${telemetry.zone_id.replace('zone-', '').toUpperCase()}`}
          </div>
        </div>

        {/* Flame Detector Badge */}
        <div
          className={`px-2.5 py-1 rounded-lg border text-xs font-medium flex items-center space-x-1.5 ${
            isFlame
              ? 'bg-[#FDF2F2] border-[#A83D45] text-[#A83D45]'
              : 'bg-[#EAF3EF] border-[#2D8A61]/30 text-[#2D8A61]'
          }`}
        >
          <Flame className={`w-4 h-4 ${isFlame ? 'text-[#A83D45]' : 'text-[#2D8A61]'}`} />
          <span>{isFlame ? 'FLAME DETECTED' : 'ATMOSPHERE NOMINAL'}</span>
        </div>
      </div>

      {/* Primary Gas Sensor Readings Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {/* Methane (MQ4) */}
        <div
          className={`p-3 rounded-xl border text-xs flex flex-col justify-between ${getMqColor(
            telemetry.mq4,
            250,
            380
          )}`}
        >
          <div className="text-[10px] uppercase font-semibold text-[#666861] flex justify-between">
            <span>Methane</span>
            <span className="font-mono">MQ4</span>
          </div>
          <div className="font-serif font-semibold text-xl my-1">
            {telemetry.mq4} <span className="text-[11px] font-sans font-normal text-[#666861]">PPM</span>
          </div>
          <div className="text-[10px] uppercase font-semibold">
            {telemetry.mq4 >= 380 ? 'CRITICAL SPIKE' : telemetry.mq4 >= 250 ? 'ELEVATED' : 'SAFE LIMIT'}
          </div>
        </div>

        {/* Smoke & LPG (MQ2) */}
        <div
          className={`p-3 rounded-xl border text-xs flex flex-col justify-between ${getMqColor(
            telemetry.mq2,
            120,
            350
          )}`}
        >
          <div className="text-[10px] uppercase font-semibold text-[#666861] flex justify-between">
            <span>Smoke / LPG</span>
            <span className="font-mono">MQ2</span>
          </div>
          <div className="font-serif font-semibold text-xl my-1">
            {telemetry.mq2} <span className="text-[11px] font-sans font-normal text-[#666861]">PPM</span>
          </div>
          <div className="text-[10px] uppercase font-semibold">
            {telemetry.mq2 >= 350 ? 'SMOKE DETECTED' : telemetry.mq2 >= 120 ? 'HAZE CAUTION' : 'CLEAR'}
          </div>
        </div>

        {/* Carbon Monoxide (MQ7) */}
        <div
          className={`p-3 rounded-xl border text-xs flex flex-col justify-between ${getMqColor(
            telemetry.mq7,
            50,
            150
          )}`}
        >
          <div className="text-[10px] uppercase font-semibold text-[#666861] flex justify-between">
            <span>Carbon Monoxide</span>
            <span className="font-mono">MQ7</span>
          </div>
          <div className="font-serif font-semibold text-xl my-1">
            {telemetry.mq7} <span className="text-[11px] font-sans font-normal text-[#666861]">PPM</span>
          </div>
          <div className="text-[10px] uppercase font-semibold">
            {telemetry.mq7 >= 150 ? 'TOXIC RISK' : telemetry.mq7 >= 50 ? 'ELEVATED' : 'SAFE LIMIT'}
          </div>
        </div>

        {/* Ambient Temperature */}
        <div
          className={`p-3 rounded-xl border text-xs flex flex-col justify-between ${
            telemetry.temperature >= 44
              ? 'text-[#A83D45] bg-[#FDF2F2] border-[#A83D45]/50'
              : telemetry.temperature >= 35
              ? 'text-[#B47A18] bg-[#FEF9E7] border-[#B47A18]/50'
              : 'text-[#151713] bg-[#FAF9F6] border-[#ECEBE6]'
          }`}
        >
          <div className="text-[10px] uppercase font-semibold text-[#666861] flex justify-between">
            <span>Temperature</span>
            <Thermometer className="w-3.5 h-3.5 text-[#176B4D]" />
          </div>
          <div className="font-serif font-semibold text-xl my-1">
            {telemetry.temperature}°C
          </div>
          <div className="text-[10px] uppercase font-semibold">
            {telemetry.temperature >= 35 ? 'HIGH THERMAL' : 'NOMINAL'}
          </div>
        </div>
      </div>

      {/* Secondary Sensor Strip */}
      <div className="flex flex-wrap items-center justify-between text-[11px] text-[#666861] bg-[#FAF9F6] px-3.5 py-2 rounded-xl border border-[#ECEBE6]">
        <div>
          MQ135 Air Quality: <strong className="text-[#151713]">{telemetry.mq135} ppm</strong>
        </div>
        <div>
          MQ9 Combustible: <strong className="text-[#151713]">{telemetry.mq9} ppm</strong>
        </div>
        <div className="font-mono text-[10px] text-[#176B4D]">
          Updated: {new Date(telemetry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
        </div>
      </div>
    </div>
  );
};
