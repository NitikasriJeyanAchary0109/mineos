import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, DEMO_ACCOUNTS, UserRole } from '../../context/AuthContext';
import { useSafety } from '../../context/SafetyContext';
import { DatabaseInspectorModal } from '../../components/controlroom/DatabaseInspectorModal';
import { WorkerEntryDigitalTwinAnimation } from '../../components/shared/WorkerEntryDigitalTwinAnimation';
import {
  Shield,
  Lock,
  Mail,
  ArrowRight,
  ArrowUpRight,
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  Radio,
  Cpu,
  Smartphone,
  Monitor,
  Database,
  Layers,
  Compass,
  Sparkles,
  MapPin,
  Check,
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, switchRoleDemo, role: currentRole } = useAuth();
  const {
    triggerSimulatedFallAlert,
    triggerSimulatedGasAlert,
    viewMode,
    setViewMode,
  } = useSafety();

  const [email, setEmail] = useState('manager@msafe.mine');
  const [password, setPassword] = useState('msafe-secure-2026');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [navDropdownOpen, setNavDropdownOpen] = useState(false);
  const [dbModalOpen, setDbModalOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const workerPages = [
    { path: '/worker-id', label: '1. RFID Badge Identification' },
    { path: '/face-ppe-scan', label: '2. Face & PPE Camera Scan' },
    { path: '/ppe-verification', label: '3. 3D PPE Verification' },
    { path: '/entry-approved', label: '4. Turnstile Entry Clearance' },
    { path: '/worker-home', label: '5. Mine Worker Home' },
    { path: '/live-safety', label: '6. Live Gear Status' },
    { path: '/sos-emergency', label: '7. SOS Distress Trigger' },
  ];

  const controlRoomPages = [
    { path: '/controlroom/dashboard', label: 'Control Room Overview' },
    { path: '/controlroom/reports', label: 'Safety Reports & Risk Index' },
    { path: '/controlroom/workers', label: 'Manage Mine Personnel' },
    { path: '/controlroom/critical-alert', label: 'Emergency Crisis Dispatch' },
  ];

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await login(email, password);
      if (res.success) {
        setSuccessMsg('Authenticated. Redirecting...');
        const matched = Object.values(DEMO_ACCOUNTS).find(
          (a) => a.email.toLowerCase() === email.toLowerCase()
        );
        setTimeout(() => {
          if (matched?.role === 'mine_worker') {
            navigate('/worker-home');
          } else {
            navigate('/controlroom/dashboard');
          }
        }, 400);
      } else {
        setErrorMsg(
          'Invalid credentials — contact your Safety Officer/Mine Manager for account access'
        );
      }
    } catch (err: any) {
      setErrorMsg(
        'Invalid credentials — contact your Safety Officer/Mine Manager for account access'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoSelect = (roleKey: UserRole) => {
    switchRoleDemo(roleKey);
    const acc = DEMO_ACCOUNTS[roleKey];
    setEmail(acc.email);
    setPassword('msafe-secure-2026');

    if (roleKey === 'mine_worker') {
      navigate('/worker-home');
    } else {
      navigate('/controlroom/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F4F0] text-[#111310] flex flex-col font-sans relative overflow-x-hidden selection:bg-[#1B4D3E] selection:text-white">
      {/* ================= BACKGROUND SUBTLE GEOLOGICAL & ARCHITECTURAL TEXTURE ================= */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Subtle architectural grid */}
        <div
          className="absolute inset-0 opacity-[0.35]"
          style={{
            backgroundImage: `radial-gradient(#686A63 0.75px, transparent 0.75px)`,
            backgroundSize: '32px 32px',
          }}
        />

        {/* Faint subterranean contour lines & geological stratum vectors */}
        <svg
          className="absolute right-0 top-0 w-full h-full max-w-5xl opacity-[0.06] text-[#111310]"
          viewBox="0 0 1000 1000"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M200,100 C350,150 500,80 750,220 C900,300 950,450 1000,500"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeDasharray="4 4"
          />
          <path
            d="M100,280 C300,320 450,260 700,400 C880,500 920,680 1000,750"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <path
            d="M50,480 C240,500 420,440 650,600 C820,720 900,860 1000,950"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeDasharray="6 6"
          />
          <path
            d="M0,680 C200,690 380,640 600,800 C780,920 860,980 1000,1000"
            stroke="currentColor"
            strokeWidth="1"
          />
          <circle cx="700" cy="400" r="180" stroke="currentColor" strokeWidth="0.75" />
          <circle cx="700" cy="400" r="320" stroke="currentColor" strokeWidth="0.5" strokeDasharray="3 3" />
        </svg>
      </div>

      {/* ================= HEADER: MINIMAL & CLEAN (ONLY REQUIRED CONTROLS) ================= */}
      <header className="relative z-30 bg-[#F5F4F0] border-b border-[#E2E0D8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Left: Brand Identity */}
          <div
            onClick={() => navigate('/')}
            className="flex items-center space-x-3 cursor-pointer select-none group"
          >
            <div className="w-8 h-8 rounded-lg bg-white border border-[#DCDAD4] shadow-sm flex items-center justify-center text-[#1B4D3E] group-hover:border-[#1B4D3E] transition-colors">
              <Shield className="w-4.5 h-4.5 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-sans font-bold text-sm tracking-wider text-[#111310]">
                  MINE OS
                </span>
                <span className="text-[10px] font-medium tracking-wide uppercase px-1.5 py-0.5 rounded bg-[#EDECE7] text-[#686A63] border border-[#DCDAD4]">
                  PORTAL
                </span>
              </div>
              <div className="text-[11px] text-[#686A63] font-normal hidden sm:block">
                Autonomous Subterranean Intelligence
              </div>
            </div>
          </div>

          {/* Right: Only Required Navigation Buttons */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* View Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setNavDropdownOpen(!navDropdownOpen)}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-[#DCDAD4] bg-white text-xs text-[#111310] hover:border-[#1B4D3E] transition-colors shadow-sm"
              >
                <span className="text-[#686A63] font-medium">VIEW:</span>
                <span className="font-semibold">Worker Flow</span>
                <ChevronDown className="w-3.5 h-3.5 text-[#686A63]" />
              </button>

              {navDropdownOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white border border-[#DCDAD4] rounded-2xl shadow-xl p-2 z-50 divide-y divide-[#EDECE7]">
                  <div className="pb-2">
                    <div className="text-[10px] font-semibold text-[#1B4D3E] uppercase tracking-wider px-3 py-1">
                      Worker Mobile Flow
                    </div>
                    {workerPages.map((p) => (
                      <button
                        key={p.path}
                        onClick={() => {
                          navigate(p.path);
                          setNavDropdownOpen(false);
                        }}
                        className="w-full text-left px-3 py-1.5 rounded-lg text-xs text-[#686A63] hover:text-[#111310] hover:bg-[#F5F4F0] transition-colors"
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>

                  <div className="pt-2">
                    <div className="text-[10px] font-semibold text-[#C67D28] uppercase tracking-wider px-3 py-1">
                      Control Room Station
                    </div>
                    {controlRoomPages.map((p) => (
                      <button
                        key={p.path}
                        onClick={() => {
                          navigate(p.path);
                          setNavDropdownOpen(false);
                        }}
                        className="w-full text-left px-3 py-1.5 rounded-lg text-xs text-[#686A63] hover:text-[#111310] hover:bg-[#F5F4F0] transition-colors"
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Direct Control Room Access Button */}
            <button
              onClick={() => navigate('/controlroom/dashboard')}
              className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-[#1B4D3E] hover:bg-[#143C30] text-white text-xs font-medium transition-all shadow-sm active:translate-y-0.5"
            >
              <span>CONTROL ROOM</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-white/80" />
            </button>
          </div>
        </div>
      </header>

      {/* ================= MAIN HERO / LOGIN AREA (EDITORIAL TWO-COLUMN LAYOUT) ================= */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-10 lg:py-16">
        <div className="max-w-7xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* LEFT SIDE: EDITORIAL PRESENTATION & ARCHITECTURAL VISUAL */}
          <div className="lg:col-span-6 xl:col-span-7 space-y-8 text-left">
            {/* Status Line */}
            <div className="flex items-center space-x-2.5">
              <span className="w-2 h-2 rounded-full bg-[#1B4D3E]" />
              <span className="text-[11px] font-mono tracking-[0.2em] uppercase text-[#686A63] font-semibold">
                SECURE CLOUD AUTHENTICATION // DGMS COMPLIANT
              </span>
            </div>

            {/* Headline */}
            <div className="space-y-3">
              <div className="font-serif italic text-2xl sm:text-3xl text-[#686A63] font-light">
                Mine OS
              </div>
              <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl text-[#111310] font-normal tracking-tight leading-[1.08]">
                Access the <br className="hidden sm:inline" />
                <span className="italic font-light">Underground.</span>
              </h1>
            </div>

            {/* Supporting Copy */}
            <p className="text-base sm:text-lg text-[#686A63] leading-relaxed max-w-xl font-normal">
              Autonomous intelligence for safer, smarter subterranean operations. Real-time biometric verification, environmental telemetry, and active worker safety tracking across all mine levels.
            </p>

            {/* 3D Digital Twin Worker Entry Animation Journey */}
            <WorkerEntryDigitalTwinAnimation />
          </div>

          {/* RIGHT SIDE: PRISTINE EDITORIAL LOGIN PANEL */}
          <div className="lg:col-span-6 xl:col-span-5 w-full">
            <div className="bg-white border border-[#DCDAD4] rounded-[24px] sm:rounded-[28px] p-6 sm:p-10 shadow-[0_4px_32px_rgba(17,19,16,0.04)] space-y-6 max-w-lg mx-auto transition-all">
              {/* Header */}
              <div className="border-b border-[#EDECE7] pb-5">
                <div className="flex items-center justify-between">
                  <h2 className="font-serif text-2xl sm:text-3xl text-[#111310] font-normal tracking-tight">
                    Mine OS Access Portal
                  </h2>
                  <span className="w-2.5 h-2.5 rounded-full bg-[#1B4D3E]" title="Cloud Live" />
                </div>
                <p className="text-xs sm:text-sm text-[#686A63] mt-1.5">
                  Authorized personnel only. Secure role credentials required.
                </p>
              </div>

              {/* Feedback Alerts */}
              {errorMsg && (
                <div className="p-3.5 rounded-xl bg-[#FEF2F2] border border-[#FCA5A5] text-[#991B1B] text-xs flex items-center space-x-2.5 transition-all">
                  <AlertCircle className="w-4 h-4 shrink-0 text-[#DC2626]" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {successMsg && (
                <div className="p-3.5 rounded-xl bg-[#F0FDF4] border border-[#86EFAC] text-[#166534] text-xs flex items-center space-x-2.5 transition-all">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-[#16A34A]" />
                  <span>{successMsg}</span>
                </div>
              )}

              {/* Login Form */}
              <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block font-medium text-[#111310] mb-1.5 flex items-center justify-between">
                    <span className="flex items-center space-x-1.5">
                      <Mail className="w-3.5 h-3.5 text-[#686A63]" />
                      <span>Registered Email</span>
                    </span>
                    <span className="text-[11px] text-[#686A63] font-normal">Official Domain</span>
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. manager@msafe.mine"
                    required
                    className="w-full bg-[#FAF9F6] border border-[#DCDAD4] focus:border-[#1B4D3E] focus:bg-white text-[#111310] rounded-xl px-4 py-3 text-sm focus:outline-none transition-all placeholder:text-[#9A9C95]"
                  />
                </div>

                <div>
                  <label className="block font-medium text-[#111310] mb-1.5 flex items-center justify-between">
                    <span className="flex items-center space-x-1.5">
                      <Lock className="w-3.5 h-3.5 text-[#686A63]" />
                      <span>Password</span>
                    </span>
                    <span className="text-[11px] text-[#686A63] font-normal">Encrypted</span>
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    required
                    className="w-full bg-[#FAF9F6] border border-[#DCDAD4] focus:border-[#1B4D3E] focus:bg-white text-[#111310] rounded-xl px-4 py-3 text-sm focus:outline-none transition-all placeholder:text-[#9A9C95]"
                  />
                </div>

                {/* Primary CTA */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-[#1B4D3E] hover:bg-[#143C30] active:scale-[0.99] text-white font-medium py-3.5 px-6 rounded-xl transition-all shadow-[0_2px_8px_rgba(27,77,62,0.15)] hover:shadow-[0_4px_12px_rgba(27,77,62,0.25)] flex items-center justify-center space-x-2 text-sm disabled:opacity-50 select-none cursor-pointer"
                  >
                    {isLoading ? (
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>Sign In to Portal</span>
                        <ArrowRight className="w-4 h-4 text-white/90" />
                      </>
                    )}
                  </button>
                </div>
              </form>

              {/* Role Test Personas (Redesigned as Elegant Compact Cards) */}
              <div className="pt-4 border-t border-[#EDECE7] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#111310]">
                    Quick Role Test Personas
                  </span>
                  <span className="text-[11px] text-[#686A63]">
                    Pre-provisioned in Supabase
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  {/* Mine Manager */}
                  <button
                    type="button"
                    onClick={() => handleDemoSelect('mine_manager')}
                    className="p-3 rounded-xl border border-[#E2E0D8] bg-[#FAF9F6] hover:bg-white hover:border-[#1B4D3E]/60 transition-all text-left space-y-1 group shadow-none hover:shadow-sm"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-xs text-[#111310] group-hover:text-[#1B4D3E] transition-colors">
                        Mine Manager
                      </span>
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-[#EAF1EE] text-[#1B4D3E] border border-[#1B4D3E]/20 uppercase">
                        ALL ZONES
                      </span>
                    </div>
                    <div className="text-[11px] text-[#686A63] font-mono truncate">
                      manager@msafe.mine
                    </div>
                  </button>

                  {/* Safety Officer */}
                  <button
                    type="button"
                    onClick={() => handleDemoSelect('safety_officer')}
                    className="p-3 rounded-xl border border-[#E2E0D8] bg-[#FAF9F6] hover:bg-white hover:border-[#1B4D3E]/60 transition-all text-left space-y-1 group shadow-none hover:shadow-sm"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-xs text-[#111310] group-hover:text-[#1B4D3E] transition-colors">
                        Safety Officer
                      </span>
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-[#EAF1EE] text-[#1B4D3E] border border-[#1B4D3E]/20 uppercase">
                        AUDIT
                      </span>
                    </div>
                    <div className="text-[11px] text-[#686A63] font-mono truncate">
                      safety@msafe.mine
                    </div>
                  </button>

                  {/* Shift In-Charge */}
                  <button
                    type="button"
                    onClick={() => handleDemoSelect('shift_incharge')}
                    className="p-3 rounded-xl border border-[#E2E0D8] bg-[#FAF9F6] hover:bg-white hover:border-[#C67D28]/60 transition-all text-left space-y-1 group shadow-none hover:shadow-sm"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-xs text-[#111310] group-hover:text-[#C67D28] transition-colors">
                        Shift In-Charge
                      </span>
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-[#FEF3C7] text-[#92400E] border border-[#D97706]/20 uppercase font-mono">
                        SHIFT A
                      </span>
                    </div>
                    <div className="text-[11px] text-[#686A63] font-mono truncate">
                      incharge@msafe.mine • Shift A Command
                    </div>
                  </button>

                  {/* Mine Worker */}
                  <button
                    type="button"
                    onClick={() => handleDemoSelect('mine_worker')}
                    className="p-3 rounded-xl border border-[#E2E0D8] bg-[#FAF9F6] hover:bg-white hover:border-[#1B4D3E]/60 transition-all text-left space-y-1 group shadow-none hover:shadow-sm"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-xs text-[#111310] group-hover:text-[#1B4D3E] transition-colors">
                        Mine Worker
                      </span>
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-[#EDECE7] text-[#686A63] border border-[#DCDAD4] uppercase font-mono">
                        DEEP1KA
                      </span>
                    </div>
                    <div className="text-[11px] text-[#686A63] font-mono truncate">
                      worker@msafe.mine
                    </div>
                  </button>
                </div>
              </div>

              {/* Subtle Footer Note */}
              <div className="pt-2 text-center text-[11px] text-[#686A63]">
                Directorate General of Mines Safety (DGMS) Statutory Audit Platform
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* ================= EDITORIAL FOOTER ================= */}
      <footer className="relative z-10 border-t border-[#E2E0D8] py-6 px-4 sm:px-6 lg:px-8 bg-[#F5F4F0] text-xs text-[#686A63]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-[#111310]">MINE OS</span>
            <span>—</span>
            <span>Underground Coal Mine Safety & Wearable Telemetry</span>
          </div>
          <div className="flex items-center space-x-4 font-mono text-[11px]">
            <span>DGMS STATUTORY</span>
            <span>•</span>
            <span>LORA PROTOCOL 868MHz</span>
            <span>•</span>
            <span>EDGE AI VISION</span>
          </div>
        </div>
      </footer>

      {/* Database Inspector Modal */}
      <DatabaseInspectorModal
        isOpen={dbModalOpen}
        onClose={() => setDbModalOpen(false)}
      />
    </div>
  );
};
