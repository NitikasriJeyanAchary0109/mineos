import React, { useMemo } from 'react';
import { useSafety } from '../../context/SafetyContext';
import {
  Users,
  ShieldCheck,
  AlertTriangle,
  AlertCircle,
  ShieldAlert,
  Award,
  TrendingUp,
  Activity,
} from 'lucide-react';

export const StatBar: React.FC = () => {
  const { stats, workers } = useSafety();

  // Compute aggregate compliance percentage
  const complianceRate = useMemo(() => {
    if (workers.length === 0) return 100;
    const compliantCount = workers.filter(
      (w) =>
        w.ppeStatus.helmet &&
        w.ppeStatus.vest &&
        w.ppeStatus.boots &&
        w.ppeStatus.gloves &&
        w.status !== 'critical'
    ).length;
    return Math.round((compliantCount / workers.length) * 100);
  }, [workers]);

  const statItems = [
    {
      label: 'Workers Underground',
      value: stats.underground,
      status: 'Active on Shift A',
      icon: Users,
      color: 'text-[#151713]',
      accentBg: 'bg-[#ECEBE6]',
      iconColor: 'text-[#176B4D]',
      badge: 'LIVE',
    },
    {
      label: 'Safe & Verified',
      value: stats.safe,
      status: '100% nominal posture',
      icon: ShieldCheck,
      color: 'text-[#2D8A61]',
      accentBg: 'bg-[#EAF3EF]',
      iconColor: 'text-[#2D8A61]',
      badge: 'PASS',
    },
    {
      label: 'Attention Needed',
      value: stats.attention,
      status: stats.attention > 0 ? 'Advisory active' : 'All clear',
      icon: AlertTriangle,
      color: stats.attention > 0 ? 'text-[#B47A18]' : 'text-[#666861]',
      accentBg: stats.attention > 0 ? 'bg-[#FEF9E7]' : 'bg-[#ECEBE6]',
      iconColor: stats.attention > 0 ? 'text-[#B47A18]' : 'text-[#666861]',
      badge: stats.attention > 0 ? 'FLAG' : undefined,
    },
    {
      label: 'Critical Hazards',
      value: stats.critical,
      status: stats.critical > 0 ? 'Emergency dispatch' : 'Zero incidents',
      icon: AlertCircle,
      color: stats.critical > 0 ? 'text-[#A83D45]' : 'text-[#666861]',
      accentBg: stats.critical > 0 ? 'bg-[#FDF2F2]' : 'bg-[#ECEBE6]',
      iconColor: stats.critical > 0 ? 'text-[#A83D45]' : 'text-[#666861]',
      badge: stats.critical > 0 ? 'ALERT' : undefined,
    },
    {
      label: 'PPE Violations',
      value: stats.ppeViolations,
      status: stats.ppeViolations > 0 ? 'Turnstile alerts' : 'Full compliance',
      icon: ShieldAlert,
      color: stats.ppeViolations > 0 ? 'text-[#B47A18]' : 'text-[#666861]',
      accentBg: stats.ppeViolations > 0 ? 'bg-[#FEF9E7]' : 'bg-[#ECEBE6]',
      iconColor: stats.ppeViolations > 0 ? 'text-[#B47A18]' : 'text-[#666861]',
    },
    {
      label: 'DGMS Compliance Rate',
      value: `${complianceRate}%`,
      status: 'Rule 181 standard',
      icon: Award,
      color: complianceRate >= 90 ? 'text-[#2D8A61]' : 'text-[#B47A18]',
      accentBg: 'bg-[#EAF3EF]',
      iconColor: 'text-[#176B4D]',
      progressBar: complianceRate,
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 p-4 bg-[#F5F4EF] border-b border-[#E2E0D8]">
      {statItems.map((item, idx) => {
        const Icon = item.icon;
        return (
          <div
            key={idx}
            className="p-3.5 rounded-xl border border-[#DCDAD4] bg-white shadow-2xs flex flex-col justify-between hover:shadow-xs transition-shadow relative overflow-hidden"
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-semibold text-[#666861] uppercase tracking-wider line-clamp-1">
                {item.label}
              </span>
              <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${item.accentBg} ${item.iconColor}`}>
                <Icon className="w-3.5 h-3.5 stroke-[2]" />
              </div>
            </div>

            <div>
              <div className="flex items-baseline justify-between">
                <div className={`font-serif text-2xl sm:text-3xl font-semibold tracking-tight ${item.color}`}>
                  {item.value}
                </div>
                {item.badge && (
                  <span
                    className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded ${
                      item.badge === 'ALERT'
                        ? 'bg-[#FDF2F2] text-[#A83D45] animate-pulse'
                        : item.badge === 'FLAG'
                        ? 'bg-[#FEF9E7] text-[#B47A18]'
                        : 'bg-[#EAF3EF] text-[#2D8A61]'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </div>

              {/* Optional Progress bar for compliance rate */}
              {item.progressBar !== undefined && (
                <div className="w-full h-1 bg-[#E2E0D8] rounded-full mt-1.5 overflow-hidden">
                  <div
                    className="h-full bg-[#2D8A61] rounded-full transition-all duration-500"
                    style={{ width: `${item.progressBar}%` }}
                  />
                </div>
              )}

              <div className="text-[10px] text-[#666861] mt-1 line-clamp-1 font-mono">
                {item.status}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
