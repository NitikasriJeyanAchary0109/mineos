import React, { useState, useMemo } from 'react';
import { MobileLayout } from '../../components/mobile/MobileLayout';
import { useSafety } from '../../context/SafetyContext';
import { PpeHologram } from '../../components/shared/PpeHologram';
import { Worker } from '../../types/safety';
import { getWorkerSafetyScore } from '../../services/mobileTelemetryBridge';
import {
  Users,
  Search,
  Heart,
  Activity,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  MapPin,
  Wifi,
  Battery,
  Radio,
  BellRing,
  Wind,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
} from 'lucide-react';

// Animated ECG Waveform for Mobile Telemetry
const MobileEcgWaveform: React.FC<{ heartRate: number; isCritical: boolean }> = ({
  heartRate,
  isCritical,
}) => {
  const strokeColor = isCritical ? '#A83D45' : heartRate > 105 ? '#B47A18' : '#2D8A61';
  const speed = Math.max(0.4, Math.min(1.4, 60 / (heartRate || 72))).toFixed(2);

  return (
    <div className="relative w-full h-8 overflow-hidden rounded-xl bg-[#FAF9F6] border border-[#ECEBE6] flex items-center">
      <svg className="w-full h-full" viewBox="0 0 160 28" preserveAspectRatio="none">
        <path
          d="M 0,14 L 20,14 L 25,14 L 28,10 L 31,18 L 34,4 L 37,24 L 40,11 L 43,16 L 46,14 L 70,14 L 78,14 L 82,10 L 85,18 L 88,4 L 91,24 L 94,11 L 97,16 L 100,14 L 130,14 L 138,14 L 142,10 L 145,18 L 148,4 L 151,24 L 154,11 L 157,16 L 160,14"
          fill="none"
          stroke={strokeColor}
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <div
        className="absolute top-0 bottom-0 w-8 bg-gradient-to-r from-transparent via-white/80 to-transparent pointer-events-none"
        style={{ animation: `ecgSweep ${speed}s linear infinite` }}
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

export const MobileWorkersPage: React.FC = () => {
  const {
    workers,
    selectedWorkerId,
    setSelectedWorkerId,
    selectedWorker,
    environmentByZone,
  } = useSafety();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'safe' | 'attention' | 'critical'>('all');
  const [selectedZone, setSelectedZone] = useState<string>('all');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  // Filter workers list
  const filteredWorkers = useMemo(() => {
    return workers.filter((w) => {
      const q = searchQuery.trim().toLowerCase();
      const matchesQuery =
        !q ||
        w.name.toLowerCase().includes(q) ||
        w.id.toLowerCase().includes(q) ||
        w.role.toLowerCase().includes(q);

      const matchesZone = selectedZone === 'all' || w.zoneId === selectedZone;
      const matchesStatus = statusFilter === 'all' || w.status === statusFilter;

      return matchesQuery && matchesZone && matchesStatus;
    });
  }, [workers, searchQuery, selectedZone, statusFilter]);

  const ppe = selectedWorker.ppeStatus;

  // STRICTLY 4-POINT MANDATORY PPE: Helmet, Vest, Gloves, Boots
  const ppeList = [
    { label: 'HELMET', ok: Boolean(ppe.helmet), sub: 'DGMS Type-II Hard Hat' },
    { label: 'SAFETY VEST', ok: Boolean(ppe.vest), sub: 'High-Vis Retroreflective' },
    { label: 'GLOVES', ok: Boolean(ppe.gloves), sub: 'Heavy Grip Kevlar' },
    { label: 'SAFETY BOOTS', ok: Boolean(ppe.boots), sub: 'Steel Toe & Metatarsal' },
  ];

  const compliantCount = ppeList.filter((p) => p.ok).length;
  const isAllCompliant = compliantCount === 4;
  const isFall = selectedWorker.vitals.movement === 'fall';
  const isCritical = selectedWorker.status === 'critical' || isFall;
  const safetyScore = getWorkerSafetyScore(selectedWorker);

  const zoneEnv = environmentByZone[selectedWorker.zoneId] || { mq4: 240, temperature: 28 };
  const isGasSafe = (zoneEnv.mq4 || 0) < 250;

  return (
    <MobileLayout activeTab="workers">
      <div className="space-y-3.5 pb-2">
        {/* Toast Notification */}
        {toastMsg && (
          <div className="fixed top-14 left-1/2 -translate-x-1/2 z-50 bg-[#151713] text-white text-xs font-mono px-4 py-2 rounded-xl shadow-xl border border-[#2D8A61]/60 flex items-center space-x-2 animate-in fade-in">
            <span className="w-2 h-2 rounded-full bg-[#2D8A61]" />
            <span>{toastMsg}</span>
          </div>
        )}

        {/* ===================================================================== */}
        {/* 1. SELECTED WORKER TELEMETRY INSPECTION PROFILE (HERO CARD) */}
        {/* ===================================================================== */}
        <div className="bg-white border border-[#DCDAD4] rounded-2xl p-4 shadow-sm space-y-3">
          {/* Worker Identity Header */}
          <div className="flex items-start justify-between border-b border-[#ECEBE6] pb-2.5">
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="font-serif font-bold text-lg text-[#151713] leading-tight">
                  {selectedWorker.name}
                </h2>
                <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded bg-[#FAF9F6] border border-[#DCDAD4] text-[#176B4D]">
                  {selectedWorker.id}
                </span>
              </div>
              <div className="text-xs text-[#666861] mt-0.5 font-mono">
                {selectedWorker.role} • {selectedWorker.zoneId.replace('zone-', 'Zone ').toUpperCase()}
              </div>
            </div>

            <div className="flex flex-col items-end">
              <span
                className={`font-mono text-xs font-bold px-2.5 py-0.5 rounded ${
                  isCritical
                    ? 'bg-[#FDF2F2] text-[#A83D45] animate-pulse'
                    : selectedWorker.status === 'attention'
                    ? 'bg-[#FEF9E7] text-[#B47A18]'
                    : 'bg-[#EAF3EF] text-[#2D8A61]'
                }`}
              >
                ● {selectedWorker.status.toUpperCase()}
              </span>
              <span className="text-[10px] font-mono text-[#666861] mt-1">
                Score: <strong>{safetyScore}/100</strong>
              </span>
            </div>
          </div>

          {/* Real-Time Telemetry Grid (Large Readable Indicators) */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            {/* 1. Heart Rate */}
            <div className="bg-[#FAF9F6] p-2.5 rounded-xl border border-[#ECEBE6] space-y-1">
              <div className="flex items-center justify-between text-[#666861] font-mono text-[10px] uppercase">
                <span className="flex items-center space-x-1">
                  <Heart className="w-3.5 h-3.5 text-[#A83D45]" />
                  <span>HEART RATE</span>
                </span>
                <span className={selectedWorker.vitals.heartRate > 105 ? 'text-[#A83D45] font-bold' : 'text-[#2D8A61]'}>
                  {selectedWorker.vitals.heartRate > 105 ? 'Elevated' : 'Normal Rhythm'}
                </span>
              </div>
              <div className="font-serif font-bold text-xl text-[#151713]">
                {selectedWorker.vitals.heartRate} <span className="text-xs font-mono font-normal">BPM</span>
              </div>
              <MobileEcgWaveform
                heartRate={selectedWorker.vitals.heartRate}
                isCritical={isCritical}
              />
            </div>

            {/* 2. Blood Oxygen (SpO2) */}
            <div className="bg-[#FAF9F6] p-2.5 rounded-xl border border-[#ECEBE6] space-y-1">
              <div className="flex items-center justify-between text-[#666861] font-mono text-[10px] uppercase">
                <span className="flex items-center space-x-1">
                  <Activity className="w-3.5 h-3.5 text-[#176B4D]" />
                  <span>BLOOD OXYGEN</span>
                </span>
                <span className={selectedWorker.vitals.spo2 < 90 ? 'text-[#A83D45] font-bold' : 'text-[#2D8A61]'}>
                  {selectedWorker.vitals.spo2 < 90 ? 'Hypoxia' : 'Nominal Sat.'}
                </span>
              </div>
              <div className="font-serif font-bold text-xl text-[#151713]">
                {selectedWorker.vitals.spo2}%
              </div>
              <div className="w-full bg-[#DCDAD4] h-2 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all ${
                    selectedWorker.vitals.spo2 < 90
                      ? 'bg-[#A83D45]'
                      : selectedWorker.vitals.spo2 < 95
                      ? 'bg-[#B47A18]'
                      : 'bg-[#2D8A61]'
                  }`}
                  style={{ width: `${selectedWorker.vitals.spo2}%` }}
                />
              </div>
              <div className="text-[9px] font-mono text-[#666861] flex justify-between">
                <span>90% Cutoff</span>
                <span>100%</span>
              </div>
            </div>

            {/* 3. Motion / Fall Orientation */}
            <div className="bg-[#FAF9F6] p-2.5 rounded-xl border border-[#ECEBE6]">
              <div className="flex items-center justify-between text-[#666861] font-mono text-[10px] uppercase">
                <span>MOTION / FALL</span>
                <span className="font-mono text-[#151713]">0.98g</span>
              </div>
              <div className={`font-serif font-bold text-base mt-1 ${isFall ? 'text-[#A83D45]' : 'text-[#151713]'}`}>
                {isFall ? 'FALL DETECTED ⚠' : 'ACTIVE / UPRIGHT'}
              </div>
              <div className="text-[10px] text-[#666861] mt-0.5">
                {isFall ? 'Impact alert registered' : 'Normal body kinematics'}
              </div>
            </div>

            {/* 4. Gas & Environmental Sensor */}
            <div className="bg-[#FAF9F6] p-2.5 rounded-xl border border-[#ECEBE6]">
              <div className="flex items-center justify-between text-[#666861] font-mono text-[10px] uppercase">
                <span>GAS SENSOR</span>
                <span className="font-mono text-[#176B4D] font-bold">{zoneEnv.mq4 || 240} ppm</span>
              </div>
              <div className={`font-serif font-bold text-base mt-1 ${isGasSafe ? 'text-[#2D8A61]' : 'text-[#B47A18]'}`}>
                {isGasSafe ? 'SAFE' : 'ELEVATED CH4'}
              </div>
              <div className="text-[10px] text-[#666861] mt-0.5">
                {isGasSafe ? 'Air Safe (<250 ppm)' : 'Ventilation forced'}
              </div>
            </div>
          </div>

          {/* Comms & Battery Strip */}
          <div className="flex items-center justify-between text-[11px] font-mono text-[#666861] bg-[#FAF9F6] px-3 py-1.5 rounded-xl border border-[#ECEBE6]">
            <div className="flex items-center space-x-1.5">
              <Wifi className="w-3.5 h-3.5 text-[#176B4D]" />
              <span>LoRa: <strong className="text-[#151713]">-78 dBm (Strong)</strong></span>
            </div>
            <div className="flex items-center space-x-1.5">
              <Battery className="w-3.5 h-3.5 text-[#2D8A61]" />
              <span>Battery: <strong className="text-[#151713]">84%</strong></span>
            </div>
            <span className="text-[#2D8A61] font-bold">● SYNCED</span>
          </div>

          {/* ===================================================================== */}
          {/* MANDATORY 4-POINT PPE VERIFICATION & VISUAL MINER MODEL */}
          {/* ===================================================================== */}
          <div className="bg-[#FAF9F6] border border-[#DCDAD4] rounded-xl p-3 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1.5">
                <ShieldCheck className="w-4 h-4 text-[#176B4D]" />
                <span className="font-serif font-bold text-xs text-[#151713]">
                  Mandatory 4-Point PPE Verification
                </span>
              </div>
              <span
                className={`text-[10.5px] font-mono font-bold px-2 py-0.5 rounded ${
                  isAllCompliant
                    ? 'bg-[#EAF3EF] text-[#2D8A61] border border-[#2D8A61]/30'
                    : 'bg-[#FDF2F2] text-[#A83D45] border border-[#A83D45]/30'
                }`}
              >
                {compliantCount}/4 {isAllCompliant ? 'PASS ✓' : 'VIOLATION ⚠'}
              </span>
            </div>

            {/* Visual 3D Miner Model Container (Optimized for Mobile, ~160px height) */}
            <div className="relative w-full h-40 rounded-xl overflow-hidden border border-[#DCDAD4] bg-[#F6F5F1]">
              <PpeHologram
                ppeStatus={ppe}
                workerName={selectedWorker.name}
                interactive={false}
                compact={true}
                showHud={false}
              />
              <div className="absolute bottom-1.5 left-2 bg-white/90 backdrop-blur-xs px-2 py-0.5 rounded text-[9px] font-mono text-[#666861] border border-[#DCDAD4]">
                DGMS Standard Underground Coal Miner Model
              </div>
            </div>

            {/* 4 Items Verification Status Cards (Strictly Sensor Driven, No Manual Toggles) */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              {ppeList.map((item) => (
                <div
                  key={item.label}
                  className={`p-2 rounded-xl border flex items-center justify-between transition-colors ${
                    item.ok
                      ? 'bg-white border-[#2D8A61]/40 text-[#151713]'
                      : 'bg-[#FDF2F2] border-[#A83D45]/40 text-[#A83D45]'
                  }`}
                >
                  <div>
                    <div className="font-bold text-[11px] leading-tight">
                      {item.label}
                    </div>
                    <div className="text-[9px] font-mono text-[#666861]">
                      {item.sub}
                    </div>
                  </div>

                  <div className="shrink-0 ml-1">
                    {item.ok ? (
                      <span className="text-[10px] font-mono font-bold text-[#2D8A61] flex items-center space-x-0.5">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>DETECTED</span>
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono font-bold text-[#A83D45] flex items-center space-x-0.5">
                        <XCircle className="w-3.5 h-3.5" />
                        <span>MISSING</span>
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="text-[9.5px] font-mono text-[#666861] text-center">
              Statutory: Automatic smart-sensor & tag detection. Manual override disabled.
            </div>
          </div>

          {/* Quick Supervisor Dispatch Actions */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              type="button"
              onClick={() => showToast(`Ping sent to ${selectedWorker.name}'s wearable device`)}
              className="py-2 px-3 rounded-xl bg-[#FAF9F6] border border-[#DCDAD4] text-xs font-semibold text-[#151713] flex items-center justify-center space-x-1.5 active:bg-white shadow-2xs"
            >
              <Radio className="w-3.5 h-3.5 text-[#176B4D]" />
              <span>Ping Wearable</span>
            </button>

            <button
              type="button"
              onClick={() => showToast(`Surface recall notice transmitted for ${selectedWorker.id}`)}
              className="py-2 px-3 rounded-xl bg-[#FAF9F6] border border-[#B47A18]/30 text-xs font-semibold text-[#B47A18] flex items-center justify-center space-x-1.5 active:bg-[#FEF9E7] shadow-2xs"
            >
              <BellRing className="w-3.5 h-3.5 text-[#B47A18]" />
              <span>Recall to Surface</span>
            </button>
          </div>
        </div>

        {/* ===================================================================== */}
        {/* 2. MOBILE-FRIENDLY WORKER LIST & SEARCH */}
        {/* ===================================================================== */}
        <div className="bg-white border border-[#DCDAD4] rounded-2xl p-3.5 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-[#ECEBE6] pb-2">
            <div className="flex items-center space-x-2">
              <Users className="w-4 h-4 text-[#176B4D]" />
              <h3 className="font-serif font-bold text-sm text-[#151713]">
                Colliery Worker Directory ({filteredWorkers.length})
              </h3>
            </div>
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-[#666861] absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search miners by name, ID, or role..."
              className="w-full bg-[#FAF9F6] border border-[#DCDAD4] rounded-xl pl-8 pr-3 py-1.5 text-xs font-mono focus:outline-none focus:border-[#176B4D] focus:bg-white"
            />
          </div>

          {/* Status Filter Tabs */}
          <div className="grid grid-cols-4 gap-1 p-0.5 bg-[#FAF9F6] border border-[#ECEBE6] rounded-xl text-[10px] font-mono">
            {(['all', 'safe', 'attention', 'critical'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`py-1 rounded-lg text-center font-bold capitalize transition-all ${
                  statusFilter === s
                    ? s === 'critical'
                      ? 'bg-[#A83D45] text-white shadow-2xs'
                      : s === 'attention'
                      ? 'bg-[#B47A18] text-white shadow-2xs'
                      : 'bg-[#176B4D] text-white shadow-2xs'
                    : 'text-[#666861]'
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          {/* Worker Cards List */}
          <div className="space-y-2">
            {filteredWorkers.map((w) => {
              const isSelected = w.id === selectedWorkerId;
              const isCrit = w.status === 'critical';
              const pCount =
                (w.ppeStatus.helmet ? 1 : 0) +
                (w.ppeStatus.vest ? 1 : 0) +
                (w.ppeStatus.gloves ? 1 : 0) +
                (w.ppeStatus.boots ? 1 : 0);

              return (
                <div
                  key={w.id}
                  onClick={() => setSelectedWorkerId(w.id)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                    isSelected
                      ? 'bg-[#EAF3EF] border-[#176B4D] ring-2 ring-[#176B4D]/20 shadow-xs'
                      : isCrit
                      ? 'bg-[#FDF2F2] border-[#A83D45]/40'
                      : 'bg-[#FAF9F6] border-[#ECEBE6] active:bg-white'
                  }`}
                >
                  <div className="flex items-center space-x-2.5 min-w-0">
                    <span
                      className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                        isCrit
                          ? 'bg-[#A83D45] animate-ping'
                          : w.status === 'attention'
                          ? 'bg-[#B47A18]'
                          : 'bg-[#2D8A61]'
                      }`}
                    />
                    <div className="min-w-0">
                      <div className="font-bold text-xs text-[#151713] truncate">
                        {w.name}
                      </div>
                      <div className="text-[10px] text-[#666861] font-mono truncate">
                        {w.id} • {w.zoneId.replace('zone-', 'Zone ').toUpperCase()}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0 text-right">
                    <div>
                      <div className="font-mono text-xs font-bold text-[#151713]">
                        {w.vitals.heartRate} <span className="text-[9px] font-normal text-[#666861]">BPM</span>
                      </div>
                      <div
                        className={`text-[9.5px] font-mono font-semibold ${
                          pCount === 4 ? 'text-[#2D8A61]' : 'text-[#A83D45]'
                        }`}
                      >
                        PPE {pCount}/4 {pCount === 4 ? '✓' : '⚠'}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </MobileLayout>
  );
};
