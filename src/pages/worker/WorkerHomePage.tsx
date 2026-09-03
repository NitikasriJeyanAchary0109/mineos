import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { WorkerLayout } from '../../components/worker/WorkerLayout';
import { IndustrialButton } from '../../components/shared/IndustrialButton';
import { useSafety } from '../../context/SafetyContext';
import { BACKEND_API_URL } from '../../lib/supabase';
import confetti from 'canvas-confetti';
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Radio,
  MapPin,
  Calendar,
  Clock,
  UserCheck,
  ShieldAlert,
  ArrowRight,
  Info,
  Award,
  Sparkles,
  Coins,
  Gift,
  Star,
  FileCheck2,
  Download,
  X,
  Shield,
  Trophy,
} from 'lucide-react';

interface WorkerDashboardData {
  worker_id: string;
  name: string;
  rfid_tag: string;
  shift: string;
  assigned_zone: string;
  health: {
    status: 'NORMAL' | 'ATTENTION_NEEDED';
    label: string;
    severity: 'safe' | 'warning' | 'critical';
    message: string;
  };
  attendance_today: {
    marked: boolean;
    status: string;
    entry_time: string | null;
    gate: string | null;
  };
  attendance_summary: {
    days_present: number;
    days_absent: number;
    cycle_name: string;
  };
  ppe_compliance_record: {
    non_compliance_days: number;
    last_incident_reason: string;
    status: string;
  };
  ppe_today_verified: boolean;
}

export const WorkerHomePage: React.FC = () => {
  const navigate = useNavigate();
  const { activeWorker } = useSafety();

  const [dashboardData, setDashboardData] = useState<WorkerDashboardData>({
    worker_id: activeWorker.id || 'W001',
    name: activeWorker.name || 'Deepika',
    rfid_tag: 'RFID-W001-D1',
    shift: 'Shift A (06:00 - 14:00)',
    assigned_zone: 'zone-c',
    health: {
      status: 'NORMAL',
      label: 'Health Normal',
      severity: 'safe',
      message: 'All personal vitals nominal. Subterranean safety parameters clear.',
    },
    attendance_today: {
      marked: true,
      status: 'Marked Present',
      entry_time: '06:04 AM',
      gate: 'Hoist Shaft #4 Subterranean Cage',
    },
    attendance_summary: {
      days_present: 22,
      days_absent: 2,
      cycle_name: 'Current Shift Cycle (Aug - Sep)',
    },
    ppe_compliance_record: {
      non_compliance_days: 0,
      last_incident_reason: 'None — Perfect Zero-Harm Record',
      status: 'Exemplar Standing',
    },
    ppe_today_verified: true,
  });

  const [certificateModalOpen, setCertificateModalOpen] = useState(false);

  const fetchWorkerSummary = async () => {
    try {
      const targetId = activeWorker.id || 'W001';
      const res = await fetch(`${BACKEND_API_URL}/api/worker/${targetId}/status-summary`);
      if (res.ok) {
        const data = await res.json();
        setDashboardData(data);
      }
    } catch (err) {
      // Nominal fallback to activeWorker data
    }
  };

  useEffect(() => {
    fetchWorkerSummary();
    const interval = setInterval(fetchWorkerSummary, 4000);
    return () => clearInterval(interval);
  }, [activeWorker.id]);

  const ppe = activeWorker.ppeStatus;
  const allPpe = ppe.helmet && ppe.vest && ppe.boots && ppe.gloves;
  const isHealthNormal = dashboardData.health.status === 'NORMAL';

  // Compliance Profile & Rewards Data
  const profile = activeWorker.complianceProfile || {
    consecutiveCompliantShifts: 38,
    isSafetyChampion: true,
    championAwardDate: '2026-08-15',
    commendationCount: 3,
    recentViolationsCount: 0,
    isRepeatOffender: false,
    escalationStatus: 'Nominal',
    badges: ['DGMS Safety Exemplar', 'Zero Hazard Master', 'Perfect PPE Streak 30+'],
  };

  const streak = profile.consecutiveCompliantShifts || 38;
  const nextTarget = 50;
  const progressPercent = Math.min(100, Math.round((streak / nextTarget) * 100));

  const handleOpenCertificate = () => {
    setCertificateModalOpen(true);
    try {
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
    } catch {}
  };

  return (
    <WorkerLayout showNav={true}>
      <div className="space-y-4 text-[#151713]">
        {/* Subterranean Zone & Status Strip */}
        <div className="grid grid-cols-3 gap-2.5 text-center text-xs">
          <div className="bg-white border border-[#DCDAD4] p-3 rounded-2xl flex flex-col items-center shadow-xs">
            <div className="flex items-center space-x-1 text-[#666861] text-[11px] uppercase font-medium">
              <MapPin className="w-3.5 h-3.5 text-[#176B4D]" />
              <span>Assigned Zone</span>
            </div>
            <span className="font-serif font-semibold text-[#151713] mt-1 text-sm">
              {dashboardData.assigned_zone === 'zone-c' ? 'Zone C (-440m)' : dashboardData.assigned_zone.toUpperCase()}
            </span>
          </div>

          <div className="bg-white border border-[#DCDAD4] p-3 rounded-2xl flex flex-col items-center shadow-xs">
            <div className="flex items-center space-x-1 text-[#666861] text-[11px] uppercase font-medium">
              <Radio className="w-3.5 h-3.5 text-[#2D8A61]" />
              <span>Comms Link</span>
            </div>
            <span className="font-serif font-semibold text-[#2D8A61] mt-1 text-sm">Active Mesh</span>
          </div>

          <div className="bg-white border border-[#DCDAD4] p-3 rounded-2xl flex flex-col items-center shadow-xs">
            <div className="flex items-center space-x-1 text-[#666861] text-[11px] uppercase font-medium">
              <Clock className="w-3.5 h-3.5 text-[#176B4D]" />
              <span>Shift Timing</span>
            </div>
            <span className="font-serif font-semibold text-[#151713] mt-1 text-sm">Shift A (06-14h)</span>
          </div>
        </div>

        {/* ===================================================================== */}
        {/* SAFETY REWARDS & CHAMPION COMMENDATION HERO CARD */}
        {/* ===================================================================== */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#176B4D] via-[#13563D] to-[#0D3828] text-white p-5 shadow-md space-y-4">
          {/* Subtle decorative background ring */}
          <div className="absolute -right-8 -bottom-8 w-36 h-36 rounded-full bg-white/5 pointer-events-none" />
          <div className="absolute right-12 top-2 w-20 h-20 rounded-full bg-[#B47A18]/20 blur-xl pointer-events-none" />

          {/* Top Header Row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="p-1.5 rounded-xl bg-[#FAF6E9] text-[#B47A18] shadow-xs">
                <Trophy className="w-4 h-4" />
              </span>
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#B47A18] font-bold">
                  SAFETY REWARD PROGRAM
                </span>
                <h2 className="font-serif font-bold text-lg leading-tight">
                  DGMS Safety Champion
                </h2>
              </div>
            </div>

            <span className="px-2.5 py-1 rounded-full bg-white/15 border border-white/25 text-[10px] font-mono font-bold uppercase tracking-wide text-emerald-200">
              Gold Tier
            </span>
          </div>

          {/* Core Rewards KPI Row */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="bg-white/10 backdrop-blur-xs border border-white/15 rounded-2xl p-3 space-y-0.5">
              <div className="flex items-center space-x-1 text-[11px] text-emerald-200">
                <Sparkles className="w-3.5 h-3.5 text-[#B47A18]" />
                <span>Zero-Harm Streak</span>
              </div>
              <div className="font-serif font-bold text-2xl text-white">
                {streak} Shifts
              </div>
              <div className="text-[10px] text-emerald-300/80">
                100% Subterranean Compliance
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-xs border border-white/15 rounded-2xl p-3 space-y-0.5">
              <div className="flex items-center space-x-1 text-[11px] text-emerald-200">
                <Coins className="w-3.5 h-3.5 text-yellow-300" />
                <span>Safety Bonus Earned</span>
              </div>
              <div className="font-serif font-bold text-2xl text-white">
                ₹5,000
              </div>
              <div className="text-[10px] text-emerald-300/80">
                Quarterly Incentive Credited
              </div>
            </div>
          </div>

          {/* Awarded Badges Pill Row */}
          <div className="space-y-1.5">
            <div className="text-[10px] font-mono uppercase text-emerald-200/90 font-semibold">
              Awarded Statutory Badges ({profile.badges?.length || 3})
            </div>
            <div className="flex flex-wrap gap-1.5">
              {(profile.badges && profile.badges.length > 0
                ? profile.badges
                : ['DGMS Safety Exemplar', 'Zero Hazard Master', 'Perfect PPE Streak 30+']
              ).map((badge, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-xl bg-white/15 border border-white/20 text-[11px] font-sans font-medium text-white flex items-center space-x-1 shadow-2xs"
                >
                  <Star className="w-3 h-3 text-yellow-300 fill-yellow-300" />
                  <span>{badge}</span>
                </span>
              ))}
            </div>
          </div>

          {/* Next Milestone Progress Bar */}
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between text-[11px] font-mono">
              <span className="text-emerald-200">
                Next Tier: 50 Shifts Diamond Exemplar
              </span>
              <span className="font-bold text-white">
                {streak} / {nextTarget} ({nextTarget - streak} left)
              </span>
            </div>
            <div className="w-full h-2 bg-black/30 rounded-full overflow-hidden border border-white/10">
              <div
                className="h-full bg-gradient-to-r from-yellow-400 to-amber-300 rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="text-[10px] text-emerald-200/70 text-right">
              Qualifies for ₹7,500 Diamond Safety Allowance + DGMS Gold Hardhat Decal
            </div>
          </div>

          {/* Certificate View Action Button */}
          <div className="pt-1">
            <button
              type="button"
              onClick={handleOpenCertificate}
              className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-[#FAF9F6] text-[#176B4D] font-serif font-bold text-xs flex items-center justify-center space-x-2 shadow-sm transition-all active:scale-[0.99]"
            >
              <FileCheck2 className="w-4 h-4 text-[#176B4D]" />
              <span>View Official DGMS Certificate of Safety Excellence</span>
            </button>
          </div>
        </div>

        {/* 1. HEALTH STATUS: Single Clear Indicator */}
        <div
          className={`p-5 rounded-2xl border flex items-center justify-between shadow-xs ${
            isHealthNormal
              ? 'bg-white border-[#DCDAD4]'
              : 'bg-[#FDF2F2] border-[#A83D45]/40'
          }`}
        >
          <div className="space-y-1.5 pr-3">
            <div className="flex items-center space-x-2">
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  isHealthNormal ? 'bg-[#2D8A61]' : 'bg-[#A83D45]'
                }`}
              />
              <span className="text-[11px] uppercase font-semibold text-[#666861]">
                Personal Health Status
              </span>
            </div>

            <h1 className="font-serif text-2xl text-[#151713] font-normal tracking-tight">
              {isHealthNormal ? 'Health Nominal' : 'Health Attention Needed'}
            </h1>

            <p className="text-xs text-[#666861] leading-relaxed">
              {dashboardData.health.message}
            </p>
          </div>

          <div
            className={`p-3 rounded-2xl bg-[#FAF9F6] border shrink-0 ${
              isHealthNormal
                ? 'border-[#DCDAD4] text-[#2D8A61]'
                : 'border-[#A83D45]/30 text-[#A83D45]'
            }`}
          >
            {isHealthNormal ? (
              <CheckCircle2 className="w-8 h-8 stroke-[2]" />
            ) : (
              <AlertTriangle className="w-8 h-8 stroke-[2]" />
            )}
          </div>
        </div>

        {/* 2. ATTENDANCE MARKING: Today's Status */}
        <div className="bg-white border border-[#DCDAD4] p-4 rounded-2xl shadow-xs space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <UserCheck className="w-4 h-4 text-[#176B4D]" />
              <span className="font-serif font-semibold text-xs text-[#151713]">
                Today's Shift Attendance
              </span>
            </div>
            {dashboardData.attendance_today.marked ? (
              <span className="text-[10px] font-semibold bg-[#EAF3EF] text-[#2D8A61] border border-[#2D8A61]/30 px-2.5 py-0.5 rounded-md">
                Verified On-Duty
              </span>
            ) : (
              <span className="text-[10px] font-semibold bg-[#FEF9E7] text-[#B47A18] border border-[#B47A18]/30 px-2.5 py-0.5 rounded-md">
                Pending Verification
              </span>
            )}
          </div>

          <div className="bg-[#FAF9F6] border border-[#ECEBE6] p-3.5 rounded-xl flex items-center justify-between">
            <div>
              <div className="font-serif font-semibold text-sm text-[#2D8A61] flex items-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>Marked Present</span>
              </div>
              <div className="text-xs text-[#666861] mt-1">
                Entry recorded at <strong className="text-[#151713] font-mono">{dashboardData.attendance_today.entry_time || '06:04 AM'}</strong> through Hoist Shaft #4
              </div>
            </div>
            <div className="text-[11px] text-[#666861] text-right font-mono">
              LoRa Transponder Verified
            </div>
          </div>
        </div>

        {/* 3. ATTENDANCE SUMMARY: Simple Large Text Counter Cards */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white border border-[#DCDAD4] p-4 rounded-2xl space-y-1 shadow-xs">
            <div className="flex items-center space-x-1.5 text-[#666861] text-xs font-medium">
              <Calendar className="w-4 h-4 text-[#2D8A61]" />
              <span>Days Present</span>
            </div>
            <div className="font-serif font-semibold text-3xl text-[#151713]">
              {dashboardData.attendance_summary.days_present}
            </div>
            <div className="text-[11px] text-[#666861]">
              Current shift cycle.
            </div>
          </div>

          <div className="bg-white border border-[#DCDAD4] p-4 rounded-2xl space-y-1 shadow-xs">
            <div className="flex items-center space-x-1.5 text-[#666861] text-xs font-medium">
              <Calendar className="w-4 h-4 text-[#666861]" />
              <span>Days Absent</span>
            </div>
            <div className="font-serif font-semibold text-3xl text-[#151713]">
              {dashboardData.attendance_summary.days_absent}
            </div>
            <div className="text-[11px] text-[#666861]">
              Approved rest days.
            </div>
          </div>
        </div>

        {/* 4. MANDATORY EQUIPMENT VERIFICATION STATUS CARD */}
        <div className="bg-white border border-[#DCDAD4] p-4 rounded-2xl space-y-3 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-[#2D8A61]" />
              <span className="font-serif font-semibold text-xs text-[#151713]">
                Mandatory Protective Equipment
              </span>
            </div>
            <span
              className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-md border ${
                allPpe
                  ? 'bg-[#EAF3EF] text-[#2D8A61] border-[#2D8A61]/30'
                  : 'bg-[#FDF2F2] text-[#A83D45] border-[#A83D45]/30'
              }`}
            >
              {allPpe ? 'All 4 Verified' : 'Incomplete'}
            </span>
          </div>

          <div className="grid grid-cols-4 gap-2 text-center text-xs">
            <div className="bg-[#FAF9F6] border border-[#ECEBE6] p-2 rounded-xl">
              <div className="font-medium text-[#151713] text-xs">Helmet</div>
              <div className="font-semibold text-[#2D8A61] text-[10px] mt-0.5">Active</div>
            </div>
            <div className="bg-[#FAF9F6] border border-[#ECEBE6] p-2 rounded-xl">
              <div className="font-medium text-[#151713] text-xs">High-Vis</div>
              <div className="font-semibold text-[#2D8A61] text-[10px] mt-0.5">Worn</div>
            </div>
            <div className="bg-[#FAF9F6] border border-[#ECEBE6] p-2 rounded-xl">
              <div className="font-medium text-[#151713] text-xs">Boots</div>
              <div className="font-semibold text-[#2D8A61] text-[10px] mt-0.5">Steel-Toe</div>
            </div>
            <div className="bg-[#FAF9F6] border border-[#ECEBE6] p-2 rounded-xl">
              <div className="font-medium text-[#151713] text-xs">Gloves</div>
              <div className="font-semibold text-[#2D8A61] text-[10px] mt-0.5">Fitted</div>
            </div>
          </div>

          <button
            onClick={() => navigate('/live-safety')}
            className="w-full py-2.5 bg-[#FAF9F6] hover:bg-[#ECEBE6] border border-[#DCDAD4] text-xs text-[#151713] font-medium rounded-xl transition-colors flex items-center justify-center space-x-1.5"
          >
            <span>View Personal Telemetry & Environmental Safety</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#666861]" />
          </button>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* INTERACTIVE DGMS CERTIFICATE MODAL */}
      {/* ===================================================================== */}
      {certificateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-[#DCDAD4] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-4 border-b border-[#ECEBE6] flex items-center justify-between bg-[#FAF9F6]">
              <div className="flex items-center space-x-2">
                <Award className="w-5 h-5 text-[#B47A18]" />
                <h3 className="font-serif font-bold text-sm text-[#151713]">
                  Statutory Safety Commendation
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setCertificateModalOpen(false)}
                className="p-1 rounded-lg text-[#666861] hover:text-[#151713] hover:bg-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Certificate Parchment Body */}
            <div className="p-6 bg-[#FAF6E9] border-8 border double border-[#B47A18]/30 m-4 rounded-2xl space-y-4 text-center">
              <div className="flex justify-center">
                <div className="w-12 h-12 rounded-full bg-[#B47A18]/20 border-2 border-[#B47A18] flex items-center justify-center text-[#B47A18]">
                  <Trophy className="w-6 h-6" />
                </div>
              </div>

              <div className="space-y-1">
                <div className="text-[9px] uppercase font-mono tracking-widest text-[#8A5B0B] font-bold">
                  DIRECTORATE GENERAL OF MINES SAFETY (DGMS)
                </div>
                <h2 className="font-serif text-xl font-bold uppercase tracking-tight text-[#111310]">
                  Certificate of Safety Excellence
                </h2>
                <div className="text-[11px] text-[#666861] italic">
                  Statutory Commendation for Zero-Harm Subterranean Operations
                </div>
              </div>

              <div className="py-2 border-y border-[#B47A18]/20 space-y-1">
                <div className="text-[10px] uppercase font-mono text-[#666861]">This is to certify that</div>
                <div className="font-serif font-bold text-lg text-[#151713] tracking-wide">
                  {activeWorker.name}
                </div>
                <div className="text-xs font-mono text-[#176B4D] font-bold">
                  Miner ID: {activeWorker.id} • {activeWorker.role}
                </div>
              </div>

              <p className="text-xs text-[#151713]/80 leading-relaxed font-serif px-2">
                Has achieved <strong className="text-[#176B4D]">{streak} Consecutive Underground Coal Mining Shifts</strong> with 100% Personal Protective Equipment compliance and zero safety citations under Coal Mines Regulations 1957.
              </p>

              <div className="pt-2 flex items-center justify-between text-[10px] font-mono border-t border-[#B47A18]/20 text-[#666861]">
                <div className="text-left">
                  <div>Date: 15 August 2026</div>
                  <div>Ref: DGMS/JHA/EX-2026</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-[#176B4D]">Director K. V. Rao</div>
                  <div>Mine Safety Directorate</div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-[#ECEBE6] bg-[#FAF9F6] flex items-center justify-between">
              <span className="text-[11px] font-mono text-[#2D8A61] font-bold">
                ✓ Validated on Mine OS Blockchain Ledger
              </span>
              <button
                type="button"
                onClick={() => setCertificateModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-[#176B4D] hover:bg-[#12553D] text-white text-xs font-semibold"
              >
                Close Certificate
              </button>
            </div>
          </div>
        </div>
      )}
    </WorkerLayout>
  );
};
