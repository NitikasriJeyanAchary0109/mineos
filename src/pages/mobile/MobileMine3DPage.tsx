import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MobileLayout } from '../../components/mobile/MobileLayout';
import { MineDigitalTwin } from '../../components/shared/MineDigitalTwin';
import { useSafety } from '../../context/SafetyContext';
import {
  Layers,
  Users,
  Compass,
  RotateCcw,
  Maximize2,
  Minimize2,
  ChevronRight,
  Heart,
  Activity,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  X,
  MapPin,
} from 'lucide-react';

export const MobileMine3DPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    workers,
    zones,
    alerts,
    selectedWorkerId,
    setSelectedWorkerId,
    selectedWorker,
  } = useSafety();

  const [activeZoneFilter, setActiveZoneFilter] = useState<string>('all');
  const [bottomSheetOpen, setBottomSheetOpen] = useState<boolean>(true);

  // Filter workers based on zone
  const filteredWorkers = activeZoneFilter === 'all'
    ? workers
    : workers.filter((w) => w.zoneId === activeZoneFilter);

  const handleSelectWorker = (workerId: string) => {
    setSelectedWorkerId(workerId);
    setBottomSheetOpen(true);
  };

  const ppe = selectedWorker.ppeStatus;
  const ppeList = [
    { label: 'Helmet', ok: Boolean(ppe.helmet) },
    { label: 'Vest', ok: Boolean(ppe.vest) },
    { label: 'Gloves', ok: Boolean(ppe.gloves) },
    { label: 'Boots', ok: Boolean(ppe.boots) },
  ];
  const compliantCount = ppeList.filter((p) => p.ok).length;

  return (
    <MobileLayout activeTab="mine">
      <div className="flex flex-col space-y-2.5 pb-2">
        {/* ===================================================================== */}
        {/* 1. TOP ZONE & TOUCH CONTROLS BAR */}
        {/* ===================================================================== */}
        <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 text-xs font-mono">
          {/* Zone Focus Pills */}
          <div className="flex items-center space-x-1 shrink-0">
            {[
              { id: 'all', label: 'All Levels' },
              { id: 'zone-a', label: 'Zone A (-120m)' },
              { id: 'zone-b', label: 'Zone B (-260m)' },
              { id: 'zone-c', label: 'Zone C (-440m)' },
              { id: 'zone-d', label: 'Zone D (-520m)' },
            ].map((z) => (
              <button
                key={z.id}
                type="button"
                onClick={() => setActiveZoneFilter(z.id)}
                className={`px-2.5 py-1 rounded-xl text-[11px] font-bold shrink-0 transition-all ${
                  activeZoneFilter === z.id
                    ? 'bg-[#176B4D] text-white shadow-xs'
                    : 'bg-white border border-[#DCDAD4] text-[#666861]'
                }`}
              >
                {z.label}
              </button>
            ))}
          </div>
        </div>

        {/* ===================================================================== */}
        {/* 2. 3D CANVAS CONTAINER (TOUCH-FRIENDLY, RESPONSIVE, LANDSCAPE-ADAPTED) */}
        {/* ===================================================================== */}
        <div className="relative w-full h-[52vh] sm:h-[60vh] rounded-2xl overflow-hidden border border-[#DCDAD4] shadow-sm bg-[#F6F5F1]">
          <MineDigitalTwin
            workers={filteredWorkers}
            zones={zones}
            alerts={alerts}
            selectedWorkerId={selectedWorkerId}
            onSelectWorker={handleSelectWorker}
            fullScreen={false}
          />

          {/* Floating Instructions Pill */}
          <div className="absolute top-2.5 left-2.5 z-20 pointer-events-none bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded-lg border border-[#DCDAD4] text-[10px] font-mono text-[#666861] shadow-2xs">
            1-Finger Orbit • Pinch Zoom • Tap Miner
          </div>
        </div>

        {/* ===================================================================== */}
        {/* 3. UNDERGROUND MINER HORIZONTAL QUICK SELECTOR CAROUSEL */}
        {/* ===================================================================== */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs px-1">
            <span className="font-serif font-bold text-xs text-[#151713]">
              Active Underground Personnel ({filteredWorkers.length})
            </span>
            <span className="text-[10px] font-mono text-[#666861]">
              Tap to locate in 3D
            </span>
          </div>

          <div className="flex items-center space-x-2 overflow-x-auto pb-1.5 pt-0.5">
            {filteredWorkers.map((w) => {
              const isSelected = w.id === selectedWorkerId;
              const isCritical = w.status === 'critical';
              return (
                <button
                  key={w.id}
                  onClick={() => handleSelectWorker(w.id)}
                  className={`px-3 py-2 rounded-xl border text-left shrink-0 transition-all flex items-center space-x-2 ${
                    isSelected
                      ? 'bg-[#EAF3EF] border-[#176B4D] ring-2 ring-[#176B4D]/20 shadow-xs'
                      : isCritical
                      ? 'bg-[#FDF2F2] border-[#A83D45]/50'
                      : 'bg-white border-[#DCDAD4] active:bg-[#FAF9F6]'
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full shrink-0 ${
                      isCritical
                        ? 'bg-[#A83D45] animate-ping'
                        : w.status === 'attention'
                        ? 'bg-[#B47A18]'
                        : 'bg-[#2D8A61]'
                    }`}
                  />
                  <div>
                    <div className="font-semibold text-xs text-[#151713] leading-tight">
                      {w.name}
                    </div>
                    <div className="text-[9.5px] text-[#666861] font-mono">
                      {w.id} • {w.zoneId.replace('zone-', 'Z-').toUpperCase()}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* ===================================================================== */}
        {/* 4. SELECTED MINER QUICK INSPECTION CARD */}
        {/* ===================================================================== */}
        {selectedWorker && bottomSheetOpen && (
          <div className="bg-white border border-[#DCDAD4] rounded-2xl p-3.5 shadow-sm space-y-2.5 animate-in fade-in slide-in-from-bottom-2 duration-200">
            <div className="flex items-start justify-between border-b border-[#ECEBE6] pb-2">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-serif font-bold text-sm text-[#151713]">
                    {selectedWorker.name}
                  </span>
                  <span className="text-[10px] font-mono bg-[#FAF9F6] border border-[#DCDAD4] px-1.5 py-0.2 rounded text-[#666861]">
                    {selectedWorker.id}
                  </span>
                </div>
                <div className="text-[11px] text-[#666861] mt-0.5 font-mono">
                  {selectedWorker.role} • {selectedWorker.zoneId.replace('zone-', 'Zone ').toUpperCase()}
                </div>
              </div>

              <div className="flex items-center space-x-1.5">
                <span
                  className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                    selectedWorker.status === 'critical'
                      ? 'bg-[#FDF2F2] text-[#A83D45]'
                      : selectedWorker.status === 'attention'
                      ? 'bg-[#FEF9E7] text-[#B47A18]'
                      : 'bg-[#EAF3EF] text-[#2D8A61]'
                  }`}
                >
                  {selectedWorker.status.toUpperCase()}
                </span>
                <button
                  onClick={() => setBottomSheetOpen(false)}
                  className="p-1 rounded text-[#666861] hover:text-[#151713]"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Vitals Summary Row */}
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="bg-[#FAF9F6] p-2 rounded-xl border border-[#ECEBE6]">
                <div className="text-[9.5px] font-mono text-[#666861] flex items-center justify-center space-x-1">
                  <Heart className="w-3 h-3 text-[#A83D45]" />
                  <span>HEART RATE</span>
                </div>
                <div className="font-serif font-bold text-sm text-[#151713] mt-0.5">
                  {selectedWorker.vitals.heartRate} BPM
                </div>
              </div>

              <div className="bg-[#FAF9F6] p-2 rounded-xl border border-[#ECEBE6]">
                <div className="text-[9.5px] font-mono text-[#666861] flex items-center justify-center space-x-1">
                  <Activity className="w-3 h-3 text-[#176B4D]" />
                  <span>SpO2 OXYGEN</span>
                </div>
                <div className="font-serif font-bold text-sm text-[#151713] mt-0.5">
                  {selectedWorker.vitals.spo2}%
                </div>
              </div>

              <div className="bg-[#FAF9F6] p-2 rounded-xl border border-[#ECEBE6]">
                <div className="text-[9.5px] font-mono text-[#666861] flex items-center justify-center space-x-1">
                  <ShieldCheck className="w-3 h-3 text-[#2D8A61]" />
                  <span>4-POINT PPE</span>
                </div>
                <div className="font-serif font-bold text-sm text-[#2D8A61] mt-0.5">
                  {compliantCount}/4 {compliantCount === 4 ? '✓' : '⚠'}
                </div>
              </div>
            </div>

            {/* 4-Point PPE Check Strip */}
            <div className="grid grid-cols-4 gap-1.5 text-center text-[10.5px]">
              {ppeList.map((item) => (
                <div
                  key={item.label}
                  className={`py-1 px-1 rounded-lg border flex items-center justify-center space-x-1 ${
                    item.ok
                      ? 'bg-[#EAF3EF] border-[#2D8A61]/30 text-[#2D8A61]'
                      : 'bg-[#FDF2F2] border-[#A83D45]/30 text-[#A83D45]'
                  }`}
                >
                  {item.ok ? (
                    <CheckCircle2 className="w-3 h-3 shrink-0" />
                  ) : (
                    <XCircle className="w-3 h-3 shrink-0" />
                  )}
                  <span className="font-semibold">{item.label}</span>
                </div>
              ))}
            </div>

            {/* Button to Open Full Mobile Telemetry Page */}
            <button
              type="button"
              onClick={() => navigate('/mobile/workers')}
              className="w-full py-2 rounded-xl bg-[#176B4D] hover:bg-[#13563D] text-white text-xs font-mono font-bold flex items-center justify-center space-x-1.5 shadow-2xs active:scale-[0.99] transition-all"
            >
              <span>VIEW COMPLETE WORKER TELEMETRY</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </MobileLayout>
  );
};
