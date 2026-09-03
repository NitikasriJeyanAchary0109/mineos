import React, { useState } from 'react';
import { SafetyAlert, AlertType, AlertSeverity } from '../../types/safety';
import { useSafety } from '../../context/SafetyContext';
import {
  AlertTriangle,
  AlertCircle,
  Info,
  ShieldAlert,
  Wind,
  Activity,
  Heart,
  Radio,
  CheckCircle,
  Clock,
  Filter,
} from 'lucide-react';

interface AlertsFeedProps {
  onSelectAlert?: (alert: SafetyAlert) => void;
  maxItems?: number;
}

export const AlertsFeed: React.FC<AlertsFeedProps> = ({
  onSelectAlert,
  maxItems,
}) => {
  const { alerts, acknowledgeAlert, setSelectedWorkerId } = useSafety();
  const [filterType, setFilterType] = useState<string>('all');

  const getAlertIcon = (type: AlertType) => {
    switch (type) {
      case 'fall':
        return <Activity className="w-4 h-4 text-[#A83D45]" />;
      case 'gas':
        return <Wind className="w-4 h-4 text-[#B47A18]" />;
      case 'ppe':
        return <ShieldAlert className="w-4 h-4 text-[#B47A18]" />;
      case 'health':
        return <Heart className="w-4 h-4 text-[#A83D45]" />;
      case 'system':
      default:
        return <Radio className="w-4 h-4 text-[#536B7D]" />;
    }
  };

  const getSeverityStyle = (severity: AlertSeverity, acknowledged: boolean) => {
    if (acknowledged) {
      return 'bg-[#FAF9F6] border-[#ECEBE6] text-[#666861] opacity-75';
    }
    switch (severity) {
      case 'critical':
        return 'bg-[#FDF2F2] border-[#A83D45]/60 text-[#151713]';
      case 'warning':
        return 'bg-[#FEF9E7] border-[#B47A18]/50 text-[#151713]';
      case 'info':
      default:
        return 'bg-[#FAF9F6] border-[#DCDAD4] text-[#151713]';
    }
  };

  const filteredAlerts = alerts
    .filter((a) => (filterType === 'all' ? true : a.type === filterType))
    .slice(0, maxItems || alerts.length);

  return (
    <div className="bg-white border border-[#DCDAD4] rounded-2xl p-4 flex flex-col space-y-3.5 shadow-sm">
      {/* Top Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#ECEBE6] pb-3">
        <div className="flex items-center space-x-2">
          <AlertTriangle className="w-4 h-4 text-[#176B4D]" />
          <h3 className="font-serif font-semibold text-sm text-[#151713]">
            Real-Time Alert Feed
          </h3>
          <span className="text-xs px-2 py-0.5 rounded-md bg-[#FAF9F6] border border-[#DCDAD4] font-mono text-[#176B4D] font-medium">
            {alerts.filter((a) => !a.acknowledged).length} Active
          </span>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center space-x-1.5 text-xs overflow-x-auto">
          {['all', 'fall', 'gas', 'ppe', 'health', 'system'].map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-2.5 py-1 rounded-md uppercase text-[11px] font-medium transition-colors ${
                filterType === type
                  ? 'bg-[#176B4D] text-white'
                  : 'text-[#666861] hover:text-[#151713] bg-[#FAF9F6] border border-[#DCDAD4]'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Alerts Timeline List */}
      <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
        {filteredAlerts.length === 0 ? (
          <div className="text-center py-6 text-xs text-[#666861]">
            No alerts recorded for current filter.
          </div>
        ) : (
          filteredAlerts.map((alert) => {
            const style = getSeverityStyle(alert.severity, alert.acknowledged);
            return (
              <div
                key={alert.id}
                onClick={() => {
                  if (alert.workerId) setSelectedWorkerId(alert.workerId);
                  if (onSelectAlert) onSelectAlert(alert);
                }}
                className={`p-3 rounded-xl border transition-all cursor-pointer select-none flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${style}`}
              >
                <div className="flex items-start space-x-2.5">
                  <div className="p-1.5 rounded-lg bg-white border border-[#DCDAD4] mt-0.5 shrink-0 shadow-xs">
                    {getAlertIcon(alert.type)}
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-x-2">
                      <span className="font-semibold text-xs text-[#151713]">
                        {alert.title}
                      </span>
                      {alert.workerName && (
                        <span className="text-[11px] font-mono text-[#176B4D] font-medium">
                          [{alert.workerName}]
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#666861] mt-0.5 leading-relaxed">
                      {alert.description}
                    </p>
                    <div className="flex items-center space-x-3 text-[11px] text-[#666861] mt-1 font-mono">
                      <span>{alert.zoneName}</span>
                      <span>•</span>
                      <span className="flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>{alert.timestamp}</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Acknowledge Button */}
                <div className="flex items-center space-x-2 sm:self-center shrink-0">
                  {!alert.acknowledged ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        acknowledgeAlert(alert.id);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-white hover:bg-[#FAF9F6] border border-[#DCDAD4] text-xs font-semibold text-[#151713] transition-colors shadow-xs"
                    >
                      Acknowledge
                    </button>
                  ) : (
                    <span className="flex items-center space-x-1 text-xs font-medium text-[#2D8A61]">
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Resolved</span>
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
