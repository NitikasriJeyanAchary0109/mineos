import React from 'react';
import { useLocation } from 'react-router-dom';
import { useSafety } from '../../context/SafetyContext';
import { WorkerBottomNav } from './WorkerBottomNav';
import { Radio, BatteryMedium, ShieldAlert } from 'lucide-react';

interface WorkerLayoutProps {
  children: React.ReactNode;
  showNav?: boolean;
  title?: string;
  subtitle?: string;
}

export const WorkerLayout: React.FC<WorkerLayoutProps> = ({
  children,
  showNav = true,
  title,
  subtitle,
}) => {
  const { viewMode, activeWorker, activeAlert } = useSafety();
  const location = useLocation();

  // Certain onboarding/entry pages don't show the bottom nav
  const noNavRoutes = ['/', '/worker-id', '/face-ppe-scan', '/ppe-verification', '/entry-approved'];
  const shouldShowNav = showNav && !noNavRoutes.includes(location.pathname);

  const content = (
    <div className="flex flex-col min-h-screen bg-[#F5F4EF] text-[#151713]">
      {/* Mobile Top Status Ribbon */}
      <div className="bg-white px-4 py-2.5 border-b border-[#DCDAD4] flex items-center justify-between text-xs text-[#666861] select-none">
        <div className="flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#2D8A61]" />
          <span className="font-semibold text-[#151713]">{activeWorker.name}</span>
          <span className="text-[#666861] font-mono text-[11px]">({activeWorker.id})</span>
        </div>

        <div className="flex items-center space-x-3 text-[11px] font-semibold">
          <div className="flex items-center space-x-1 text-[#176B4D]">
            <Radio className="w-3.5 h-3.5" />
            <span>LoRa 868</span>
          </div>
          <div className="flex items-center space-x-1 text-[#2D8A61]">
            <BatteryMedium className="w-4 h-4" />
            <span>{activeWorker.vitals.batteryLevel}%</span>
          </div>
        </div>
      </div>

      {/* Optional Title Header */}
      {title && (
        <div className="px-4 py-3 bg-white border-b border-[#ECEBE6]">
          <h1 className="font-serif text-xl sm:text-2xl text-[#151713] font-normal tracking-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="text-xs text-[#666861] mt-0.5">{subtitle}</p>
          )}
        </div>
      )}

      {/* Main Body */}
      <main className="flex-1 p-3 sm:p-4 pb-20 overflow-y-auto">
        {children}
      </main>

      {/* Bottom Navigation */}
      {shouldShowNav && <WorkerBottomNav />}
    </div>
  );

  // In 'mobile' mock mode on desktop screens, wrap inside an elegant minimal handset frame
  if (viewMode === 'mobile') {
    return (
      <div className="min-h-[calc(100vh-60px)] bg-[#FAF9F6] py-6 px-2 flex justify-center items-start">
        <div className="w-full max-w-[440px] rounded-[32px] bg-white p-3 border border-[#DCDAD4] shadow-xl relative overflow-hidden">
          {/* Speaker notch */}
          <div className="w-20 h-1 bg-[#DCDAD4] rounded-full mx-auto mb-2" />

          {/* Screen area */}
          <div className="rounded-[24px] overflow-hidden border border-[#ECEBE6] min-h-[680px] max-h-[780px] flex flex-col relative bg-[#F5F4EF]">
            {content}
          </div>
        </div>
      </div>
    );
  }

  // Full responsive mode
  return (
    <div className="max-w-2xl mx-auto min-h-screen border-x border-[#DCDAD4] bg-[#F5F4EF]">
      {content}
    </div>
  );
};
