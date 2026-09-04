import React, { useState } from 'react';
import { Worker, PpePart } from '../../types/safety';
import { StatusBadge } from '../shared/StatusBadge';
import { PpeHologram } from '../shared/PpeHologram';
import {
  Heart,
  Activity,
  MapPin,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Eye,
  Radio,
  Battery,
  BellRing,
  Wifi,
} from 'lucide-react';

interface SelectedWorkerTelemetryProps {
  worker: Worker;
  onTogglePpePart?: (part: PpePart) => void;
}

// Compact ECG Waveform
const CompactEcgWaveform: React.FC<{ heartRate: number; status: 'normal' | 'elevated' | 'critical' }> = ({
  heartRate,
  status,
}) => {
  const strokeColor =
    status === 'critical' ? '#A83D45' : status === 'elevated' ? '#B47A18' : '#2D8A61';

  const animDuration = Math.max(0.4, Math.min(1.4, 60 / (heartRate || 72))).toFixed(2);

  return (
    <div className="relative w-full h-6 overflow-hidden rounded bg-[#FAF9F6] border border-[#ECEBE6] flex items-center">
      <svg className="w-full h-full" viewBox="0 0 160 24" preserveAspectRatio="none">
        <path
          d="M 0,12 L 20,12 L 25,12 L 28,9 L 31,15 L 34,3 L 37,21 L 40,10 L 43,14 L 46,12 L 70,12 L 78,12 L 82,9 L 85,15 L 88,3 L 91,21 L 94,10 L 97,14 L 100,12 L 130,12 L 138,12 L 142,9 L 145,15 L 148,3 L 151,21 L 154,10 L 157,14 L 160,12"
          fill="none"
          stroke={strokeColor}
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <div
        className="absolute top-0 bottom-0 w-6 bg-gradient-to-r from-transparent via-white/80 to-transparent pointer-events-none"
        style={{
          animation: `ecgSweep ${animDuration}s linear infinite`,
        }}
      />
      <style>{`
        @keyframes ecgSweep {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200px); }
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

  // STRICTLY 4-POINT PPE ITEMS: Helmet, Vest, Gloves, Boots
  const ppeList: Array<{ id: PpePart; label: string; ok: boolean }> = [
    { id: 'helmet', label: 'Helmet', ok: Boolean(ppe.helmet) },
    { id: 'vest', label: 'Safety Vest', ok: Boolean(ppe.vest) },
    { id: 'gloves', label: 'Gloves', ok: Boolean(ppe.gloves) },
    { id: 'boots', label: 'Boots', ok: Boolean(ppe.boots) },
  ];

  const compliantCount = ppeList.filter((item) => item.ok).length;
  const allCompliant = compliantCount === 4;

  const getHeartRateStyle = (hr: number, status: string) => {
    if (status === 'critical' || hr > 130) return 'bg-[#FDF2F2] border-[#A83D45]/40 text-[#A83D45]';
    if (status === 'elevated' || hr > 100) return 'bg-[#FEF9E7] border-[#B47A18]/40 text-[#B47A18]';
    return 'bg-[#FAF9F6] border-[#ECEBE6] text-[#151713]';
  };

  const isFall = worker.vitals.movement === 'fall';

  const handleActionToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  return (
    <div className="bg-white border border-[#DCDAD4] rounded-2xl p-3.5 flex flex-col justify-between shadow-sm relative h-full space-y-2.5">
      {/* Action Toast */}
      {toastMsg && (
        <div className="absolute top-2 left-1/2 -translate-x-1/2 z-30 bg-[#151713] text-white text-[10.5px] font-mono px-3 py-1 rounded-lg shadow-lg border border-[#2D8A61]/60 flex items-center space-x-1.5 animate-in fade-in">
          <span className="w-1.5 h-1.5 rounded-full bg-[#2D8A61]" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header: Name, Status & 3D Toggle */}
      <div className="flex items-start justify-between border-b border-[#ECEBE6] pb-2">
        <div>
          <div className="text-[10px] text-[#666861] uppercase tracking-wider font-semibold flex items-center space-x-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#2D8A61] animate-pulse" />
            <span>Active Worker Telemetry</span>
          </div>
          <div className="flex items-center space-x-2 mt-0.5">
            <h2 className="font-serif font-semibold text-base text-[#151713] leading-tight">
              {worker.name}
            </h2>
            <StatusBadge status={worker.status} size="sm" />
          </div>
          <div className="flex items-center space-x-2 text-[11px] text-[#666861] font-mono">
            <span>ID: <strong className="text-[#151713]">{worker.id}</strong></span>
            <span>•</span>
            <span className="truncate max-w-[130px]">{worker.role}</span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowHologramModal(!showHologramModal)}
          className="px-2 py-1 rounded-lg bg-[#FAF9F6] hover:bg-white border border-[#DCDAD4] text-[#176B4D] text-[11px] font-semibold flex items-center space-x-1 transition-all shadow-2xs shrink-0"
        >
          <Eye className="w-3 h-3 text-[#176B4D]" />
          <span>{showHologramModal ? 'Close 3D' : '3D Model'}</span>
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

      {/* Primary Biometrics: Heart Rate & SpO2 */}
      <div className="grid grid-cols-2 gap-2">
        {/* Heart Rate */}
        <div className={`p-2.5 rounded-xl border flex flex-col justify-between ${getHeartRateStyle(worker.vitals.heartRate, worker.vitals.heartRateStatus)}`}>
          <div className="flex items-center justify-between text-[10px] uppercase font-semibold">
            <span className="flex items-center space-x-1">
              <Heart className="w-3 h-3 text-current" />
              <span>Heart Rate</span>
            </span>
            <span className="font-mono text-[9px] opacity-75">LIVE</span>
          </div>
          <div className="flex items-baseline space-x-1 my-0.5">
            <span className="font-serif font-bold text-xl">{worker.vitals.heartRate}</span>
            <span className="text-[10px] text-[#666861]">BPM</span>
          </div>
          <CompactEcgWaveform heartRate={worker.vitals.heartRate} status={worker.vitals.heartRateStatus} />
        </div>

        {/* SpO2 Blood Oxygen */}
        <div className="p-2.5 rounded-xl border border-[#ECEBE6] bg-[#FAF9F6] flex flex-col justify-between">
          <div className="flex items-center justify-between text-[10px] uppercase font-semibold text-[#666861]">
            <span className="flex items-center space-x-1">
              <Activity className="w-3 h-3 text-[#176B4D]" />
              <span>Oxygen</span>
            </span>
            <span className="font-mono text-[9px] text-[#176B4D]">SpO2</span>
          </div>
          <div className="flex items-baseline space-x-1 my-0.5">
            <span className="font-serif font-bold text-xl text-[#151713]">{worker.vitals.spo2}</span>
            <span className="text-[10px] text-[#666861]">%</span>
          </div>
          <div className="space-y-0.5">
            <div className="w-full h-1.5 rounded-full bg-[#E2E0D8] overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  worker.vitals.spo2 >= 95 ? 'bg-[#2D8A61]' : worker.vitals.spo2 >= 90 ? 'bg-[#B47A18]' : 'bg-[#A83D45]'
                }`}
                style={{ width: `${Math.min(100, worker.vitals.spo2)}%` }}
              />
            </div>
            <div className="flex justify-between text-[8px] font-mono text-[#666861]">
              <span>85%</span>
              <span className="text-[#A83D45]">90% Limit</span>
              <span>100%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Sector Location & 6-Axis Orientation */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="p-2 rounded-xl bg-[#FAF9F6] border border-[#ECEBE6] flex items-center justify-between">
          <div className="flex items-center space-x-1.5">
            <MapPin className="w-3.5 h-3.5 text-[#176B4D]" />
            <div>
              <div className="text-[9px] text-[#666861] uppercase font-semibold">Sector</div>
              <div className="font-serif font-bold text-xs text-[#151713] uppercase">{worker.zoneId}</div>
            </div>
          </div>
          <span className="text-[9px] font-mono bg-[#EAF3EF] text-[#176B4D] px-1.5 py-0.2 rounded font-semibold">
            Active
          </span>
        </div>

        <div className={`p-2 rounded-xl border flex items-center justify-between ${
          isFall ? 'bg-[#FDF2F2] border-[#A83D45]/60 text-[#A83D45]' : 'bg-[#FAF9F6] border-[#ECEBE6]'
        }`}>
          <div className="flex items-center space-x-1.5">
            <Activity className="w-3.5 h-3.5 text-[#176B4D]" />
            <div>
              <div className="text-[9px] text-[#666861] uppercase font-semibold">Orientation</div>
              <div className="font-serif font-bold text-xs">{isFall ? 'FALL ⚠' : 'UPRIGHT'}</div>
            </div>
          </div>
          <span className="text-[9px] font-mono text-[#666861]">0.98g</span>
        </div>
      </div>

      {/* 4-POINT PPE VERIFICATION (Helmet, Vest, Gloves, Boots) */}
      <div className="bg-[#FAF9F6] border border-[#DCDAD4] rounded-xl p-2.5 space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="text-[#151713] font-semibold text-[11px] uppercase flex items-center space-x-1">
            <ShieldCheck className="w-3.5 h-3.5 text-[#176B4D]" />
            <span>4-Point PPE Verification</span>
          </span>
          <span
            className={`font-mono text-[9.5px] font-bold px-1.5 py-0.2 rounded ${
              allCompliant
                ? 'bg-[#EAF3EF] text-[#2D8A61] border border-[#2D8A61]/30'
                : 'bg-[#FDF2F2] text-[#A83D45] border border-[#A83D45]/30'
            }`}
          >
            {compliantCount}/4 {allCompliant ? 'PASS ✓' : 'VIOLATION ⚠'}
          </span>
        </div>

        <div className="grid grid-cols-4 gap-1.5 text-center text-xs">
          {ppeList.map((item) => (
            <div
              key={item.id}
              className={`p-1.5 rounded-lg border flex flex-col items-center justify-center transition-all ${
                item.ok
                  ? 'bg-white border-[#2D8A61]/40 text-[#2D8A61]'
                  : 'bg-[#FDF2F2] border-[#A83D45]/40 text-[#A83D45]'
              }`}
            >
              <span className="text-[9.5px] font-semibold leading-tight">{item.label}</span>
              <div className="mt-0.5">
                {item.ok ? (
                  <CheckCircle2 className="w-3 h-3 text-[#2D8A61]" />
                ) : (
                  <XCircle className="w-3 h-3 text-[#A83D45]" />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* LoRa Telemetry & Battery */}
      <div className="flex items-center justify-between text-[10.5px] font-mono text-[#666861] bg-[#FAF9F6] px-2.5 py-1.5 rounded-xl border border-[#ECEBE6]">
        <div className="flex items-center space-x-1">
          <Wifi className="w-3 h-3 text-[#176B4D]" />
          <span>LoRa: <strong className="text-[#151713]">-78 dBm</strong></span>
        </div>
        <div className="flex items-center space-x-1">
          <Battery className="w-3 h-3 text-[#2D8A61]" />
          <span>Battery: <strong className="text-[#151713]">84%</strong></span>
        </div>
        <span className="text-[9.5px] text-[#2D8A61] font-bold">● SYNCED</span>
      </div>

      {/* Quick Dispatch Action Buttons */}
      <div className="grid grid-cols-2 gap-1.5 pt-0.5">
        <button
          type="button"
          onClick={() => handleActionToast(`Ping sent to ${worker.name} via LoRa Mesh`)}
          className="px-2.5 py-1.5 rounded-xl bg-[#FAF9F6] hover:bg-white border border-[#DCDAD4] text-[#151713] text-[11px] font-semibold flex items-center justify-center space-x-1 transition-colors shadow-2xs"
        >
          <Radio className="w-3 h-3 text-[#176B4D]" />
          <span>Ping Wearable</span>
        </button>

        <button
          type="button"
          onClick={() => handleActionToast(`Surface recall notice issued for ${worker.id}`)}
          className="px-2.5 py-1.5 rounded-xl bg-[#FAF9F6] hover:bg-[#FEF9E7] border border-[#B47A18]/30 text-[#B47A18] text-[11px] font-semibold flex items-center justify-center space-x-1 transition-colors shadow-2xs"
        >
          <BellRing className="w-3 h-3 text-[#B47A18]" />
          <span>Recall to Surface</span>
        </button>
      </div>
    </div>
  );
};
