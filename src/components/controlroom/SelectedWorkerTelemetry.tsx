import React, { useState } from 'react';
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
} from 'lucide-react';

interface SelectedWorkerTelemetryProps {
  worker: Worker;
  onTogglePpePart?: (part: PpePart) => void;
}

export const SelectedWorkerTelemetry: React.FC<SelectedWorkerTelemetryProps> = ({
  worker,
  onTogglePpePart,
}) => {
  const [showHologramModal, setShowHologramModal] = useState(false);

  const ppe = worker.ppeStatus;
  const allPpe = ppe.helmet && ppe.vest && ppe.boots && ppe.gloves;

  const getHeartRateStyle = (hr: number, status: string) => {
    if (status === 'critical' || hr > 130) {
      return 'bg-[#FDF2F2] border-[#A83D45]/50 text-[#A83D45]';
    }
    if (status === 'elevated' || hr > 100) {
      return 'bg-[#FEF9E7] border-[#B47A18]/50 text-[#B47A18]';
    }
    return 'bg-[#EAF3EF] border-[#2D8A61]/30 text-[#2D8A61]';
  };

  const getSpo2Style = (spo2: number) => {
    if (spo2 < 90) return 'bg-[#FDF2F2] border-[#A83D45]/50 text-[#A83D45]';
    if (spo2 < 95) return 'bg-[#FEF9E7] border-[#B47A18]/50 text-[#B47A18]';
    return 'bg-[#FAF9F6] border-[#DCDAD4] text-[#151713]';
  };

  const isFall = worker.vitals.movement === 'fall';

  return (
    <div className="bg-white border border-[#DCDAD4] rounded-2xl p-4 flex flex-col space-y-3.5 shadow-sm">
      {/* Panel Title & Worker Identification */}
      <div className="flex items-start justify-between border-b border-[#ECEBE6] pb-3">
        <div>
          <div className="text-[10px] text-[#666861] uppercase tracking-wider font-semibold">
            Active Personnel Telemetry
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
          onClick={() => setShowHologramModal(!showHologramModal)}
          className="px-2.5 py-1 rounded-lg bg-[#FAF9F6] hover:bg-white border border-[#DCDAD4] text-[#176B4D] text-xs font-medium flex items-center space-x-1.5 transition-colors shadow-xs"
        >
          <Eye className="w-3.5 h-3.5 text-[#176B4D]" />
          <span>{showHologramModal ? 'Hide 3D' : '3D PPE'}</span>
        </button>
      </div>

      {/* Optional In-Panel 3D PPE Hologram */}
      {showHologramModal && (
        <div className="rounded-xl overflow-hidden border border-[#DCDAD4] bg-[#171A17]">
          <PpeHologram
            ppeStatus={worker.ppeStatus}
            onTogglePart={onTogglePpePart}
            compact={true}
            interactive={true}
            showHud={false}
          />
        </div>
      )}

      {/* Primary Biometrics Grid (Zone, Heart Rate, SpO2, Fall Status) */}
      <div className="grid grid-cols-2 gap-2.5">
        {/* Assigned Zone */}
        <div className="p-3 rounded-xl bg-[#FAF9F6] border border-[#ECEBE6] text-xs flex flex-col justify-between">
          <div className="text-[10px] text-[#666861] uppercase flex items-center space-x-1 font-medium">
            <MapPin className="w-3 h-3 text-[#176B4D]" />
            <span>Zone Location</span>
          </div>
          <div className="font-serif font-semibold text-base text-[#151713] mt-1 uppercase">
            {worker.zoneId.toUpperCase()}
          </div>
          <div className="text-[10px] text-[#666861]">Subterranean Sector</div>
        </div>

        {/* Live Heart Rate */}
        <div
          className={`p-3 rounded-xl border text-xs flex flex-col justify-between ${getHeartRateStyle(
            worker.vitals.heartRate,
            worker.vitals.heartRateStatus
          )}`}
        >
          <div className="text-[10px] uppercase flex items-center justify-between font-medium">
            <span className="flex items-center space-x-1">
              <Heart className="w-3 h-3" />
              <span>Heart Rate</span>
            </span>
            <span className="font-mono text-[9px] font-bold">LIVE</span>
          </div>
          <div className="font-serif font-semibold text-xl my-0.5">
            {worker.vitals.heartRate} <span className="text-xs font-sans font-normal text-[#666861]">BPM</span>
          </div>
          <div className="text-[10px] uppercase font-semibold">
            {worker.vitals.heartRateStatus === 'normal' ? 'Normal Rhythm' : 'Elevated Load'}
          </div>
        </div>

        {/* SpO2 Blood Oxygen */}
        <div
          className={`p-3 rounded-xl border text-xs flex flex-col justify-between ${getSpo2Style(
            worker.vitals.spo2
          )}`}
        >
          <div className="text-[10px] uppercase flex items-center justify-between text-[#666861] font-medium">
            <span>Blood Oxygen</span>
            <span className="font-mono text-[9px]">SpO2</span>
          </div>
          <div className="font-serif font-semibold text-xl my-0.5 text-[#151713]">
            {worker.vitals.spo2}%
          </div>
          <div className="text-[10px] uppercase font-semibold text-[#666861]">
            {worker.vitals.spo2 >= 95 ? 'Optimal Saturation' : 'Hypoxia Caution'}
          </div>
        </div>

        {/* Fall Status */}
        <div
          className={`p-3 rounded-xl border text-xs flex flex-col justify-between ${
            isFall
              ? 'bg-[#FDF2F2] border-[#A83D45]/60 text-[#A83D45]'
              : 'bg-[#EAF3EF] border-[#2D8A61]/30 text-[#2D8A61]'
          }`}
        >
          <div className="text-[10px] uppercase flex items-center space-x-1 font-medium">
            <Activity className="w-3 h-3" />
            <span>Orientation</span>
          </div>
          <div className="font-serif font-semibold text-base my-0.5">
            {isFall ? 'FALL DETECTED' : 'UPRIGHT // STABLE'}
          </div>
          <div className="text-[10px] uppercase font-semibold">
            {isFall ? 'Impact Deceleration' : 'Normal Orientation'}
          </div>
        </div>
      </div>

      {/* 4-Point PPE Compliance Strip */}
      <div className="bg-[#FAF9F6] border border-[#DCDAD4] rounded-xl p-3 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-[#151713] font-semibold uppercase flex items-center space-x-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-[#176B4D]" />
            <span>4-Point PPE Verification</span>
          </span>
          <span
            className={`font-mono text-[10px] font-bold ${
              allPpe ? 'text-[#2D8A61]' : 'text-[#A83D45]'
            }`}
          >
            {allPpe ? 'ALL COMPLIANT ✓' : 'VIOLATION ✕'}
          </span>
        </div>

        <div className="grid grid-cols-4 gap-2 text-center text-xs">
          {(['helmet', 'vest', 'gloves', 'boots'] as PpePart[]).map((part) => {
            const isDetected = worker.ppeStatus[part];
            return (
              <div
                key={part}
                className={`p-2 rounded-lg border flex flex-col items-center justify-center transition-all ${
                  isDetected
                    ? 'bg-[#EAF3EF] border-[#2D8A61]/40 text-[#2D8A61]'
                    : 'bg-[#FDF2F2] border-[#A83D45]/40 text-[#A83D45]'
                }`}
              >
                <span className="text-[9px] uppercase tracking-wide font-semibold">
                  {part}
                </span>
                <div className="mt-1">
                  {isDetected ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#2D8A61]" />
                  ) : (
                    <XCircle className="w-3.5 h-3.5 text-[#A83D45]" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer Info */}
      <div className="flex items-center justify-between text-[11px] text-[#666861] border-t border-[#ECEBE6] pt-2.5 font-mono">
        <span>Wearable: <strong className="text-[#151713]">{worker.wearableId}</strong></span>
        <span>Synced: <strong className="text-[#176B4D]">{worker.vitals.lastUpdate}</strong></span>
      </div>
    </div>
  );
};
