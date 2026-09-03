import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { WorkerLayout } from '../../components/worker/WorkerLayout';
import { IndustrialButton } from '../../components/shared/IndustrialButton';
import { useSafety } from '../../context/SafetyContext';
import {
  AlertOctagon,
  Radio,
  Clock,
  MapPin,
  CheckCircle2,
  PhoneCall,
  RotateCcw,
  ArrowLeft,
  Volume2,
} from 'lucide-react';

export const SosEmergencyPage: React.FC = () => {
  const navigate = useNavigate();
  const { activeWorker, triggerSos, resolveActiveEmergency } = useSafety();
  const [sosSent, setSosSent] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);

  const handleTriggerSos = () => {
    setCountdown(3);
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(interval);
          triggerSos();
          setSosSent(true);
          return null;
        }
        return prev - 1;
      });
    }, 600);
  };

  const handleCancel = () => {
    resolveActiveEmergency();
    setSosSent(false);
    setCountdown(null);
  };

  const currentTime = new Date().toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  return (
    <WorkerLayout showNav={true} title="Emergency SOS Beacon" subtitle="Subterranean Distress Broadcast to Surface Control">
      <div className="flex flex-col justify-between min-h-[540px] space-y-4 text-[#151713]">
        {/* Main Distress Beacon / Button */}
        <div className="my-auto flex flex-col items-center justify-center space-y-5 text-center">
          {!sosSent ? (
            <div className="space-y-6 flex flex-col items-center">
              {/* Massive Tactile SOS Button */}
              <button
                type="button"
                onClick={handleTriggerSos}
                disabled={countdown !== null}
                className="w-52 h-52 sm:w-60 sm:h-60 rounded-full bg-[#A83D45] hover:bg-[#923239] border-4 border-white text-white font-semibold shadow-xl active:scale-95 transition-transform flex flex-col items-center justify-center relative overflow-hidden"
              >
                <AlertOctagon className="w-16 h-16 sm:w-18 sm:h-18 mb-2 stroke-[2.2]" />
                <span className="text-2xl sm:text-3xl font-serif">
                  {countdown !== null ? `ALERT IN ${countdown}` : 'BROADCAST SOS'}
                </span>
                <span className="text-[11px] font-mono mt-1 opacity-90">
                  PRESS TO DISPATCH
                </span>
              </button>

              <div className="max-w-xs space-y-1">
                <div className="font-serif font-semibold text-sm text-[#A83D45]">
                  DIRECT EMERGENCY RESCUE DISPATCH
                </div>
                <p className="text-xs text-[#666861]">
                  Transmits high-priority distress telemetry to surface control room over LoRa subterranean mesh.
                </p>
              </div>
            </div>
          ) : (
            /* Emergency Confirmation State */
            <div className="w-full max-w-sm space-y-4 animate-fade-in">
              <div className="p-5 rounded-3xl bg-[#FDF2F2] border border-[#A83D45]/30 text-[#151713] shadow-xs space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-white border border-[#A83D45]/30 mx-auto flex items-center justify-center shadow-xs">
                  <CheckCircle2 className="w-8 h-8 text-[#A83D45]" />
                </div>

                <div>
                  <h2 className="font-serif font-semibold text-xl text-[#151713]">
                    Emergency Alert Broadcasted
                  </h2>
                  <p className="text-xs text-[#666861] mt-1">
                    Control room supervisory console acknowledged distress beacon. Rapid response dispatched.
                  </p>
                </div>
              </div>

              {/* Distress Telemetry Receipt */}
              <div className="bg-white border border-[#DCDAD4] rounded-2xl p-4 space-y-2 text-xs text-left shadow-xs">
                <div className="flex justify-between py-1 border-b border-[#ECEBE6]">
                  <span className="text-[#666861]">Personnel</span>
                  <span className="font-semibold text-[#151713]">{activeWorker.name}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#ECEBE6]">
                  <span className="text-[#666861]">Worker ID</span>
                  <span className="font-mono text-[#176B4D] font-semibold">{activeWorker.id}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#ECEBE6]">
                  <span className="text-[#666861]">Incident Subterranean Zone</span>
                  <span className="font-semibold text-[#A83D45]">
                    Zone C (-440m)
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#ECEBE6]">
                  <span className="text-[#666861]">Dispatch Time</span>
                  <span className="font-mono text-[#151713]">{currentTime} IST</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-[#666861]">Repeater Mesh Node</span>
                  <span className="text-[#2D8A61] font-semibold">RPT-04 (LoRa Verified)</span>
                </div>
              </div>

              {/* Immediate Survival Protocol */}
              <div className="p-3.5 bg-[#FEF9E7] border border-[#B47A18]/30 rounded-2xl text-left text-xs text-[#151713] space-y-1 shadow-xs">
                <div className="font-serif font-semibold text-xs text-[#B47A18] flex items-center space-x-1.5">
                  <Volume2 className="w-4 h-4" />
                  <span>Immediate Survival Protocol</span>
                </div>
                <p className="text-[11px] text-[#666861]">1. Stay calm. Do not enter unventilated or sealed drifts.</p>
                <p className="text-[11px] text-[#666861]">2. Ensure self-rescuer respirator is within arm's reach.</p>
                <p className="text-[11px] text-[#666861]">3. Tap Cancel below only if this was an accidental drill trigger.</p>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="w-full py-3 rounded-xl bg-white hover:bg-[#FAF9F6] border border-[#DCDAD4] text-xs font-semibold text-[#151713] transition-colors shadow-xs"
                >
                  Cancel Distress / Clear Alarm
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Back Link */}
        <div className="pt-2 text-center">
          <button
            onClick={() => navigate('/worker-home')}
            className="inline-flex items-center space-x-1 text-xs text-[#666861] hover:text-[#151713]"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Worker Home</span>
          </button>
        </div>
      </div>
    </WorkerLayout>
  );
};
