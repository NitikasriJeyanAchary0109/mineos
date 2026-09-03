import React, { useMemo, useState } from 'react';
import { Worker } from '../../types/safety';
import { PpeHologram } from '../shared/PpeHologram';
import { notificationService } from '../../utils/notificationService';
import { useSafety } from '../../context/SafetyContext';
import {
  getSafetyScore,
  getZeroHarmStreak,
  getViolationsCount,
  getPpeCompliance,
  isRepeatOffender,
  getEscalationStatus,
  getLeaderboard,
  getWorkerRecommendations,
} from '../../utils/safetyScoring';
import confetti from 'canvas-confetti';
import {
  Heart,
  Wind,
  Activity,
  Radio,
  Clock,
  Battery,
  Shield,
  ShieldCheck,
  ShieldAlert,
  MapPin,
  Cpu,
  CheckCircle2,
  XCircle,
  HardHat,
  AlertTriangle,
  Flame,
  Check,
  X,
  History,
  Award,
  Send,
  BellRing,
  Sparkles,
  AlertOctagon,
  FileCheck2,
  TrendingUp,
} from 'lucide-react';

interface WorkerDetailPanelProps {
  worker: Worker;
  onTogglePpePart?: (part: any) => void; // Deprecated: UI is strictly read-only
  onClose?: () => void;
}

export const WorkerDetailPanel: React.FC<WorkerDetailPanelProps> = ({
  worker,
  onClose,
}) => {
  const { workers } = useSafety();
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const ppe = worker.ppeStatus;

  // Derived safety data from single source of truth
  const safetyScore = useMemo(() => getSafetyScore(worker), [worker]);
  const zeroHarmData = useMemo(() => getZeroHarmStreak(worker), [worker]);
  const violationsCount = useMemo(() => getViolationsCount(worker), [worker]);
  const ppeCompliance = useMemo(() => getPpeCompliance(worker), [worker]);
  const isOffender = useMemo(() => isRepeatOffender(worker), [worker]);
  const escalationDetails = useMemo(() => getEscalationStatus(worker), [worker]);
  const leaderboard = useMemo(() => getLeaderboard(workers), [workers]);
  const recommendationsData = useMemo(
    () => getWorkerRecommendations(worker, workers),
    [worker, workers]
  );

  // Calculate 4-point verified count
  const verifiedCount = useMemo(() => {
    let count = 0;
    if (ppe.helmet) count++;
    if (ppe.vest) count++;
    if (ppe.gloves) count++;
    if (ppe.boots) count++;
    return count;
  }, [ppe]);

  const isCompliant = verifiedCount === 4;

  const missingItems = useMemo(() => {
    const list: string[] = [];
    if (!ppe.helmet) list.push('Helmet');
    if (!ppe.vest) list.push('Safety Vest');
    if (!ppe.gloves) list.push('Protective Gloves');
    if (!ppe.boots) list.push('Steel-Toe Boots');
    return list;
  }, [ppe]);

  // Status-driven styling helpers
  const getHeartRateStyle = (status: string) => {
    if (status === 'critical') return 'text-[#A83D45] bg-[#FDF2F2] border-[#A83D45]/40';
    if (status === 'elevated') return 'text-[#B47A18] bg-[#FEF9E7] border-[#B47A18]/40';
    return 'text-[#151713] bg-[#FAF9F6] border-[#ECEBE6]';
  };

  const getGasStyle = (level: string) => {
    if (level === 'danger') return 'text-[#A83D45] bg-[#FDF2F2] border-[#A83D45]/40';
    if (level === 'warning') return 'text-[#B47A18] bg-[#FEF9E7] border-[#B47A18]/40';
    return 'text-[#151713] bg-[#FAF9F6] border-[#ECEBE6]';
  };

  const getMovementStyle = (movement: string) => {
    if (movement === 'fall') return 'text-[#A83D45] bg-[#FDF2F2] border-[#A83D45]/40';
    if (movement === 'stationary') return 'text-[#B47A18] bg-[#FEF9E7] border-[#B47A18]/40';
    return 'text-[#151713] bg-[#FAF9F6] border-[#ECEBE6]';
  };

  // 4 Read-Only PPE Status Panels Configuration
  const ppePanels = [
    {
      id: 'helmet',
      name: 'HELMET',
      detected: ppe.helmet,
      lastSeen: '2 sec ago',
      detail: 'Class E • Cap Lamp Active',
    },
    {
      id: 'vest',
      name: 'VEST',
      detected: ppe.vest,
      lastSeen: '2 sec ago',
      detail: 'EN ISO 20471 Class 3 High-Vis',
    },
    {
      id: 'gloves',
      name: 'GLOVES',
      detected: ppe.gloves,
      lastSeen: '2 sec ago',
      detail: 'Cut Level 5 Metatarsal Grip',
    },
    {
      id: 'boots',
      name: 'BOOTS',
      detected: ppe.boots,
      lastSeen: '3 sec ago',
      detail: 'Steel-Toe Metatarsal Guard',
    },
  ];

  return (
    <div className="bg-white border border-[#DCDAD4] rounded-2xl p-5 flex flex-col space-y-5 shadow-sm">
      {/* ================= 1. SELECTED WORKER IDENTITY HEADER ================= */}
      <div className="flex items-start justify-between border-b border-[#ECEBE6] pb-3.5">
        <div>
          <div className="text-[10px] text-[#666861] uppercase tracking-wider font-semibold font-mono">
            Selected Worker
          </div>
          <div className="flex items-center space-x-2 mt-0.5">
            <h2 className="font-serif font-bold text-xl sm:text-2xl text-[#151713]">
              {worker.name}
            </h2>
            <span
              className={`px-2.5 py-0.5 rounded-lg text-xs font-semibold uppercase tracking-wide border ${
                worker.status === 'critical'
                  ? 'bg-[#FDF2F2] text-[#A83D45] border-[#A83D45]/30'
                  : worker.status === 'attention'
                  ? 'bg-[#FEF9E7] text-[#B47A18] border-[#B47A18]/30'
                  : 'bg-[#EAF3EF] text-[#2D8A61] border-[#2D8A61]/30'
              }`}
            >
              {worker.status === 'critical'
                ? 'Critical Distress'
                : worker.status === 'attention'
                ? 'Attention Required'
                : 'Verified Safe'}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-x-2.5 text-xs text-[#666861] mt-1 font-mono">
            <span>
              ID: <strong className="text-[#151713]">{worker.id}</strong>
            </span>
            <span>•</span>
            <span>
              Role: <strong className="text-[#151713]">{worker.role}</strong>
            </span>
            <span>•</span>
            <span>
              Shift: <strong className="text-[#151713]">{worker.shift}</strong>
            </span>
          </div>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="text-[#666861] hover:text-[#151713] p-1.5 rounded-lg hover:bg-[#FAF9F6] border border-transparent hover:border-[#DCDAD4]"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Location & Wearable Hub Info */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
        <div className="bg-[#FAF9F6] border border-[#ECEBE6] p-2.5 rounded-xl">
          <div className="text-[10px] text-[#666861] uppercase font-semibold flex items-center space-x-1">
            <MapPin className="w-3 h-3 text-[#176B4D]" />
            <span>Assigned Location</span>
          </div>
          <div className="font-semibold text-[#151713] uppercase font-mono mt-0.5">
            {worker.zoneId.toUpperCase()}
          </div>
        </div>

        <div className="bg-[#FAF9F6] border border-[#ECEBE6] p-2.5 rounded-xl">
          <div className="text-[10px] text-[#666861] uppercase font-semibold flex items-center space-x-1">
            <Cpu className="w-3 h-3 text-[#176B4D]" />
            <span>Wearable Hub</span>
          </div>
          <div className="font-semibold text-[#151713] font-mono mt-0.5">
            {worker.wearableId}
          </div>
        </div>

        <div className="bg-[#FAF9F6] border border-[#ECEBE6] p-2.5 rounded-xl">
          <div className="text-[10px] text-[#666861] uppercase font-semibold flex items-center space-x-1">
            <Radio className="w-3 h-3 text-[#176B4D]" />
            <span>LoRa Mesh</span>
          </div>
          <div className="font-semibold text-[#2D8A61] font-mono mt-0.5 uppercase">
            {worker.vitals.loraSignal} (-78dBm)
          </div>
        </div>

        <div className="bg-[#FAF9F6] border border-[#ECEBE6] p-2.5 rounded-xl">
          <div className="text-[10px] text-[#666861] uppercase font-semibold flex items-center space-x-1">
            <Clock className="w-3 h-3 text-[#176B4D]" />
            <span>Underground Ingress</span>
          </div>
          <div className="font-semibold text-[#151713] font-mono mt-0.5">
            {worker.entryTime}
          </div>
        </div>
      </div>

      {/* ================= 2. PPE VERIFICATION (3D MODEL + 4 CARDS) ================= */}
      <div className="space-y-3">
        <div className="flex items-center justify-between border-b border-[#ECEBE6] pb-2">
          <div className="flex items-center space-x-2">
            <HardHat className="w-4 h-4 text-[#176B4D]" />
            <span className="font-serif font-semibold text-sm text-[#151713]">
              PPE Verification
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <span
              className={`px-2.5 py-0.5 rounded-xl text-xs font-mono font-bold border ${
                isCompliant
                  ? 'bg-[#EAF3EF] text-[#2D8A61] border-[#2D8A61]/30'
                  : 'bg-[#FDF2F2] text-[#A83D45] border-[#A83D45]/30 animate-pulse'
              }`}
            >
              {verifiedCount} / 4 DETECTED
            </span>
            <div className="flex items-center space-x-1.5 bg-[#EAF3EF] border border-[#2D8A61]/30 px-2 py-0.5 rounded-xl text-[11px] font-mono font-semibold text-[#2D8A61]">
              <span className="w-2 h-2 rounded-full bg-[#2D8A61] animate-pulse" />
              <span>LIVE</span>
            </div>
          </div>
        </div>

        {/* 3D Worker Model with Callouts */}
        <div className="rounded-2xl overflow-hidden border border-[#DCDAD4] bg-[#F5F4F0] shadow-xs">
          <PpeHologram
            ppeStatus={worker.ppeStatus}
            workerName={worker.name}
            compact={true}
            showHud={false}
          />
        </div>

        {/* 4 Read-Only Status Panels */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {ppePanels.map((p) => (
            <div
              key={p.id}
              className={`p-2.5 rounded-xl border flex flex-col justify-between ${
                p.detected
                  ? 'bg-[#FAF9F6] border-[#ECEBE6]'
                  : 'bg-[#FDF2F2] border-[#A83D45]/40'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-serif font-bold text-xs text-[#151713]">
                  {p.name}
                </span>
                <span
                  className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded ${
                    p.detected
                      ? 'bg-[#EAF3EF] text-[#2D8A61]'
                      : 'bg-[#A83D45] text-white'
                  }`}
                >
                  {p.detected ? '✓ PASS' : '✕ MISSING'}
                </span>
              </div>
              <div className="text-[10px] text-[#666861] mt-1 truncate">
                {p.detail}
              </div>
            </div>
          ))}
        </div>

        {/* Overall Compliance Banner */}
        <div
          className={`p-3 rounded-xl border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs ${
            isCompliant
              ? 'bg-[#EAF3EF] border-[#2D8A61]/30 text-[#151713]'
              : 'bg-[#FDF2F2] border-[#A83D45]/50 text-[#A83D45]'
          }`}
        >
          <div className="flex items-center space-x-2">
            {isCompliant ? (
              <ShieldCheck className="w-5 h-5 text-[#2D8A61] shrink-0" />
            ) : (
              <ShieldAlert className="w-5 h-5 text-[#A83D45] shrink-0" />
            )}
            <div>
              <div className="font-serif font-bold text-sm">
                PPE COMPLIANCE: {ppeCompliance}% ({verifiedCount} / 4 DETECTED)
              </div>
              <div className="text-[11px] opacity-90">
                {isCompliant
                  ? 'All 4 mandatory personal protective gear items verified at turnstile.'
                  : `PPE NON-COMPLIANCE: ${missingItems.join(', ').toUpperCase()} NOT DETECTED.`}
              </div>
            </div>
          </div>

          <span
            className={`px-3 py-1 rounded-lg text-xs font-mono font-bold uppercase tracking-wider shrink-0 ${
              isCompliant ? 'bg-[#2D8A61] text-white' : 'bg-[#A83D45] text-white'
            }`}
          >
            {isCompliant ? 'COMPLIANT' : 'NON-COMPLIANT'}
          </span>
        </div>
      </div>

      {/* ================= 3. SAFETY PERFORMANCE (DERIVED METRICS) ================= */}
      <div className="bg-[#FAF9F6] border border-[#ECEBE6] rounded-2xl p-4 space-y-3">
        <div className="flex items-center justify-between border-b border-[#ECEBE6] pb-2">
          <div className="text-xs text-[#666861] uppercase font-semibold font-serif tracking-wider flex items-center space-x-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-[#176B4D]" />
            <span>SAFETY PERFORMANCE</span>
          </div>
          <span className="text-[10px] font-mono text-[#666861]">
            Derived Mathematical Telemetry
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* Safety Score */}
          <div className="bg-white border border-[#DCDAD4] p-3 rounded-xl shadow-2xs">
            <div className="text-[10px] uppercase font-mono text-[#666861]">
              Safety Score
            </div>
            <div className="font-serif font-bold text-2xl text-[#176B4D] mt-0.5">
              {safetyScore}{' '}
              <span className="text-xs font-normal text-[#666861]">/ 100</span>
            </div>
            <div className="text-[10px] text-[#2D8A61] mt-0.5 font-mono">
              Composite Rating
            </div>
          </div>

          {/* Zero-Harm Streak */}
          <div className="bg-white border border-[#DCDAD4] p-3 rounded-xl shadow-2xs">
            <div className="text-[10px] uppercase font-mono text-[#666861]">
              Zero-Harm Streak
            </div>
            <div className="font-serif font-bold text-2xl text-[#151713] mt-0.5">
              {zeroHarmData.currentDays}{' '}
              <span className="text-xs font-normal text-[#666861]">DAYS</span>
            </div>
            <div className="text-[10px] text-[#666861] mt-0.5 font-mono">
              Previous best: {zeroHarmData.previousBestDays} days
            </div>
          </div>

          {/* PPE Compliance */}
          <div className="bg-white border border-[#DCDAD4] p-3 rounded-xl shadow-2xs">
            <div className="text-[10px] uppercase font-mono text-[#666861]">
              PPE Compliance
            </div>
            <div className="font-serif font-bold text-2xl text-[#176B4D] mt-0.5">
              {ppeCompliance}%
            </div>
            <div className="text-[10px] text-[#2D8A61] mt-0.5 font-mono">
              DGMS Statutory Floor
            </div>
          </div>

          {/* Violations */}
          <div className="bg-white border border-[#DCDAD4] p-3 rounded-xl shadow-2xs">
            <div className="text-[10px] uppercase font-mono text-[#666861]">
              Violations
            </div>
            <div
              className={`font-serif font-bold text-2xl mt-0.5 ${
                violationsCount > 0 ? 'text-[#A83D45]' : 'text-[#2D8A61]'
              }`}
            >
              {violationsCount}
            </div>
            <div className="text-[10px] text-[#666861] mt-0.5 font-mono">
              {violationsCount >= 2 ? 'Escalation Required' : 'Past 30 Days'}
            </div>
          </div>
        </div>
      </div>

      {/* ================= 4. SAFETY CHAMPIONS LEADERBOARD ================= */}
      <div className="bg-white border border-[#DCDAD4] rounded-2xl p-4 space-y-3 shadow-xs">
        <div className="flex items-center justify-between border-b border-[#ECEBE6] pb-2">
          <div>
            <h4 className="font-serif font-bold text-sm text-[#151713] tracking-tight">
              SAFETY CHAMPIONS
            </h4>
            <p className="text-[11px] text-[#666861]">Zero-Harm Streaks</p>
          </div>
          <span className="text-[10px] font-mono uppercase text-[#176B4D] bg-[#EAF3EF] px-2 py-0.5 rounded border border-[#176B4D]/20 font-bold">
            Mine Safety Performance Board
          </span>
        </div>

        <div className="space-y-1.5">
          {leaderboard.slice(0, 5).map((entry) => {
            const isCurrent = entry.worker.id === worker.id;
            return (
              <div
                key={entry.worker.id}
                className={`p-2.5 rounded-xl border transition-all flex items-center justify-between text-xs ${
                  isCurrent
                    ? 'bg-[#FAF6E9] border-[#B47A18]/40 ring-1 ring-[#B47A18]/20'
                    : 'bg-[#FAF9F6] border-[#ECEBE6]'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <span
                    className={`w-5 h-5 rounded-full flex items-center justify-center font-mono font-bold text-[11px] ${
                      entry.rank === 1
                        ? 'bg-[#B47A18] text-white'
                        : entry.rank === 2
                        ? 'bg-[#536B7D] text-white'
                        : entry.rank === 3
                        ? 'bg-[#8B5A2B] text-white'
                        : 'bg-[#ECEBE6] text-[#666861]'
                    }`}
                  >
                    {entry.rank}
                  </span>
                  <div>
                    <div className="font-semibold text-[#151713] flex items-center space-x-1.5">
                      <span>{entry.worker.name}</span>
                      {entry.isChampion && (
                        <span className="text-[9px] font-mono uppercase bg-[#FAF6E9] text-[#8A5B0B] border border-[#B47A18]/30 px-1.5 py-0.2 rounded font-bold">
                          SAFETY CHAMPION
                        </span>
                      )}
                      {isCurrent && (
                        <span className="text-[9px] font-mono text-[#666861] bg-white border border-[#DCDAD4] px-1 rounded">
                          SELECTED
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-[#666861] font-mono">
                      {entry.worker.role} • {entry.worker.zoneId.toUpperCase()}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-4 text-right font-mono">
                  <div>
                    <div className="font-bold text-[#151713]">
                      {entry.streakDays} days
                    </div>
                    <div className="text-[10px] text-[#666861]">Zero-Harm</div>
                  </div>
                  <div>
                    <div className="font-bold text-[#176B4D]">{entry.score}</div>
                    <div className="text-[10px] text-[#666861]">Score</div>
                  </div>
                  <div>
                    <div
                      className={`font-bold ${
                        entry.violations > 0 ? 'text-[#A83D45]' : 'text-[#2D8A61]'
                      }`}
                    >
                      {entry.violations}
                    </div>
                    <div className="text-[10px] text-[#666861]">Violations</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ================= 5. PERSONALIZED RECOMMENDATIONS ================= */}
      <div className="bg-[#FAF9F6] border border-[#ECEBE6] rounded-2xl p-4 space-y-3">
        <div className="flex items-center justify-between border-b border-[#ECEBE6] pb-2">
          <div>
            <h4 className="font-serif font-bold text-sm text-[#151713]">
              {recommendationsData.title}
            </h4>
            <p className="text-[11px] text-[#666861]">
              {recommendationsData.subtitle}
            </p>
          </div>
          <div className="flex items-center space-x-2 text-xs font-mono">
            <span className="bg-white border border-[#DCDAD4] px-2 py-0.5 rounded text-[#151713] font-bold">
              Current Rank: {recommendationsData.currentRankText}
            </span>
            {recommendationsData.nextRankText && (
              <span className="bg-[#EAF3EF] border border-[#2D8A61]/30 px-2 py-0.5 rounded text-[#2D8A61] font-bold">
                Target: {recommendationsData.nextRankText}
              </span>
            )}
          </div>
        </div>

        <div className="space-y-1.5">
          {recommendationsData.recommendations.map((rec, idx) => (
            <div key={idx} className="flex items-start space-x-2 text-xs text-[#151713]">
              <span className="text-[#2D8A61] font-bold shrink-0">✓</span>
              <span>{rec}</span>
            </div>
          ))}
        </div>

        <div className="pt-2 border-t border-[#ECEBE6] flex items-center justify-between text-[11px] font-mono text-[#666861]">
          <span>Next statutory milestone:</span>
          <span className="text-[#176B4D] font-bold">
            {recommendationsData.nextMilestone}
          </span>
        </div>
      </div>

      {/* ================= 6. IMPORTANT CONDITIONAL DISPLAY ================= */}
      {/* If worker.violations >= 2: Prioritize SAFETY ESCALATION. Otherwise: ZERO-HARM PROGRESS */}
      {isOffender ? (
        <div className="bg-[#FDF2F2] border-2 border-[#A83D45]/50 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-[#A83D45]/20 pb-2">
            <div className="flex items-center space-x-2">
              <AlertOctagon className="w-5 h-5 text-[#A83D45]" />
              <div>
                <h4 className="font-serif font-bold text-sm text-[#A83D45]">
                  SAFETY ESCALATION · REPEAT OFFENDER
                </h4>
                <p className="text-[11px] text-[#A83D45]/80 font-mono">
                  {violationsCount} SAFETY VIOLATIONS · {escalationDetails.statusText}
                </p>
              </div>
            </div>
            <span className="text-[10px] font-mono bg-[#A83D45] text-white px-2.5 py-1 rounded font-bold uppercase">
              MANDATORY ESCALATION
            </span>
          </div>

          <div>
            <div className="text-[11px] font-mono uppercase text-[#666861] font-semibold mb-1">
              Recent Violations:
            </div>
            <div className="space-y-1 text-xs font-mono text-[#151713]">
              {escalationDetails.recentViolations.map((viol, vi) => (
                <div
                  key={vi}
                  className="flex items-center justify-between bg-white border border-[#A83D45]/20 p-2 rounded-lg"
                >
                  <span>• {viol.type}</span>
                  <span className="text-[#A83D45] font-semibold">{viol.date}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="text-[11px] font-mono uppercase text-[#666861] font-semibold mb-1">
              Required Corrective Actions:
            </div>
            <div className="space-y-1 text-xs text-[#151713]">
              {escalationDetails.requiredActions.map((action, ai) => (
                <div key={ai} className="flex items-center space-x-2">
                  <span className="text-[#A83D45] font-bold">✕</span>
                  <span>{action}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-[#EAF3EF]/40 border border-[#2D8A61]/30 rounded-2xl p-3.5 flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2.5">
            <ShieldCheck className="w-5 h-5 text-[#2D8A61] shrink-0" />
            <div>
              <div className="font-serif font-bold text-[#151713]">
                ZERO-HARM PROGRESS · STANDING NOMINAL
              </div>
              <div className="text-[11px] text-[#666861]">
                No safety escalation required. Personnel in full statutory compliance.
              </div>
            </div>
          </div>
          <span className="font-mono text-xs text-[#2D8A61] font-bold bg-white px-2.5 py-1 rounded-lg border border-[#2D8A61]/20">
            {zeroHarmData.currentDays} DAYS ZERO-HARM
          </span>
        </div>
      )}

      {/* ================= 7. WEARABLE SENSOR VITALS ================= */}
      <div className="space-y-2.5 pt-1">
        <div className="text-xs text-[#666861] uppercase font-semibold font-serif tracking-wider">
          WEARABLE SENSOR VITALS
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {/* Heart Rate */}
          <div
            className={`p-3 rounded-xl border flex flex-col justify-between ${getHeartRateStyle(
              worker.vitals.heartRateStatus
            )}`}
          >
            <div className="flex items-center justify-between text-xs text-[#666861] font-medium">
              <span className="uppercase text-[10px]">Heart Rate</span>
              <Heart className="w-3.5 h-3.5 text-[#176B4D] shrink-0" />
            </div>
            <div className="font-serif font-bold text-xl my-1 text-[#151713]">
              {worker.vitals.heartRate}{' '}
              <span className="text-xs font-sans font-normal text-[#666861]">
                BPM
              </span>
            </div>
            <div className="text-[10px] uppercase font-semibold text-[#666861]">
              {worker.vitals.heartRateStatus === 'normal'
                ? 'Normal Rhythm'
                : worker.vitals.heartRateStatus === 'elevated'
                ? 'Elevated — Rest'
                : 'Critical Arrhythmia'}
            </div>
          </div>

          {/* Gas Sensor */}
          <div
            className={`p-3 rounded-xl border flex flex-col justify-between ${getGasStyle(
              worker.vitals.gasLevel
            )}`}
          >
            <div className="flex items-center justify-between text-xs text-[#666861] font-medium">
              <span className="uppercase text-[10px]">Gas Sensor</span>
              <Wind className="w-3.5 h-3.5 text-[#176B4D] shrink-0" />
            </div>
            <div className="font-serif font-bold text-xl my-1 text-[#151713] uppercase">
              {worker.vitals.gasLevel}
            </div>
            <div className="text-[10px] uppercase font-semibold text-[#666861]">
              {worker.vitals.gasLevel === 'safe'
                ? 'Air Safe (CH4 Safe)'
                : 'Ventilate Area'}
            </div>
          </div>

          {/* Movement / Fall */}
          <div
            className={`p-3 rounded-xl border flex flex-col justify-between ${getMovementStyle(
              worker.vitals.movement
            )}`}
          >
            <div className="flex items-center justify-between text-xs text-[#666861] font-medium">
              <span className="uppercase text-[10px]">Motion / Fall</span>
              <Activity className="w-3.5 h-3.5 text-[#176B4D] shrink-0" />
            </div>
            <div className="font-serif font-bold text-xl my-1 text-[#151713] uppercase">
              {worker.vitals.movement === 'fall'
                ? 'FALL DETECTED'
                : worker.vitals.movement}
            </div>
            <div className="text-[10px] uppercase font-semibold text-[#666861]">
              {worker.vitals.movement === 'active'
                ? 'Normal Motion'
                : worker.vitals.movement === 'stationary'
                ? 'Rest / Stationary'
                : 'Impact Alert'}
            </div>
          </div>

          {/* Comms & Power */}
          <div className="p-3 rounded-xl border bg-[#FAF9F6] border-[#ECEBE6] text-[#151713] flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-[#666861] font-medium">
              <span className="uppercase text-[10px]">Comms & Power</span>
              <Radio className="w-3.5 h-3.5 text-[#176B4D] shrink-0" />
            </div>
            <div className="font-serif font-bold text-xl my-1 text-[#151713]">
              {worker.vitals.batteryLevel}%{' '}
              <span className="text-xs font-sans font-normal text-[#666861]">
                BAT
              </span>
            </div>
            <div className="text-[10px] text-[#666861] font-mono">
              LoRa: <strong className="text-[#2D8A61]">Strong (-78dBm)</strong>
            </div>
          </div>
        </div>
      </div>

      {/* ================= 8. OPERATIONAL ACTION TRIGGERS ================= */}
      <div className="border border-[#DCDAD4] rounded-2xl p-4 bg-white space-y-3 shadow-xs">
        <div className="flex items-center justify-between border-b border-[#ECEBE6] pb-2">
          <div className="flex items-center space-x-2">
            <Award className="w-4 h-4 text-[#176B4D]" />
            <h4 className="font-serif font-bold text-sm text-[#151713]">
              Safety Recognition & Operational Actions
            </h4>
          </div>
          <span className="text-[10px] font-mono uppercase text-[#666861] bg-[#FAF9F6] px-2 py-0.5 rounded border border-[#ECEBE6]">
            DGMS Compliance Protocol
          </span>
        </div>

        {/* Action Toast Feedback */}
        {toastMessage && (
          <div className="p-2.5 rounded-xl bg-[#EAF3EF] border border-[#2D8A61]/40 text-[#176B4D] text-xs font-mono flex items-center justify-between animate-in fade-in duration-200">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-[#2D8A61]" />
              <span>{toastMessage}</span>
            </div>
            <button
              type="button"
              onClick={() => setToastMessage(null)}
              className="text-[#666861] hover:text-[#151713] ml-2 text-xs"
            >
              ✕
            </button>
          </div>
        )}

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
          <button
            type="button"
            onClick={() => {
              notificationService.dispatchChampionCommendation(
                worker.id,
                worker.name,
                zeroHarmData.currentDays
              );
              try {
                confetti({
                  particleCount: 80,
                  spread: 60,
                  origin: { y: 0.6 },
                });
              } catch {}
              setToastMessage(
                `Commendation SMS dispatched to ${worker.name}! Logged in Statutory Outbox.`
              );
            }}
            className="w-full py-2.5 px-3 rounded-xl bg-[#176B4D] hover:bg-[#12553D] text-white text-xs font-semibold flex items-center justify-center space-x-1.5 shadow-xs transition-colors"
          >
            <Award className="w-4 h-4" />
            <span>Commend Safety Performance (SMS)</span>
          </button>

          {isOffender ? (
            <button
              type="button"
              onClick={() => {
                notificationService.dispatchWarningNotice(
                  worker.id,
                  worker.name,
                  'Mandatory Supervisor Safety Review Summoned'
                );
                setToastMessage(
                  `Formal Warning SMS dispatched to ${worker.name} & Shift Supervisor.`
                );
              }}
              className="w-full py-2.5 px-3 rounded-xl bg-[#A83D45] hover:bg-[#92333B] text-white text-xs font-semibold flex items-center justify-center space-x-1.5 shadow-xs transition-colors"
            >
              <AlertTriangle className="w-4 h-4" />
              <span>Issue Escalation Notice (SMS)</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                notificationService.dispatchWarningNotice(
                  worker.id,
                  worker.name,
                  'Routine PPE Turnstile Advisory'
                );
                setToastMessage(`Advisory safety notice sent to ${worker.name}.`);
              }}
              className="w-full py-2.5 px-3 rounded-xl bg-white hover:bg-[#FAF9F6] border border-[#DCDAD4] text-[#666861] hover:text-[#151713] text-xs font-semibold flex items-center justify-center space-x-1.5 shadow-2xs transition-colors"
            >
              <BellRing className="w-4 h-4 text-[#B47A18]" />
              <span>Issue Advisory Notice (SMS)</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
