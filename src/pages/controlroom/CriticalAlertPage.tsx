import React, { useState, useEffect } from 'react';
import { ControlRoomLayout } from '../../components/controlroom/ControlRoomLayout';
import { MineDigitalTwin } from '../../components/shared/MineDigitalTwin';
import { useSafety } from '../../context/SafetyContext';
import { useNavigate } from 'react-router-dom';
import { sirenAudio } from '../../utils/sirenAudio';
import {
  AlertOctagon,
  AlertTriangle,
  Radio,
  Clock,
  MapPin,
  Heart,
  Activity,
  CheckCircle,
  Volume2,
  VolumeX,
  Users,
  PhoneCall,
  ShieldAlert,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

interface IncidentAuditEvent {
  id: string;
  type: string;
  action: string;
  zone: string;
  operator: string;
  timestamp: string;
  detail?: string;
}

export const CriticalAlertPage: React.FC = () => {
  const navigate = useNavigate();
  const { workers, zones, alerts, resolveActiveEmergency } = useSafety();

  const [teamDispatched, setTeamDispatched] = useState(false);
  const [sirenStatus, setSirenStatus] = useState<'STANDBY' | 'ACTIVE' | 'SILENCED'>('STANDBY');
  const [sirenActivatedTime, setSirenActivatedTime] = useState<string | null>(null);
  const [sirenSilencedTime, setSirenSilencedTime] = useState<string | null>(null);
  const isAlertActive = alerts.some((a) => !a.acknowledged && (a.severity === 'critical' || a.id === 'ALT-109'));
  const [userResolved, setUserResolved] = useState(false);
  const resolved = !isAlertActive || userResolved;

  // Incident & Emergency Protocol Audit Log
  const [auditEvents, setAuditEvents] = useState<IncidentAuditEvent[]>([
    {
      id: 'aud-1',
      type: 'IMU FALL TELEMETRY',
      action: 'HIGH-G IMPACT TRIGGER',
      zone: 'Zone C — Deep Longwall Extraction Face',
      operator: 'Autonomous Edge Gateway (ESP32-NODE-05)',
      timestamp: '14:28:10 IST',
      detail: 'Worker Sunil Marandi (WM-6288) motionless after fall impact (-440m).',
    },
  ]);

  // Audio cleanup on unmount: ensure siren sound stops if navigating away
  useEffect(() => {
    return () => {
      sirenAudio.stop();
    };
  }, []);

  // Find worker involved in fall alert (Sunil Marandi WM-6288 or fallback)
  const targetWorker =
    workers.find((w) => w.id === 'WM-6288') ||
    workers.find((w) => w.status === 'critical') ||
    workers[1];

  const handleActivateSiren = () => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-IN', { hour12: false });
    sirenAudio.start();
    setSirenStatus('ACTIVE');
    setSirenActivatedTime(timeStr);

    setAuditEvents((prev) => [
      {
        id: `aud-${Date.now()}`,
        type: 'EVACUATION SIREN',
        action: 'ACTIVATED',
        zone: 'Zone C',
        operator: 'Operations Director Rao',
        timestamp: `${timeStr} IST`,
        detail: 'Zone C emergency broadcast initiated. Audible evacuation acoustic horn engaged.',
      },
      ...prev,
    ]);
  };

  const handleSilenceSiren = () => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-IN', { hour12: false });
    sirenAudio.stop();
    setSirenStatus('SILENCED');
    setSirenSilencedTime(timeStr);

    setAuditEvents((prev) => [
      {
        id: `aud-${Date.now()}`,
        type: 'EVACUATION SIREN',
        action: 'SILENCED',
        zone: 'Zone C',
        operator: 'Operations Director Rao',
        timestamp: `${timeStr} IST`,
        detail: 'Audible evacuation siren silenced by operator. Standby incident protocol retained.',
      },
      ...prev,
    ]);
  };

  const handleResolve = () => {
    sirenAudio.stop();
    setSirenStatus((prev) => (prev === 'ACTIVE' ? 'SILENCED' : prev));
    resolveActiveEmergency('ALT-109');
    setUserResolved(true);

    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-IN', { hour12: false });
    setAuditEvents((prev) => [
      {
        id: `aud-${Date.now()}`,
        type: 'CRITICAL ALERT RESOLUTION',
        action: 'RESOLVED',
        zone: 'Zone C',
        operator: 'Operations Director Rao',
        timestamp: `${timeStr} IST`,
        detail: 'Incident #ALT-109 verified, acknowledged and cleared across all control pages.',
      },
      ...prev,
    ]);
  };

  return (
    <ControlRoomLayout>
      <div className="space-y-5">
        {/* Authoritative Incident Banner */}
        <div
          className={`p-5 rounded-2xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
            resolved
              ? 'bg-[#EAF3EF] border-[#2D8A61]/30 text-[#151713]'
              : 'bg-[#FDF2F2] border-[#A83D45]/40 text-[#151713]'
          }`}
        >
          <div className="flex items-start space-x-4">
            <div
              className={`p-3 rounded-xl border mt-0.5 shrink-0 ${
                resolved
                  ? 'bg-white border-[#2D8A61]/30 text-[#2D8A61]'
                  : 'bg-[#A83D45] border-[#A83D45] text-white'
              }`}
            >
              <AlertOctagon className="w-6 h-6 stroke-[2]" />
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-x-3 text-xs font-mono">
                <span
                  className={`font-semibold px-2 py-0.5 rounded text-[11px] ${
                    resolved
                      ? 'bg-[#2D8A61] text-white'
                      : 'bg-[#A83D45] text-white'
                  }`}
                >
                  {resolved ? 'RESOLVED' : 'CRITICAL PRIORITY'}
                </span>
                <span className="text-[#666861] font-semibold">INCIDENT #ALT-109</span>
                <span className="text-[#666861]">•</span>
                <span className="text-[#666861]">Time: 14:28:10 IST</span>
              </div>

              <h1 className="font-serif text-2xl sm:text-3xl font-semibold tracking-tight text-[#151713] mt-1">
                {resolved
                  ? 'Incident Logged & Section Cleared'
                  : 'Critical Slip & Fall Detected'}
              </h1>

              <div className="flex flex-wrap items-center gap-x-4 text-xs text-[#666861] mt-1 font-mono">
                <span>Subterranean Sector: <strong className="text-[#151713]">Zone-C</strong></span>
                <span>•</span>
                <span>Depth: <strong className="text-[#151713]">-440m</strong></span>
                <span>•</span>
                <span>Continuous Haulage Sub-Level 4</span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            {!resolved ? (
              <button
                onClick={handleResolve}
                className="px-4 py-2.5 rounded-xl bg-[#176B4D] hover:bg-[#13563D] text-white text-xs font-semibold shadow-xs transition-colors flex items-center space-x-2"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Acknowledge Operator</span>
              </button>
            ) : (
              <div className="flex items-center space-x-2 text-xs text-[#2D8A61] font-medium bg-white px-3.5 py-2 rounded-xl border border-[#2D8A61]/30 shadow-xs">
                <CheckCircle className="w-4 h-4 text-[#2D8A61]" />
                <span>Acknowledged by Operator • Resolved</span>
              </div>
            )}
          </div>
        </div>

        {/* Operational Split: 3D Mine Highlight + Safety Response Command Panel */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
          {/* 3D Mine Spatial Coordinate View (7 cols) */}
          <div className="xl:col-span-7 flex flex-col space-y-3">
            <div className="flex items-center justify-between text-xs text-[#666861]">
              <span className="font-medium text-[#151713] flex items-center space-x-1.5">
                <MapPin className="w-4 h-4 text-[#176B4D]" />
                <span>Subterranean Coordinate Lock</span>
              </span>
              <span className="font-mono text-[#A83D45] font-semibold">
                Sector Grid: [13.2, -4.0, 8.8] / Zone C Face
              </span>
            </div>

            <div className="rounded-2xl overflow-hidden border border-[#DCDAD4] shadow-sm bg-[#171A17]">
              <MineDigitalTwin
                workers={workers}
                zones={zones}
                alerts={alerts}
                selectedWorkerId={targetWorker.id}
                fullScreen={false}
              />
            </div>

            <div className="bg-white border border-[#DCDAD4] rounded-xl p-3 flex items-center justify-between text-xs text-[#666861] shadow-xs font-mono">
              <span>Stationary for 2m 14s</span>
              <span className="text-[#176B4D]">Repeater Node RPT-04 link active</span>
            </div>
          </div>

          {/* Right: Worker Card & Response Protocol Panel (5 cols) */}
          <div className="xl:col-span-5 space-y-4">
            {/* Worker Biometric & Sensor Profile Card */}
            <div className="bg-white border border-[#DCDAD4] rounded-2xl p-5 space-y-3.5 shadow-sm">
              <div className="flex items-start justify-between border-b border-[#ECEBE6] pb-3">
                <div>
                  <div className="text-[10px] text-[#666861] uppercase tracking-wider font-semibold">
                    Involved Worker Dossier
                  </div>
                  <div className="font-serif font-semibold text-lg text-[#151713] mt-0.5">
                    {targetWorker.name}
                  </div>
                  <div className="text-xs text-[#666861] font-mono">
                    ID: {targetWorker.id} • {targetWorker.role}
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-lg bg-[#FDF2F2] border border-[#A83D45]/40 text-[#A83D45] text-xs font-semibold">
                  Critical
                </span>
              </div>

              {/* Sensor telemetry grid */}
              <div className="grid grid-cols-2 gap-2.5 text-xs">
                <div className="p-3 rounded-xl bg-[#FAF9F6] border border-[#ECEBE6]">
                  <div className="text-[10px] text-[#666861] uppercase flex items-center space-x-1 font-medium">
                    <Heart className="w-3.5 h-3.5 text-[#A83D45]" />
                    <span>Heart Rate</span>
                  </div>
                  <div className="font-serif font-semibold text-xl text-[#A83D45] mt-1">
                    138 <span className="text-xs font-sans font-normal text-[#666861]">BPM</span>
                  </div>
                  <div className="text-[10px] text-[#666861] mt-0.5">Tachycardia Warning</div>
                </div>

                <div className="p-3 rounded-xl bg-[#FAF9F6] border border-[#ECEBE6]">
                  <div className="text-[10px] text-[#666861] uppercase flex items-center space-x-1 font-medium">
                    <Activity className="w-3.5 h-3.5 text-[#B47A18]" />
                    <span>Blood Oxygen</span>
                  </div>
                  <div className="font-serif font-semibold text-xl text-[#B47A18] mt-1">
                    91% <span className="text-xs font-sans font-normal text-[#666861]">SpO2</span>
                  </div>
                  <div className="text-[10px] text-[#666861] mt-0.5">Hypoxia Alert</div>
                </div>

                <div className="p-3 rounded-xl bg-[#FAF9F6] border border-[#ECEBE6]">
                  <div className="text-[10px] text-[#666861] uppercase font-medium text-[#666861]">Movement</div>
                  <div className="font-serif font-semibold text-base text-[#A83D45] mt-1">
                    Impact Decel.
                  </div>
                  <div className="text-[10px] text-[#666861] mt-0.5">High-G Event @ 14:28</div>
                </div>

                <div className="p-3 rounded-xl bg-[#FAF9F6] border border-[#ECEBE6]">
                  <div className="text-[10px] text-[#666861] uppercase font-medium text-[#666861]">PPE Verification</div>
                  <div className="font-serif font-semibold text-sm text-[#2D8A61] mt-1">
                    Helmet / Vest OK
                  </div>
                  <div className="text-[10px] text-[#666861] mt-0.5">Hardware Attached</div>
                </div>
              </div>
            </div>

            {/* Emergency Response Protocols */}
            <div className="bg-white border border-[#DCDAD4] rounded-2xl p-5 space-y-3 shadow-sm">
              <div className="font-serif font-semibold text-sm text-[#151713]">
                Emergency Response Protocols
              </div>

              <div className="space-y-2.5">
                {/* Action 1: Dispatch Rapid Response Team */}
                <button
                  type="button"
                  onClick={() => setTeamDispatched(!teamDispatched)}
                  className={`w-full p-3.5 rounded-xl border text-xs font-semibold flex items-center justify-between transition-colors ${
                    teamDispatched
                      ? 'bg-[#EAF3EF] border-[#2D8A61]/50 text-[#2D8A61]'
                      : 'bg-[#A83D45] hover:bg-[#92333B] border-[#A83D45] text-white shadow-xs'
                  }`}
                >
                  <span className="flex items-center space-x-2">
                    <Users className="w-4 h-4" />
                    <span>1. Dispatch Rapid Response Team</span>
                  </span>
                  <span className="text-[11px] font-mono">
                    {teamDispatched ? 'DISPATCHED ✓' : 'AUTHORIZE'}
                  </span>
                </button>

                {/* Action 2: Broadcast Evacuation Siren */}
                {sirenStatus === 'STANDBY' && (
                  <button
                    type="button"
                    onClick={handleActivateSiren}
                    className="w-full p-3.5 rounded-xl border border-[#DCDAD4] bg-white hover:bg-[#FAF9F6] text-[#151713] text-xs font-semibold flex items-center justify-between transition-colors shadow-xs group"
                  >
                    <span className="flex items-center space-x-2">
                      <Volume2 className="w-4 h-4 text-[#176B4D] group-hover:scale-110 transition-transform" />
                      <span>2. Broadcast Evacuation Siren</span>
                    </span>
                    <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-md bg-[#FAF9F6] border border-[#ECEBE6] text-[#666861] font-semibold">
                      STANDBY
                    </span>
                  </button>
                )}

                {sirenStatus === 'ACTIVE' && (
                  <div className="space-y-2.5">
                    <div className="w-full p-3.5 rounded-xl border-2 border-[#A83D45] bg-[#FDF2F2] text-[#A83D45] text-xs font-semibold flex items-center justify-between shadow-xs">
                      <span className="flex items-center space-x-2">
                        <Volume2 className="w-4 h-4 text-[#A83D45] animate-bounce" />
                        <span>2. Broadcast Evacuation Siren</span>
                      </span>
                      <div className="flex items-center space-x-2">
                        <span className="text-[11px] font-mono font-bold text-[#A83D45] flex items-center space-x-1.5">
                          <span className="w-2 h-2 rounded-full bg-[#A83D45] animate-ping" />
                          <span>SIREN ACTIVE</span>
                        </span>
                        <button
                          type="button"
                          onClick={handleSilenceSiren}
                          className="px-3 py-1 rounded-lg bg-[#A83D45] hover:bg-[#8f3239] text-white text-xs font-bold font-mono tracking-wide shadow-xs transition-colors"
                        >
                          SILENCE SIREN
                        </button>
                      </div>
                    </div>

                    {/* EMERGENCY SAFETY UX CONFIRMATION / STATUS AREA */}
                    <div className="p-4 rounded-xl bg-[#FDF2F2] border border-[#A83D45]/40 text-[#151713] space-y-3 shadow-sm">
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <div className="font-serif font-bold text-sm text-[#A83D45] flex items-center space-x-2">
                            <AlertTriangle className="w-4 h-4 text-[#A83D45] shrink-0" />
                            <span>⚠ EVACUATION SIREN ACTIVE</span>
                          </div>
                          <div className="text-xs font-medium text-[#151713] pt-0.5">
                            Emergency broadcast active
                          </div>
                          <div className="text-xs text-[#666861] font-mono">
                            Zone C — Deep Longwall Extraction Face
                          </div>
                          <div className="text-[11px] text-[#A83D45] font-mono font-semibold">
                            Activated {sirenActivatedTime || '14:28:32'} IST
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={handleSilenceSiren}
                          className="px-3.5 py-2 rounded-xl bg-[#A83D45] hover:bg-[#8f3239] text-white text-xs font-bold font-mono tracking-wider shadow-sm transition-all hover:scale-105 shrink-0"
                        >
                          SILENCE SIREN
                        </button>
                      </div>

                      <div className="text-[11px] text-[#666861] bg-white/90 p-2.5 rounded-lg border border-[#A83D45]/20 font-mono">
                        Zone C emergency broadcast initiated. Audible evacuation acoustic horn sounding continuously across subterranean working areas.
                      </div>
                    </div>
                  </div>
                )}

                {sirenStatus === 'SILENCED' && (
                  <div className="w-full p-3.5 rounded-xl border border-[#DCDAD4] bg-[#FAF9F6] text-[#151713] text-xs font-semibold flex items-center justify-between shadow-xs">
                    <div className="flex items-center space-x-2">
                      <VolumeX className="w-4 h-4 text-[#666861]" />
                      <span>Broadcast Evacuation Siren</span>
                      <span className="text-[10px] font-mono text-[#666861] ml-1">
                        (Silenced {sirenSilencedTime} IST)
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-[11px] font-mono px-2.5 py-0.5 rounded bg-white border border-[#DCDAD4] text-[#666861] font-bold">
                        SILENCED
                      </span>
                      <button
                        type="button"
                        onClick={handleActivateSiren}
                        className="px-2 py-1 text-[11px] font-mono text-[#176B4D] hover:underline"
                      >
                        Re-Broadcast
                      </button>
                    </div>
                  </div>
                )}

                {/* Action 3: Acknowledge Operator */}
                <button
                  type="button"
                  onClick={handleResolve}
                  className={`w-full p-3.5 rounded-xl border text-xs font-semibold flex items-center justify-between transition-colors shadow-xs ${
                    resolved
                      ? 'bg-[#EAF3EF] border-[#2D8A61]/40 text-[#2D8A61]'
                      : 'bg-white hover:bg-[#FAF9F6] border-[#DCDAD4] text-[#151713]'
                  }`}
                >
                  <span className="flex items-center space-x-2">
                    <CheckCircle className={`w-4 h-4 ${resolved ? 'text-[#2D8A61]' : 'text-[#176B4D]'}`} />
                    <span>3. Acknowledge (Operator) — Resolve Critical Alert</span>
                  </span>
                  <span className={`text-[11px] font-mono font-bold ${resolved ? 'text-[#2D8A61]' : 'text-[#176B4D]'}`}>
                    {resolved ? 'ACKNOWLEDGED & RESOLVED ✓' : 'ACKNOWLEDGE OPERATOR'}
                  </span>
                </button>
              </div>

              {/* Incident Protocol Audit Trail */}
              <div className="bg-[#FAF9F6] border border-[#ECEBE6] rounded-xl p-3.5 space-y-2 mt-3">
                <div className="flex items-center justify-between border-b border-[#ECEBE6] pb-1.5">
                  <div className="text-[10px] font-mono uppercase font-bold text-[#666861] flex items-center space-x-1.5">
                    <Clock className="w-3 h-3 text-[#176B4D]" />
                    <span>Incident Protocol Audit Trail</span>
                  </div>
                  <span className="text-[9px] font-mono text-[#666861]">
                    DGMS Statutory Log
                  </span>
                </div>

                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {auditEvents.map((evt) => (
                    <div
                      key={evt.id}
                      className="text-xs p-2 rounded-lg bg-white border border-[#ECEBE6] flex flex-col space-y-0.5 font-mono shadow-2xs"
                    >
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-bold text-[#151713]">{evt.type}</span>
                        <span
                          className={`px-1.5 py-0.2 rounded font-bold text-[10px] ${
                            evt.action === 'ACTIVATED'
                              ? 'bg-[#FDF2F2] text-[#A83D45] border border-[#A83D45]/30'
                              : evt.action === 'SILENCED'
                              ? 'bg-[#FAF9F6] text-[#666861] border border-[#DCDAD4]'
                              : evt.action === 'RESOLVED'
                              ? 'bg-[#EAF3EF] text-[#2D8A61] border border-[#2D8A61]/30'
                              : 'bg-[#FAF9F6] text-[#151713]'
                          }`}
                        >
                          {evt.action}
                        </span>
                      </div>
                      <div className="text-[10px] text-[#666861] flex items-center justify-between">
                        <span>{evt.zone}</span>
                        <span>{evt.timestamp}</span>
                      </div>
                      <div className="text-[10px] text-[#151713]/80">
                        Operator: <strong className="text-[#151713]">{evt.operator}</strong>
                      </div>
                      {evt.detail && (
                        <div className="text-[9px] text-[#666861] italic pt-0.5">
                          {evt.detail}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ControlRoomLayout>
  );
};
