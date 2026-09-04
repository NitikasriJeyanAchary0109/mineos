import React, { useState, useRef } from 'react';
import { MobileLayout } from '../../components/mobile/MobileLayout';
import { useSafety } from '../../context/SafetyContext';
import { useAuth } from '../../context/AuthContext';
import {
  Users,
  Search,
  Plus,
  Camera,
  X,
  CheckCircle2,
  MapPin,
  Clock,
  Radio,
  ShieldCheck,
  ChevronRight,
  ChevronLeft,
  Upload,
  RefreshCw,
} from 'lucide-react';

export const MobileManageWorkersPage: React.FC = () => {
  const { workers, selectedWorkerId, setSelectedWorkerId } = useSafety();
  const { role } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedZone, setSelectedZone] = useState('all');
  const [enrollModalOpen, setEnrollModalOpen] = useState(false);
  const [enrollStep, setEnrollStep] = useState(1);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    role: 'Coal Cutting Machine Operator',
    zone: 'zone-c',
    shift: 'Shift A (06:00 - 14:00)',
    workerId: `WM-${Math.floor(1000 + Math.random() * 9000)}`,
    rfid: `RFID-${Math.floor(100000 + Math.random() * 900000)}`,
    photoUrl: '',
  });

  const [cameraActive, setCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const startCamera = async () => {
    try {
      setCameraActive(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: 320, height: 320 },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.warn('Camera access fallback:', err);
      // Fallback: mock biometric capture
      setFormData((prev) => ({
        ...prev,
        photoUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=150',
      }));
      setCameraActive(false);
      showToast('Camera stream simulated for biometric enrollment.');
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const canvas = document.createElement('canvas');
      canvas.width = 240;
      canvas.height = 240;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, 240, 240);
        const dataUrl = canvas.toDataURL('image/jpeg');
        setFormData((prev) => ({ ...prev, photoUrl: dataUrl }));
      }
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((t) => t.stop());
      setCameraActive(false);
      showToast('Biometric snapshot captured successfully.');
    }
  };

  const handleEnrollSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    showToast(`Worker ${formData.name} (${formData.workerId}) enrolled successfully!`);
    setEnrollModalOpen(false);
    setEnrollStep(1);
    setFormData({
      name: '',
      phone: '',
      role: 'Coal Cutting Machine Operator',
      zone: 'zone-c',
      shift: 'Shift A (06:00 - 14:00)',
      workerId: `WM-${Math.floor(1000 + Math.random() * 9000)}`,
      rfid: `RFID-${Math.floor(100000 + Math.random() * 900000)}`,
      photoUrl: '',
    });
  };

  const filteredWorkers = workers.filter((w) => {
    const q = searchQuery.toLowerCase();
    const matchSearch = !q || w.name.toLowerCase().includes(q) || w.id.toLowerCase().includes(q);
    const matchZone = selectedZone === 'all' || w.zoneId === selectedZone;
    return matchSearch && matchZone;
  });

  return (
    <MobileLayout activeTab="workers">
      <div className="space-y-3.5 pb-2">
        {/* Toast */}
        {toastMsg && (
          <div className="fixed top-14 left-1/2 -translate-x-1/2 z-50 bg-[#151713] text-white text-xs font-mono px-4 py-2 rounded-xl shadow-xl border border-[#2D8A61]/60 flex items-center space-x-2 animate-in fade-in">
            <span className="w-2 h-2 rounded-full bg-[#2D8A61]" />
            <span>{toastMsg}</span>
          </div>
        )}

        {/* Top Header Card with Action */}
        <div className="bg-white border border-[#DCDAD4] rounded-2xl p-4 shadow-xs flex items-center justify-between">
          <div>
            <h1 className="font-serif font-bold text-lg text-[#151713]">
              Colliery Personnel Management
            </h1>
            <p className="text-xs text-[#666861] mt-0.5">
              Enrollment & statutory underground clearance
            </p>
          </div>

          <button
            onClick={() => setEnrollModalOpen(true)}
            className="px-3 py-2 rounded-xl bg-[#176B4D] text-white text-xs font-mono font-bold flex items-center space-x-1.5 shadow-2xs active:bg-[#13563D]"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Enroll Miner</span>
          </button>
        </div>

        {/* Search and Filters */}
        <div className="space-y-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-[#666861] absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by miner name or ID..."
              className="w-full bg-white border border-[#DCDAD4] rounded-xl pl-8 pr-3 py-1.5 text-xs font-mono focus:outline-none focus:border-[#176B4D]"
            />
          </div>

          <div className="flex items-center space-x-1 overflow-x-auto pb-1 text-xs">
            {['all', 'zone-a', 'zone-b', 'zone-c', 'zone-d'].map((z) => (
              <button
                key={z}
                onClick={() => setSelectedZone(z)}
                className={`px-2.5 py-1 rounded-xl font-mono text-[11px] font-bold shrink-0 transition-all ${
                  selectedZone === z
                    ? 'bg-[#176B4D] text-white shadow-2xs'
                    : 'bg-white border border-[#DCDAD4] text-[#666861]'
                }`}
              >
                {z === 'all' ? 'All Zones' : z.replace('zone-', 'Zone ').toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Worker Cards List */}
        <div className="space-y-2">
          {filteredWorkers.map((w) => (
            <div
              key={w.id}
              onClick={() => setSelectedWorkerId(w.id)}
              className="p-3.5 rounded-2xl bg-white border border-[#DCDAD4] shadow-xs space-y-2"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-bold text-sm text-[#151713]">{w.name}</div>
                  <div className="text-xs text-[#666861] font-mono mt-0.5">
                    {w.id} • {w.role}
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

              <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-[#ECEBE6] font-mono text-[#666861]">
                <div className="flex items-center space-x-1">
                  <MapPin className="w-3 h-3 text-[#176B4D]" />
                  <span>{w.zoneId.replace('zone-', 'Zone ').toUpperCase()}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="w-3 h-3 text-[#666861]" />
                  <span>Shift A (06:00 - 14:00)</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Radio className="w-3 h-3 text-[#B47A18]" />
                  <span>RFID: Tag-OK</span>
                </div>
                <div className="flex items-center space-x-1">
                  <ShieldCheck className="w-3 h-3 text-[#2D8A61]" />
                  <span>DGMS Level-1 Pass</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ===================================================================== */}
        {/* MULTI-STEP WORKER ENROLLMENT MODAL (MOBILE OPTIMIZED) */}
        {/* ===================================================================== */}
        {enrollModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/50 backdrop-blur-xs animate-in fade-in">
            <div className="bg-white rounded-2xl border border-[#DCDAD4] p-4 max-w-sm w-full shadow-2xl space-y-3 max-h-[92vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-[#ECEBE6] pb-2">
                <div>
                  <h3 className="font-serif font-bold text-sm text-[#151713]">
                    Enroll Underground Miner
                  </h3>
                  <div className="text-[10px] font-mono text-[#176B4D] font-bold">
                    STEP {enrollStep} OF 5
                  </div>
                </div>

                <button
                  onClick={() => setEnrollModalOpen(false)}
                  className="p-1 rounded text-[#666861]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Step 1: Personal Info */}
              {enrollStep === 1 && (
                <div className="space-y-2.5 text-xs">
                  <div className="font-bold text-xs text-[#151713]">
                    1. Worker Information
                  </div>
                  <div>
                    <label className="text-[10.5px] font-mono text-[#666861]">Full Name *</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Anand Murmu"
                      className="w-full bg-[#FAF9F6] border border-[#DCDAD4] rounded-xl px-3 py-2 text-xs font-sans mt-0.5 focus:outline-none focus:border-[#176B4D]"
                    />
                  </div>
                  <div>
                    <label className="text-[10.5px] font-mono text-[#666861]">Contact Number</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+91 98321 00000"
                      className="w-full bg-[#FAF9F6] border border-[#DCDAD4] rounded-xl px-3 py-2 text-xs font-sans mt-0.5 focus:outline-none focus:border-[#176B4D]"
                    />
                  </div>
                </div>
              )}

              {/* Step 2: Role, Zone & Shift */}
              {enrollStep === 2 && (
                <div className="space-y-2.5 text-xs">
                  <div className="font-bold text-xs text-[#151713]">
                    2. Role & Subterranean Assignment
                  </div>
                  <div>
                    <label className="text-[10.5px] font-mono text-[#666861]">Designation / Role</label>
                    <select
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      className="w-full bg-[#FAF9F6] border border-[#DCDAD4] rounded-xl px-3 py-2 text-xs font-sans mt-0.5"
                    >
                      <option>Continuous Haulage Driver</option>
                      <option>Coal Cutting Machine Operator</option>
                      <option>Roof Bolting Specialist</option>
                      <option>Ventilation & Gas Inspector</option>
                      <option>Conveyor Technician</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10.5px] font-mono text-[#666861]">Assigned Zone</label>
                    <select
                      value={formData.zone}
                      onChange={(e) => setFormData({ ...formData, zone: e.target.value })}
                      className="w-full bg-[#FAF9F6] border border-[#DCDAD4] rounded-xl px-3 py-2 text-xs font-sans mt-0.5"
                    >
                      <option value="zone-a">Zone A — Upper Haulage Drift (-120m)</option>
                      <option value="zone-b">Zone B — Conveyor Drift & Bolting (-260m)</option>
                      <option value="zone-c">Zone C — Deep Extraction Face (-440m)</option>
                      <option value="zone-d">Zone D — Ventilation Substation (-520m)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10.5px] font-mono text-[#666861]">Shift Timing</label>
                    <select
                      value={formData.shift}
                      onChange={(e) => setFormData({ ...formData, shift: e.target.value })}
                      className="w-full bg-[#FAF9F6] border border-[#DCDAD4] rounded-xl px-3 py-2 text-xs font-sans mt-0.5"
                    >
                      <option>Shift A (06:00 - 14:00)</option>
                      <option>Shift B (14:00 - 22:00)</option>
                      <option>Shift C (22:00 - 06:00)</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Step 3: Equipment & Auto-generated ID */}
              {enrollStep === 3 && (
                <div className="space-y-2.5 text-xs">
                  <div className="font-bold text-xs text-[#151713]">
                    3. Identification & Transponder Tags
                  </div>
                  <div className="p-3 bg-[#FAF9F6] rounded-xl border border-[#ECEBE6] space-y-1.5 font-mono">
                    <div className="flex justify-between">
                      <span className="text-[#666861]">Generated Worker ID:</span>
                      <strong className="text-[#176B4D]">{formData.workerId}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#666861]">RFID UID:</span>
                      <strong className="text-[#151713]">{formData.rfid}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#666861]">Wearable Mesh Node:</span>
                      <strong className="text-[#2D8A61]">ESP32-MESH-AUTO</strong>
                    </div>
                  </div>
                  <p className="text-[10.5px] text-[#666861]">
                    Smart helmet transponder and wearable biometrics node will bind automatically upon first turnstile scan.
                  </p>
                </div>
              )}

              {/* Step 4: Facial Biometric Photo Capture */}
              {enrollStep === 4 && (
                <div className="space-y-2.5 text-xs text-center">
                  <div className="font-bold text-xs text-[#151713] text-left">
                    4. Facial Recognition Enrollment
                  </div>

                  {cameraActive ? (
                    <div className="space-y-2">
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        className="w-48 h-48 rounded-2xl mx-auto object-cover border-2 border-[#176B4D]"
                      />
                      <button
                        type="button"
                        onClick={capturePhoto}
                        className="px-4 py-2 rounded-xl bg-[#176B4D] text-white font-bold text-xs shadow-xs"
                      >
                        Snap Photo
                      </button>
                    </div>
                  ) : formData.photoUrl ? (
                    <div className="space-y-2">
                      <img
                        src={formData.photoUrl}
                        alt="Biometric Capture"
                        className="w-32 h-32 rounded-2xl mx-auto object-cover border-2 border-[#2D8A61] shadow-xs"
                      />
                      <div className="text-[11px] font-mono text-[#2D8A61] font-bold">
                        ✓ Facial Biometrics Enrolled
                      </div>
                      <button
                        type="button"
                        onClick={startCamera}
                        className="text-xs text-[#176B4D] underline"
                      >
                        Retake Snapshot
                      </button>
                    </div>
                  ) : (
                    <div className="p-4 rounded-2xl border-2 border-dashed border-[#DCDAD4] space-y-2">
                      <Camera className="w-8 h-8 text-[#666861] mx-auto" />
                      <div className="text-[11px] text-[#666861]">
                        Capture miner face for turnstile AI camera verification.
                      </div>
                      <button
                        type="button"
                        onClick={startCamera}
                        className="px-4 py-2 rounded-xl bg-[#176B4D] text-white font-bold text-xs shadow-xs"
                      >
                        Open Camera
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Step 5: Review & Enroll */}
              {enrollStep === 5 && (
                <div className="space-y-2.5 text-xs">
                  <div className="font-bold text-xs text-[#151713]">
                    5. Review & Authorize Clearance
                  </div>
                  <div className="p-3 bg-[#FAF9F6] rounded-xl border border-[#ECEBE6] space-y-1 font-mono text-[11px]">
                    <div>Name: <strong>{formData.name || 'Anand Murmu'}</strong></div>
                    <div>ID: <strong className="text-[#176B4D]">{formData.workerId}</strong></div>
                    <div>Role: <strong>{formData.role}</strong></div>
                    <div>Zone: <strong>{formData.zone.toUpperCase()}</strong></div>
                    <div>Shift: <strong>{formData.shift}</strong></div>
                    <div>DGMS Clearance: <strong className="text-[#2D8A61]">LEVEL 1 APPROVED</strong></div>
                  </div>
                </div>
              )}

              {/* Modal Step Navigation Footer */}
              <div className="flex items-center justify-between pt-2 border-t border-[#ECEBE6]">
                {enrollStep > 1 ? (
                  <button
                    type="button"
                    onClick={() => setEnrollStep(enrollStep - 1)}
                    className="px-3 py-1.5 rounded-xl border border-[#DCDAD4] text-xs font-semibold text-[#666861] flex items-center space-x-1"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    <span>Back</span>
                  </button>
                ) : (
                  <div />
                )}

                {enrollStep < 5 ? (
                  <button
                    type="button"
                    onClick={() => {
                      if (enrollStep === 1 && !formData.name.trim()) {
                        setFormData({ ...formData, name: 'Anand Murmu' });
                      }
                      setEnrollStep(enrollStep + 1);
                    }}
                    className="px-4 py-1.5 rounded-xl bg-[#176B4D] text-white text-xs font-bold flex items-center space-x-1 shadow-xs"
                  >
                    <span>Next</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleEnrollSubmit}
                    className="px-4 py-1.5 rounded-xl bg-[#2D8A61] text-white text-xs font-bold shadow-xs active:bg-[#236C4C]"
                  >
                    Confirm & Enroll
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </MobileLayout>
  );
};
