import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSafety } from '../../context/SafetyContext';
import {
  Shield,
  Radio,
  Cpu,
  AlertTriangle,
  ExternalLink,
  Database,
  AlertOctagon,
  Bell,
  Mail,
  Send,
  Check,
  X,
  Sparkles,
  Phone,
} from 'lucide-react';
import { DatabaseInspectorModal } from '../controlroom/DatabaseInspectorModal';
import { useAuth } from '../../context/AuthContext';
import { notificationService } from '../../utils/notificationService';
import { NotificationDispatch } from '../../types/safety';

export const SystemHeader: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { role, assignedZone, workerId } = useAuth();

  const {
    activeAlert,
    activeEmergency,
  } = useSafety();

  const [dbModalOpen, setDbModalOpen] = useState(false);
  const [notificationDrawerOpen, setNotificationDrawerOpen] = useState(false);
  const [outbox, setOutbox] = useState<NotificationDispatch[]>([]);
  const [desktopNotifGranted, setDesktopNotifGranted] = useState(
    typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted'
  );

  // Sync notification outbox
  useEffect(() => {
    setOutbox(notificationService.getOutbox());
    const handler = () => {
      setOutbox(notificationService.getOutbox());
    };
    window.addEventListener('msafe_outbox_updated', handler);
    return () => window.removeEventListener('msafe_outbox_updated', handler);
  }, []);

  const handleEnableDesktopNotifications = async () => {
    const granted = await notificationService.requestDesktopPermission();
    setDesktopNotifGranted(granted);
    if (granted) {
      notificationService.sendDesktopPush(
        'Notifications Active',
        'Mine OS Subterranean safety alerts will now appear on your desktop.'
      );
    }
  };

  const isControlRoom = location.pathname.startsWith('/controlroom');

  if (location.pathname === '/login') {
    return null;
  }

  return (
    <header className="sticky top-0 z-50 bg-[#F5F4EF] border-b border-[#E2E0D8] text-[#151713]">
      {/* Universal Emergency Distress Ribbon Across Entire Application */}
      {activeEmergency && (
        <div className="bg-[#A83D45] text-white px-4 py-2 flex items-center justify-between text-xs font-medium shadow-sm">
          <div className="flex items-center space-x-2">
            <AlertOctagon className="w-4 h-4 text-white shrink-0" />
            <span className="tracking-wide">
              <strong>CRITICAL DISTRESS:</strong> {activeEmergency.workerName} ({activeEmergency.workerId}) — {activeEmergency.title}
            </span>
          </div>
          <button
            onClick={() => navigate('/controlroom/critical-alert')}
            className="px-3 py-1 rounded bg-black/25 hover:bg-black/40 border border-white/30 text-[11px] font-semibold uppercase tracking-wider transition-colors shrink-0 ml-3"
          >
            Open Crisis Dispatch →
          </button>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between">
        {/* Left: Mine OS logo */}
        <div
          onClick={() => navigate('/controlroom/dashboard')}
          className="flex items-center space-x-3 cursor-pointer group select-none"
        >
          <div className="w-8 h-8 rounded-lg bg-white border border-[#DCDAD4] shadow-sm flex items-center justify-center text-[#176B4D] group-hover:border-[#176B4D] transition-colors">
            <Shield className="w-4.5 h-4.5 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-sans font-bold text-sm tracking-wider text-[#151713]">
                MINE OS
              </span>
              <span className="text-[10px] font-medium tracking-wide uppercase px-1.5 py-0.5 rounded bg-[#ECEBE6] text-[#666861] border border-[#DCDAD4]">
                Enterprise
              </span>
            </div>
            <div className="text-[11px] text-[#666861] font-normal hidden sm:block">
              Autonomous Subterranean Intelligence
            </div>
          </div>
        </div>

        {/* Center/Right: Utility Controls */}
        <div className="flex items-center space-x-2 sm:space-x-2.5">
          {/* LoRa 868MHz ONLINE */}
          <div className="hidden xl:flex items-center space-x-1.5 bg-white border border-[#DCDAD4] px-2.5 py-1 rounded-md text-xs text-[#666861]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#2D8A61]" />
            <span>LoRa 868MHz</span>
            <span className="font-semibold text-[#151713]">ONLINE</span>
          </div>

          {/* Active Alert indicator */}
          {activeAlert && (
            <div
              onClick={() => navigate('/controlroom/critical-alert')}
              className="flex items-center space-x-1.5 bg-[#FDF2F2] border border-[#A83D45]/40 text-[#A83D45] px-2.5 py-1 rounded-md text-xs cursor-pointer font-medium"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-[#A83D45]" />
              <span>1 Hazard</span>
            </div>
          )}

          {/* NOTIFICATION HUB BELL BUTTON */}
          <button
            type="button"
            onClick={() => setNotificationDrawerOpen(true)}
            title="Notification Center & Statutory Outbox"
            className="relative p-2 rounded-xl bg-white hover:bg-[#FAF9F6] border border-[#DCDAD4] text-[#151713] transition-colors shadow-2xs"
          >
            <Bell className="w-4 h-4 text-[#176B4D]" />
            {outbox.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#176B4D] text-white text-[10px] font-bold font-mono px-1.5 py-0.2 rounded-full ring-2 ring-white">
                {outbox.length}
              </span>
            )}
          </button>



          {/* Role Chip */}
          <button
            onClick={() => navigate('/login')}
            className="flex items-center space-x-1.5 bg-white hover:bg-[#FAF9F6] border border-[#DCDAD4] px-2.5 py-1 rounded-md text-xs transition-colors"
            title="Switch User Role or Sign Out"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#2D8A61]" />
            <span className="text-[#666861] text-[11px] hidden md:inline">Role:</span>
            <span className="font-semibold text-[#151713] text-[11px] uppercase">
              {role === 'mine_manager'
                ? 'Manager'
                : role === 'safety_officer'
                ? 'Officer'
                : role === 'shift_incharge'
                ? 'In-Charge'
                : 'Worker'}
            </span>
          </button>

          {/* Switch View Button: Worker App or Control Room */}
          <button
            onClick={() =>
              navigate(isControlRoom ? '/worker-home' : '/controlroom/dashboard')
            }
            className="px-3 py-1.5 rounded-md text-xs font-medium bg-[#176B4D] hover:bg-[#13563D] text-white transition-colors flex items-center space-x-1.5 shadow-sm active:translate-y-0.5"
          >
            <span>{isControlRoom ? 'Worker App' : 'Control Room'}</span>
            <ExternalLink className="w-3 h-3 text-white/80" />
          </button>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* NOTIFICATION CENTER SLIDE-OVER DRAWER */}
      {/* ===================================================================== */}
      {notificationDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between border-l border-[#DCDAD4] animate-in slide-in-from-right duration-200">
            {/* Drawer Header */}
            <div className="p-4 border-b border-[#ECEBE6] flex items-center justify-between bg-[#FAF9F6]">
              <div className="flex items-center space-x-2">
                <Bell className="w-5 h-5 text-[#176B4D]" />
                <div>
                  <h3 className="font-serif font-bold text-sm text-[#151713]">
                    Notification Dispatch Center
                  </h3>
                  <p className="text-[11px] text-[#666861]">
                    Statutory SMS, Email & App Push Log
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setNotificationDrawerOpen(false)}
                className="p-1 rounded-lg hover:bg-white text-[#666861] hover:text-[#151713]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Desktop Notification Permission Banner */}
            {!desktopNotifGranted && (
              <div className="p-3 bg-[#FAF6E9] border-b border-[#B47A18]/20 flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2 text-[#8A5B0B]">
                  <Sparkles className="w-4 h-4 shrink-0" />
                  <span>Enable desktop alerts for instant distress pings</span>
                </div>
                <button
                  type="button"
                  onClick={handleEnableDesktopNotifications}
                  className="px-2.5 py-1 rounded-lg bg-[#B47A18] text-white text-[11px] font-bold font-mono shadow-xs shrink-0 ml-2"
                >
                  Enable
                </button>
              </div>
            )}

            {/* Outbox Items List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              <div className="flex items-center justify-between text-xs text-[#666861] font-mono">
                <span>RECENT DISPATCHES ({outbox.length})</span>
                <button
                  type="button"
                  onClick={() => {
                    navigate('/controlroom/reports');
                    setNotificationDrawerOpen(false);
                  }}
                  className="text-[#176B4D] font-bold hover:underline"
                >
                  Full Outbox Console →
                </button>
              </div>

              {outbox.length === 0 ? (
                <div className="py-12 text-center text-xs text-[#666861]">
                  No dispatches recorded yet.
                </div>
              ) : (
                outbox.slice(0, 8).map((item) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-xl border border-[#ECEBE6] bg-[#FAF9F6] space-y-1.5 text-xs hover:border-[#176B4D]/40 transition-colors"
                  >
                    <div className="flex items-center justify-between font-mono">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          item.channel === 'SMS'
                            ? 'bg-[#EAF3EF] text-[#176B4D] border border-[#176B4D]/30'
                            : item.channel === 'EMAIL'
                            ? 'bg-[#FAF6E9] text-[#8A5B0B] border border-[#B47A18]/30'
                            : 'bg-[#FDF2F2] text-[#A83D45] border border-[#A83D45]/30'
                        }`}
                      >
                        {item.channel}
                      </span>
                      <span className="text-[10px] text-[#666861]">{item.timestamp}</span>
                    </div>

                    <div className="font-semibold text-[#151713]">{item.subject}</div>

                    <div className="text-[11px] text-[#666861] line-clamp-2">
                      {item.message}
                    </div>

                    <div className="flex items-center justify-between pt-1 text-[10px] text-[#666861] font-mono">
                      <span>To: {item.recipientName} ({item.recipientContact})</span>
                      <span className="text-[#2D8A61] font-bold">{item.status} ✓</span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Drawer Footer Actions */}
            <div className="p-4 border-t border-[#ECEBE6] bg-[#FAF9F6] space-y-2">
              <button
                type="button"
                onClick={() => {
                  navigate('/controlroom/reports');
                  setNotificationDrawerOpen(false);
                }}
                className="w-full py-2 px-3 rounded-xl bg-[#176B4D] hover:bg-[#12553D] text-white text-xs font-semibold flex items-center justify-center space-x-1.5 shadow-xs transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Open Notification Hub & Compose</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Database Inspector Modal */}
      <DatabaseInspectorModal
        isOpen={dbModalOpen}
        onClose={() => setDbModalOpen(false)}
      />
    </header>
  );
};
