import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MobileLayout } from '../../components/mobile/MobileLayout';
import { useSafety } from '../../context/SafetyContext';
import {
  ShieldCheck,
  AlertTriangle,
  Users,
  Wind,
  Layers,
  Heart,
  Activity,
  ArrowRight,
  MapPin,
  Clock,
  CheckCircle2,
  ChevronRight,
  Compass,
} from 'lucide-react';
import { getFormattedTime } from '../../services/mobileTelemetryBridge';

export const MobileDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    workers,
    zones,
    alerts,
    stats,
    hasCriticalHazard,
    primaryCriticalHazard,
    environmentByZone,
    setSelectedWorkerId,
    acknowledgeAlert,
  } = useSafety();

  const isMineSafe = !hasCriticalHazard && stats.critical === 0;

  return (
    <MobileLayout activeTab="home">
      <div className="space-y-3.5 pb-2">
        {/* ===================================================================== */}
        {/* 1. PRIMARY ANSWER CARD: "IS THE MINE SAFE RIGHT NOW?" */}
        {/* ===================================================================== */}
        <div
          className={`rounded-2xl p-4 border shadow-xs transition-all ${
            hasCriticalHazard
              ? 'bg-[#FDF2F2] border-[#A83D45]/50 text-[#151713]'
              : stats.attention > 0
              ? 'bg-[#FEF9E7] border-[#B47A18]/40 text-[#151713]'
              : 'bg-white border-[#DCDAD4] text-[#151713]'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span
                className={`w-3 h-3 rounded-full shrink-0 ${
                  hasCriticalHazard
                    ? 'bg-[#A83D45] animate-ping'
                    : stats.attention > 0
                    ? 'bg-[#B47A18]'
                    : 'bg-[#2D8A61]'
                }`}
              />
              <span className="text-[11px] font-mono uppercase tracking-wider font-bold text-[#666861]">
                Mine Operational Status
              </span>
            </div>
            <span className="text-[10px] font-mono text-[#666861]">
              Live: {getFormattedTime()} IST
            </span>
          </div>

          <div className="mt-2 flex items-baseline justify-between">
            <h1 className="font-serif text-2xl font-bold tracking-tight text-[#151713]">
              {hasCriticalHazard
                ? 'EMERGENCY ACTIVE'
                : stats.attention > 0
                ? 'ATTENTION ADVISORY'
                : 'MINE NOMINAL & SAFE'}
            </h1>
          </div>

          <p className="text-xs text-[#666861] mt-1 leading-relaxed">
            {hasCriticalHazard
              ? 'Critical distress incident active underground. Immediate protocol response required.'
              : stats.attention > 0
              ? `${stats.attention} personnel or sector require attention. Zero life-threatening hazards logged.`
              : 'All subterranean sectors, forced ventilation drifts, and personnel telemetry verified within DGMS statutory limits.'}
          </p>

          {/* Quick Headcount Snapshot Pill Grid */}
          <div className="grid grid-cols-4 gap-1.5 mt-3 pt-3 border-t border-black/5 text-center">
            <div className="bg-[#FAF9F6] p-2 rounded-xl border border-[#ECEBE6]">
              <div className="text-[10px] text-[#666861] font-mono uppercase">Miners</div>
              <div className="font-serif font-bold text-lg text-[#151713]">{stats.underground}</div>
            </div>
            <div className="bg-[#EAF3EF] p-2 rounded-xl border border-[#2D8A61]/30">
              <div className="text-[10px] text-[#2D8A61] font-mono uppercase font-semibold">Safe</div>
              <div className="font-serif font-bold text-lg text-[#2D8A61]">{stats.safe}</div>
            </div>
            <div className="bg-[#FEF9E7] p-2 rounded-xl border border-[#B47A18]/30">
              <div className="text-[10px] text-[#B47A18] font-mono uppercase font-semibold">Advisory</div>
              <div className="font-serif font-bold text-lg text-[#B47A18]">{stats.attention}</div>
            </div>
            <div className={`p-2 rounded-xl border ${hasCriticalHazard ? 'bg-[#FDF2F2] border-[#A83D45]/40 text-[#A83D45]' : 'bg-[#FAF9F6] border-[#ECEBE6] text-[#666861]'}`}>
              <div className="text-[10px] font-mono uppercase font-semibold">Critical</div>
              <div className="font-serif font-bold text-lg">{stats.critical}</div>
            </div>
          </div>
        </div>

        {/* ===================================================================== */}
        {/* 2. PROMINENT CRITICAL HAZARD CALLOUT (When active) */}
        {/* ===================================================================== */}
        {hasCriticalHazard && primaryCriticalHazard && (
          <div
            onClick={() => navigate('/mobile/hazards')}
            className="p-4 rounded-2xl bg-[#FDF2F2] border-2 border-[#A83D45] shadow-md cursor-pointer active:scale-[0.99] transition-transform space-y-2.5"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1.5 text-[#A83D45] text-xs font-mono font-bold uppercase">
                <AlertTriangle className="w-4 h-4 animate-bounce shrink-0" />
                <span>⚠ ACTIVE CRITICAL HAZARD</span>
              </div>
              <span className="text-[10.5px] font-mono bg-[#A83D45] text-white px-2 py-0.5 rounded font-bold">
                PRIORITY 1
              </span>
            </div>

            <div>
              <div className="font-serif font-bold text-lg text-[#151713]">
                {primaryCriticalHazard.title}
              </div>
              <div className="text-xs text-[#666861] mt-0.5 font-mono">
                Worker: <strong className="text-[#151713]">{primaryCriticalHazard.workerName}</strong> ({primaryCriticalHazard.workerId})
              </div>
              <div className="text-xs text-[#666861] font-mono">
                Location: <strong className="text-[#176B4D]">{primaryCriticalHazard.zoneName}</strong> • {primaryCriticalHazard.timestamp}
              </div>
            </div>

            <button
              type="button"
              className="w-full py-2.5 rounded-xl bg-[#A83D45] text-white font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center space-x-1.5 shadow-xs"
            >
              <span>OPEN INCIDENT PROTOCOLS</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* ===================================================================== */}
        {/* 3. QUICK ACCESS LAUNCHER TILES */}
        {/* ===================================================================== */}
        <div className="grid grid-cols-2 gap-2.5">
          {/* 3D Mine Spatial Twin Tile */}
          <button
            onClick={() => navigate('/mobile/mine')}
            className="p-3.5 rounded-2xl bg-white border border-[#DCDAD4] text-left hover:border-[#176B4D] active:bg-[#FAF9F6] transition-all shadow-xs flex flex-col justify-between space-y-2"
          >
            <div className="w-8 h-8 rounded-xl bg-[#EAF3EF] text-[#176B4D] flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <div className="font-serif font-bold text-sm text-[#151713] flex items-center justify-between">
                <span>3D Mine Twin</span>
                <ChevronRight className="w-3.5 h-3.5 text-[#666861]" />
              </div>
              <div className="text-[11px] text-[#666861] mt-0.5">
                Inspect 4 zones & active miner positions
              </div>
            </div>
          </button>

          {/* Worker Telemetry Tile */}
          <button
            onClick={() => navigate('/mobile/workers')}
            className="p-3.5 rounded-2xl bg-white border border-[#DCDAD4] text-left hover:border-[#176B4D] active:bg-[#FAF9F6] transition-all shadow-xs flex flex-col justify-between space-y-2"
          >
            <div className="w-8 h-8 rounded-xl bg-[#FAF6E9] text-[#B47A18] flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <div className="font-serif font-bold text-sm text-[#151713] flex items-center justify-between">
                <span>4-Point PPE</span>
                <ChevronRight className="w-3.5 h-3.5 text-[#666861]" />
              </div>
              <div className="text-[11px] text-[#666861] mt-0.5">
                Helmet, vest, gloves & boots verification
              </div>
            </div>
          </button>
        </div>

        {/* ===================================================================== */}
        {/* 4. SUBTERRANEAN ZONE ENVIRONMENTAL GAS CAROUSEL */}
        {/* ===================================================================== */}
        <div className="bg-white border border-[#DCDAD4] rounded-2xl p-3.5 shadow-xs space-y-2.5">
          <div className="flex items-center justify-between border-b border-[#ECEBE6] pb-2">
            <div className="flex items-center space-x-1.5">
              <Wind className="w-4 h-4 text-[#176B4D]" />
              <h3 className="font-serif font-bold text-sm text-[#151713]">
                Subterranean Atmospheric Telemetry
              </h3>
            </div>
            <span className="text-[10px] font-mono text-[#176B4D] font-bold">
              4 ZONES ACTIVE
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {[
              { id: 'zone-a', name: 'Zone A (-120m)', mq4: environmentByZone['zone-a']?.mq4 || 42, temp: 27 },
              { id: 'zone-b', name: 'Zone B (-260m)', mq4: environmentByZone['zone-b']?.mq4 || 110, temp: 28 },
              { id: 'zone-c', name: 'Zone C (-440m)', mq4: environmentByZone['zone-c']?.mq4 || 249, temp: 31 },
              { id: 'zone-d', name: 'Zone D (-520m)', mq4: environmentByZone['zone-d']?.mq4 || 180, temp: 29 },
            ].map((z) => {
              const isCh4Elevated = z.mq4 > 250;
              return (
                <div
                  key={z.id}
                  onClick={() => navigate('/mobile/mine')}
                  className="p-2.5 rounded-xl bg-[#FAF9F6] border border-[#ECEBE6] cursor-pointer active:bg-white transition-colors"
                >
                  <div className="text-[11px] font-semibold text-[#151713] truncate">
                    {z.name}
                  </div>
                  <div className="flex items-baseline justify-between mt-1">
                    <div>
                      <span className="text-[9.5px] font-mono text-[#666861]">CH4: </span>
                      <strong className={`font-mono text-xs ${isCh4Elevated ? 'text-[#B47A18]' : 'text-[#176B4D]'}`}>
                        {z.mq4} ppm
                      </strong>
                    </div>
                    <span className="text-[10px] font-mono text-[#666861]">
                      {z.temp}°C
                    </span>
                  </div>
                  <div className="text-[9px] font-mono text-[#2D8A61] mt-0.5">
                    ● Nominal Airflow
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ===================================================================== */}
        {/* 5. RECENT ALERTS FEED (Mobile Compact) */}
        {/* ===================================================================== */}
        <div className="bg-white border border-[#DCDAD4] rounded-2xl p-3.5 shadow-xs space-y-2.5">
          <div className="flex items-center justify-between border-b border-[#ECEBE6] pb-2">
            <div className="flex items-center space-x-1.5">
              <Activity className="w-4 h-4 text-[#176B4D]" />
              <h3 className="font-serif font-bold text-sm text-[#151713]">
                Live Safety Alerts Stream
              </h3>
            </div>
            <button
              onClick={() => navigate('/mobile/hazards')}
              className="text-[11px] font-medium text-[#176B4D] hover:underline"
            >
              View All ({alerts.length})
            </button>
          </div>

          <div className="space-y-2">
            {alerts.slice(0, 3).map((alert) => (
              <div
                key={alert.id}
                className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 text-xs ${
                  alert.severity === 'critical'
                    ? 'bg-[#FDF2F2] border-[#A83D45]/40 text-[#151713]'
                    : alert.severity === 'warning'
                    ? 'bg-[#FEF9E7] border-[#B47A18]/30 text-[#151713]'
                    : 'bg-[#FAF9F6] border-[#ECEBE6] text-[#151713]'
                }`}
              >
                <div className="min-w-0 flex-1">
                  <div className="font-semibold truncate text-[11.5px] leading-tight">
                    {alert.title}
                  </div>
                  <div className="text-[10px] text-[#666861] font-mono truncate mt-0.5">
                    {alert.workerName || alert.zoneName} • {alert.timestamp}
                  </div>
                </div>

                {!alert.acknowledged ? (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      acknowledgeAlert(alert.id);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-white border border-[#DCDAD4] text-[10px] font-bold shrink-0 active:bg-[#FAF9F6] shadow-2xs"
                  >
                    Ack
                  </button>
                ) : (
                  <span className="text-[10px] text-[#2D8A61] font-mono font-bold shrink-0 flex items-center space-x-0.5">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Done</span>
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </MobileLayout>
  );
};
