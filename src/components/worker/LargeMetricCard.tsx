import React from 'react';
import { LucideIcon } from 'lucide-react';

interface LargeMetricCardProps {
  title: string;
  status: 'safe' | 'warning' | 'danger';
  statusText: string;
  subtext: string;
  icon: LucideIcon;
  onClick?: () => void;
  actionText?: string;
}

export const LargeMetricCard: React.FC<LargeMetricCardProps> = ({
  title,
  status,
  statusText,
  subtext,
  icon: Icon,
  onClick,
  actionText,
}) => {
  const getTheme = () => {
    switch (status) {
      case 'safe':
        return {
          border: 'border-emerald-600 hover:border-emerald-500',
          bg: 'bg-emerald-950/40 hover:bg-emerald-950/60',
          text: 'text-emerald-300',
          badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50',
          iconColor: 'text-emerald-400',
          glow: 'shadow-sm',
        };
      case 'warning':
        return {
          border: 'border-amber-600 hover:border-amber-500',
          bg: 'bg-amber-950/40 hover:bg-amber-950/60',
          text: 'text-amber-300',
          badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-500/50',
          iconColor: 'text-amber-400',
          glow: 'shadow-sm',
        };
      case 'danger':
        return {
          border: 'border-rose-600 hover:border-rose-500 animate-pulse',
          bg: 'bg-rose-950/60 hover:bg-rose-950/80',
          text: 'text-rose-300',
          badgeBg: 'bg-rose-500/30 text-rose-200 border-rose-500',
          iconColor: 'text-rose-400',
          glow: 'shadow-sm',
        };
    }
  };

  const theme = getTheme();

  return (
    <div
      onClick={onClick}
      className={`relative p-4 rounded-2xl border-2 transition-all cursor-pointer select-none ${theme.border} ${theme.bg} ${theme.glow} flex flex-col justify-between min-h-[140px] active:scale-[0.98]`}
    >
      {/* Top row: Label & Icon */}
      <div className="flex items-center justify-between mb-2">
        <span className="font-sans text-xs font-bold tracking-wide text-slate-300 uppercase">
          {title}
        </span>
        <div className={`p-2 rounded-xl bg-[#0a0e14] border border-[#283446] ${theme.iconColor}`}>
          <Icon className="w-6 h-6 stroke-[2.2]" />
        </div>
      </div>

      {/* Center: High-contrast plain language status */}
      <div className="my-1">
        <div className={`font-display text-xl sm:text-2xl font-bold uppercase tracking-wide leading-tight ${theme.text}`}>
          {statusText}
        </div>
        <div className="text-xs text-slate-300 mt-1 leading-relaxed">
          {subtext}
        </div>
      </div>

      {/* Bottom action indicator */}
      {actionText && (
        <div className="mt-2 pt-2 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
          <span className="text-cyan-300 font-semibold">{actionText}</span>
        </div>
      )}
    </div>
  );
};
