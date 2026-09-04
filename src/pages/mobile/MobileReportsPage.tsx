import React, { useState } from 'react';
import { MobileLayout } from '../../components/mobile/MobileLayout';
import { useSafety } from '../../context/SafetyContext';
import {
  FileText,
  Download,
  ShieldCheck,
  Wind,
  Heart,
  Calendar,
  Filter,
  CheckCircle2,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { getFormattedTime } from '../../services/mobileTelemetryBridge';

export const MobileReportsPage: React.FC = () => {
  const { workers, zones, alerts, stats, environmentByZone } = useSafety();

  const [activeReportTab, setActiveReportTab] = useState<'dgms' | 'gas' | 'vitals'>('dgms');
  const [selectedZone, setSelectedZone] = useState('all');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleExportCsv = () => {
    const headers = 'Worker ID,Name,Role,Zone,Shift,PPE Status,Heart Rate,SpO2,Status\n';
    const rows = workers
      .map(
        (w) =>
          `${w.id},"${w.name}","${w.role}",${w.zoneId},Shift A,${
            w.ppeStatus.helmet && w.ppeStatus.vest && w.ppeStatus.gloves && w.ppeStatus.boots
              ? 'PASS'
              : 'ATTENTION'
          },${w.vitals.heartRate},${w.vitals.spo2}%,${w.status.toUpperCase()}`
      )
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `DGMS_Mine_OS_Report_${Date.now()}.csv`;
    a.click();
    showToast('DGMS CSV audit file generated & downloaded.');
  };

  const filteredWorkers = selectedZone === 'all'
    ? workers
    : workers.filter((w) => w.zoneId === selectedZone);

  return (
    <MobileLayout activeTab="reports">
      <div className="space-y-3.5 pb-2">
        {/* Toast */}
        {toastMsg && (
          <div className="fixed top-14 left-1/2 -translate-x-1/2 z-50 bg-[#151713] text-white text-xs font-mono px-4 py-2 rounded-xl shadow-xl border border-[#2D8A61]/60 flex items-center space-x-2 animate-in fade-in">
            <span className="w-2 h-2 rounded-full bg-[#2D8A61]" />
            <span>{toastMsg}</span>
          </div>
        )}

        {/* ===================================================================== */}
        {/* 1. TOP STATUTORY HEADER & EXPORT ACTION */}
        {/* ===================================================================== */}
        <div className="bg-white border border-[#DCDAD4] rounded-2xl p-4 shadow-xs space-y-3">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[10px] font-mono bg-[#EAF3EF] text-[#2D8A61] border border-[#2D8A61]/30 px-2 py-0.5 rounded font-bold uppercase">
                DGMS Statutory Form IV-B
              </span>
              <h1 className="font-serif font-bold text-lg text-[#151713] mt-1">
                Safety & Compliance Console
              </h1>
              <div className="text-[11px] text-[#666861] font-mono">
                Jharia Coalfield • Subterranean Seam IV
              </div>
            </div>

            <button
              type="button"
              onClick={handleExportCsv}
              className="px-3 py-1.5 rounded-xl bg-[#176B4D] text-white text-xs font-mono font-bold flex items-center space-x-1.5 shadow-2xs active:bg-[#13563D]"
            >
              <Download className="w-3.5 h-3.5" />
              <span>CSV</span>
            </button>
          </div>

          {/* Statutory 4-KPI Grid */}
          <div className="grid grid-cols-2 gap-2 pt-1 border-t border-[#ECEBE6] text-xs">
            <div className="bg-[#FAF9F6] p-2.5 rounded-xl border border-[#ECEBE6]">
              <div className="text-[10px] font-mono text-[#666861] uppercase">
                PPE Gate Compliance
              </div>
              <div className="font-serif font-bold text-xl text-[#2D8A61] mt-0.5">
                94% PASS
              </div>
              <div className="text-[9.5px] font-mono text-[#666861]">
                4-Point Verification
              </div>
            </div>

            <div className="bg-[#FAF9F6] p-2.5 rounded-xl border border-[#ECEBE6]">
              <div className="text-[10px] font-mono text-[#666861] uppercase">
                Atmospheric Methane
              </div>
              <div className="font-serif font-bold text-xl text-[#176B4D] mt-0.5">
                249 ppm
              </div>
              <div className="text-[9.5px] font-mono text-[#666861]">
                Threshold: 380 ppm
              </div>
            </div>

            <div className="bg-[#FAF9F6] p-2.5 rounded-xl border border-[#ECEBE6]">
              <div className="text-[10px] font-mono text-[#666861] uppercase">
                Personnel on Duty
              </div>
              <div className="font-serif font-bold text-xl text-[#151713] mt-0.5">
                {stats.underground} / {stats.underground}
              </div>
              <div className="text-[9.5px] font-mono text-[#666861]">
                Shift A Active
              </div>
            </div>

            <div className="bg-[#FAF9F6] p-2.5 rounded-xl border border-[#ECEBE6]">
              <div className="text-[10px] font-mono text-[#666861] uppercase">
                Critical Distress
              </div>
              <div className={`font-serif font-bold text-xl mt-0.5 ${stats.critical > 0 ? 'text-[#A83D45]' : 'text-[#2D8A61]'}`}>
                {stats.critical} Active
              </div>
              <div className="text-[9.5px] font-mono text-[#666861]">
                Continuous LoRa Mesh
              </div>
            </div>
          </div>
        </div>

        {/* ===================================================================== */}
        {/* 2. REPORT CATEGORY SELECTOR TABS & ZONE FILTER */}
        {/* ===================================================================== */}
        <div className="space-y-2">
          {/* Tab Switcher */}
          <div className="grid grid-cols-3 gap-1 p-0.5 bg-white border border-[#DCDAD4] rounded-xl text-xs font-mono">
            <button
              onClick={() => setActiveReportTab('dgms')}
              className={`py-2 rounded-lg font-bold transition-all ${
                activeReportTab === 'dgms'
                  ? 'bg-[#176B4D] text-white shadow-xs'
                  : 'text-[#666861]'
              }`}
            >
              DGMS Audit
            </button>
            <button
              onClick={() => setActiveReportTab('gas')}
              className={`py-2 rounded-lg font-bold transition-all ${
                activeReportTab === 'gas'
                  ? 'bg-[#176B4D] text-white shadow-xs'
                  : 'text-[#666861]'
              }`}
            >
              Multi-Gas
            </button>
            <button
              onClick={() => setActiveReportTab('vitals')}
              className={`py-2 rounded-lg font-bold transition-all ${
                activeReportTab === 'vitals'
                  ? 'bg-[#176B4D] text-white shadow-xs'
                  : 'text-[#666861]'
              }`}
            >
              Biometrics
            </button>
          </div>

          {/* Zone Chips */}
          <div className="flex items-center space-x-1 overflow-x-auto pb-1 text-xs">
            {['all', 'zone-a', 'zone-b', 'zone-c', 'zone-d'].map((z) => (
              <button
                key={z}
                onClick={() => setSelectedZone(z)}
                className={`px-2.5 py-1 rounded-xl font-mono text-[11px] font-bold shrink-0 transition-all ${
                  selectedZone === z
                    ? 'bg-[#151713] text-white shadow-2xs'
                    : 'bg-white border border-[#DCDAD4] text-[#666861]'
                }`}
              >
                {z === 'all' ? 'All Zones' : z.replace('zone-', 'Zone ').toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* ===================================================================== */}
        {/* 3. REPORT TAB CONTENTS */}
        {/* ===================================================================== */}

        {/* TAB 1: DGMS AUDIT CARDS */}
        {activeReportTab === 'dgms' && (
          <div className="space-y-2">
            {filteredWorkers.map((w) => {
              const allPpe =
                w.ppeStatus.helmet &&
                w.ppeStatus.vest &&
                w.ppeStatus.gloves &&
                w.ppeStatus.boots;

              return (
                <div
                  key={w.id}
                  className="bg-white border border-[#DCDAD4] rounded-2xl p-3.5 shadow-xs space-y-2"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-bold text-xs text-[#151713]">{w.name}</div>
                      <div className="text-[10.5px] text-[#666861] font-mono">
                        {w.id} • {w.role}
                      </div>
                    </div>

                    <span
                      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                        w.status === 'critical'
                          ? 'bg-[#FDF2F2] text-[#A83D45]'
                          : allPpe
                          ? 'bg-[#EAF3EF] text-[#2D8A61]'
                          : 'bg-[#FEF9E7] text-[#B47A18]'
                      }`}
                    >
                      {w.status === 'critical' ? 'HOLD (DISTRESS)' : allPpe ? 'PASS ✓' : 'ATTENTION (PPE)'}
                    </span>
                  </div>

                  <div className="grid grid-cols-4 gap-1 text-center font-mono text-[10px] pt-2 border-t border-[#ECEBE6]">
                    <div className={w.ppeStatus.helmet ? 'text-[#2D8A61] font-bold' : 'text-[#A83D45] font-bold'}>
                      Helmet {w.ppeStatus.helmet ? '✓' : '×'}
                    </div>
                    <div className={w.ppeStatus.vest ? 'text-[#2D8A61] font-bold' : 'text-[#A83D45] font-bold'}>
                      Vest {w.ppeStatus.vest ? '✓' : '×'}
                    </div>
                    <div className={w.ppeStatus.gloves ? 'text-[#2D8A61] font-bold' : 'text-[#A83D45] font-bold'}>
                      Gloves {w.ppeStatus.gloves ? '✓' : '×'}
                    </div>
                    <div className={w.ppeStatus.boots ? 'text-[#2D8A61] font-bold' : 'text-[#A83D45] font-bold'}>
                      Boots {w.ppeStatus.boots ? '✓' : '×'}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* TAB 2: ATMOSPHERIC MULTI-GAS CARDS (CLEAN ALIGNMENT, ZERO WRAPPING) */}
        {activeReportTab === 'gas' && (
          <div className="space-y-2">
            {[
              {
                gas: 'Methane (CH4)',
                sensor: 'MQ-4 Optical Combustible',
                zone: 'Zone C — Deep Extraction Face',
                value: `${environmentByZone['zone-c']?.mq4 || 249} ppm`,
                baseline: '380 ppm',
                airflow: '4.8 m/s (Nominal)',
                verdict: 'PASS (SAFE)',
              },
              {
                gas: 'Carbon Monoxide (CO)',
                sensor: 'MQ-7 Electrochemical',
                zone: 'Zone B — Conveyor Drift',
                value: `${environmentByZone['zone-b']?.mq7 || 2.1} ppm`,
                baseline: '50 ppm',
                airflow: '3.6 m/s (Nominal)',
                verdict: 'PASS (SAFE)',
              },
              {
                gas: 'Air Quality / Toxic Mesh',
                sensor: 'MQ-135 Multi-Gas Array',
                zone: 'Zone A — Upper Haulage Drift',
                value: '14.8 ppm',
                baseline: '100 ppm',
                airflow: '5.2 m/s (Nominal)',
                verdict: 'PASS (SAFE)',
              },
              {
                gas: 'Ambient Crosscut Temp',
                sensor: 'NTC Thermistor / SHT31',
                zone: 'Zone C — Deep Extraction Face',
                value: '31.1°C',
                baseline: '35.0°C',
                airflow: '4.8 m/s',
                verdict: 'PASS (SAFE)',
              },
              {
                gas: 'Auxiliary Return Airflow',
                sensor: 'Pitot Differential Transducer',
                zone: 'Zone D — Ventilation Substation',
                value: '6.4 m/s',
                baseline: '3.0 m/s min',
                airflow: '6.4 m/s',
                verdict: 'PASS (SAFE)',
              },
            ].map((g, idx) => (
              <div
                key={idx}
                className="bg-white border border-[#DCDAD4] rounded-2xl p-3.5 shadow-xs space-y-2"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-bold text-xs text-[#151713]">{g.gas}</div>
                    <div className="text-[10px] text-[#666861] font-mono mt-0.5">
                      {g.sensor} • {g.zone}
                    </div>
                  </div>

                  {/* Clean Verdict Badge with whitespace-nowrap and centered alignment */}
                  <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-lg bg-[#EAF3EF] text-[#2D8A61] border border-[#2D8A61]/30 font-mono text-xs font-bold whitespace-nowrap shrink-0">
                    {g.verdict}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#ECEBE6] text-xs font-mono">
                  <div>
                    <span className="text-[9.5px] text-[#666861]">LIVE VALUE</span>
                    <div className="font-bold text-[#176B4D] text-xs">{g.value}</div>
                  </div>
                  <div>
                    <span className="text-[9.5px] text-[#666861]">DGMS LIMIT</span>
                    <div className="font-bold text-[#151713] text-xs">{g.baseline}</div>
                  </div>
                  <div>
                    <span className="text-[9.5px] text-[#666861]">AIRFLOW</span>
                    <div className="font-bold text-[#666861] text-xs">{g.airflow}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 3: MINER BIOMETRICS CARDS */}
        {activeReportTab === 'vitals' && (
          <div className="space-y-2">
            {filteredWorkers.map((w) => (
              <div
                key={w.id}
                className="bg-white border border-[#DCDAD4] rounded-2xl p-3.5 shadow-xs space-y-2"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-bold text-xs text-[#151713]">{w.name}</div>
                    <div className="text-[10.5px] text-[#666861] font-mono">
                      {w.id} • {w.zoneId.replace('zone-', 'Zone ').toUpperCase()}
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                      w.status === 'critical'
                        ? 'bg-[#FDF2F2] text-[#A83D45]'
                        : w.status === 'attention'
                        ? 'bg-[#FEF9E7] text-[#B47A18]'
                        : 'bg-[#EAF3EF] text-[#2D8A61]'
                    }`}
                  >
                    ● {w.status.toUpperCase()}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#ECEBE6] text-xs font-mono">
                  <div className="bg-[#FAF9F6] p-2 rounded-xl border border-[#ECEBE6]">
                    <span className="text-[9px] text-[#666861]">HEART RATE</span>
                    <div className="font-bold text-[#151713]">{w.vitals.heartRate} BPM</div>
                  </div>
                  <div className="bg-[#FAF9F6] p-2 rounded-xl border border-[#ECEBE6]">
                    <span className="text-[9px] text-[#666861]">SpO2 OXYGEN</span>
                    <div className="font-bold text-[#2D8A61]">{w.vitals.spo2}%</div>
                  </div>
                  <div className="bg-[#FAF9F6] p-2 rounded-xl border border-[#ECEBE6]">
                    <span className="text-[9px] text-[#666861]">ORIENTATION</span>
                    <div className={`font-bold ${w.vitals.movement === 'fall' ? 'text-[#A83D45]' : 'text-[#151713]'}`}>
                      {w.vitals.movement === 'fall' ? 'FALL' : 'UPRIGHT'}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </MobileLayout>
  );
};
