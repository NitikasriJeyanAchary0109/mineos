import React from 'react';
import { ControlRoomLayout } from '../../components/controlroom/ControlRoomLayout';
import { ConnectionStatusBar } from '../../components/controlroom/ConnectionStatusBar';
import { LiveWorkerRoster } from '../../components/controlroom/LiveWorkerRoster';
import { MineDigitalTwin } from '../../components/shared/MineDigitalTwin';
import { SelectedWorkerTelemetry } from '../../components/controlroom/SelectedWorkerTelemetry';
import { GasEnvironmentalPanel } from '../../components/controlroom/GasEnvironmentalPanel';
import { AlertsFeed } from '../../components/controlroom/AlertsFeed';
import { useSafety } from '../../context/SafetyContext';
import { useNavigate } from 'react-router-dom';
import {
  Maximize2,
  Layers,
  AlertTriangle,
  Volume2,
  VolumeX,
  ExternalLink,
  Check,
} from 'lucide-react';

export const ControlRoomDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    workers,
    zones,
    alerts,
    selectedWorkerId,
    selectedWorker,
    setSelectedWorkerId,
    togglePpePart,
    selectedZoneTelemetry,
    activeEmergency,
    dismissEmergency,
    resolveActiveEmergency,
    hasCriticalHazard,
    primaryCriticalHazard,
    isAlarmSilenced,
    silenceAlarm,
    resumeAlarm,
  } = useSafety();

  const currentZone = zones.find((z) => z.id === selectedWorker.zoneId);

  return (
    <ControlRoomLayout>
      <div className="space-y-5">
        {/* Top Editorial Header */}
        <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-2 border-b border-[#ECEBE6] pb-4">
          <div>
            <div className="text-[11px] font-mono tracking-[0.2em] uppercase text-[#666861] font-semibold">
              Mine Operations
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl text-[#151713] font-normal tracking-tight mt-0.5">
              Underground safety at a glance.
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-[#666861] max-w-md">
            Live personnel, environmental and safety intelligence across all active mine levels.
          </p>
        </div>

        {/* ==================== CRITICAL HAZARD ALERT SECTION ==================== */}
        {hasCriticalHazard && primaryCriticalHazard && (
          <div className="rounded-2xl border-2 border-[#A83D45] bg-[#FDF2F2] p-5 shadow-sm text-[#151713] transition-all animate-in fade-in duration-200">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="space-y-1.5">
                <div className="flex items-center space-x-2">
                  <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-md bg-[#A83D45] text-white text-[10px] font-mono font-bold uppercase tracking-wider">
                    <AlertTriangle className="w-3 h-3 text-white animate-pulse" />
                    <span>⚠ CRITICAL HAZARD</span>
                  </span>

                  <span className="text-xs font-mono text-[#A83D45]">
                    Detected: {primaryCriticalHazard.timestamp}
                  </span>
                </div>

                <div>
                  <h2 className="font-serif font-bold text-xl sm:text-2xl text-[#A83D45] tracking-tight">
                    {primaryCriticalHazard.title}
                  </h2>
                  <div className="text-sm text-[#151713] font-medium mt-0.5 flex flex-wrap items-center gap-x-2">
                    <span>
                      <strong>{primaryCriticalHazard.workerName}</strong> ·{' '}
                      <span className="font-mono text-xs">{primaryCriticalHazard.workerId}</span>
                    </span>
                    <span className="text-[#666861]">•</span>
                    <span className="text-[#666861]">{primaryCriticalHazard.zoneName}</span>
                  </div>
                  <p className="text-xs text-[#666861] mt-1 font-mono">
                    {primaryCriticalHazard.description}
                  </p>
                </div>
              </div>

              {/* Action Controls */}
              <div className="flex flex-wrap items-center gap-2 shrink-0">
                {/* Silence Alarm Button (audio only, incident stays active) */}
                <button
                  type="button"
                  onClick={isAlarmSilenced ? resumeAlarm : silenceAlarm}
                  className="px-3 py-2 rounded-xl bg-white border border-[#A83D45]/30 hover:bg-[#FAF9F6] text-[#A83D45] text-xs font-mono font-semibold flex items-center space-x-1.5 shadow-2xs transition-colors"
                  title={
                    isAlarmSilenced
                      ? 'Resume audible emergency siren'
                      : 'Silence alarm sound (incident remains active until resolved)'
                  }
                >
                  {isAlarmSilenced ? (
                    <>
                      <VolumeX className="w-3.5 h-3.5 text-[#A83D45]" />
                      <span>SIREN SILENCED (RESUME)</span>
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-3.5 h-3.5 text-[#A83D45] animate-pulse" />
                      <span>SILENCE ALARM</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => navigate('/controlroom/critical-alert')}
                  className="px-4 py-2 rounded-xl bg-[#A83D45] hover:bg-[#92333B] text-white text-xs font-semibold uppercase tracking-wider flex items-center space-x-1.5 shadow-xs transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>OPEN INCIDENT</span>
                </button>

                <button
                  type="button"
                  onClick={() => resolveActiveEmergency(primaryCriticalHazard.id)}
                  className="px-4 py-2 rounded-xl bg-white hover:bg-[#EAF3EF] border border-[#2D8A61] text-[#2D8A61] text-xs font-semibold uppercase tracking-wider flex items-center space-x-1.5 shadow-xs transition-colors"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>RESOLVE INCIDENT</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 3-Column Command Center Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Column 1: Left Sidebar — Live Worker Roster (3 cols) */}
          <div className="lg:col-span-3">
            <LiveWorkerRoster
              onSelectWorker={(id) => setSelectedWorkerId(id)}
            />
          </div>

          {/* Column 2: Center Stage — 3D Mine Subterranean Digital-Twin (5 cols on lg, 5 on xl) */}
          <div className="lg:col-span-5 flex flex-col space-y-2.5">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center space-x-2">
                <Layers className="w-4 h-4 text-[#176B4D]" />
                <span className="font-serif font-semibold text-sm text-[#151713]">
                  Subterranean Spatial Mine Map (3D)
                </span>
              </div>

              <button
                onClick={() => navigate('/controlroom/mine-3d')}
                className="text-xs text-[#176B4D] hover:text-[#13563D] font-medium flex items-center space-x-1"
              >
                <span>Full-Screen</span>
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* 3D Mine Center Stage container */}
            <div className="rounded-2xl overflow-hidden border border-[#DCDAD4] shadow-sm bg-[#171A17]">
              <MineDigitalTwin
                workers={workers}
                zones={zones}
                alerts={alerts}
                selectedWorkerId={selectedWorkerId}
                onSelectWorker={(id) => setSelectedWorkerId(id)}
                fullScreen={false}
              />
            </div>

            {/* Quick Status Legend Bar */}
            <div className="bg-white border border-[#DCDAD4] rounded-xl p-3 flex flex-wrap items-center justify-between gap-2 text-xs text-[#666861] shadow-xs">
              <div className="flex items-center space-x-3 text-[11px]">
                <span className="flex items-center space-x-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#2D8A61]" />
                  <span className="text-[#151713]">Safe</span>
                </span>
                <span className="flex items-center space-x-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#B47A18]" />
                  <span className="text-[#151713]">Attention</span>
                </span>
                <span className="flex items-center space-x-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#A83D45]" />
                  <span className="text-[#151713]">Critical</span>
                </span>
              </div>
              <span className="text-xs font-mono text-[#666861]">
                Drag to orbit. Scroll to zoom. Click node to inspect.
              </span>
            </div>
          </div>

          {/* Column 3: Right Rail — Dual Scoped Telemetry Panels (4 cols) */}
          <div className="lg:col-span-4 flex flex-col space-y-3">
            {/* Panel 1: Selected Worker Telemetry (Heart rate, SpO2, Fall, 4-Point PPE) */}
            <SelectedWorkerTelemetry
              worker={selectedWorker}
              onTogglePpePart={togglePpePart}
            />

            {/* Panel 2: Gas & Environmental Telemetry (Scoped to Selected Worker's Zone) */}
            <GasEnvironmentalPanel
              telemetry={selectedZoneTelemetry}
              zoneName={currentZone?.name}
            />
          </div>
        </div>

        {/* Bottom Alerts Feed */}
        <div className="pt-1">
          <AlertsFeed
            onSelectAlert={(alert) => {
              if (alert.severity === 'critical') {
                navigate('/controlroom/critical-alert');
              }
            }}
          />
        </div>
      </div>
    </ControlRoomLayout>
  );
};
