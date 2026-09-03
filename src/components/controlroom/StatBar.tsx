import React from 'react';
import { useSafety } from '../../context/SafetyContext';
import { Users, ShieldCheck, AlertTriangle, AlertCircle, ShieldAlert } from 'lucide-react';

export const StatBar: React.FC = () => {
  const { stats } = useSafety();

  const statItems = [
    {
      label: 'Workers Underground',
      value: stats.underground,
      status: 'Active on shift',
      icon: Users,
      color: 'text-[#151713]',
      accentBg: 'bg-[#ECEBE6]',
      iconColor: 'text-[#176B4D]',
    },
    {
      label: 'Safe & Verified',
      value: stats.safe,
      status: '100% nominal',
      icon: ShieldCheck,
      color: 'text-[#2D8A61]',
      accentBg: 'bg-[#EAF3EF]',
      iconColor: 'text-[#2D8A61]',
    },
    {
      label: 'Attention Needed',
      value: stats.attention,
      status: stats.attention > 0 ? 'Advisory active' : 'Normal',
      icon: AlertTriangle,
      color: stats.attention > 0 ? 'text-[#B47A18]' : 'text-[#666861]',
      accentBg: stats.attention > 0 ? 'bg-[#FEF9E7]' : 'bg-[#ECEBE6]',
      iconColor: stats.attention > 0 ? 'text-[#B47A18]' : 'text-[#666861]',
    },
    {
      label: 'Critical Hazards',
      value: stats.critical,
      status: stats.critical > 0 ? 'Emergency dispatch' : 'Zero events',
      icon: AlertCircle,
      color: stats.critical > 0 ? 'text-[#A83D45]' : 'text-[#666861]',
      accentBg: stats.critical > 0 ? 'bg-[#FDF2F2]' : 'bg-[#ECEBE6]',
      iconColor: stats.critical > 0 ? 'text-[#A83D45]' : 'text-[#666861]',
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
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 p-4 bg-[#F5F4EF] border-b border-[#E2E0D8]">
      {statItems.map((item, idx) => {
        const Icon = item.icon;
        return (
          <div
            key={idx}
            className="p-4 rounded-xl border border-[#DCDAD4] bg-white shadow-sm flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-[#666861] uppercase tracking-wider">
                {item.label}
              </span>
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${item.accentBg} ${item.iconColor}`}>
                <Icon className="w-4 h-4 stroke-[2]" />
              </div>
            </div>
            <div className="flex items-baseline justify-between">
              <div className={`font-serif text-3xl font-semibold tracking-tight ${item.color}`}>
                {item.value}
              </div>
              <span className="text-[11px] text-[#666861]">
                {item.status}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
