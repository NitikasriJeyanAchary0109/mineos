import React, { useState } from 'react';
import { useSafety } from '../../context/SafetyContext';
import { Radio, Wifi, WifiOff, AlertTriangle, Cpu, Database } from 'lucide-react';
import { DatabaseInspectorModal } from './DatabaseInspectorModal';

export const ConnectionStatusBar: React.FC = () => {
  const { backendConnection, activeAlert } = useSafety();
  const [showDbModal, setShowDbModal] = useState(false);

  const isConnected = backendConnection.state === 'connected';

  return (
    <>
      <div className="bg-[#080e17] border-b border-slate-800 px-3 sm:px-4 py-2 flex flex-wrap items-center justify-between gap-2 text-xs font-hud select-none">
        {/* Hardware Link State */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 bg-slate-900/90 border border-slate-700/80 px-2.5 py-1 rounded-lg">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500 animate-ping'
              }`}
            />
            <span className="text-slate-400 uppercase text-[11px]">Hardware Stream:</span>
            <span
              className={`font-bold uppercase ${
                isConnected ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {isConnected ? 'CONNECTED' : 'DISCONNECTED'}
            </span>
            {isConnected ? (
              <Wifi className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <WifiOff className="w-3.5 h-3.5 text-rose-400" />
            )}
          </div>

          {/* Database Live Inspector Button */}
          <button
            onClick={() => setShowDbModal(true)}
            className="flex items-center space-x-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 px-2.5 py-1 rounded-lg text-cyan-300 font-bold transition-all shadow-sm active:scale-95"
            title="Inspect running database tables and live rows"
          >
            <Database className="w-3.5 h-3.5 text-cyan-400" />
            <span>LIVE DATABASE TABLES</span>
          </button>
        </div>

        {/* Latency & Ping */}
        <div className="flex items-center space-x-3 text-[11px]">
          <div className="hidden sm:flex items-center space-x-1 text-slate-400">
            <span>Latency:</span>
            <strong className="text-emerald-400 font-mono">{backendConnection.latencyMs}ms</strong>
          </div>

          <div className="flex items-center space-x-1 text-slate-400">
            <span>Last Sync:</span>
            <strong className="text-slate-200 font-mono">{backendConnection.lastPing}</strong>
          </div>

          {/* Critical hazard indicator */}
          {activeAlert && (
            <div className="flex items-center space-x-1.5 bg-rose-950 border border-rose-500 text-rose-300 px-2 py-0.5 rounded animate-pulse">
              <AlertTriangle className="w-3 h-3 text-rose-400" />
              <span className="font-bold">ACTIVE HAZARD DETECTED</span>
            </div>
          )}
        </div>
      </div>

      {/* Database Inspector Modal */}
      <DatabaseInspectorModal
        isOpen={showDbModal}
        onClose={() => setShowDbModal(false)}
      />
    </>
  );
};
