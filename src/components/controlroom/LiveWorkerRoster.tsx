import React from 'react';
import { Worker } from '../../types/safety';
import { useSafety } from '../../context/SafetyContext';
import { Users, Heart, MapPin, Activity, ShieldAlert } from 'lucide-react';

interface LiveWorkerRosterProps {
  onSelectWorker?: (workerId: string) => void;
}

export const LiveWorkerRoster: React.FC<LiveWorkerRosterProps> = ({ onSelectWorker }) => {
  const { workers, selectedWorkerId, setSelectedWorkerId } = useSafety();
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedZone, setSelectedZone] = React.useState<string>('all');

  const handleSelect = (workerId: string) => {
    setSelectedWorkerId(workerId);
    if (onSelectWorker) onSelectWorker(workerId);
  };

  const getStatusDotColor = (status: string) => {
    if (status === 'critical') return 'bg-[#A83D45]';
    if (status === 'attention') return 'bg-[#B47A18]';
    return 'bg-[#2D8A61]';
  };

  const getHrColor = (hr: number, status: string) => {
    if (status === 'critical' || hr > 130) return 'text-[#A83D45]';
    if (status === 'attention' || hr > 100) return 'text-[#B47A18]';
    return 'text-[#151713]';
  };

  const filteredWorkers = workers.filter((w) => {
    const q = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !q ||
      w.name.toLowerCase().includes(q) ||
      w.id.toLowerCase().includes(q) ||
      w.role.toLowerCase().includes(q);

    const matchesZone =
      selectedZone === 'all' ||
      w.zoneId.toLowerCase() === selectedZone.toLowerCase();

    return matchesSearch && matchesZone;
  });

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
        <span className="text-[11px] font-medium text-[#176B4D] bg-[#EAF3EF] px-2 py-0.5 rounded-md font-mono">
          {filteredWorkers.length}/{workers.length}
        </span>
      </div>

      {/* Filter & Search Bar */}
      <div className="space-y-2">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Filter miners by name/ID..."
          className="w-full bg-[#FAF9F6] border border-[#DCDAD4] focus:border-[#176B4D] rounded-xl px-2.5 py-1.5 text-xs text-[#151713] font-mono focus:outline-none"
        />

        {/* Zone Pills */}
        <div className="flex flex-wrap gap-1">
          {['all', 'zone-a', 'zone-b', 'zone-c', 'zone-d'].map((z) => (
            <button
              key={z}
              type="button"
              onClick={() => setSelectedZone(z)}
              className={`px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold transition-colors ${
                selectedZone === z
                  ? 'bg-[#176B4D] text-white'
                  : 'bg-[#FAF9F6] border border-[#DCDAD4] text-[#666861] hover:text-[#151713]'
              }`}
            >
              {z === 'all' ? 'ALL' : z.replace('zone-', 'Z-').toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Worker Rows */}
      <div className="space-y-2 overflow-y-auto max-h-[500px] pr-1">
        {filteredWorkers.map((w) => {
          const isSelected = w.id === selectedWorkerId;
          const isCritical = w.status === 'critical';
          const isAttention = w.status === 'attention';

          return (
            <div
              key={w.id}
              onClick={() => handleSelect(w.id)}
              className={`p-3 rounded-xl border transition-all cursor-pointer select-none flex flex-col space-y-2 ${
                isSelected
                  ? 'bg-[#EAF3EF]/40 border-[#176B4D] shadow-xs'
                  : isCritical
                  ? 'bg-[#FDF2F2] border-[#A83D45]/60'
                  : isAttention
                  ? 'bg-[#FEF9E7] border-[#B47A18]/50'
                  : 'bg-[#FAF9F6] border-[#ECEBE6] hover:bg-white hover:border-[#DCDAD4]'
              }`}
            >
              {/* Top: Name & Status Dot */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className={`w-2 h-2 rounded-full ${getStatusDotColor(w.status)}`} />
                  <div className="font-semibold text-xs text-[#151713]">
                    {w.name}
                  </div>
                </div>

                <span className="font-mono text-[10px] text-[#666861] bg-white px-1.5 py-0.5 rounded border border-[#DCDAD4]">
                  {w.id}
                </span>
              </div>

              {/* Bottom: Zone & Live Heart Rate */}
              <div className="flex items-center justify-between text-xs pt-1 border-t border-[#ECEBE6]">
                <div className="flex items-center space-x-1 text-[11px] text-[#666861]">
                  <MapPin className="w-3 h-3 text-[#176B4D]" />
                  <span>{w.zoneId.toUpperCase()}</span>
                </div>

                <div className="flex items-center space-x-1 font-mono text-xs">
                  <Heart className={`w-3.5 h-3.5 ${getHrColor(w.vitals.heartRate, w.status)}`} />
                  <span className={`font-semibold ${getHrColor(w.vitals.heartRate, w.status)}`}>
                    {w.vitals.heartRate} <span className="text-[10px] font-normal text-[#666861]">BPM</span>
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
