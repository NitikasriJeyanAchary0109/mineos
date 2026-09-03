import React, { useState, useEffect } from 'react';
import { WorkerLayout } from '../../components/worker/WorkerLayout';
import { PpeHologram } from '../../components/shared/PpeHologram';
import { StatusBadge } from '../../components/shared/StatusBadge';
import { useSafety } from '../../context/SafetyContext';
import { BACKEND_API_URL } from '../../lib/supabase';
import {
  ShieldCheck,
  CheckCircle2,
  Radio,
  MapPin,
  Clock,
  ShieldAlert,
  UserCheck,
  Calendar,
  AlertTriangle,
  Info,
} from 'lucide-react';

export const LiveSafetyPage: React.FC = () => {
  const { activeWorker, togglePpePart } = useSafety();

  const [workerSummary, setWorkerSummary] = useState<any>(null);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const targetId = activeWorker.id || 'W001';
        const res = await fetch(`${BACKEND_API_URL}/api/worker/${targetId}/status-summary`);
        if (res.ok) {
          const data = await res.json();
          setWorkerSummary(data);
        }
      } catch (err) {
        // Fallback silently
      }
    };

    fetchSummary();
    const interval = setInterval(fetchSummary, 5000);
    return () => clearInterval(interval);
  }, [activeWorker.id]);

  const ppe = activeWorker.ppeStatus;
  const allPpe = ppe.helmet && ppe.vest && ppe.boots && ppe.gloves;
  const isHealthNormal = (workerSummary?.health?.status || 'NORMAL') === 'NORMAL';

  const safetyRows = [
    {
      label: 'Physiological Health',
      value: isHealthNormal ? 'Health Normal' : 'Attention Needed',
      status: isHealthNormal ? 'safe' : 'warning',
      description: isHealthNormal
        ? 'All physiological indicators nominal. Fit for subterranean duty.'
        : 'Health attention needed. Rest advised in ventilated crosscut.',
      icon: isHealthNormal ? CheckCircle2 : AlertTriangle,
    },
    {
      label: 'Turnstile PPE Verification',
      value: allPpe ? 'All 4 Verified' : 'Incomplete',
      status: allPpe ? 'safe' : 'danger',
      description: allPpe
        ? 'Helmet, vest, gloves, and boots verified at surface gate.'
        : 'Required safety gear incomplete. Tap interactive 3D model above.',
      icon: allPpe ? ShieldCheck : ShieldAlert,
    },
    {
      label: 'Today Shift Attendance',
      value: workerSummary?.attendance_today?.status || 'Marked Present',
      status: 'safe',
      description: `Gate entry logged at ${workerSummary?.attendance_today?.entry_time || '06:04 AM'}, with ${workerSummary?.attendance_summary?.days_present || 22} days present this cycle.`,
      icon: UserCheck,
    },
    {
      label: 'PPE Compliance Standing',
      value: `${workerSummary?.ppe_compliance_record?.non_compliance_days || 1} Non-Compliance Day`,
      status: 'info',
      description: `Last recorded: ${workerSummary?.ppe_compliance_record?.last_incident_reason || 'Helmet unclipped (Aug 28)'}. Overall good standing.`,
      icon: Calendar,
    },
    {
      label: 'Underground Zone',
      value: 'Zone C (-440m)',
      status: 'safe',
      description: 'Deep Longwall Extraction Face connected to Surface Master Node.',
      icon: MapPin,
    },
    {
      label: 'Sub-GHz Mesh Link',
      value: 'LoRa Mesh Nominal',
      status: 'safe',
      description: 'Repeater Node #04 active. Emergency dispatch telemetry channel clear.',
      icon: Radio,
    },
  ];

  return (
    <WorkerLayout
      showNav={true}
      title="Safety & Gear Inspection"
      subtitle="Subterranean personal vitals and mandatory equipment status"
    >
      <div className="space-y-4 text-[#151713]">
        {/* Interactive 3D Hologram / PPE Inspector */}
        <div className="bg-white border border-[#DCDAD4] rounded-2xl p-4 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-[#176B4D]" />
              <span className="font-serif font-semibold text-xs text-[#151713]">
                Interactive PPE Status
              </span>
            </div>
            <span className="text-[11px] text-[#666861]">
              Tap parts to inspect fit
            </span>
          </div>

          <div className="py-2">
            <PpeHologram ppeStatus={ppe} onTogglePart={togglePpePart} />
          </div>

          <div className="grid grid-cols-4 gap-2 text-center text-xs pt-3 border-t border-[#ECEBE6]">
            <div className="bg-[#FAF9F6] border border-[#ECEBE6] p-2 rounded-xl">
              <div className="text-[#666861] font-medium text-xs">Helmet</div>
              <div className="font-semibold text-[#2D8A61] text-[10px] mt-0.5">Worn</div>
            </div>
            <div className="bg-[#FAF9F6] border border-[#ECEBE6] p-2 rounded-xl">
              <div className="text-[#666861] font-medium text-xs">High-Vis</div>
              <div className="font-semibold text-[#2D8A61] text-[10px] mt-0.5">Worn</div>
            </div>
            <div className="bg-[#FAF9F6] border border-[#ECEBE6] p-2 rounded-xl">
              <div className="text-[#666861] font-medium text-xs">Boots</div>
              <div className="font-semibold text-[#2D8A61] text-[10px] mt-0.5">Steel-Toe</div>
            </div>
            <div className="bg-[#FAF9F6] border border-[#ECEBE6] p-2 rounded-xl">
              <div className="text-[#666861] font-medium text-xs">Gloves</div>
              <div className="font-semibold text-[#2D8A61] text-[10px] mt-0.5">Secure</div>
            </div>
          </div>
        </div>

        {/* Current Shift Safety Checklist */}
        <div className="bg-white border border-[#DCDAD4] rounded-2xl p-4 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#ECEBE6]">
            <span className="font-serif font-semibold text-xs text-[#151713]">
              Current Shift Safety Indicators
            </span>
            <span className="text-[10px] text-[#2D8A61] bg-[#EAF3EF] px-2 py-0.5 rounded font-semibold border border-[#2D8A61]/30">
              DGMS Compliant
            </span>
          </div>

          <div className="space-y-2.5">
            {safetyRows.map((row, index) => {
              const Icon = row.icon;
              return (
                <div
                  key={index}
                  className="bg-[#FAF9F6] border border-[#ECEBE6] p-3 rounded-xl flex items-start justify-between gap-3"
                >
                  <div className="flex items-start space-x-3">
                    <div className="p-2 rounded-lg bg-white border border-[#DCDAD4] text-[#176B4D] shrink-0 mt-0.5">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-[#151713]">
                        {row.label}
                      </div>
                      <div className="text-[11px] text-[#666861] mt-0.5 leading-relaxed">
                        {row.description}
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0">
                    <span className={`px-2.5 py-1 rounded-md text-[10px] font-semibold uppercase ${
                      row.status === 'safe'
                        ? 'bg-[#EAF3EF] text-[#2D8A61] border border-[#2D8A61]/30'
                        : row.status === 'warning'
                        ? 'bg-[#FEF9E7] text-[#B47A18] border border-[#B47A18]/30'
                        : 'bg-[#FAF9F6] text-[#666861] border border-[#DCDAD4]'
                    }`}>
                      {row.value}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Statutory Safety Advisory */}
        <div className="p-4 bg-white border border-[#DCDAD4] rounded-2xl text-xs text-[#666861] flex items-start space-x-2.5 shadow-xs">
          <Info className="w-4 h-4 text-[#176B4D] shrink-0 mt-0.5" />
          <span className="leading-relaxed text-[11px]">
            Safety Directive: Keep chin strap securely fastened, high-vis vest on, and heavy boots laced while inside any active drift. Report unusual atmospheric odors or pressure fluctuations to Shift In-Charge immediately.
          </span>
        </div>
      </div>
    </WorkerLayout>
  );
};
