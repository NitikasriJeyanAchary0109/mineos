import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSafety } from '../../context/SafetyContext';
import { useAuth } from '../../context/AuthContext';
import {
  Shield,
  Home,
  Layers,
  Users,
  AlertTriangle,
  FileText,
  Menu,
  X,
  Volume2,
  VolumeX,
  CheckCircle2,
  BellRing,
  Award,
  UserCheck,
  Radio,
  Settings,
  LogOut,
  ExternalLink,
  ChevronRight,
  Wifi,
  Flame,
  Activity,
  Download,
  Smartphone,
} from 'lucide-react';
import { isStandaloneMode, getMobileServerUrl, setMobileServerUrl, setStandaloneMode } from '../../services/mobileTelemetryBridge';

interface MobileLayoutProps {
  children: React.ReactNode;
  activeTab?: 'home' | 'mine' | 'workers' | 'hazards' | 'reports';
  title?: string;
  showBack?: boolean;
}

export const MobileLayout: React.FC<MobileLayoutProps> = ({
  children,
  activeTab: explicitTab,
  title,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, role, switchRoleDemo, logout } = useAuth();
  const {
    hasCriticalHazard,
    primaryCriticalHazard,
    isAlarmSilenced,
    silenceAlarm,
    resumeAlarm,
    resolveActiveEmergency,
    stats,
    alerts,
  } = useSafety();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [serverUrlInput, setServerUrlInput] = useState(getMobileServerUrl());
  const [standaloneEnabled, setStandaloneEnabled] = useState(isStandaloneMode());
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Derive active tab from URL path if not explicitly provided
  const currentTab = explicitTab || (() => {
    const path = location.pathname;
    if (path.includes('/mobile/mine')) return 'mine';
    if (path.includes('/mobile/workers')) return 'workers';
    if (path.includes('/mobile/hazards')) return 'hazards';
    if (path.includes('/mobile/reports')) return 'reports';
    return 'home';
  })();

  const activeHazardsCount = alerts.filter((a) => !a.acknowledged && (a.severity === 'critical' || a.severity === 'warning')).length;

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setMobileServerUrl(serverUrlInput);
    setStandaloneMode(standaloneEnabled);
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      setSettingsOpen(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#F5F4EF] text-[#151713] flex flex-col font-sans select-none antialiased">
      {/* ===================================================================== */}
      {/* 1. TOP MOBILE APP BAR (Fixed top, safe-area padded) */}
      {/* ===================================================================== */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#DCDAD4] shadow-xs px-3.5 py-2.5 flex items-center justify-between">
        {/* Left: Brand / Logo */}
        <div
          onClick={() => navigate('/mobile')}
          className="flex items-center space-x-2 cursor-pointer active:opacity-80"
        >
          <div className="w-8 h-8 rounded-xl bg-[#176B4D] flex items-center justify-center text-white shadow-xs">
            <Shield className="w-4 h-4 fill-white/20" />
          </div>
          <div>
            <div className="font-serif font-bold text-sm tracking-tight leading-tight flex items-center space-x-1.5">
              <span>MINE OS</span>
              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-[#FAF9F6] border border-[#DCDAD4] text-[#666861] uppercase">
                Field
              </span>
            </div>
            <div className="text-[10px] font-mono text-[#666861] leading-tight">
              Subterranean Safety
            </div>
          </div>
        </div>

        {/* Center/Right: Overall Mine Status Badge */}
        <div className="flex items-center space-x-2">
          {hasCriticalHazard ? (
            <button
              onClick={() => navigate('/mobile/hazards')}
              className="px-2.5 py-1 rounded-lg bg-[#FDF2F2] border border-[#A83D45]/40 text-[#A83D45] text-[11px] font-mono font-bold flex items-center space-x-1 animate-pulse shadow-xs active:scale-95"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>CRITICAL</span>
            </button>
          ) : stats.attention > 0 ? (
            <div className="px-2.5 py-1 rounded-lg bg-[#FEF9E7] border border-[#B47A18]/30 text-[#B47A18] text-[11px] font-mono font-bold flex items-center space-x-1">
              <span className="w-2 h-2 rounded-full bg-[#B47A18]" />
              <span>ATTENTION</span>
            </div>
          ) : (
            <div className="px-2.5 py-1 rounded-lg bg-[#EAF3EF] border border-[#2D8A61]/30 text-[#2D8A61] text-[11px] font-mono font-bold flex items-center space-x-1">
              <span className="w-2 h-2 rounded-full bg-[#2D8A61]" />
              <span>NOMINAL</span>
            </div>
          )}

          {/* Drawer Menu Button */}
          <button
            onClick={() => setDrawerOpen(true)}
            className="w-9 h-9 rounded-xl border border-[#DCDAD4] bg-[#FAF9F6] active:bg-white flex items-center justify-center text-[#151713] transition-colors shadow-2xs"
            aria-label="Open Navigation Drawer"
          >
            <Menu className="w-5 h-5 text-[#151713]" />
          </button>
        </div>
      </header>

      {/* ===================================================================== */}
      {/* 2. EMERGENCY SIREN BANNER (Visible when critical hazard is active) */}
      {/* ===================================================================== */}
      {hasCriticalHazard && primaryCriticalHazard && (
        <div className="bg-[#A83D45] text-white px-3.5 py-2.5 flex items-center justify-between text-xs font-mono shadow-md z-30 animate-in slide-in-from-top duration-200">
          <div
            onClick={() => navigate('/mobile/hazards')}
            className="flex items-center space-x-2 flex-1 min-w-0 cursor-pointer"
          >
            <AlertTriangle className="w-4 h-4 text-white shrink-0 animate-bounce" />
            <div className="truncate">
              <span className="font-bold uppercase tracking-wider">
                SIREN ACTIVE: {primaryCriticalHazard.title}
              </span>
              <span className="opacity-90 ml-1 text-[11px]">
                ({primaryCriticalHazard.workerName} • {primaryCriticalHazard.zoneName.split('—')[0].trim()})
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-2 shrink-0 ml-2">
            <button
              onClick={() => {
                if (isAlarmSilenced) resumeAlarm();
                else silenceAlarm();
              }}
              className="px-2.5 py-1 rounded-lg bg-white/20 hover:bg-white/30 active:bg-white/40 text-[10.5px] font-bold uppercase tracking-wider flex items-center space-x-1 border border-white/30"
            >
              {isAlarmSilenced ? (
                <>
                  <Volume2 className="w-3 h-3" />
                  <span>Resume</span>
                </>
              ) : (
                <>
                  <VolumeX className="w-3 h-3" />
                  <span>Silence</span>
                </>
              )}
            </button>

            <button
              onClick={() => navigate('/mobile/hazards')}
              className="px-2.5 py-1 rounded-lg bg-white text-[#A83D45] text-[10.5px] font-bold uppercase tracking-wider shadow-xs active:bg-[#FDF2F2]"
            >
              Action
            </button>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* 3. MAIN SCROLLABLE CONTENT BODY */}
      {/* Padded at bottom to clear the fixed bottom navigation bar (min 76px) */}
      {/* ===================================================================== */}
      <main className="flex-1 overflow-y-auto pb-24 px-3.5 pt-3 max-w-lg mx-auto w-full">
        {children}
      </main>

      {/* ===================================================================== */}
      {/* 4. FIXED BOTTOM NAVIGATION BAR (Ergonomic, Touch-Friendly, >= 48px targets) */}
      {/* ===================================================================== */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#DCDAD4] shadow-lg max-w-lg mx-auto">
        <div className="grid grid-cols-5 h-16 items-center px-1">
          {/* 1. Home */}
          <button
            type="button"
            onClick={() => navigate('/mobile')}
            className={`flex flex-col items-center justify-center h-full transition-colors active:scale-95 ${
              currentTab === 'home' ? 'text-[#176B4D]' : 'text-[#666861] hover:text-[#151713]'
            }`}
          >
            <Home className={`w-5 h-5 ${currentTab === 'home' ? 'stroke-[2.5]' : 'stroke-[1.75]'}`} />
            <span className={`text-[10px] mt-1 font-medium ${currentTab === 'home' ? 'font-bold' : ''}`}>
              Home
            </span>
          </button>

          {/* 2. Mine 3D */}
          <button
            type="button"
            onClick={() => navigate('/mobile/mine')}
            className={`flex flex-col items-center justify-center h-full transition-colors active:scale-95 ${
              currentTab === 'mine' ? 'text-[#176B4D]' : 'text-[#666861] hover:text-[#151713]'
            }`}
          >
            <Layers className={`w-5 h-5 ${currentTab === 'mine' ? 'stroke-[2.5]' : 'stroke-[1.75]'}`} />
            <span className={`text-[10px] mt-1 font-medium ${currentTab === 'mine' ? 'font-bold' : ''}`}>
              Mine
            </span>
          </button>

          {/* 3. Workers */}
          <button
            type="button"
            onClick={() => navigate('/mobile/workers')}
            className={`flex flex-col items-center justify-center h-full transition-colors active:scale-95 ${
              currentTab === 'workers' ? 'text-[#176B4D]' : 'text-[#666861] hover:text-[#151713]'
            }`}
          >
            <Users className={`w-5 h-5 ${currentTab === 'workers' ? 'stroke-[2.5]' : 'stroke-[1.75]'}`} />
            <span className={`text-[10px] mt-1 font-medium ${currentTab === 'workers' ? 'font-bold' : ''}`}>
              Workers
            </span>
          </button>

          {/* 4. Hazards */}
          <button
            type="button"
            onClick={() => navigate('/mobile/hazards')}
            className={`relative flex flex-col items-center justify-center h-full transition-colors active:scale-95 ${
              currentTab === 'hazards'
                ? hasCriticalHazard
                  ? 'text-[#A83D45]'
                  : 'text-[#176B4D]'
                : hasCriticalHazard
                ? 'text-[#A83D45]'
                : 'text-[#666861] hover:text-[#151713]'
            }`}
          >
            <div className="relative">
              <AlertTriangle className={`w-5 h-5 ${currentTab === 'hazards' ? 'stroke-[2.5]' : 'stroke-[1.75]'}`} />
              {activeHazardsCount > 0 && (
                <span className="absolute -top-1.5 -right-2 w-4 h-4 rounded-full bg-[#A83D45] text-white text-[9px] font-mono font-bold flex items-center justify-center shadow-xs">
                  {activeHazardsCount}
                </span>
              )}
            </div>
            <span className={`text-[10px] mt-1 font-medium ${currentTab === 'hazards' ? 'font-bold' : ''}`}>
              Hazards
            </span>
          </button>

          {/* 5. Reports */}
          <button
            type="button"
            onClick={() => navigate('/mobile/reports')}
            className={`flex flex-col items-center justify-center h-full transition-colors active:scale-95 ${
              currentTab === 'reports' ? 'text-[#176B4D]' : 'text-[#666861] hover:text-[#151713]'
            }`}
          >
            <FileText className={`w-5 h-5 ${currentTab === 'reports' ? 'stroke-[2.5]' : 'stroke-[1.75]'}`} />
            <span className={`text-[10px] mt-1 font-medium ${currentTab === 'reports' ? 'font-bold' : ''}`}>
              Reports
            </span>
          </button>
        </div>
      </nav>

      {/* ===================================================================== */}
      {/* 5. SLIDE-OUT MOBILE DRAWER / MORE MENU */}
      {/* ===================================================================== */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <div
            onClick={() => setDrawerOpen(false)}
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
          />

          {/* Drawer Content */}
          <div className="relative w-full max-w-xs bg-white h-full shadow-2xl flex flex-col justify-between z-10 animate-in slide-in-from-right duration-200">
            {/* Drawer Top */}
            <div className="p-4 border-b border-[#ECEBE6] flex items-center justify-between bg-[#FAF9F6]">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#176B4D] text-white flex items-center justify-center font-serif font-bold text-base shadow-xs">
                  M
                </div>
                <div>
                  <div className="font-serif font-bold text-sm text-[#151713]">
                    Mine OS Mobile
                  </div>
                  <div className="text-[11px] font-mono text-[#176B4D] font-medium uppercase">
                    Role: {role.replace('_', ' ')}
                  </div>
                </div>
              </div>

              <button
                onClick={() => setDrawerOpen(false)}
                className="p-1.5 rounded-lg border border-[#DCDAD4] bg-white text-[#666861] hover:text-[#151713]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Drawer Navigation Links */}
            <div className="flex-1 overflow-y-auto p-3 space-y-1 text-xs">
              <div className="text-[10px] font-mono uppercase text-[#666861] font-bold px-3 py-1">
                Operations & Management
              </div>

              <button
                onClick={() => {
                  setDrawerOpen(false);
                  navigate('/mobile/manage-workers');
                }}
                className="w-full px-3 py-2.5 rounded-xl border border-transparent hover:border-[#DCDAD4] hover:bg-[#FAF9F6] active:bg-[#EAF3EF] flex items-center justify-between text-left transition-colors"
              >
                <div className="flex items-center space-x-2.5">
                  <Users className="w-4 h-4 text-[#176B4D]" />
                  <span className="font-medium text-[#151713]">Worker Management</span>
                </div>
                <ChevronRight className="w-4 h-4 text-[#666861]" />
              </button>

              <button
                onClick={() => {
                  setDrawerOpen(false);
                  navigate('/mobile/champions');
                }}
                className="w-full px-3 py-2.5 rounded-xl border border-transparent hover:border-[#DCDAD4] hover:bg-[#FAF9F6] active:bg-[#EAF3EF] flex items-center justify-between text-left transition-colors"
              >
                <div className="flex items-center space-x-2.5">
                  <Award className="w-4 h-4 text-[#B47A18]" />
                  <span className="font-medium text-[#151713]">Safety Champions</span>
                </div>
                <ChevronRight className="w-4 h-4 text-[#666861]" />
              </button>

              <button
                onClick={() => {
                  setDrawerOpen(false);
                  navigate('/mobile/reports');
                }}
                className="w-full px-3 py-2.5 rounded-xl border border-transparent hover:border-[#DCDAD4] hover:bg-[#FAF9F6] active:bg-[#EAF3EF] flex items-center justify-between text-left transition-colors"
              >
                <div className="flex items-center space-x-2.5">
                  <FileText className="w-4 h-4 text-[#176B4D]" />
                  <span className="font-medium text-[#151713]">DGMS Statutory Logs</span>
                </div>
                <ChevronRight className="w-4 h-4 text-[#666861]" />
              </button>

              <div className="pt-2 text-[10px] font-mono uppercase text-[#666861] font-bold px-3 py-1">
                Role Clearance
              </div>

              <div className="grid grid-cols-2 gap-1 px-1">
                {[
                  { id: 'manager', label: 'Manager' },
                  { id: 'safety_officer', label: 'Safety Off.' },
                  { id: 'shift_incharge', label: 'Shift In-Chg' },
                  { id: 'mine_worker', label: 'Worker' },
                ].map((r) => (
                  <button
                    key={r.id}
                    onClick={() => switchRoleDemo(r.id as any)}
                    className={`px-2 py-1.5 rounded-lg text-[11px] font-medium border transition-all text-center ${
                      role === r.id
                        ? 'bg-[#176B4D] text-white border-[#176B4D] font-bold shadow-2xs'
                        : 'bg-[#FAF9F6] border-[#DCDAD4] text-[#666861]'
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>

              <div className="pt-2 text-[10px] font-mono uppercase text-[#666861] font-bold px-3 py-1">
                Configuration
              </div>

              <button
                onClick={() => {
                  setSettingsOpen(true);
                }}
                className="w-full px-3 py-2.5 rounded-xl border border-transparent hover:border-[#DCDAD4] hover:bg-[#FAF9F6] active:bg-[#EAF3EF] flex items-center justify-between text-left transition-colors"
              >
                <div className="flex items-center space-x-2.5">
                  <Settings className="w-4 h-4 text-[#666861]" />
                  <span className="font-medium text-[#151713]">Standalone Engine / Sync</span>
                </div>
                <span className="text-[10px] font-mono text-[#2D8A61] font-bold">
                  {standaloneEnabled ? 'LOCAL' : 'SERVER'}
                </span>
              </button>

              <a
                href="/MineOS.apk"
                download="MineOS.apk"
                onClick={() => setDrawerOpen(false)}
                className="w-full px-3 py-2.5 rounded-xl border border-[#D4E8DF] bg-[#EAF3EF] text-[#176B4D] hover:bg-[#D4E8DF] active:bg-[#C2E0D4] flex items-center justify-between text-left transition-colors font-medium text-xs shadow-2xs"
              >
                <div className="flex items-center space-x-2.5">
                  <Smartphone className="w-4 h-4 text-[#176B4D]" />
                  <span className="font-bold text-[#176B4D]">Download Android APK</span>
                </div>
                <span className="text-[10px] font-mono bg-[#176B4D] text-white px-2 py-0.5 rounded-md font-bold">
                  4.5 MB
                </span>
              </a>

              <button
                onClick={() => {
                  setDrawerOpen(false);
                  navigate('/controlroom/dashboard');
                }}
                className="w-full px-3 py-2.5 rounded-xl border border-transparent hover:border-[#DCDAD4] hover:bg-[#FAF9F6] active:bg-[#EAF3EF] flex items-center justify-between text-left transition-colors"
              >
                <div className="flex items-center space-x-2.5">
                  <ExternalLink className="w-4 h-4 text-[#666861]" />
                  <span className="font-medium text-[#151713]">Switch to Desktop View</span>
                </div>
                <ChevronRight className="w-4 h-4 text-[#666861]" />
              </button>
            </div>

            {/* Drawer Bottom */}
            <div className="p-3 border-t border-[#ECEBE6] bg-[#FAF9F6] flex items-center justify-between">
              <div className="text-[10.5px] font-mono text-[#666861]">
                {user ? user.email || user.name : 'Subterranean Node'}
              </div>
              <button
                onClick={() => {
                  logout();
                  navigate('/login');
                }}
                className="px-2.5 py-1 rounded-lg border border-[#DCDAD4] bg-white text-[#A83D45] text-[11px] font-bold flex items-center space-x-1 active:bg-[#FDF2F2]"
              >
                <LogOut className="w-3 h-3" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* 6. SETTINGS MODAL: Autonomous Subterranean Engine & Server URL */}
      {/* ===================================================================== */}
      {settingsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl border border-[#DCDAD4] p-4 max-w-sm w-full shadow-xl space-y-3">
            <div className="flex items-center justify-between border-b border-[#ECEBE6] pb-2">
              <div className="flex items-center space-x-2">
                <Settings className="w-4 h-4 text-[#176B4D]" />
                <h3 className="font-serif font-bold text-sm text-[#151713]">
                  Connection & Autonomous Mode
                </h3>
              </div>
              <button
                onClick={() => setSettingsOpen(false)}
                className="text-[#666861] hover:text-[#151713]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveSettings} className="space-y-3 text-xs">
              <div className="bg-[#FAF9F6] p-3 rounded-xl border border-[#ECEBE6] space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-[#151713]">
                    Autonomous Offline Engine
                  </label>
                  <input
                    type="checkbox"
                    checked={standaloneEnabled}
                    onChange={(e) => setStandaloneEnabled(e.target.checked)}
                    className="w-4 h-4 accent-[#176B4D] rounded"
                  />
                </div>
                <p className="text-[11px] text-[#666861] leading-relaxed">
                  When enabled, Mine OS simulates full real-time miner vitals, multi-gas telemetry, and LoRa signals locally on this phone without needing a computer or network connection.
                </p>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-mono text-[#666861] uppercase">
                  Central Mine Server URL (Optional)
                </label>
                <input
                  type="text"
                  value={serverUrlInput}
                  onChange={(e) => setServerUrlInput(e.target.value)}
                  placeholder="e.g. http://192.168.1.50:3001"
                  className="w-full bg-[#FAF9F6] border border-[#DCDAD4] rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:border-[#176B4D] focus:bg-white"
                />
                <span className="text-[10px] text-[#666861]">
                  Leave empty to run 100% standalone inside the mobile APK.
                </span>
              </div>

              {saveSuccess && (
                <div className="p-2 rounded-lg bg-[#EAF3EF] border border-[#2D8A61]/30 text-[#2D8A61] text-xs font-bold flex items-center space-x-1.5 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Settings Saved Successfully</span>
                </div>
              )}

              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-[#ECEBE6]">
                <button
                  type="button"
                  onClick={() => setSettingsOpen(false)}
                  className="px-3 py-1.5 rounded-xl border border-[#DCDAD4] text-xs font-semibold text-[#666861]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-[#176B4D] text-white text-xs font-bold shadow-xs active:bg-[#13563D]"
                >
                  Save Configuration
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
