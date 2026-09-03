import React, { useState } from 'react';
import { WorkerLayout } from '../../components/worker/WorkerLayout';
import { useSafety } from '../../context/SafetyContext';
import { SafetyAlert, AlertType } from '../../types/safety';
import {
  Bell,
  AlertTriangle,
  AlertOctagon,
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

export const WorkerAlertsPage: React.FC = () => {
  const { alerts, acknowledgeAlert } = useSafety();
  const [selectedFilter, setSelectedFilter] = useState<string>('all');

  const getAlertIcon = (type: AlertType) => {
    switch (type) {
      case 'fall':
        return <Activity className="w-5 h-5 text-rose-400 stroke-[2.2]" />;
      case 'gas':
        return <Wind className="w-5 h-5 text-amber-400 stroke-[2.2]" />;
      case 'ppe':
        return <ShieldAlert className="w-5 h-5 text-amber-400 stroke-[2.2]" />;
      case 'health':
        return <Heart className="w-5 h-5 text-rose-400 stroke-[2.2]" />;
      case 'system':
      default:
        return <Radio className="w-5 h-5 text-cyan-400 stroke-[2.2]" />;
    }
  };

  const filteredAlerts = alerts.filter((a) =>
    selectedFilter === 'all' ? true : a.type === selectedFilter
  );

  return (
    <WorkerLayout
      showNav={true}
      title="Safety Alerts"
      subtitle="Chronological feed of field telemetry events, hazard advisories and audits"
    >
      <div className="space-y-4 text-[#151713]">
        {/* Category Filters */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 text-xs">
          <button
            onClick={() => setSelectedFilter('all')}
            className={`px-3.5 py-1.5 rounded-xl border text-xs font-medium whitespace-nowrap transition-colors shadow-xs ${
              selectedFilter === 'all'
                ? 'bg-[#EAF3EF] border-[#176B4D] text-[#176B4D] font-semibold'
                : 'bg-white border-[#DCDAD4] text-[#666861] hover:text-[#151713]'
            }`}
          >
            All Alerts ({alerts.length})
          </button>
          {[
            { id: 'fall', label: 'Fall Detection' },
            { id: 'gas', label: 'Gas Atmospheric' },
            { id: 'ppe', label: 'PPE Non-Compliance' },
            { id: 'health', label: 'Health Vitals' },
            { id: 'system', label: 'System Mesh' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedFilter(cat.id)}
              className={`px-3 py-1.5 rounded-xl border text-xs font-medium whitespace-nowrap transition-colors shadow-xs ${
                selectedFilter === cat.id
                  ? 'bg-[#EAF3EF] border-[#176B4D] text-[#176B4D] font-semibold'
                  : 'bg-white border-[#DCDAD4] text-[#666861] hover:text-[#151713]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Alerts Timeline */}
        <div className="space-y-3">
          {filteredAlerts.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-[#DCDAD4] p-6 shadow-xs">
              <CheckCircle className="w-10 h-10 text-[#2D8A61] mx-auto mb-2" />
              <div className="font-serif font-semibold text-base text-[#151713]">
                Zero Active Alerts
              </div>
              <p className="text-xs text-[#666861] mt-1">
                No safety or equipment incidents recorded for the selected filter category.
              </p>
            </div>
          ) : (
            filteredAlerts.map((alert) => {
              const isCritical = alert.severity === 'critical';
              const isWarning = alert.severity === 'warning';

              return (
                <div
                  key={alert.id}
                  className={`p-4 rounded-2xl border transition-all relative overflow-hidden shadow-xs ${
                    alert.acknowledged
                      ? 'bg-[#FAF9F6] border-[#DCDAD4] opacity-75'
                      : isCritical
                      ? 'bg-[#FDF2F2] border-[#A83D45]/40'
                      : isWarning
                      ? 'bg-[#FEF9E7] border-[#B47A18]/40'
                      : 'bg-white border-[#DCDAD4]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start space-x-3">
                      <div className="p-2.5 rounded-xl bg-white border border-[#DCDAD4] shrink-0 shadow-xs">
                        {getAlertIcon(alert.type)}
                      </div>
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-serif font-semibold text-sm sm:text-base text-[#151713]">
                            {alert.title}
                          </span>
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-md uppercase font-semibold border ${
                              isCritical
                                ? 'bg-[#FDF2F2] text-[#A83D45] border-[#A83D45]/30'
                                : isWarning
                                ? 'bg-[#FEF9E7] text-[#B47A18] border-[#B47A18]/30'
                                : 'bg-[#EAF3EF] text-[#2D8A61] border-[#2D8A61]/30'
                            }`}
                          >
                            {alert.type}
                          </span>
                        </div>

                        <p className="text-xs text-[#666861] leading-relaxed">
                          {alert.description}
                        </p>

                        <div className="flex items-center space-x-3 text-[11px] text-[#666861] pt-1">
                          <span>{alert.zoneName}</span>
                          <span>•</span>
                          <span className="flex items-center space-x-1">
                            <Clock className="w-3 h-3 text-[#176B4D]" />
                            <span>{alert.timestamp}</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Acknowledge Button */}
                  <div className="mt-3 pt-2.5 border-t border-[#ECEBE6] flex items-center justify-between">
                    <div className="text-[10px] font-mono text-[#666861]">
                      REF: {alert.id}
                    </div>

                    {!alert.acknowledged ? (
                      <button
                        onClick={() => acknowledgeAlert(alert.id)}
                        className="px-3 py-1 rounded-lg bg-white hover:bg-[#FAF9F6] border border-[#DCDAD4] text-xs font-semibold text-[#151713] transition-colors shadow-xs"
                      >
                        Acknowledge
                      </button>
                    ) : (
                      <div className="flex items-center space-x-1 text-xs text-[#2D8A61] font-semibold">
                        <CheckCircle className="w-4 h-4" />
                        <span>Acknowledged</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </WorkerLayout>
  );
};
