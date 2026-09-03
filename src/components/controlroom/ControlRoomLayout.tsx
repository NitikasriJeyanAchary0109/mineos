import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { StatBar } from './StatBar';
import {
  Layers,
  LayoutDashboard,
  UserCheck,
  AlertOctagon,
  Users,
  Radio,
  LogOut,
  Shield,
  Key,
  FileText,
} from 'lucide-react';
import { useSafety } from '../../context/SafetyContext';
import { useAuth, DEMO_ACCOUNTS } from '../../context/AuthContext';
import { EmergencyModalOverlay } from './EmergencyModalOverlay';

interface ControlRoomLayoutProps {
  children: React.ReactNode;
}

export const ControlRoomLayout: React.FC<ControlRoomLayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { activeAlert, activeEmergency, dismissEmergency, resolveActiveEmergency, workers } = useSafety();
  const { user, role, assignedZone, assignedShift, isScopedToShift, canCreateWorker, logout } = useAuth();

  const baseNavItems = [
    {
      path: '/controlroom/dashboard',
      label: 'Main Dashboard',
      icon: LayoutDashboard,
    },
    {
      path: '/controlroom/mine-3d',
      label: '3D Mine Overview',
      icon: Layers,
    },
    {
      path: '/controlroom/worker',
      label: 'Worker Telemetry',
      icon: UserCheck,
    },
    {
      path: '/controlroom/critical-alert',
      label: 'Critical Hazards',
      icon: AlertOctagon,
      badge: activeAlert ? '1' : undefined,
    },
    {
      path: '/controlroom/reports',
      label: 'Safety Reports',
      icon: FileText,
    },
    // Business Logic: Only Mine Manager and Safety Officer can access Manage Workers
    ...(canCreateWorker
      ? [
          {
            path: '/controlroom/manage-workers',
            label: 'Manage Workers',
            icon: Users,
          },
        ]
      : []),
  ];

  const handleSignOut = () => {
    logout();
    navigate('/login');
  };

  const roleMeta = DEMO_ACCOUNTS[role] || {
    badgeColor: 'bg-slate-900 text-slate-300 border-slate-700',
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-60px)] bg-[#F5F4EF] text-[#151713]">
      {/* Top Stat Bar */}
      <div className="print:hidden">
        <StatBar />
      </div>

      {/* Body Area with Left Nav & Content */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden print:overflow-visible">
        {/* Left Sidebar Nav */}
        <aside className="print:hidden w-full md:w-60 bg-white border-r border-[#DCDAD4] p-3 flex md:flex-col justify-between shrink-0 gap-1 overflow-x-auto md:overflow-x-visible">
          <div className="flex md:flex-col gap-1 w-full">
            <div className="hidden md:flex items-center justify-between text-xs font-semibold text-[#666861] uppercase tracking-wider px-3 py-2 border-b border-[#ECEBE6] mb-2">
              <span>Supervision Scope</span>
              {isScopedToShift ? (
                <span className="text-[#B47A18] font-bold text-[10px] bg-[#FEF9E7] px-1.5 py-0.5 rounded border border-[#B47A18]/20 font-mono">
                  {assignedShift ? assignedShift.toUpperCase() : 'SHIFT A'}
                </span>
              ) : assignedZone ? (
                <span className="text-[#B47A18] font-bold text-[10px] bg-[#FEF9E7] px-1.5 py-0.5 rounded border border-[#B47A18]/20 font-mono">
                  {assignedZone.toUpperCase()}
                </span>
              ) : (
                <span className="text-[#176B4D] font-bold text-[10px] bg-[#EAF3EF] px-1.5 py-0.5 rounded border border-[#176B4D]/20 font-mono">
                  ALL ZONES
                </span>
              )}
            </div>

            {baseNavItems.map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs transition-colors whitespace-nowrap ${
                    isActive
                      ? 'bg-[#EAF3EF] text-[#176B4D] font-semibold shadow-xs border-l-2 border-[#176B4D]'
                      : 'text-[#666861] hover:text-[#151713] hover:bg-[#F5F4EF]'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-[#176B4D]' : 'text-[#666861]'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="ml-1 px-1.5 py-0.5 rounded-full bg-[#A83D45] text-white text-[10px] font-bold">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* User Profile & Sign Out Box */}
          <div className="hidden md:block border-t border-[#ECEBE6] pt-3 mt-4 space-y-2">
            <div className="bg-[#FAF9F6] p-3 rounded-xl border border-[#DCDAD4] text-xs space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-[#666861] uppercase font-semibold">Active Role</span>
                <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-[#EAF3EF] text-[#176B4D] border border-[#176B4D]/20 uppercase">
                  {role === 'mine_manager'
                    ? 'Manager'
                    : role === 'safety_officer'
                    ? 'Safety Officer'
                    : role === 'shift_incharge'
                    ? 'Shift In-Charge'
                    : 'Worker'}
                </span>
              </div>

              <div>
                <div className="font-semibold text-[#151713] text-xs truncate">
                  {user?.name || (role === 'shift_incharge' ? 'Shift In-Charge Meena' : 'Operations Director Rao')}
                </div>
                <div className="text-[11px] text-[#666861] font-mono truncate">
                  {user?.email || (role === 'shift_incharge' ? 'incharge@msafe.mine' : 'manager@msafe.mine')}
                </div>
              </div>

              <button
                onClick={handleSignOut}
                className="w-full py-2 rounded-lg bg-white hover:bg-[#FEF2F2] border border-[#DCDAD4] hover:border-[#A83D45]/40 text-[#A83D45] text-[11px] font-semibold flex items-center justify-center space-x-1.5 transition-colors shadow-xs"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>SIGN OUT</span>
              </button>
            </div>
          </div>
        </aside>

        {/* Center Content Workspace */}
        <main className="flex-1 p-4 sm:p-6 overflow-y-auto print:overflow-visible print:p-0 bg-[#F5F4EF] print:bg-white text-[#151713]">
          {children}
        </main>
      </div>

      {/* Global Control Room Critical Emergency Modal Overlay (Triggers on Fall / SOS) */}
      {activeEmergency && (
        <EmergencyModalOverlay
          alert={activeEmergency}
          worker={workers.find((w) => w.id === activeEmergency.workerId)}
          onDismiss={dismissEmergency}
          onAcknowledgeAndDispatch={resolveActiveEmergency}
        />
      )}
    </div>
  );
};
