import React, { useState, useMemo } from 'react';
import { Worker } from '../../types/safety';
import { useSafety } from '../../context/SafetyContext';
import { getSafetyScore } from '../../utils/safetyScoring';
import {
  Users,
  Heart,
  MapPin,
  Activity,
  ShieldAlert,
  ShieldCheck,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

interface LiveWorkerRosterProps {
  onSelectWorker?: (workerId: string) => void;
}

export const LiveWorkerRoster: React.FC<LiveWorkerRosterProps> = ({ onSelectWorker }) => {
  const { workers, selectedWorkerId, setSelectedWorkerId } = useSafety();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedZone, setSelectedZone] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'safe' | 'attention' | 'critical'>('all');

  const handleSelect = (workerId: string) => {
    setSelectedWorkerId(workerId);
    if (onSelectWorker) onSelectWorker(workerId);
  };

  const getStatusDotColor = (status: string) => {
    if (status === 'critical') return 'bg-[#A83D45] animate-pulse';
    if (status === 'attention') return 'bg-[#B47A18]';
    return 'bg-[#2D8A61]';
  };

  const getHrColor = (hr: number, status: string) => {
    if (status === 'critical' || hr > 130) return 'text-[#A83D45] font-bold';
    if (status === 'attention' || hr > 100) return 'text-[#B47A18] font-bold';
    return 'text-[#151713]';
  };

  const filteredWorkers = useMemo(() => {
    return workers.filter((w) => {
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !q ||
        w.name.toLowerCase().includes(q) ||
        w.id.toLowerCase().includes(q) ||
        w.role.toLowerCase().includes(q);

      const matchesZone =
        selectedZone === 'all' ||
        w.zoneId.toLowerCase() === selectedZone.toLowerCase();

      const matchesStatus =
        statusFilter === 'all' || w.status === statusFilter;

      return matchesSearch && matchesZone && matchesStatus;
    });
  }, [workers, searchQuery, selectedZone, statusFilter]);

  return (
    <div className="bg-white border border-[#DCDAD4] rounded-2xl p-4 flex flex-col h-full space-y-3 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#ECEBE6] pb-2.5">
        <div className="flex items-center space-x-2">
          <Users className="w-4 h-4 text-[#176B4D]" />
          <h3 className="font-serif font-semibold text-sm text-[#151713]">
            Live Worker Roster
          </h3>
        </div>
        <span className="text-[11px] font-medium text-[#176B4D] bg-[#EAF3EF] px-2 py-0.5 rounded-md font-mono border border-[#176B4D]/20">
          {filteredWorkers.length}/{workers.length} ACTIVE
        </span>
      </div>

      {/* Filter & Search Bar */}
      <div className="space-y-2">
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-[#666861] absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search miners by name, ID or role..."
            className="w-full bg-[#FAF9F6] border border-[#DCDAD4] focus:border-[#176B4D] rounded-xl pl-8 pr-3 py-1.5 text-xs text-[#151713] font-mono focus:outline-none focus:bg-white transition-colors"
          />
        </div>

        {/* Status Filter Tabs */}
        <div className="grid grid-cols-4 gap-1 p-0.5 bg-[#FAF9F6] border border-[#ECEBE6] rounded-xl text-[10px] font-mono">
          {(['all', 'safe', 'attention', 'critical'] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setStatusFilter(s)}
              className={`py-1 rounded-lg text-center font-semibold transition-all capitalize ${
                statusFilter === s
                  ? s === 'critical'
                    ? 'bg-[#A83D45] text-white shadow-xs'
                    : s === 'attention'
                    ? 'bg-[#B47A18] text-white shadow-xs'
                    : 'bg-[#176B4D] text-white shadow-xs'
                  : 'text-[#666861] hover:text-[#151713]'
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Zone Filter Chips */}
        <div className="flex flex-wrap gap-1">
          {['all', 'zone-a', 'zone-b', 'zone-c', 'zone-d'].map((z) => (
            <button
              key={z}
              type="button"
              onClick={() => setSelectedZone(z)}
              className={`px-2 py-0.5 rounded-lg text-[9.5px] font-mono font-bold transition-all ${
                selectedZone === z
                  ? 'bg-[#151713] text-white shadow-xs'
                  : 'bg-[#FAF9F6] border border-[#DCDAD4] text-[#666861] hover:text-[#151713] hover:bg-white'
              }`}
            >
              {z === 'all' ? 'ALL ZONES' : z.replace('zone-', 'ZONE ').toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Worker List Rows */}
      <div className="space-y-2 overflow-y-auto max-h-[520px] pr-1">
        {filteredWorkers.length === 0 ? (
          <div className="text-center py-6 text-xs text-[#666861] font-mono">
            No miners match this filter criteria.
          </div>
        ) : (
          filteredWorkers.map((w) => {
            const isSelected = w.id === selectedWorkerId;
            const isCritical = w.status === 'critical';
            const isAttention = w.status === 'attention';
            const score = getSafetyScore(w);

            const ppeCount =
              (w.ppeStatus.helmet ? 1 : 0) +
              (w.ppeStatus.vest ? 1 : 0) +
              (w.ppeStatus.boots ? 1 : 0) +
              (w.ppeStatus.gloves ? 1 : 0);

            return (
              <div
                key={w.id}
                onClick={() => handleSelect(w.id)}
                className={`p-3 rounded-xl border transition-all cursor-pointer select-none flex flex-col space-y-2 relative ${
                  isSelected
                    ? 'bg-[#EAF3EF] border-[#176B4D] ring-2 ring-[#176B4D]/30 shadow-xs'
                    : isCritical
                    ? 'bg-[#FDF2F2] border-[#A83D45]/60 hover:border-[#A83D45]'
                    : isAttention
                    ? 'bg-[#FEF9E7] border-[#B47A18]/50 hover:border-[#B47A18]'
                    : 'bg-[#FAF9F6] border-[#ECEBE6] hover:bg-white hover:border-[#DCDAD4]'
                }`}
              >
                {/* Top Row: Name, Score & Status Dot */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className={`w-2 h-2 rounded-full shrink-0 ${getStatusDotColor(w.status)}`} />
                    <div>
                      <div className="font-semibold text-xs text-[#151713] leading-tight">
                        {w.name}
                      </div>
                      <div className="text-[10px] text-[#666861] font-mono leading-tight mt-0.5">
                        {w.role}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-1.5 shrink-0">
                    <span
                      className={`font-mono text-[10px] font-bold px-1.5 py-0.5 rounded border ${
                        score >= 90
                          ? 'bg-[#EAF3EF] text-[#2D8A61] border-[#2D8A61]/30'
                          : score >= 75
                          ? 'bg-[#FEF9E7] text-[#B47A18] border-[#B47A18]/30'
                          : 'bg-[#FDF2F2] text-[#A83D45] border-[#A83D45]/30'
                      }`}
                      title={`Statutory Safety Score: ${score}/100`}
                    >
                      {score} pts
                    </span>

                    <span className="font-mono text-[10px] text-[#666861] bg-white px-1.5 py-0.5 rounded border border-[#DCDAD4]">
                      {w.id}
                    </span>
                  </div>
                </div>

                {/* Bottom Row: Zone, Vitals & PPE Pill */}
                <div className="flex items-center justify-between text-xs pt-1.5 border-t border-black/5">
                  <div className="flex items-center space-x-1 text-[11px] text-[#666861] font-mono">
                    <MapPin className="w-3 h-3 text-[#176B4D]" />
                    <span>{w.zoneId.replace('zone-', 'Z-').toUpperCase()}</span>
                  </div>

                  <div className="flex items-center space-x-2">
                    {/* 4-Point PPE Mini Tag */}
                    <span
                      className={`text-[9.5px] font-mono font-semibold px-1.5 py-0.2 rounded ${
                        ppeCount === 4
                          ? 'bg-white text-[#2D8A61] border border-[#2D8A61]/30'
                          : 'bg-[#FDF2F2] text-[#A83D45] border border-[#A83D45]/40'
                      }`}
                    >
                      PPE {ppeCount}/4 {ppeCount === 4 ? '✓' : '⚠'}
                    </span>

                    {/* Heart Rate */}
                    <div className="flex items-center space-x-1 font-mono text-xs">
                      <Heart className={`w-3 h-3 ${getHrColor(w.vitals.heartRate, w.status)}`} />
                      <span className={getHrColor(w.vitals.heartRate, w.status)}>
                        {w.vitals.heartRate}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
