import React, { useState, useMemo } from 'react';
import { ControlRoomLayout } from '../../components/controlroom/ControlRoomLayout';
import { WorkerDetailPanel } from '../../components/controlroom/WorkerDetailPanel';
import { useSafety } from '../../context/SafetyContext';
import {
  UserCheck,
  Users,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Search,
  CheckCircle2,
  XCircle,
  Filter,
} from 'lucide-react';
import { getSafetyScore, getZeroHarmStreak } from '../../utils/safetyScoring';

export const SelectedWorkerPage: React.FC = () => {
  const { workers, selectedWorker, selectedWorkerId, setSelectedWorkerId } = useSafety();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'compliant' | 'noncompliant'>('all');

  // Filter workers based on search and compliance status
  const filteredWorkers = useMemo(() => {
    return workers.filter((w) => {
      const matchesSearch =
        w.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        w.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        w.zoneId.toLowerCase().includes(searchQuery.toLowerCase());

      const isCompliant =
        w.ppeStatus.helmet &&
        w.ppeStatus.vest &&
        w.ppeStatus.boots &&
        w.ppeStatus.gloves;

      if (!matchesSearch) return false;
      if (filterMode === 'compliant') return isCompliant;
      if (filterMode === 'noncompliant') return !isCompliant;
      return true;
    });
  }, [workers, searchQuery, filterMode]);

  return (
    <ControlRoomLayout>
      <div className="space-y-4 text-[#151713]">
        {/* ==================== PAGE HEADER ==================== */}
        <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-2 border-b border-[#ECEBE6] pb-3">
          <div>
            <h1 className="font-serif text-2xl sm:text-3xl text-[#151713] font-normal tracking-tight">
              Worker Telemetry & PPE Inspector
            </h1>
            <p className="text-xs sm:text-sm text-[#666861] mt-0.5">
              Live personnel telemetry, wearable sensor data and PPE verification.
            </p>
          </div>

          <div className="flex items-center space-x-2 text-xs font-mono text-[#666861]">
            <span className="w-2 h-2 rounded-full bg-[#2D8A61] animate-pulse" />
            <span>AI PPE VISION ACTIVE (DGMS LEVEL 1)</span>
          </div>
        </div>

        {/* ==================== MASTER-DETAIL DUAL COLUMN LAYOUT ==================== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Left Column: Workers Underground Roster (4 cols) */}
          <div className="lg:col-span-4 bg-white border border-[#DCDAD4] rounded-2xl p-4 flex flex-col space-y-3 shadow-sm">
            <div className="flex items-center justify-between border-b border-[#ECEBE6] pb-2.5">
              <span className="font-serif font-semibold text-sm text-[#151713] flex items-center space-x-2">
                <Users className="w-4 h-4 text-[#176B4D]" />
                <span>Underground Personnel ({workers.length})</span>
              </span>
              <span className="text-[10px] font-mono text-[#666861] bg-[#FAF9F6] border border-[#ECEBE6] px-2 py-0.5 rounded">
                Shift A Active
              </span>
            </div>

            {/* Quick Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-[#666861] absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search name, ID or zone..."
                className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-[#ECEBE6] bg-[#FAF9F6] text-xs text-[#151713] placeholder-[#666861] focus:outline-none focus:border-[#176B4D] focus:bg-white transition-all"
              />
            </div>

            {/* Filter Tabs: All, Compliant, Non-Compliant */}
            <div className="grid grid-cols-3 gap-1 p-1 bg-[#FAF9F6] border border-[#ECEBE6] rounded-xl text-[11px] font-mono">
              <button
                onClick={() => setFilterMode('all')}
                className={`py-1 rounded-lg text-center font-medium transition-colors ${
                  filterMode === 'all'
                    ? 'bg-white text-[#151713] shadow-xs font-semibold'
                    : 'text-[#666861] hover:text-[#151713]'
                }`}
              >
                All ({workers.length})
              </button>
              <button
                onClick={() => setFilterMode('compliant')}
                className={`py-1 rounded-lg text-center font-medium transition-colors ${
                  filterMode === 'compliant'
                    ? 'bg-white text-[#2D8A61] shadow-xs font-semibold'
                    : 'text-[#666861] hover:text-[#2D8A61]'
                }`}
              >
                Pass ({workers.filter((w) => w.ppeStatus.helmet && w.ppeStatus.vest && w.ppeStatus.boots && w.ppeStatus.gloves).length})
              </button>
              <button
                onClick={() => setFilterMode('noncompliant')}
                className={`py-1 rounded-lg text-center font-medium transition-colors ${
                  filterMode === 'noncompliant'
                    ? 'bg-white text-[#A83D45] shadow-xs font-semibold'
                    : 'text-[#666861] hover:text-[#A83D45]'
                }`}
              >
                Alert ({workers.filter((w) => !(w.ppeStatus.helmet && w.ppeStatus.vest && w.ppeStatus.boots && w.ppeStatus.gloves)).length})
              </button>
            </div>

            {/* Worker Cards Roster */}
            <div className="space-y-2 overflow-y-auto max-h-[640px] pr-1">
              {filteredWorkers.map((worker) => {
                const isSelected = worker.id === selectedWorkerId;
                const isCritical = worker.status === 'critical';
                const isAttention = worker.status === 'attention';

                const ppePassedCount =
                  (worker.ppeStatus.helmet ? 1 : 0) +
                  (worker.ppeStatus.vest ? 1 : 0) +
                  (worker.ppeStatus.gloves ? 1 : 0) +
                  (worker.ppeStatus.boots ? 1 : 0);

                const isPpeCompliant = ppePassedCount === 4;

                return (
                  <div
                    key={worker.id}
                    onClick={() => setSelectedWorkerId(worker.id)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer select-none ${
                      isSelected
                        ? 'bg-[#EAF3EF] border-[#176B4D] shadow-xs ring-1 ring-[#176B4D]/20'
                        : isCritical
                        ? 'bg-[#FDF2F2] border-[#A83D45]/40'
                        : isAttention
                        ? 'bg-[#FEF9E7] border-[#B47A18]/40'
                        : 'bg-[#FAF9F6] border-[#ECEBE6] hover:bg-white hover:border-[#DCDAD4]'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-2.5">
                        <div
                          className={`w-8 h-8 rounded-lg border flex items-center justify-center font-serif font-bold text-xs ${
                            isSelected
                              ? 'bg-[#176B4D] text-white border-[#176B4D]'
                              : 'bg-white text-[#176B4D] border-[#DCDAD4]'
                          }`}
                        >
                          {worker.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-serif font-bold text-xs text-[#151713]">
                            {worker.name}
                          </div>
                          <div className="text-[10px] font-mono text-[#666861]">
                            {worker.id} • {worker.role}
                          </div>
                        </div>
                      </div>

                      {/* PPE Compliance Badge */}
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold flex items-center space-x-1 ${
                          isPpeCompliant
                            ? 'bg-[#EAF3EF] text-[#2D8A61] border border-[#2D8A61]/30'
                            : 'bg-[#FDF2F2] text-[#A83D45] border border-[#A83D45]/40 animate-pulse'
                        }`}
                      >
                        <span>{ppePassedCount}/4 PPE</span>
                        {isPpeCompliant ? (
                          <CheckCircle2 className="w-2.5 h-2.5" />
                        ) : (
                          <XCircle className="w-2.5 h-2.5" />
                        )}
                      </span>
                    </div>

                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#ECEBE6] text-[11px] text-[#666861] font-mono">
                      <span>{worker.zoneId.toUpperCase()}</span>
                      <span className="text-[#151713] font-semibold">
                        Score: {getSafetyScore(worker)} • {getZeroHarmStreak(worker).currentDays}d streak
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Full Read-Only PPE & Telemetry Detail Panel (8 cols) */}
          <div className="lg:col-span-8">
            {selectedWorker ? (
              <WorkerDetailPanel worker={selectedWorker} />
            ) : (
              <div className="bg-white border border-[#DCDAD4] rounded-2xl p-12 text-center text-[#666861]">
                <Users className="w-8 h-8 mx-auto text-[#176B4D] mb-2 opacity-50" />
                <div className="font-serif font-semibold text-base text-[#151713]">
                  No Worker Selected
                </div>
                <div className="text-xs mt-1">
                  Select a subterranean worker from the left roster to view their live PPE verification and telemetry.
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </ControlRoomLayout>
  );
};
