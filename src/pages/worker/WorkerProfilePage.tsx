import React, { useState } from 'react';
import { WorkerLayout } from '../../components/worker/WorkerLayout';
import { useSafety } from '../../context/SafetyContext';
import confetti from 'canvas-confetti';
import {
  User,
  CreditCard,
  Cpu,
  Clock,
  ShieldCheck,
  CheckCircle,
  Calendar,
  Award,
  FileText,
  Sparkles,
  Coins,
  Trophy,
  Star,
  FileCheck2,
  Lock,
  Gift,
  CheckCircle2,
  X,
  MessageSquare,
} from 'lucide-react';

export const WorkerProfilePage: React.FC = () => {
  const { activeWorker } = useSafety();
  const [certificateModalOpen, setCertificateModalOpen] = useState(false);

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

  const handleOpenCertificate = () => {
    setCertificateModalOpen(true);
    try {
      confetti({ particleCount: 70, spread: 70, origin: { y: 0.5 } });
    } catch {}
  };

  // Statutory Badges Showcase (Unlocked and Locked)
  const allBadges = [
    {
      name: 'DGMS Safety Exemplar',
      desc: '30+ consecutive subterranean shifts with 100% PPE compliance',
      unlocked: true,
      perk: '+₹5,000 Quarterly Safety Bonus',
      date: 'Aug 15, 2026',
    },
    {
      name: 'Zero Hazard Master',
      desc: 'Zero fall impacts, SOS beacons, or physical citations recorded',
      unlocked: true,
      perk: 'Gold Hardhat Decal Awarded',
      date: 'Jul 30, 2026',
    },
    {
      name: 'Perfect PPE Streak 30+',
      desc: 'Continuous 4-point verification at every subterranean shift',
      unlocked: true,
      perk: 'Priority Shift Selection',
      date: 'Aug 01, 2026',
    },
    {
      name: 'Subterranean Gas Vigilance Star',
      desc: 'Zero personal exposure threshold alarms across working seams',
      unlocked: true,
      perk: 'Ventilation Specialist Pin',
      date: 'Aug 22, 2026',
    },
    {
      name: 'Diamond Exemplar (50 Shifts)',
      desc: 'Attain 50 consecutive zero-harm subterranean extraction shifts',
      unlocked: false,
      perk: '+₹7,500 Diamond Bonus (12 shifts left)',
      date: 'In Progress (38/50)',
    },
  ];

  // Official Commendations Letters & Supervisor Messages
  const commendations = [
    {
      id: 'cmd-1',
      date: 'Aug 15, 2026',
      from: 'Director K. V. Rao (Mine General Manager)',
      role: 'Directorate General of Mines Safety',
      subject: 'Formal Commendation: 30-Shift Zero-Harm Milestone',
      body: 'Your exemplary adherence to personal safety equipment during continuous haulage operations in Zone C sets the industry standard for Jharia Coalfield Level 4. Credited ₹5,000 statutory quarterly allowance.',
      type: 'OFFICIAL_AWARD',
    },
    {
      id: 'cmd-2',
      date: 'Aug 02, 2026',
      from: 'Ashok Varma',
      role: 'Shift In-Charge (Shift A)',
      subject: 'Exemplary Gas Sensor Vigilance',
      body: 'Thank you for immediate reporting of ventilation damper drift at Crosscut 4. Prompt action prevented localized methane buildup.',
      type: 'SHIFT_RECOGNITION',
    },
    {
      id: 'cmd-3',
      date: 'Jul 10, 2026',
      from: 'Safety Officer A. Roy',
      role: 'Mine Safety Directorate',
      subject: 'DGMS Safety Practitioner Accreditation',
      body: 'Verified 100% compliance across 20 consecutive checks. Awarded Gold Hardhat Decal.',
      type: 'BADGE_AWARD',
    },
  ];

  return (
    <WorkerLayout
      showNav={true}
      title="Worker Profile & Rewards"
      subtitle="Credentials, statutory safety rewards, badges & compliance history"
    >
      <div className="space-y-4 text-[#151713]">
        {/* Worker Identity Header Card */}
        <div className="p-4 rounded-2xl bg-white border border-[#DCDAD4] shadow-xs space-y-3">
          <div className="flex items-center space-x-3.5">
            <div className="w-14 h-14 rounded-2xl bg-[#FAF9F6] border border-[#DCDAD4] flex items-center justify-center font-serif font-bold text-2xl text-[#176B4D] shadow-xs">
              {activeWorker.name.charAt(0)}
            </div>

            <div>
              <div className="flex items-center space-x-2">
                <h2 className="font-serif font-semibold text-xl text-[#151713]">
                  {activeWorker.name}
                </h2>
                <span className="px-2 py-0.5 rounded-md bg-[#EAF3EF] border border-[#2D8A61]/30 text-[#2D8A61] text-[10px] font-semibold">
                  ACTIVE ON-DUTY
                </span>
              </div>
              <p className="text-xs text-[#666861] font-medium mt-0.5">
                {activeWorker.role}
              </p>
              <div className="text-[11px] font-mono text-[#176B4D] mt-0.5">
                {activeWorker.shift}
              </div>
            </div>
          </div>

          {/* Key Identifiers Grid */}
          <div className="grid grid-cols-2 gap-2 pt-3 border-t border-[#ECEBE6] text-xs">
            <div className="p-2.5 rounded-xl bg-[#FAF9F6] border border-[#ECEBE6]">
              <div className="text-[10px] text-[#666861] uppercase flex items-center space-x-1">
                <User className="w-3 h-3 text-[#176B4D]" />
                <span>Worker ID</span>
              </div>
              <div className="font-semibold text-[#151713] font-mono mt-0.5">
                {activeWorker.id}
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-[#FAF9F6] border border-[#ECEBE6]">
              <div className="text-[10px] text-[#666861] uppercase flex items-center space-x-1">
                <CreditCard className="w-3 h-3 text-[#176B4D]" />
                <span>RFID Transponder</span>
              </div>
              <div className="font-semibold text-[#151713] font-mono mt-0.5">
                {activeWorker.rfid}
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-[#FAF9F6] border border-[#ECEBE6]">
              <div className="text-[10px] text-[#666861] uppercase flex items-center space-x-1">
                <Cpu className="w-3 h-3 text-[#176B4D]" />
                <span>ESP32 Node</span>
              </div>
              <div className="font-semibold text-[#151713] font-mono mt-0.5">
                {activeWorker.wearableId}
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-[#FAF9F6] border border-[#ECEBE6]">
              <div className="text-[10px] text-[#666861] uppercase flex items-center space-x-1">
                <Clock className="w-3 h-3 text-[#2D8A61]" />
                <span>Cage Entry</span>
              </div>
              <div className="font-semibold text-[#2D8A61] font-mono mt-0.5">
                {activeWorker.entryTime}
              </div>
            </div>
          </div>
        </div>

        {/* ===================================================================== */}
        {/* STATUTORY SAFETY REWARDS & EARNINGS OVERVIEW */}
        {/* ===================================================================== */}
        <div className="p-5 rounded-2xl bg-white border border-[#DCDAD4] shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#ECEBE6] pb-3">
            <div className="flex items-center space-x-2">
              <Trophy className="w-5 h-5 text-[#B47A18]" />
              <div>
                <h3 className="font-serif font-bold text-base text-[#151713]">
                  Safety Rewards & Recognition
                </h3>
                <p className="text-[11px] text-[#666861]">
                  Statutory DGMS Exemplar Badges & Financial Safety Incentives
                </p>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-xl bg-[#FAF6E9] border border-[#B47A18]/30 text-[#8A5B0B] font-mono text-[10px] font-bold">
              ★ GOLD CHAMPION
            </span>
          </div>

          {/* Reward Metrics 3-Grid */}
          <div className="grid grid-cols-3 gap-2.5 text-center">
            <div className="p-3 rounded-xl bg-[#FAF9F6] border border-[#ECEBE6]">
              <div className="text-[10px] uppercase font-mono text-[#666861]">Zero-Harm Streak</div>
              <div className="font-serif font-bold text-xl text-[#176B4D] mt-0.5">
                {streak} Shifts
              </div>
              <div className="text-[10px] text-[#2D8A61]">100% Compliant</div>
            </div>

            <div className="p-3 rounded-xl bg-[#FAF9F6] border border-[#ECEBE6]">
              <div className="text-[10px] uppercase font-mono text-[#666861]">Total Safety Bonus</div>
              <div className="font-serif font-bold text-xl text-[#B47A18] mt-0.5">
                ₹12,500
              </div>
              <div className="text-[10px] text-[#666861]">Direct Bank Credit</div>
            </div>

            <div className="p-3 rounded-xl bg-[#FAF9F6] border border-[#ECEBE6]">
              <div className="text-[10px] uppercase font-mono text-[#666861]">Earned Badges</div>
              <div className="font-serif font-bold text-xl text-[#151713] mt-0.5">
                4 / 5
              </div>
              <div className="text-[10px] text-[#666861]">DGMS Verified</div>
            </div>
          </div>

          {/* Certificate Quick Action */}
          <button
            type="button"
            onClick={handleOpenCertificate}
            className="w-full py-2.5 px-4 rounded-xl bg-[#176B4D] hover:bg-[#12553D] text-white font-serif font-bold text-xs flex items-center justify-center space-x-2 shadow-xs transition-colors"
          >
            <FileCheck2 className="w-4 h-4" />
            <span>View Official DGMS Certificate of Safety Excellence</span>
          </button>
        </div>

        {/* ===================================================================== */}
        {/* STATUTORY BADGES SHOWCASE GRID */}
        {/* ===================================================================== */}
        <div className="p-5 rounded-2xl bg-white border border-[#DCDAD4] shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-[#ECEBE6] pb-2">
            <div className="flex items-center space-x-2">
              <Award className="w-4 h-4 text-[#176B4D]" />
              <span className="font-serif font-bold text-sm text-[#151713]">
                Earned Safety Badges & Perks
              </span>
            </div>
            <span className="text-[10px] font-mono text-[#666861]">DGMS Tier System</span>
          </div>

          <div className="space-y-2.5">
            {allBadges.map((b, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-xl border flex items-start justify-between gap-3 text-xs transition-colors ${
                  b.unlocked
                    ? 'bg-[#FAF9F6] border-[#ECEBE6]'
                    : 'bg-[#FAF9F6]/40 border-dashed border-[#DCDAD4] opacity-70'
                }`}
              >
                <div className="flex items-start space-x-2.5">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                      b.unlocked
                        ? 'bg-[#FAF6E9] border border-[#B47A18]/30 text-[#B47A18]'
                        : 'bg-[#ECEBE6] text-[#666861]'
                    }`}
                  >
                    {b.unlocked ? <Trophy className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                  </div>

                  <div className="space-y-0.5">
                    <div className="flex items-center space-x-1.5">
                      <span className="font-semibold text-[#151713]">{b.name}</span>
                      {b.unlocked && (
                        <span className="px-1.5 py-0.2 rounded bg-[#EAF3EF] text-[#2D8A61] text-[9px] font-bold font-mono">
                          UNLOCKED
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-[#666861] leading-tight">{b.desc}</p>
                    <div className="text-[10px] font-mono text-[#176B4D] font-bold pt-0.5">
                      Perk: {b.perk}
                    </div>
                  </div>
                </div>

                <div className="text-[10px] font-mono text-[#666861] shrink-0 text-right">
                  {b.date}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ===================================================================== */}
        {/* OFFICIAL SUPERVISOR COMMENDATIONS LOG */}
        {/* ===================================================================== */}
        <div className="p-5 rounded-2xl bg-white border border-[#DCDAD4] shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-[#ECEBE6] pb-2">
            <div className="flex items-center space-x-2">
              <MessageSquare className="w-4 h-4 text-[#176B4D]" />
              <span className="font-serif font-bold text-sm text-[#151713]">
                Formal Commendations & Safety Praise
              </span>
            </div>
            <span className="text-[10px] font-mono text-[#2D8A61] font-bold">
              {commendations.length} Commendations
            </span>
          </div>

          <div className="space-y-2.5">
            {commendations.map((cmd) => (
              <div
                key={cmd.id}
                className="p-3.5 rounded-xl bg-[#FAF9F6] border border-[#ECEBE6] space-y-1.5 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#151713]">{cmd.subject}</span>
                  <span className="text-[10px] font-mono text-[#666861]">{cmd.date}</span>
                </div>

                <p className="text-[11px] text-[#151713]/85 leading-relaxed font-sans">
                  "{cmd.body}"
                </p>

                <div className="pt-1 border-t border-[#ECEBE6] flex items-center justify-between text-[10px] font-mono text-[#666861]">
                  <span>From: <strong className="text-[#176B4D]">{cmd.from}</strong> ({cmd.role})</span>
                  <span className="text-[#B47A18] font-bold">★ VERIFIED</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* PPE Compliance Rate Card */}
        <div className="p-4 rounded-2xl bg-white border border-[#DCDAD4] shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-5 h-5 text-[#2D8A61]" />
              <span className="font-serif font-semibold text-xs text-[#151713]">
                Subterranean Compliance Rate
              </span>
            </div>
            <span className="font-serif font-semibold text-2xl text-[#151713]">
              {activeWorker.ppeComplianceRate}%
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-2.5 bg-[#FAF9F6] rounded-full overflow-hidden border border-[#DCDAD4]">
            <div
              className="h-full bg-[#176B4D] rounded-full"
              style={{ width: `${activeWorker.ppeComplianceRate}%` }}
            />
          </div>

          <p className="text-[11px] text-[#666861]">
            Calculated across continuous subterranean LoRa telemetry, 4-point protective gear sensors, and shift uptime.
          </p>
        </div>

        {/* Attendance & Entry Logs Table */}
        <div className="p-4 rounded-2xl bg-white border border-[#DCDAD4] shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-[#ECEBE6] pb-2">
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-[#176B4D]" />
              <span className="font-serif font-semibold text-xs text-[#151713]">
                Recent Shift Attendance
              </span>
            </div>
            <span className="text-[10px] text-[#666861]">Last 5 Shifts</span>
          </div>

          <div className="space-y-2">
            {activeWorker.attendanceHistory.map((rec, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-[#FAF9F6] border border-[#ECEBE6] flex items-center justify-between text-xs"
              >
                <div>
                  <div className="font-semibold text-[#151713] flex items-center space-x-2">
                    <span>{rec.date}</span>
                    <span className="text-[10px] text-[#666861] font-mono">({rec.shift})</span>
                  </div>
                  <div className="text-[11px] text-[#666861] mt-0.5">
                    In: <span className="text-[#2D8A61] font-mono font-medium">{rec.checkIn}</span> • Out:{' '}
                    <span className="text-[#151713] font-mono">{rec.checkOut}</span>
                  </div>
                </div>

                <div className="text-right">
                  <span
                    className={`px-2.5 py-0.5 rounded-md text-[10px] font-semibold ${
                      rec.status === 'Completed'
                        ? 'bg-[#EAF3EF] text-[#2D8A61] border border-[#2D8A61]/30'
                        : rec.status === 'In-Progress'
                        ? 'bg-white text-[#176B4D] border border-[#176B4D]/30'
                        : 'bg-[#FEF9E7] text-[#B47A18] border border-[#B47A18]/30'
                    }`}
                  >
                    {rec.status}
                  </span>
                  <div className="text-[10px] font-mono text-[#666861] mt-1">
                    PPE: {rec.ppeScore}%
                  </div>
                </div>
              </div>
            ))}
          </div>
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
