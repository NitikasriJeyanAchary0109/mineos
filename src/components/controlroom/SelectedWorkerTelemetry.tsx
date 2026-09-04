import React, { useState, useEffect } from 'react';
import { Worker, PpePart } from '../../types/safety';
import { StatusBadge } from '../shared/StatusBadge';
import { PpeHologram } from '../shared/PpeHologram';
import {
  Heart,
  Activity,
  MapPin,
  ShieldCheck,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  Eye,
  Clock,
  Radio,
  Battery,
  Send,
  BellRing,
  AlertTriangle,
  Flame,
  Wifi,
  Sparkles,
} from 'lucide-react';

interface SelectedWorkerTelemetryProps {
  worker: Worker;
  onTogglePpePart?: (part: PpePart) => void;
}

// =============================================================================
// ANIMATED ECG WAVEFORM COMPONENT
// Sweeps an authentic electrocardiogram pulse wave matching the worker's heart rate
// =============================================================================
const EcgWaveform: React.FC<{ heartRate: number; status: 'normal' | 'elevated' | 'critical' }> = ({
  heartRate,
  status,
}) => {
  const strokeColor =
    status === 'critical' ? '#A83D45' : status === 'elevated' ? '#B47A18' : '#2D8A61';

  // Pulse animation duration based on BPM (e.g. 72 BPM = ~0.83s cycle)
  const animDuration = Math.max(0.4, Math.min(1.5, 60 / (heartRate || 72))).toFixed(2);

  return (
    <div className="relative w-full h-8 overflow-hidden rounded bg-[#FAF9F6] border border-[#ECEBE6] flex items-center">
      {/* Grid lines background */}
      <div
        className="absolute inset-0 opacity-25"
        style={{
          backgroundImage:
            'linear-gradient(to right, #DCDAD4 1px, transparent 1px), linear-gradient(to bottom, #DCDAD4 1px, transparent 1px)',
          backgroundSize: '8px 8px',
        }}
      />

      {/* Pulsing ECG line */}
      <svg className="w-full h-full" viewBox="0 0 200 32" preserveAspectRatio="none">
        <path
          d="M 0,16 L 25,16 L 32,16 L 36,12 L 40,20 L 44,4 L 48,28 L 52,14 L 56,18 L 60,16 L 90,16 L 100,16 L 106,12 L 110,20 L 114,4 L 118,28 L 122,14 L 126,18 L 130,16 L 160,16 L 170,16 L 176,12 L 180,20 L 184,4 L 188,28 L 192,14 L 196,18 L 200,16"
          fill="none"
          stroke={strokeColor}
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      {/* Moving scanning beam */}
      <div
        className="absolute top-0 bottom-0 w-8 bg-gradient-to-r from-transparent via-white/80 to-transparent pointer-events-none"
        style={{
          animation: `ecgSweep ${animDuration}s linear infinite`,
        }}
      />

      <style>{`
        @keyframes ecgSweep {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(300px); }
        }
      `}</style>
    </div>
  );
};

export const SelectedWorkerTelemetry: React.FC<SelectedWorkerTelemetryProps> = ({
  worker,
  onTogglePpePart,
}) => {
  const [showHologramModal, setShowHologramModal] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const ppe = worker.ppeStatus;

  // 7-Point DGMS Statutory PPE item list
  const statutoryPpeItems: Array<{ id: PpePart; label: string; sub: string }> = [
    { id: 'helmet', label: 'Hard Hat', sub: 'DGMS Type-II' },
    { id: 'capLamp', label: 'Cap Lamp', sub: 'Cordless LED' },
    { id: 'vest', label: 'Safety Vest', sub: 'High-Vis Retro' },
    { id: 'boots', label: 'Steel Boots', sub: 'Metatarsal' },
    { id: 'gloves', label: 'Work Gloves', sub: 'Heavy Grip' },
    { id: 'gasDetector', label: 'Gas Monitor', sub: 'CH4/CO/O2' },
    { id: 'selfRescuer', label: 'Self-Rescuer', sub: 'FSR-60 O2' },
  ];

  // Calculate compliance across all items
  const isDetected = (part: PpePart): boolean => {
    if (part === 'helmet') return Boolean(ppe.helmet);
    if (part === 'vest') return Boolean(ppe.vest);
    if (part === 'boots') return Boolean(ppe.boots);
    if (part === 'gloves') return Boolean(ppe.gloves);
    if (part === 'capLamp') return ppe.capLamp !== undefined ? Boolean(ppe.capLamp) : Boolean(ppe.helmet);
    if (part === 'gasDetector') return ppe.gasDetector !== undefined ? Boolean(ppe.gasDetector) : true;
    if (part === 'selfRescuer') return ppe.selfRescuer !== undefined ? Boolean(ppe.selfRescuer) : true;
    return true;
  };

  const compliantCount = statutoryPpeItems.filter((i) => isDetected(i.id)).length;
  const isAllCompliant = compliantCount === statutoryPpeItems.length;

  const getHeartRateStyle = (hr: number, status: string) => {
    if (status === 'critical' || hr > 130) {
      return 'bg-[#FDF2F2] border-[#A83D45]/50 text-[#A83D45]';
    }
    if (status === 'elevated' || hr > 100) {
      return 'bg-[#FEF9E7] border-[#B47A18]/50 text-[#B47A18]';
    }
    return 'bg-[#EAF3EF] border-[#2D8A61]/30 text-[#2D8A61]';
  };

  const isFall = worker.vitals.movement === 'fall';

  const handleActionToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  return (
    <div className="bg-white border border-[#DCDAD4] rounded-2xl p-4 flex flex-col space-y-3.5 shadow-sm relative">
      {/* Action Confirmation Toast */}
      {toastMsg && (
        <div className="absolute top-2 left-1/2 -translate-x-1/2 z-30 bg-[#151713] text-white text-[11px] font-mono px-3 py-1.5 rounded-lg shadow-lg border border-[#2D8A61]/60 flex items-center space-x-2 animate-in fade-in slide-in-from-top-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#2D8A61]" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Panel Title & Worker Identification */}
      <div className="flex items-start justify-between border-b border-[#ECEBE6] pb-3">
        <div>
          <div className="text-[10px] text-[#666861] uppercase tracking-wider font-semibold flex items-center space-x-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#2D8A61] animate-pulse" />
            <span>Active Personnel Telemetry</span>
          </div>
          <div className="flex items-center space-x-2 mt-0.5">
            <h2 className="font-serif font-semibold text-lg text-[#151713]">
              {worker.name}
            </h2>
            <StatusBadge status={worker.status} size="sm" />
          </div>
          <div className="flex items-center space-x-2 text-xs text-[#666861] mt-0.5 font-mono">
            <span>ID: <strong className="text-[#151713]">{worker.id}</strong></span>
            <span>•</span>
            <span>{worker.role}</span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowHologramModal(!showHologramModal)}
          className="px-2.5 py-1.5 rounded-xl bg-[#FAF9F6] hover:bg-white border border-[#DCDAD4] text-[#176B4D] text-xs font-semibold flex items-center space-x-1.5 transition-all shadow-xs"
        >
          <Eye className="w-3.5 h-3.5 text-[#176B4D]" />
          <span>{showHologramModal ? 'Hide 3D' : '3D Model'}</span>
        </button>
      </div>

      {/* Optional In-Panel 3D PPE Hologram */}
      {showHologramModal && (
        <div className="rounded-xl overflow-hidden border border-[#DCDAD4] bg-[#F6F5F1] p-1 shadow-inner">
          <PpeHologram
            ppeStatus={worker.ppeStatus}
            onTogglePart={onTogglePpePart}
            compact={true}
            interactive={true}
            showHud={false}
          />
        </div>
      )}

      {/* Primary Biometrics Grid */}
      <div className="grid grid-cols-2 gap-2.5">
        {/* Heart Rate + Live ECG Waveform */}
        <div
          className={`p-3 rounded-xl border text-xs flex flex-col justify-between ${getHeartRateStyle(
            worker.vitals.heartRate,
            worker.vitals.heartRateStatus
          )}`}
        >
          <div className="text-[10px] uppercase flex items-center justify-between font-medium">
            <span className="flex items-center space-x-1">
              <Heart className="w-3 h-3 text-current" />
              <span>Heart Rate</span>
            </span>
            <span className="font-mono text-[9px] font-bold px-1.5 py-0.2 rounded bg-white/70">
              LIVE ECG
            </span>
          </div>

          <div className="flex items-baseline space-x-2 my-1">
            <span className="font-serif font-semibold text-2xl">
              {worker.vitals.heartRate}
            </span>
            <span className="text-xs font-sans font-normal text-[#666861]">BPM</span>
          </div>

          {/* Miniature Sweeping Waveform */}
          <div className="my-1">
            <EcgWaveform
              heartRate={worker.vitals.heartRate}
              status={worker.vitals.heartRateStatus}
            />
          </div>

          <div className="text-[10px] uppercase font-semibold mt-1">
            {worker.vitals.heartRateStatus === 'normal' ? 'Sinus Rhythm (Normal)' : 'Elevated Cardiac Load'}
          </div>
        </div>

        {/* SpO2 Blood Oxygen Saturation */}
        <div className="p-3 rounded-xl border border-[#ECEBE6] bg-[#FAF9F6] text-xs flex flex-col justify-between">
          <div className="text-[10px] uppercase flex items-center justify-between text-[#666861] font-medium">
            <span className="flex items-center space-x-1">
              <Activity className="w-3 h-3 text-[#176B4D]" />
              <span>Blood Oxygen</span>
            </span>
            <span className="font-mono text-[9px] font-semibold text-[#176B4D]">SpO2</span>
          </div>

          <div className="flex items-baseline space-x-1.5 my-1">
            <span className="font-serif font-semibold text-2xl text-[#151713]">
              {worker.vitals.spo2}
            </span>
            <span className="text-xs font-sans font-normal text-[#666861]">% Saturation</span>
          </div>

          {/* Calibrated Fill Bar with 90% Hypoxia Marker */}
          <div className="space-y-1">
            <div className="w-full h-2 rounded-full bg-[#E2E0D8] overflow-hidden relative">
              <div
                className={`h-full transition-all duration-500 rounded-full ${
                  worker.vitals.spo2 >= 95
                    ? 'bg-[#2D8A61]'
                    : worker.vitals.spo2 >= 90
                    ? 'bg-[#B47A18]'
                    : 'bg-[#A83D45]'
                }`}
                style={{ width: `${Math.min(100, worker.vitals.spo2)}%` }}
              />
              {/* 90% threshold marker */}
              <div
                className="absolute top-0 bottom-0 w-0.5 bg-[#A83D45] opacity-75"
                style={{ left: '90%' }}
                title="DGMS Critical Hypoxia Threshold (90%)"
              />
            </div>
            <div className="flex justify-between text-[9px] font-mono text-[#666861]">
              <span>85%</span>
              <span className="text-[#A83D45] font-bold">90% Limit</span>
              <span>100%</span>
            </div>
          </div>

          <div className="text-[10px] uppercase font-semibold text-[#666861] mt-1">
            {worker.vitals.spo2 >= 95 ? 'Optimal Saturation' : 'Hypoxia Alert (<95%)'}
          </div>
        </div>

        {/* Assigned Underground Sector */}
        <div className="p-3 rounded-xl bg-[#FAF9F6] border border-[#ECEBE6] text-xs flex flex-col justify-between">
          <div className="text-[10px] text-[#666861] uppercase flex items-center space-x-1 font-medium">
            <MapPin className="w-3 h-3 text-[#176B4D]" />
            <span>Assigned Sector</span>
          </div>
          <div className="font-serif font-semibold text-base text-[#151713] mt-1 uppercase flex items-center justify-between">
            <span>{worker.zoneId.toUpperCase()}</span>
            <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-[#EAF3EF] text-[#176B4D] border border-[#176B4D]/20">
              Active Shift
            </span>
          </div>
          <div className="text-[10px] text-[#666861]">Station 14+20 // Depth -260m</div>
        </div>

        {/* 6-Axis IMU Orientation & Deceleration */}
        <div
          className={`p-3 rounded-xl border text-xs flex flex-col justify-between ${
            isFall
              ? 'bg-[#FDF2F2] border-[#A83D45]/60 text-[#A83D45]'
              : 'bg-[#EAF3EF] border-[#2D8A61]/30 text-[#2D8A61]'
          }`}
        >
          <div className="text-[10px] uppercase flex items-center space-x-1 font-medium">
            <Activity className="w-3 h-3" />
            <span>6-Axis IMU Sensor</span>
          </div>
          <div className="font-serif font-semibold text-base my-0.5">
            {isFall ? 'FALL DETECTED ⚠' : 'UPRIGHT // 0.98g'}
          </div>
          <div className="text-[10px] uppercase font-semibold">
            {isFall ? 'High Deceleration Shock' : 'Nominal Posture'}
          </div>
        </div>
      </div>

      {/* Statutory 7-Point DGMS PPE Compliance Strip */}
      <div className="bg-[#FAF9F6] border border-[#DCDAD4] rounded-xl p-3 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-[#151713] font-semibold uppercase flex items-center space-x-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-[#176B4D]" />
            <span>DGMS 7-Point PPE Verification</span>
          </span>
          <span
            className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded ${
              isAllCompliant
                ? 'bg-[#EAF3EF] text-[#2D8A61] border border-[#2D8A61]/30'
                : 'bg-[#FDF2F2] text-[#A83D45] border border-[#A83D45]/30'
            }`}
          >
            {compliantCount}/7 VERIFIED {isAllCompliant ? '✓' : '⚠'}
          </span>
        </div>

        <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5 text-center text-xs">
          {statutoryPpeItems.map((item) => {
            const ok = isDetected(item.id);
            return (
              <div
                key={item.id}
                className={`p-1.5 rounded-lg border flex flex-col items-center justify-center transition-all ${
                  ok
                    ? 'bg-[#EAF3EF] border-[#2D8A61]/30 text-[#2D8A61]'
                    : 'bg-[#FDF2F2] border-[#A83D45]/40 text-[#A83D45]'
                }`}
                title={`${item.label} (${item.sub}): ${ok ? 'Verified Compliant' : 'Missing / Violation'}`}
              >
                <span className="text-[9px] font-semibold leading-tight line-clamp-1">
                  {item.label}
                </span>
                <span className="text-[7.5px] opacity-75 font-mono leading-tight">
                  {item.sub}
                </span>
                <div className="mt-1">
                  {ok ? (
                    <CheckCircle2 className="w-3 h-3 text-[#2D8A61]" />
                  ) : (
                    <XCircle className="w-3 h-3 text-[#A83D45]" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* LoRa Telemetry & Battery Indicator */}
      <div className="bg-white border border-[#ECEBE6] rounded-xl p-2.5 flex items-center justify-between text-xs font-mono text-[#666861]">
        <div className="flex items-center space-x-2">
          <Wifi className="w-3.5 h-3.5 text-[#176B4D]" />
          <span>LoRa: <strong className="text-[#151713]">-78 dBm (Ch 4)</strong></span>
        </div>
        <div className="flex items-center space-x-1.5">
          <Battery className="w-3.5 h-3.5 text-[#2D8A61]" />
          <span>Battery: <strong className="text-[#151713]">84%</strong></span>
        </div>
        <div className="text-[10px] text-[#2D8A61] font-semibold">
          ● SYNCED
        </div>
      </div>

      {/* Supervisor Quick Dispatch Actions */}
      <div className="grid grid-cols-2 gap-2 pt-1">
        <button
          type="button"
          onClick={() => handleActionToast(`Ping broadcast to ${worker.name}'s wearable via LoRa Mesh`)}
          className="px-3 py-2 rounded-xl bg-[#FAF9F6] hover:bg-white border border-[#DCDAD4] text-[#151713] text-xs font-semibold flex items-center justify-center space-x-1.5 shadow-2xs transition-colors"
        >
          <Radio className="w-3.5 h-3.5 text-[#176B4D]" />
          <span>Ping Wearable</span>
        </button>

        <button
          type="button"
          onClick={() => handleActionToast(`Surface recall notice issued for ${worker.id}`)}
          className="px-3 py-2 rounded-xl bg-[#FAF9F6] hover:bg-[#FEF9E7] border border-[#B47A18]/30 text-[#B47A18] text-xs font-semibold flex items-center justify-center space-x-1.5 shadow-2xs transition-colors"
        >
          <BellRing className="w-3.5 h-3.5 text-[#B47A18]" />
          <span>Recall to Surface</span>
        </button>
      </div>
    </div>
  );
};
