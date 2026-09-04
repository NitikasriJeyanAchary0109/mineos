import React, { useState } from 'react';
import { MobileLayout } from '../../components/mobile/MobileLayout';
import { useSafety } from '../../context/SafetyContext';
import {
  AlertTriangle,
  Volume2,
  VolumeX,
  CheckCircle2,
  PhoneCall,
  Wind,
  BellRing,
  Clock,
  MapPin,
  ShieldAlert,
  Radio,
  Check,
  ArrowRight,
} from 'lucide-react';
import { getFormattedTime } from '../../services/mobileTelemetryBridge';

export const MobileHazardsPage: React.FC = () => {
  const {
    alerts,
    hasCriticalHazard,
    primaryCriticalHazard,
    isAlarmSilenced,
    silenceAlarm,
    resumeAlarm,
    resolveActiveEmergency,
    acknowledgeAlert,
  } = useSafety();

  const [dispatchedRrt, setDispatchedRrt] = useState(false);
  const [broadcastedEvac, setBroadcastedEvac] = useState(false);
  const [overriddenVent, setOverriddenVent] = useState(false);
  const [resolveSuccess, setResolveSuccess] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleResolve = () => {
    if (primaryCriticalHazard) {
      resolveActiveEmergency(primaryCriticalHazard.id);
      setResolveSuccess(true);
      showToast('Incident resolved. Siren halted. Personnel status normalized.');
      setTimeout(() => setResolveSuccess(false), 4000);
    }
  };

  const criticalAlerts = alerts.filter((a) => a.severity === 'critical');
  const warningAlerts = alerts.filter((a) => a.severity === 'warning');

  return (
    <MobileLayout activeTab="hazards">
      <div className="space-y-3.5 pb-2">
        {/* Toast Notification */}
        {toastMsg && (
          <div className="fixed top-14 left-1/2 -translate-x-1/2 z-50 bg-[#151713] text-white text-xs font-mono px-4 py-2 rounded-xl shadow-xl border border-[#2D8A61]/60 flex items-center space-x-2 animate-in fade-in">
            <span className="w-2 h-2 rounded-full bg-[#2D8A61]" />
            <span>{toastMsg}</span>
          </div>
        )}

        {/* ===================================================================== */}
        {/* 1. PRIMARY CRITICAL INCIDENT COMMAND BANNER */}
        {/* ===================================================================== */}
        {hasCriticalHazard && primaryCriticalHazard ? (
          <div className="bg-[#FDF2F2] border-2 border-[#A83D45] rounded-2xl p-4 shadow-md space-y-3 animate-in fade-in">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#A83D45] flex items-center space-x-1.5">
                <AlertTriangle className="w-4 h-4 animate-ping" />
                <span>⚠ CRITICAL HAZARD ACTIVE</span>
              </span>
              <span className="text-[10px] font-mono bg-[#A83D45] text-white px-2 py-0.5 rounded font-bold">
                INCIDENT ID: {primaryCriticalHazard.id}
              </span>
            </div>

            <div>
              <h1 className="font-serif text-2xl font-bold text-[#151713] leading-tight">
                {primaryCriticalHazard.title}
              </h1>
              <div className="text-xs text-[#666861] mt-1 font-mono">
                Affected Worker: <strong className="text-[#151713]">{primaryCriticalHazard.workerName}</strong> ({primaryCriticalHazard.workerId})
              </div>
              <div className="text-xs text-[#666861] font-mono">
                Subterranean Sector: <strong className="text-[#176B4D]">{primaryCriticalHazard.zoneName}</strong>
              </div>
              <div className="text-xs text-[#666861] font-mono">
                Registered Timestamp: <strong className="text-[#151713]">{primaryCriticalHazard.timestamp}</strong>
              </div>
            </div>

            {/* Siren Audio Controls Card */}
            <div className="bg-white p-3 rounded-xl border border-[#A83D45]/30 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${isAlarmSilenced ? 'bg-[#B47A18]' : 'bg-[#A83D45] animate-ping'}`} />
                <div>
                  <div className="text-xs font-mono font-bold text-[#151713]">
                    {isAlarmSilenced ? 'SIREN OUTPUT SILENCED' : 'SIREN AUDIO ACTIVE'}
                  </div>
                  <div className="text-[10px] text-[#666861]">
                    {isAlarmSilenced ? 'Incident remains active' : 'Multi-tone industrial wail playing'}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (isAlarmSilenced) {
                    resumeAlarm();
                    showToast('Siren audio resumed');
                  } else {
                    silenceAlarm();
                    showToast('Siren muted (Incident still active)');
                  }
                }}
                className="px-3 py-1.5 rounded-lg border border-[#DCDAD4] bg-[#FAF9F6] text-xs font-mono font-bold flex items-center space-x-1.5 shadow-2xs active:bg-white"
              >
                {isAlarmSilenced ? (
                  <>
                    <Volume2 className="w-3.5 h-3.5 text-[#2D8A61]" />
                    <span>Resume Audio</span>
                  </>
                ) : (
                  <>
                    <VolumeX className="w-3.5 h-3.5 text-[#A83D45]" />
                    <span>Silence Audio</span>
                  </>
                )}
              </button>
            </div>

            {/* ===================================================================== */}
            {/* 4 EMERGENCY RESPONSE PROTOCOLS */}
            {/* ===================================================================== */}
            <div className="space-y-2 pt-1">
              <div className="text-[11px] font-mono uppercase text-[#666861] font-bold">
                Emergency Response Protocols
              </div>

              {/* Protocol 1: Dispatch Rapid Response Team */}
              <button
                type="button"
                onClick={() => {
                  setDispatchedRrt(true);
                  showToast('Rapid Response Team dispatched to Zone C');
                }}
                className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between text-xs transition-colors ${
                  dispatchedRrt
                    ? 'bg-[#EAF3EF] border-[#2D8A61]/40 text-[#2D8A61]'
                    : 'bg-white border-[#DCDAD4] text-[#151713] active:bg-[#FAF9F6]'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <PhoneCall className="w-4 h-4 text-[#176B4D]" />
                  <div>
                    <div className="font-bold">1. Dispatch Rapid Response Team (RRT)</div>
                    <div className="text-[10px] text-[#666861]">First-aid & paramedic dispatch to Sector IV</div>
                  </div>
                </div>
                <span className="text-[10px] font-mono font-bold">
                  {dispatchedRrt ? 'DISPATCHED ✓' : 'DISPATCH'}
                </span>
              </button>

              {/* Protocol 2: Broadcast Evacuation Siren */}
              <button
                type="button"
                onClick={() => {
                  setBroadcastedEvac(true);
                  showToast('Subterranean sector evacuation alert broadcasted');
                }}
                className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between text-xs transition-colors ${
                  broadcastedEvac
                    ? 'bg-[#EAF3EF] border-[#2D8A61]/40 text-[#2D8A61]'
                    : 'bg-white border-[#DCDAD4] text-[#151713] active:bg-[#FAF9F6]'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <BellRing className="w-4 h-4 text-[#B47A18]" />
                  <div>
                    <div className="font-bold">2. Broadcast Subterranean Evacuation Alert</div>
                    <div className="text-[10px] text-[#666861]">Activate flashing beacon & strobe lights underground</div>
                  </div>
                </div>
                <span className="text-[10px] font-mono font-bold">
                  {broadcastedEvac ? 'BROADCASTED ✓' : 'BROADCAST'}
                </span>
              </button>

              {/* Protocol 3: Override Zone Ventilation */}
              <button
                type="button"
                onClick={() => {
                  setOverriddenVent(true);
                  showToast('Forced ventilation fans overridden to 100% capacity');
                }}
                className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between text-xs transition-colors ${
                  overriddenVent
                    ? 'bg-[#EAF3EF] border-[#2D8A61]/40 text-[#2D8A61]'
                    : 'bg-white border-[#DCDAD4] text-[#151713] active:bg-[#FAF9F6]'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Wind className="w-4 h-4 text-[#176B4D]" />
                  <div>
                    <div className="font-bold">3. Override Forced Ventilation Fans</div>
                    <div className="text-[10px] text-[#666861]">Boost crosscut intake velocity to 2.4 m/s</div>
                  </div>
                </div>
                <span className="text-[10px] font-mono font-bold">
                  {overriddenVent ? 'OVERRIDDEN ✓' : 'OVERRIDE'}
                </span>
              </button>

              {/* Protocol 4: Acknowledge & Resolve Incident */}
              <button
                type="button"
                onClick={handleResolve}
                className="w-full py-3 rounded-xl bg-[#2D8A61] hover:bg-[#236C4C] text-white font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center space-x-2 shadow-sm active:scale-[0.99] transition-all"
              >
                <Check className="w-4 h-4" />
                <span>ACKNOWLEDGE & RESOLVE INCIDENT</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white border border-[#DCDAD4] rounded-2xl p-4 shadow-xs text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-[#EAF3EF] text-[#2D8A61] flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h2 className="font-serif font-bold text-lg text-[#151713]">
              Zero Active Critical Hazards
            </h2>
            <p className="text-xs text-[#666861] max-w-xs mx-auto leading-relaxed">
              All active subterranean zones, personnel vitals, and atmospheric monitoring channels are operating within statutory bounds.
            </p>
          </div>
        )}

        {/* ===================================================================== */}
        {/* 2. COMPREHENSIVE SAFETY ALERTS STREAM */}
        {/* ===================================================================== */}
        <div className="bg-white border border-[#DCDAD4] rounded-2xl p-3.5 shadow-xs space-y-2.5">
          <div className="flex items-center justify-between border-b border-[#ECEBE6] pb-2">
            <div className="flex items-center space-x-2">
              <ShieldAlert className="w-4 h-4 text-[#176B4D]" />
              <h3 className="font-serif font-bold text-sm text-[#151713]">
                Safety Alerts Register ({alerts.length})
              </h3>
            </div>
          </div>

          <div className="space-y-2">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-3 rounded-xl border flex flex-col space-y-1.5 text-xs transition-colors ${
                  alert.severity === 'critical'
                    ? 'bg-[#FDF2F2] border-[#A83D45]/40 text-[#151713]'
                    : alert.severity === 'warning'
                    ? 'bg-[#FEF9E7] border-[#B47A18]/30 text-[#151713]'
                    : 'bg-[#FAF9F6] border-[#ECEBE6] text-[#151713]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs">{alert.title}</span>
                  <span
                    className={`text-[9.5px] font-mono font-bold uppercase px-1.5 py-0.2 rounded ${
                      alert.severity === 'critical'
                        ? 'bg-[#A83D45] text-white'
                        : alert.severity === 'warning'
                        ? 'bg-[#B47A18] text-white'
                        : 'bg-[#536B7D] text-white'
                    }`}
                  >
                    {alert.severity}
                  </span>
                </div>

                <p className="text-xs text-[#666861] leading-relaxed">
                  {alert.description}
                </p>

                <div className="flex items-center justify-between pt-1 border-t border-black/5 text-[10.5px] font-mono text-[#666861]">
                  <span>{alert.workerName || alert.zoneName} • {alert.timestamp}</span>

                  {!alert.acknowledged ? (
                    <button
                      onClick={() => {
                        acknowledgeAlert(alert.id);
                        showToast(`Alert #${alert.id} acknowledged`);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-white border border-[#DCDAD4] text-xs font-bold text-[#151713] active:bg-[#FAF9F6]"
                    >
                      Acknowledge
                    </button>
                  ) : (
                    <span className="text-[#2D8A61] font-bold flex items-center space-x-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Resolved</span>
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </MobileLayout>
  );
};
