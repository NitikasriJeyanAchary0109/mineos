import React, { useState } from 'react';
import { MobileLayout } from '../../components/mobile/MobileLayout';
import { useSafety } from '../../context/SafetyContext';
import {
  Award,
  ShieldCheck,
  AlertTriangle,
  Flame,
  CheckCircle2,
  TrendingUp,
  UserCheck,
  ChevronRight,
  ShieldAlert,
  Star,
} from 'lucide-react';
import {
  getRankedWorkers,
  getZeroHarmStreak,
  getViolationCount,
  getWorkerRecommendations,
  isSafetyEscalationRequired,
} from '../../services/mobileTelemetryBridge';

export const MobileChampionsPage: React.FC = () => {
  const { workers, selectedWorkerId, setSelectedWorkerId, selectedWorker } = useSafety();

  const ranked = getRankedWorkers(workers);
  const activeWorkerProfile = getWorkerRecommendations(selectedWorker, workers);
  const isEscalated = isSafetyEscalationRequired(selectedWorker);

  // Filter repeat offenders (violations >= 2)
  const repeatOffenders = workers.filter((w) => getViolationCount(w) >= 2);

  return (
    <MobileLayout activeTab="reports">
      <div className="space-y-3.5 pb-2">
        {/* ===================================================================== */}
        {/* 1. SAFETY CHAMPIONS LEADERBOARD */}
        {/* ===================================================================== */}
        <div className="bg-white border border-[#DCDAD4] rounded-2xl p-4 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-[#ECEBE6] pb-2.5">
            <div className="flex items-center space-x-2">
              <Award className="w-5 h-5 text-[#B47A18]" />
              <div>
                <h2 className="font-serif font-bold text-base text-[#151713]">
                  Colliery Safety Champions
                </h2>
                <div className="text-[10px] font-mono text-[#666861]">
                  DGMS Statutory Performance & Zero-Harm Standing
                </div>
              </div>
            </div>
            <span className="text-[10.5px] font-mono bg-[#FAF6E9] text-[#8A5B0B] border border-[#B47A18]/30 px-2 py-0.5 rounded font-bold">
              ★ TOP MINERS
            </span>
          </div>

          <div className="space-y-2">
            {ranked.slice(0, 3).map((item, idx) => {
              const streak = getZeroHarmStreak(item.worker);
              const isSel = item.worker.id === selectedWorkerId;
              return (
                <div
                  key={item.worker.id}
                  onClick={() => setSelectedWorkerId(item.worker.id)}
                  className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                    isSel
                      ? 'bg-[#EAF3EF] border-[#176B4D] ring-2 ring-[#176B4D]/20 shadow-xs'
                      : 'bg-[#FAF9F6] border-[#ECEBE6] active:bg-white'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center font-serif font-bold text-xs shadow-2xs ${
                        idx === 0
                          ? 'bg-[#B47A18] text-white'
                          : idx === 1
                          ? 'bg-[#536B7D] text-white'
                          : 'bg-[#8B5A2B] text-white'
                      }`}
                    >
                      #{item.rank}
                    </div>

                    <div>
                      <div className="font-bold text-xs text-[#151713]">
                        {item.worker.name}
                      </div>
                      <div className="text-[10px] text-[#666861] font-mono">
                        {item.worker.id} • {item.worker.role}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-mono text-xs font-bold text-[#176B4D]">
                      {item.score} Score
                    </div>
                    <div className="text-[10px] text-[#B47A18] font-mono font-semibold flex items-center justify-end space-x-1">
                      <Flame className="w-3 h-3 text-[#B47A18]" />
                      <span>{streak} Days Streak</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ===================================================================== */}
        {/* 2. CONDITIONAL WORKER STATUS & PERSONALIZED RECOMMENDATIONS */}
        {/* ===================================================================== */}
        <div className="bg-white border border-[#DCDAD4] rounded-2xl p-4 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-[#ECEBE6] pb-2.5">
            <div>
              <div className="text-[10px] font-mono uppercase text-[#666861] font-bold">
                Selected Personnel Performance
              </div>
              <h3 className="font-serif font-bold text-base text-[#151713]">
                {selectedWorker.name} ({selectedWorker.id})
              </h3>
            </div>

            <span
              className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded border ${
                isEscalated
                  ? 'bg-[#FDF2F2] text-[#A83D45] border-[#A83D45]/40'
                  : 'bg-[#EAF3EF] text-[#2D8A61] border-[#2D8A61]/30'
              }`}
            >
              {isEscalated ? '⚠ SAFETY ESCALATION REVIEW' : '● ZERO-HARM PROGRESS'}
            </span>
          </div>

          {/* Metrics Overview Bar */}
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="bg-[#FAF9F6] p-2 rounded-xl border border-[#ECEBE6]">
              <div className="text-[9.5px] font-mono text-[#666861]">COLLIERY RANK</div>
              <div className="font-serif font-bold text-base text-[#151713]">
                #{activeWorkerProfile.currentRank} / {activeWorkerProfile.totalWorkers}
              </div>
            </div>

            <div className="bg-[#FAF9F6] p-2 rounded-xl border border-[#ECEBE6]">
              <div className="text-[9.5px] font-mono text-[#666861]">SAFETY SCORE</div>
              <div className="font-serif font-bold text-base text-[#176B4D]">
                {activeWorkerProfile.safetyScore} / 100
              </div>
            </div>

            <div className="bg-[#FAF9F6] p-2 rounded-xl border border-[#ECEBE6]">
              <div className="text-[9.5px] font-mono text-[#666861]">ZERO-HARM</div>
              <div className="font-serif font-bold text-base text-[#B47A18]">
                {getZeroHarmStreak(selectedWorker)} Days
              </div>
            </div>
          </div>

          {/* Recommendations Block */}
          <div className="space-y-2 pt-1">
            <div className="text-xs font-serif font-bold text-[#151713]">
              {activeWorkerProfile.isTopRank
                ? 'HOW TO MAINTAIN #1 STANDING'
                : `HOW TO ADVANCE TO RANK #${activeWorkerProfile.currentRank - 1}`}
            </div>

            <div className="space-y-2">
              {activeWorkerProfile.recommendations.map((rec) => (
                <div
                  key={rec.id}
                  className={`p-2.5 rounded-xl border text-xs flex items-start space-x-2.5 ${
                    rec.completed
                      ? 'bg-[#EAF3EF]/60 border-[#2D8A61]/30'
                      : 'bg-[#FAF9F6] border-[#ECEBE6]'
                  }`}
                >
                  <div className="mt-0.5 shrink-0">
                    {rec.completed ? (
                      <CheckCircle2 className="w-4 h-4 text-[#2D8A61]" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border-2 border-[#B47A18] flex items-center justify-center text-[9px] font-bold text-[#B47A18]">
                        !
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="font-bold text-[#151713]">{rec.title}</div>
                    <div className="text-[11px] text-[#666861] mt-0.5 leading-relaxed">
                      {rec.description}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ===================================================================== */}
        {/* 3. REPEAT OFFENDER ESCALATION LIST (VIOLATIONS >= 2) */}
        {/* ===================================================================== */}
        <div className="bg-white border border-[#DCDAD4] rounded-2xl p-4 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-[#ECEBE6] pb-2">
            <div className="flex items-center space-x-2">
              <ShieldAlert className="w-4 h-4 text-[#A83D45]" />
              <h3 className="font-serif font-bold text-sm text-[#151713]">
                Repeat Offender Escalation List
              </h3>
            </div>
            <span className="text-[10px] font-mono text-[#A83D45] font-bold bg-[#FDF2F2] px-2 py-0.5 rounded border border-[#A83D45]/30">
              ≥2 VIOLATIONS REQUIRED
            </span>
          </div>

          <p className="text-xs text-[#666861] leading-relaxed">
            Statutory DGMS safety intervention log. Personnel with 2 or more active safety non-compliances requiring supervisor review.
          </p>

          <div className="space-y-2">
            {repeatOffenders.length === 0 ? (
              <div className="p-4 rounded-xl bg-[#EAF3EF] text-center text-xs font-mono text-[#2D8A61] font-bold border border-[#2D8A61]/30">
                ✓ Zero Repeat Offenders in Colliery. All Personnel Compliant.
              </div>
            ) : (
              repeatOffenders.map((offender) => {
                const count = getViolationCount(offender);
                return (
                  <div
                    key={offender.id}
                    onClick={() => setSelectedWorkerId(offender.id)}
                    className="p-3 rounded-xl bg-[#FDF2F2] border border-[#A83D45]/40 space-y-1.5 cursor-pointer active:bg-[#FAF9F6]"
                  >
                    <div className="flex items-center justify-between">
                      <div className="font-bold text-xs text-[#151713]">
                        {offender.name}
                      </div>
                      <span className="text-[10px] font-mono font-bold bg-[#A83D45] text-white px-2 py-0.5 rounded">
                        {count} VIOLATIONS
                      </span>
                    </div>

                    <div className="text-[11px] text-[#666861] font-mono">
                      {offender.id} • {offender.role} • {offender.zoneId.replace('zone-', 'Zone ').toUpperCase()}
                    </div>

                    <div className="text-[10.5px] text-[#A83D45] font-semibold flex items-center space-x-1 pt-1 border-t border-black/5">
                      <AlertTriangle className="w-3 h-3 shrink-0" />
                      <span>SUPERVISOR REVIEW REQUIRED • Ref: DGMS-RULE-181</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </MobileLayout>
  );
};
