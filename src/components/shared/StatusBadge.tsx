import React from 'react';
import { ShieldCheck, AlertTriangle, AlertCircle, Info, CheckCircle, XCircle } from 'lucide-react';
import { WorkerSafetyStatus, AlertSeverity } from '../../types/safety';

interface StatusBadgeProps {
  status: WorkerSafetyStatus | AlertSeverity | 'verified' | 'unverified';
  text?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  text,
  size = 'md',
  className = '',
}) => {
  const getBadgeConfig = () => {
    switch (status) {
      case 'safe':
      case 'verified':
        return {
          icon: <ShieldCheck className={size === 'lg' ? 'w-5 h-5' : size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'} />,
          defaultText: 'VERIFIED SAFE',
          classes: 'bg-emerald-950/80 border-emerald-500/80 text-emerald-300',
        };
      case 'attention':
      case 'warning':
        return {
          icon: <AlertTriangle className={size === 'lg' ? 'w-5 h-5' : size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'} />,
          defaultText: 'ATTENTION REQUIRED',
          classes: 'bg-amber-950/80 border-amber-500/80 text-amber-300',
        };
      case 'critical':
      case 'unverified':
        return {
          icon: <AlertCircle className={size === 'lg' ? 'w-5 h-5' : size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'} />,
          defaultText: 'CRITICAL ALERT',
          classes: 'bg-rose-950/90 border-rose-500 text-rose-300 animate-pulse',
        };
      case 'info':
      default:
        return {
          icon: <Info className={size === 'lg' ? 'w-5 h-5' : size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'} />,
          defaultText: 'INFORMATION',
          classes: 'bg-cyan-950/70 border-cyan-500/60 text-cyan-300',
        };
    }
  };

  const config = getBadgeConfig();
  const label = text || config.defaultText;

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-[10px] gap-1',
    md: 'px-2.5 py-1 text-xs gap-1.5',
    lg: 'px-3 py-1.5 text-sm gap-2 font-bold',
  };

  return (
    <span
      className={`inline-flex items-center rounded-md border font-sans font-bold uppercase tracking-wide ${config.classes} ${sizeClasses[size]} ${className}`}
    >
      {config.icon}
      <span>{label}</span>
    </span>
  );
};
