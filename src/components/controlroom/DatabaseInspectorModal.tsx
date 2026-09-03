import React, { useState, useEffect } from 'react';
import { Database, Table, RefreshCw, X, Server, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { BACKEND_API_URL } from '../../lib/supabase';

interface DatabaseInspectorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DatabaseInspectorModal: React.FC<DatabaseInspectorModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeTable, setActiveTable] = useState<string>('wearable_readings');
  const [dbOverview, setDbOverview] = useState<any>(null);
  const [tableData, setTableData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const fetchOverview = async () => {
    try {
      const res = await fetch(`${BACKEND_API_URL}/api/database/overview`);
      if (res.ok) {
        const data = await res.json();
        setDbOverview(data);
      }
    } catch (err) {
      console.warn('Could not fetch DB overview:', err);
    }
  };

  const fetchTableRows = async (tableName: string) => {
    setLoading(true);
    try {
      const res = await fetch(`${BACKEND_API_URL}/api/database/tables/${tableName}?limit=15`);
      if (res.ok) {
        const data = await res.json();
        setTableData(data);
      }
    } catch (err) {
      console.warn('Could not fetch table rows:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchOverview();
      fetchTableRows(activeTable);
      const interval = setInterval(() => {
        fetchOverview();
        fetchTableRows(activeTable);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [isOpen, activeTable]);

  if (!isOpen) return null;

  const tablesList = [
    { id: 'wearable_readings', label: 'wearable_readings' },
    { id: 'environment_readings', label: 'environment_readings' },
    { id: 'ppe_entry_logs', label: 'ppe_entry_logs' },
    { id: 'helmet_status', label: 'helmet_status' },
    { id: 'alerts', label: 'alerts' },
    { id: 'workers', label: 'workers' },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-fade-in">
      <div className="relative w-full max-w-5xl bg-[#0b1017] border border-slate-700 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Modal Top Header */}
        <div className="bg-[#0e1520] border-b border-slate-800 p-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center text-cyan-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="font-display font-black text-lg text-white uppercase tracking-wider">
                  M-SAFE Database Engine // Live Tables
                </h2>
                <span className="px-2 py-0.5 rounded bg-emerald-950 border border-emerald-500 text-emerald-300 text-[10px] font-hud font-bold flex items-center space-x-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>RUNNING // ONLINE</span>
                </span>
              </div>
              <div className="text-xs font-hud text-slate-400 mt-0.5 flex items-center space-x-3">
                <span>Database: <strong className="text-slate-200">iron_minds_msafe_db</strong></span>
                <span>•</span>
                <span>Total Live Records: <strong className="text-cyan-300 font-mono">{dbOverview?.total_records || 0}</strong></span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                fetchOverview();
                fetchTableRows(activeTable);
              }}
              className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white"
              title="Refresh Tables"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-cyan-400' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Table Selector Tabs */}
        <div className="bg-[#0a0f18] border-b border-slate-800 px-4 py-2 flex items-center space-x-2 overflow-x-auto text-xs font-hud">
          {tablesList.map((t) => {
            const count = dbOverview?.tables?.[t.id]?.count ?? 0;
            const isSelected = activeTable === t.id;
            return (
              <button
                key={t.id}
                onClick={() => {
                  setActiveTable(t.id);
                  fetchTableRows(t.id);
                }}
                className={`px-3 py-1.5 rounded-lg border font-bold flex items-center space-x-2 whitespace-nowrap transition-all ${
                  isSelected
                    ? 'bg-cyan-950 border-cyan-400 text-cyan-300 ring-1 ring-cyan-500/50 shadow-md'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <Table className="w-3.5 h-3.5 opacity-70" />
                <span>{t.label}</span>
                <span className="font-mono text-[10px] bg-black/40 px-1.5 py-0.5 rounded border border-white/10 text-slate-300">
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Table Body & Records Inspector */}
        <div className="flex-1 p-4 overflow-y-auto font-hud">
          <div className="flex items-center justify-between mb-3 text-xs">
            <span className="text-slate-300 font-bold uppercase">
              Table: <span className="text-cyan-400 font-mono">{activeTable}</span>
            </span>
            <span className="text-slate-400 text-[11px]">
              Showing latest {tableData?.rows?.length || 0} rows (auto-refreshing every 3s)
            </span>
          </div>

          {tableData?.rows && tableData.rows.length > 0 ? (
            <div className="rounded-xl border border-slate-800 overflow-x-auto bg-[#060a10]">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#0e1624] border-b border-slate-800 text-[10px] text-cyan-300 uppercase tracking-wider">
                    {Object.keys(tableData.rows[0]).map((col) => (
                      <th key={col} className="p-2.5 font-bold whitespace-nowrap">
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {tableData.rows.map((row: any, idx: number) => (
                    <tr key={row.id || idx} className="hover:bg-slate-900/40 transition-colors text-[11px] text-slate-200">
                      {Object.entries(row).map(([key, val]: any) => (
                        <td key={key} className="p-2.5 font-mono whitespace-nowrap">
                          {typeof val === 'boolean' ? (
                            val ? (
                              <span className="text-emerald-400 font-bold">TRUE</span>
                            ) : (
                              <span className="text-slate-500">FALSE</span>
                            )
                          ) : typeof val === 'object' && val !== null ? (
                            JSON.stringify(val)
                          ) : (
                            String(val)
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-8 text-center text-slate-500 bg-slate-900/30 rounded-xl border border-slate-800">
              No records in table yet. Simulator or hardware stream is populating rows...
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-[#0b121e] border-t border-slate-800 px-4 py-2.5 flex items-center justify-between text-[11px] font-hud text-slate-400">
          <div className="flex items-center space-x-2">
            <Server className="w-3.5 h-3.5 text-cyan-400" />
            <span>Ingestion Endpoint: <strong className="text-slate-300">http://localhost:3001/api</strong></span>
          </div>
          <div>
            Supabase Schema: <span className="text-cyan-400 font-mono">backend/schema.sql</span>
          </div>
        </div>
      </div>
    </div>
  );
};
