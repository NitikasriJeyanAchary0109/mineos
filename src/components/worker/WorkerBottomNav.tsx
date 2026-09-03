import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Shield, Bell, User, AlertTriangle } from 'lucide-react';
import { useSafety } from '../../context/SafetyContext';

export const WorkerBottomNav: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { alerts, activeWorker } = useSafety();

  const unreadAlerts = alerts.filter((a) => !a.acknowledged).length;

  const navItems = [
    {
      path: '/worker-home',
      label: 'Home',
      icon: Home,
    },
    {
      path: '/live-safety',
      label: 'Safety',
      icon: Shield,
    },
    {
      path: '/alerts',
      label: 'Alerts',
      icon: Bell,
      badge: unreadAlerts > 0 ? unreadAlerts : undefined,
    },
    {
      path: '/profile',
      label: 'Profile',
      icon: User,
    },
  ];

  return (
    <nav className="sticky bottom-0 z-40 bg-white border-t border-[#DCDAD4] px-2 py-2">
      <div className="grid grid-cols-4 gap-1.5 max-w-lg mx-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex-1 flex flex-col items-center justify-center py-2 px-1 rounded-xl select-none min-h-[52px] transition-colors relative ${
                isActive
                  ? 'bg-[#EAF3EF] text-[#176B4D] font-semibold'
                  : 'text-[#666861] hover:text-[#151713] hover:bg-[#FAF9F6]'
              }`}
            >
              {item.badge !== undefined && (
                <span className="absolute top-1.5 right-4 w-4 h-4 bg-[#A83D45] text-white rounded-full text-[10px] font-bold flex items-center justify-center">
                  {item.badge}
                </span>
              )}
              <Icon className={`w-5 h-5 mb-0.5 ${isActive ? 'text-[#176B4D] stroke-[2.2]' : 'stroke-2'}`} />
              <span className="text-[11px] font-sans">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
