import React, { useState } from 'react';
import { SafetyAlert, Worker } from '../../types/safety';
import {
  AlertOctagon,
  Heart,
  Activity,
  MapPin,
  Volume2,
  VolumeX,
  CheckCircle,
  Users,
  Radio,
  Clock,
  ArrowRight,
  X,
} from 'lucide-react';
import { IndustrialButton } from '../shared/IndustrialButton';

interface EmergencyModalOverlayProps {
  alert: SafetyAlert;
  worker?: Worker;
  onDismiss: () => void;
  onAcknowledgeAndDispatch: () => void;
}

export const EmergencyModalOverlay: React.FC<EmergencyModalOverlayProps> = ({
  alert,
  worker,
  onDismiss,
  onAcknowledgeAndDispatch,
}) => {
  const [isMuted, setIsMuted] = useState(false);
  const [dispatched, setDispatched] = useState(false);

  const handleDispatch = () => {
    setDispatched(true);
    onAcknowledgeAndDispatch();
    setTimeout(() => {
      onDismiss();
    }, 1500);
  };

  const isFall = alert.type === 'fall';
  const workerName = alert.workerName || worker?.name || 'Underground Personnel';
  const workerId = alert.workerId || worker?.id || 'WM-UNKNOWN';
  const zoneName = alert.zoneName || 'Zone C — Deep Extraction Face';
  const heartRate = worker?.vitals.heartRate || 124;
  const spo2 = worker?.vitals.spo2 || 94;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
      {/* Main Alert Card Box */}
      <div className="relative w-full max-w-2xl bg-[#0b1017] border-2 border-rose-600 rounded-2xl shadow-2xl p-6 sm:p-8 flex flex-col space-y-5 overflow-hidden z-10">
        {/* Top Hazard Warning Banner */}
        <div className="hazard-stripe-danger h-3 -mx-8 -mt-8 mb-2" />

        {/* Header Ribbon */}
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-xl bg-rose-950 border border-rose-600 flex items-center justify-center text-rose-400 shrink-0">
              <AlertOctagon className="w-7 h-7 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-hud font-black text-xs px-2.5 py-0.5 rounded bg-rose-600 text-white uppercase tracking-widest">
                  CRITICAL INCIDENT // SEVERITY 1
                </span>
                <span className="font-mono text-xs text-rose-300">
                  {alert.id}
                </span>
              </div>
              <h1 className="font-display font-black text-2xl sm:text-3xl uppercase tracking-wider text-white mt-1">
                {isFall ? '🚨 FALL DETECTED' : '🚨 EMERGENCY SOS BROADCAST'}
              </h1>
            </div>
          </div>

          <button
            onClick={onDismiss}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Worker & Location Focus Box */}
        <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-600/70 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-rose-800/60 pb-2.5">
            <div>
              <div className="text-[10px] font-hud text-rose-300 uppercase">Worker Involved</div>
              <div className="font-display font-black text-xl text-white">
                {workerName} <span className="font-mono text-sm text-rose-400">({workerId})</span>
              </div>
            </div>

            <div className="text-right">
              <div className="text-[10px] font-hud text-rose-300 uppercase">Location</div>
              <div className="font-hud font-bold text-sm text-white uppercase flex items-center space-x-1">
                <MapPin className="w-4 h-4 text-rose-400" />
                <span>{zoneName}</span>
              </div>
            </div>
          </div>

          {/* Vitals at Time of Incident (Heart Rate, SpO2, Motion) */}
          <div className="grid grid-cols-3 gap-2 text-center font-hud">
            <div className="p-2.5 rounded-xl bg-black/50 border border-rose-900/80">
              <div className="text-[10px] text-slate-400 uppercase flex items-center justify-center space-x-1">
                <Heart className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
                <span>Heart Rate</span>
              </div>
              <div className="font-display font-black text-xl text-white mt-0.5">
                {heartRate} <span className="text-[10px] font-mono text-rose-400">BPM</span>
              </div>
              <div className="text-[9px] text-rose-300 font-semibold">ELEVATED PULSE</div>
            </div>

            <div className="p-2.5 rounded-xl bg-black/50 border border-rose-900/80">
              <div className="text-[10px] text-slate-400 uppercase">Blood Oxygen</div>
              <div className="font-display font-black text-xl text-white mt-0.5">
                {spo2}% <span className="text-[10px] font-mono text-cyan-400">SpO2</span>
              </div>
              <div className="text-[9px] text-slate-300 font-semibold">HYPOXIA CHECK</div>
            </div>

            <div className="p-2.5 rounded-xl bg-black/50 border border-rose-900/80">
              <div className="text-[10px] text-slate-400 uppercase flex items-center justify-center space-x-1">
                <Activity className="w-3.5 h-3.5 text-rose-400" />
                <span>Motion IMU</span>
              </div>
              <div className="font-display font-black text-lg text-rose-400 mt-0.5">
                {isFall ? 'IMPACT' : 'SOS BEACON'}
              </div>
              <div className="text-[9px] text-rose-300 font-semibold">HIGH-G TRIGGER</div>
            </div>
          </div>
        </div>

        {/* Detailed Incident Message */}
        <p className="text-xs font-hud text-slate-200 leading-relaxed bg-black/40 p-3 rounded-xl border border-slate-800">
          {alert.description || 'Sudden high-G impact followed by lack of orientation. Wearable accelerometer triggered critical alert.'}
        </p>

        {/* Primary Action Buttons */}
        <div className="space-y-2 pt-1">
          {!dispatched ? (
            <IndustrialButton
              variant="danger"
              size="xl"
              fullWidth
              onClick={handleDispatch}
              icon={<Users className="w-5 h-5" />}
            >
              ACKNOWLEDGE (OPERATOR) & DISPATCH RESCUE
            </IndustrialButton>
          ) : (
            <div className="p-3.5 rounded-xl bg-emerald-950/80 border-2 border-emerald-400 text-emerald-200 text-center font-hud font-bold text-sm flex items-center justify-center space-x-2">
              <CheckCircle className="w-5 h-5 text-emerald-400" />
              <span>RESCUE SQUAD DISPATCHED TO {zoneName.toUpperCase()}</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-hud text-slate-300 flex items-center justify-center space-x-2"
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-rose-400 animate-pulse" />}
              <span>{isMuted ? 'UNMUTE KLAXON' : 'MUTE AUDIBLE KLAXON'}</span>
            </button>

            <button
              onClick={onDismiss}
              className="py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-hud text-cyan-300 flex items-center justify-center space-x-2"
            >
              <span>MONITOR ON 3D MAP</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
