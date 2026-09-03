import React, { useState, useEffect, useRef } from 'react';
import { ControlRoomLayout } from '../../components/controlroom/ControlRoomLayout';
import { useAuth } from '../../context/AuthContext';
import { useSafety } from '../../context/SafetyContext';
import { BACKEND_API_URL } from '../../lib/supabase';
import { IndustrialButton } from '../../components/shared/IndustrialButton';
import {
  Users,
  UserPlus,
  Shield,
  Search,
  Filter,
  Camera,
  Upload,
  CheckCircle2,
  XCircle,
  QrCode,
  Printer,
  X,
  AlertTriangle,
  RefreshCw,
  Key,
  BadgeAlert,
  Phone,
  Radio,
  MapPin,
} from 'lucide-react';

interface NewWorkerForm {
  name: string;
  worker_id: string;
  rfid_tag: string;
  shift: string;
  assigned_zone: 'zone-a' | 'zone-b' | 'zone-c' | 'zone-d';
  contact_number: string;
  photo_url: string;
  helmet_device_id: string;
  wearable_device_id: string;
  role: 'mine_worker' | 'shift_incharge' | 'safety_officer';
  email: string;
  password?: string;
}

export const ManageWorkersPage: React.FC = () => {
  const { role, canCreateWorker, canManageOfficers } = useAuth();
  const { workers: contextWorkers } = useSafety();

  const [workersList, setWorkersList] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedZoneFilter, setSelectedZoneFilter] = useState<string>('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('all');
  const [loading, setLoading] = useState(false);

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [badgeModalWorker, setBadgeModalWorker] = useState<any | null>(null);

  // Form state
  const [form, setForm] = useState<NewWorkerForm>({
    name: '',
    worker_id: '',
    rfid_tag: '',
    shift: 'Shift A (06:00 - 14:00)',
    assigned_zone: 'zone-c',
    contact_number: '',
    photo_url: '',
    helmet_device_id: '',
    wearable_device_id: '',
    role: 'mine_worker',
    email: '',
    password: 'msafe-worker-2026',
  });

  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // Camera capture state
  const [isCameraActive, setIsCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Fetch workers from backend API
  const fetchWorkers = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BACKEND_API_URL}/api/workers`);
      if (res.ok) {
        const data = await res.json();
        setWorkersList(data.workers || []);
      } else {
        // Fallback to context workers
        setWorkersList(contextWorkers);
      }
    } catch (e) {
      setWorkersList(contextWorkers);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkers();
  }, []);

  const handleGenerateIds = () => {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const generatedId = `WM-${randomNum}`;
    const generatedRfid = `RFID-${generatedId}-4G`;

    setForm((prev) => ({
      ...prev,
      worker_id: generatedId,
      rfid_tag: generatedRfid,
      helmet_device_id: `HLM-${generatedId}`,
      wearable_device_id: `ESP32-${generatedId}`,
    }));
  };

  // Camera activation for face enrollment snapshot
  const startCamera = async () => {
    setIsCameraActive(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 300, height: 300 } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err) {
      console.warn('Camera access unavailable:', err);
      setIsCameraActive(false);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = 300;
      canvas.height = 300;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, 300, 300);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        setForm((prev) => ({ ...prev, photo_url: dataUrl }));
      }
      stopCamera();
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setForm((prev) => ({ ...prev, photo_url: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.assigned_zone) {
      setFormError('Please enter full name and assign a zone.');
      return;
    }

    setFormSubmitting(true);
    setFormError('');

    try {
      const workerId = form.worker_id || `WM-${Math.floor(1000 + Math.random() * 9000)}`;
      const payload = {
        ...form,
        worker_id: workerId,
        rfid_tag: form.rfid_tag || `RFID-${workerId}-4G`,
        helmet_device_id: form.helmet_device_id || `HLM-${workerId}`,
        wearable_device_id: form.wearable_device_id || `ESP32-${workerId}`,
      };

      const res = await fetch(`${BACKEND_API_URL}/api/workers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to create worker');
      }

      const result = await res.json();
      const createdWorker = result.worker;

      // Close create modal and open Digital Badge Preview
      setShowCreateModal(false);
      setBadgeModalWorker(createdWorker);
      fetchWorkers();

      // Reset form
      setForm({
        name: '',
        worker_id: '',
        rfid_tag: '',
        shift: 'Shift A (06:00 - 14:00)',
        assigned_zone: 'zone-c',
        contact_number: '',
        photo_url: '',
        helmet_device_id: '',
        wearable_device_id: '',
        role: 'mine_worker',
        email: '',
      });
    } catch (err: any) {
      setFormError(err.message || 'Error creating worker');
    } finally {
      setFormSubmitting(false);
    }
  };

  const toggleWorkerStatus = async (workerId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    try {
      await fetch(`${BACKEND_API_URL}/api/workers/${workerId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      fetchWorkers();
    } catch (err) {
      console.warn('Could not update status:', err);
    }
  };

  // Filtered workers
  const filteredWorkers = workersList.filter((w) => {
    const query = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !query ||
      (w.name || '').toLowerCase().includes(query) ||
      (w.worker_id || w.id || '').toLowerCase().includes(query) ||
      (w.role || '').toLowerCase().includes(query) ||
      (w.rfid_tag || w.rfid || '').toLowerCase().includes(query);

    const workerZone = (w.assigned_zone || w.zoneId || '').toLowerCase();
    const matchesZone =
      selectedZoneFilter === 'all' ||
      workerZone === selectedZoneFilter.toLowerCase() ||
      workerZone.includes(selectedZoneFilter.replace('zone-', '').toLowerCase());

    const workerStatus = (w.status || 'active').toLowerCase();
    const matchesStatus =
      selectedStatusFilter === 'all' ||
      workerStatus === selectedStatusFilter.toLowerCase() ||
      (selectedStatusFilter === 'active' && workerStatus !== 'inactive' && workerStatus !== 'on_leave');

    return matchesSearch && matchesZone && matchesStatus;
  });

  return (
    <ControlRoomLayout>
      <div className="space-y-5 text-[#151713] p-1 sm:p-2">
        {/* Top Header & Actions Bar */}
        <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-3 border-b border-[#ECEBE6] pb-4">
          <div>
            <h1 className="font-serif text-2xl sm:text-3xl text-[#151713] font-normal tracking-tight">
              Underground Worker Directory
            </h1>
            <p className="text-xs sm:text-sm text-[#666861] mt-0.5">
              Enrolled Personnel: <strong className="text-[#176B4D] font-mono">{workersList.length}</strong> • Active Authority: <span className="text-[#151713] font-semibold uppercase">{role.replace('_', ' ')}</span>
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={fetchWorkers}
              className="p-2.5 rounded-xl bg-white hover:bg-[#FAF9F6] border border-[#DCDAD4] text-[#666861] hover:text-[#151713] shadow-xs transition-colors"
              title="Refresh Directory"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#176B4D]' : ''}`} />
            </button>

            {canCreateWorker && (
              <button
                onClick={() => {
                  handleGenerateIds();
                  setShowCreateModal(true);
                }}
                className="px-4 py-2.5 rounded-xl bg-[#176B4D] hover:bg-[#13563D] text-white text-xs font-semibold flex items-center space-x-2 shadow-xs transition-colors"
              >
                <UserPlus className="w-4 h-4" />
                <span>Enroll New Personnel</span>
              </button>
            )}
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 bg-white border border-[#DCDAD4] p-3 rounded-2xl text-xs shadow-xs">
          <div className="sm:col-span-6 relative">
            <Search className="w-4 h-4 text-[#666861] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Name, Worker ID, or RFID tag..."
              className="w-full bg-[#FAF9F6] border border-[#ECEBE6] focus:border-[#176B4D] rounded-xl pl-9 pr-3 py-2 text-[#151713] font-mono focus:outline-none placeholder-[#8C8E87]"
            />
          </div>

          <div className="sm:col-span-3 flex items-center space-x-1">
            <Filter className="w-4 h-4 text-[#666861] shrink-0" />
            <select
              value={selectedZoneFilter}
              onChange={(e) => setSelectedZoneFilter(e.target.value)}
              className="w-full bg-[#FAF9F6] border border-[#ECEBE6] rounded-xl px-2.5 py-2 text-[#151713] focus:outline-none uppercase"
            >
              <option value="all">All Zones</option>
              <option value="zone-a">Zone A (Extraction)</option>
              <option value="zone-b">Zone B (Haulage)</option>
              <option value="zone-c">Zone C (Deep Face)</option>
              <option value="zone-d">Zone D (Ventilation)</option>
            </select>
          </div>

          <div className="sm:col-span-3">
            <select
              value={selectedStatusFilter}
              onChange={(e) => setSelectedStatusFilter(e.target.value)}
              className="w-full bg-[#FAF9F6] border border-[#ECEBE6] rounded-xl px-2.5 py-2 text-[#151713] focus:outline-none uppercase"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active Duty</option>
              <option value="inactive">Deactivated</option>
              <option value="on_leave">On Leave</option>
            </select>
          </div>
        </div>

        {/* Workers Table */}
        <div className="bg-white border border-[#DCDAD4] rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#FAF9F6] border-b border-[#ECEBE6] text-[11px] text-[#666861] uppercase tracking-wider font-semibold">
                  <th className="p-3.5">NAME / ID</th>
                  <th className="p-3.5">ROLE</th>
                  <th className="p-3.5">ASSIGNED ZONE</th>
                  <th className="p-3.5">WEARABLE HUB</th>
                  <th className="p-3.5">STATUS</th>
                  <th className="p-3.5 text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#ECEBE6]">
                {filteredWorkers.map((w) => {
                  const workerId = w.worker_id || w.id;
                  const rfid = w.rfid_tag || w.rfid;
                  const zone = w.assigned_zone || w.zoneId || 'zone-c';
                  const status = w.status || 'active';
                  const isActive = status === 'active';
                  const wearableHub = w.wearable_device_id || w.wearableId || 'ESP32-NODE-01';

                  return (
                    <tr key={workerId} className="hover:bg-[#FAF9F6]/60 transition-colors">
                      <td className="p-3.5">
                        <div className="flex items-center space-x-3">
                          <div className="w-9 h-9 rounded-xl bg-[#FAF9F6] border border-[#DCDAD4] flex items-center justify-center font-semibold text-xs text-[#176B4D] overflow-hidden shrink-0">
                            {w.photo_url ? (
                              <img src={w.photo_url} alt={w.name} className="w-full h-full object-cover" />
                            ) : (
                              <span>{w.name.charAt(0)}</span>
                            )}
                          </div>
                          <div>
                            <div className="font-semibold text-xs text-[#151713]">
                              {w.name}
                            </div>
                            <div className="text-[10px] text-[#666861] font-mono">
                              {workerId} • RFID: {rfid}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="p-3.5 font-medium text-[#151713]">
                        {w.role || 'Continuous Haulage Driver'}
                      </td>

                      <td className="p-3.5 uppercase">
                        <span className="flex items-center space-x-1 font-semibold text-[#151713]">
                          <MapPin className="w-3.5 h-3.5 text-[#176B4D]" />
                          <span>{zone.toUpperCase()}</span>
                        </span>
                      </td>

                      <td className="p-3.5 font-mono text-[#666861]">
                        {wearableHub}
                      </td>

                      <td className="p-3.5">
                        <span
                          className={`px-2.5 py-0.5 rounded-md text-[10px] font-semibold uppercase ${
                            isActive
                              ? 'bg-[#EAF3EF] text-[#2D8A61] border border-[#2D8A61]/30'
                              : 'bg-[#FDF2F2] text-[#A83D45] border border-[#A83D45]/30'
                          }`}
                        >
                          {isActive ? 'Active Duty' : 'Deactivated'}
                        </span>
                      </td>

                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => setBadgeModalWorker(w)}
                            title="Generate / Print RFID Digital Badge"
                            className="p-1.5 rounded-lg bg-white hover:bg-[#FAF9F6] border border-[#DCDAD4] text-[#176B4D] transition-colors"
                          >
                            <QrCode className="w-4 h-4" />
                          </button>

                          {canCreateWorker && (
                            <button
                              onClick={() => toggleWorkerStatus(workerId, status)}
                              title={isActive ? 'Deactivate Worker' : 'Activate Worker'}
                              className={`px-2.5 py-1 rounded-lg border text-xs font-semibold transition-colors ${
                                isActive
                                  ? 'bg-white hover:bg-[#FDF2F2] border-[#DCDAD4] text-[#A83D45]'
                                  : 'bg-white hover:bg-[#EAF3EF] border-[#DCDAD4] text-[#2D8A61]'
                              }`}
                            >
                              {isActive ? 'Deactivate' : 'Activate'}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* ===================================================================== */}
        {/* CREATE WORKER MODAL (MINE MANAGER & SAFETY OFFICER ONLY) */}
        {/* ===================================================================== */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-fade-in">
            <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col bg-white border border-[#DCDAD4] rounded-3xl shadow-2xl overflow-hidden text-[#151713]">
              {/* Pinned Modal Header */}
              <div className="flex items-center justify-between border-b border-[#ECEBE6] p-6 pb-4 shrink-0 bg-white">
                <div>
                  <h2 className="font-serif text-2xl font-semibold text-[#151713]">
                    Register New Underground Personnel
                  </h2>
                  <p className="text-xs text-[#666861] mt-0.5">
                    Formal statutory enrollment: biometric identity, zone authorization, and access credentials.
                  </p>
                </div>

                <button
                  onClick={() => {
                    stopCamera();
                    setShowCreateModal(false);
                  }}
                  className="text-[#666861] hover:text-[#151713] p-1.5 rounded-lg hover:bg-[#FAF9F6] transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {formError && (
                <div className="mx-6 mt-4 p-3 rounded-xl bg-[#FDF2F2] border border-[#A83D45]/40 text-[#A83D45] text-xs flex items-center space-x-2 shrink-0">
                  <AlertTriangle className="w-4 h-4 text-[#A83D45] shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Scrollable Form Body starting from 1. Personal Information */}
              <form onSubmit={handleCreateSubmit} className="flex-1 flex flex-col overflow-hidden text-xs">
                <div className="overflow-y-auto p-6 space-y-4 flex-1">
                  {/* 1. Personal Information */}
                  <div className="bg-[#FAF9F6] border border-[#ECEBE6] rounded-2xl p-4 space-y-3">
                    <div className="font-serif font-semibold text-sm text-[#151713]">
                      1. Personal Information
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[#666861] font-medium mb-1">
                          Worker Full Name *
                        </label>
                        <input
                          type="text"
                          value={form.name}
                          onChange={(e) => setForm({ ...form, name: e.target.value })}
                          placeholder="e.g. Ramesh Chandra"
                          required
                          className="w-full bg-white border border-[#DCDAD4] focus:border-[#176B4D] rounded-xl px-3 py-2 text-[#151713] font-sans focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[#666861] font-medium mb-1">
                          Contact Number (Optional)
                        </label>
                        <input
                          type="text"
                          value={form.contact_number}
                          onChange={(e) => setForm({ ...form, contact_number: e.target.value })}
                          placeholder="+91 98765 43210"
                          className="w-full bg-white border border-[#DCDAD4] focus:border-[#176B4D] rounded-xl px-3 py-2 text-[#151713] font-mono focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* 2. Identification */}
                  <div className="bg-[#FAF9F6] border border-[#ECEBE6] rounded-2xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-serif font-semibold text-sm text-[#151713]">
                        2. Identification
                      </span>
                      <button
                        type="button"
                        onClick={handleGenerateIds}
                        className="text-[11px] text-[#176B4D] hover:underline font-mono font-semibold"
                      >
                        Generate Unique ID
                      </button>
                    </div>
                    <div>
                      <label className="block text-[#666861] font-medium mb-1">Worker ID *</label>
                      <input
                        type="text"
                        value={form.worker_id}
                        onChange={(e) => setForm({ ...form, worker_id: e.target.value })}
                        placeholder="WM-XXXX (e.g. WM-6181)"
                        required
                        className="w-full bg-white border border-[#DCDAD4] focus:border-[#176B4D] rounded-xl px-3 py-2 text-[#176B4D] font-mono font-semibold focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* 3. Shift & Zone Assignment */}
                  <div className="bg-[#FAF9F6] border border-[#ECEBE6] rounded-2xl p-4 space-y-3">
                    <div className="font-serif font-semibold text-sm text-[#151713]">
                      3. Shift & Zone Assignment
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[#666861] font-medium mb-1">Assigned Subterranean Zone *</label>
                        <select
                          value={form.assigned_zone}
                          onChange={(e) => setForm({ ...form, assigned_zone: e.target.value as any })}
                          className="w-full bg-white border border-[#DCDAD4] rounded-xl px-3 py-2 text-[#151713] focus:outline-none uppercase"
                        >
                          <option value="zone-a">Zone A — Upper Haulage Drift</option>
                          <option value="zone-b">Zone B — Conveyor Drift & Bolting</option>
                          <option value="zone-c">Zone C — Deep Extraction Face</option>
                          <option value="zone-d">Zone D — Ventilation Substation</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[#666861] font-medium mb-1">Shift Timing *</label>
                        <select
                          value={form.shift}
                          onChange={(e) => setForm({ ...form, shift: e.target.value })}
                          className="w-full bg-white border border-[#DCDAD4] rounded-xl px-3 py-2 text-[#151713] focus:outline-none"
                        >
                          <option value="Shift A (06:00 - 14:00)">Shift A (06:00 - 14:00)</option>
                          <option value="Shift B (14:00 - 22:00)">Shift B (14:00 - 22:00)</option>
                          <option value="Shift C (22:00 - 06:00)">Shift C (22:00 - 06:00)</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* 4. Role & Credentials */}
                  <div className="bg-[#FAF9F6] border border-[#ECEBE6] rounded-2xl p-4 space-y-3">
                    <div className="font-serif font-semibold text-sm text-[#151713]">
                      4. Role & Credentials
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[#666861] font-medium mb-1">Job Role / Designation</label>
                        <select
                          value={form.role}
                          onChange={(e) => setForm({ ...form, role: e.target.value as any })}
                          className="w-full bg-white border border-[#DCDAD4] rounded-xl px-3 py-2 text-[#151713] focus:outline-none uppercase"
                        >
                          <option value="mine_worker">Mine Worker (Subterranean Face)</option>
                          {canManageOfficers && (
                            <>
                              <option value="shift_incharge">Shift In-Charge (Operational Shift Command)</option>
                              <option value="safety_officer">Safety Officer (Statutory)</option>
                            </>
                          )}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[#666861] font-medium mb-1">Safety Clearance Level</label>
                        <div className="w-full bg-white border border-[#DCDAD4] rounded-xl px-3 py-2 text-[#176B4D] font-mono font-medium">
                          DGMS Standard Level 1 (Underground)
                        </div>
                      </div>

                      <div>
                        <label className="block text-[#666861] font-medium mb-1">Portal Login Email</label>
                        <input
                          type="email"
                          value={form.email}
                          onChange={(e) => setForm({ ...form, email: e.target.value })}
                          placeholder="worker@msafe.mine"
                          className="w-full bg-white border border-[#DCDAD4] rounded-xl px-3 py-2 text-[#151713] font-mono focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[#666861] font-medium mb-1">Initial Access Password</label>
                        <input
                          type="text"
                          value={form.password}
                          onChange={(e) => setForm({ ...form, password: e.target.value })}
                          placeholder="msafe-worker-2026"
                          className="w-full bg-white border border-[#DCDAD4] rounded-xl px-3 py-2 text-[#151713] font-mono focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* 5. Facial Recognition & Biometric Profile */}
                  <div className="bg-[#FAF9F6] border border-[#ECEBE6] rounded-2xl p-4 space-y-3">
                    <div className="font-serif font-semibold text-sm text-[#151713]">
                      5. Facial Recognition & Biometric Profile
                    </div>
                    <div className="flex flex-col sm:flex-row items-center gap-4">
                      <div className="w-24 h-24 rounded-2xl bg-white border-2 border-dashed border-[#DCDAD4] overflow-hidden flex items-center justify-center shrink-0 relative shadow-xs">
                        {isCameraActive ? (
                          <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                        ) : form.photo_url ? (
                          <img src={form.photo_url} alt="Worker photo" className="w-full h-full object-cover" />
                        ) : (
                          <Camera className="w-6 h-6 text-[#8C8E87]" />
                        )}
                      </div>

                      <div className="space-y-2 w-full">
                        <div className="flex items-center space-x-2">
                          {!isCameraActive ? (
                            <button
                              type="button"
                              onClick={startCamera}
                              className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-[#FAF9F6] border border-[#DCDAD4] text-[#176B4D] font-medium text-xs flex items-center space-x-1.5 shadow-xs"
                            >
                              <Camera className="w-3.5 h-3.5 text-[#176B4D]" />
                              <span>Capture Webcam</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={capturePhoto}
                              className="px-3.5 py-1.5 rounded-xl bg-[#176B4D] hover:bg-[#13563D] text-white font-medium text-xs flex items-center space-x-1.5 shadow-xs"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Snap Photo</span>
                            </button>
                          )}

                          <label className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-[#FAF9F6] border border-[#DCDAD4] text-[#666861] font-medium text-xs flex items-center space-x-1.5 cursor-pointer shadow-xs">
                            <Upload className="w-3.5 h-3.5" />
                            <span>Upload File</span>
                            <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                          </label>
                        </div>
                        <p className="text-[11px] text-[#666861]">
                          Stored directly for edge 1:N facial verification at subterranean gate turnstiles.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Pinned Footer */}
                <div className="p-4 sm:px-6 border-t border-[#ECEBE6] bg-[#FAF9F6] shrink-0 flex items-center justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      stopCamera();
                      setShowCreateModal(false);
                    }}
                    className="px-4 py-2.5 rounded-xl bg-white hover:bg-[#FAF9F6] border border-[#DCDAD4] text-[#666861] font-semibold text-xs transition-colors"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={formSubmitting}
                    className="px-5 py-2.5 rounded-xl bg-[#176B4D] hover:bg-[#13563D] text-white font-semibold text-xs flex items-center space-x-2 shadow-xs transition-colors"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{formSubmitting ? 'Enrolling...' : 'Enroll Worker & Issue Credentials'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ===================================================================== */}
        {/* PRINTABLE DIGITAL RFID BADGE MODAL */}
        {/* ===================================================================== */}
        {badgeModalWorker && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
            <div className="relative w-full max-w-sm bg-white border border-[#DCDAD4] rounded-3xl shadow-2xl p-6 space-y-4 text-[#151713]">
              <div className="flex items-center justify-between border-b border-[#ECEBE6] pb-3">
                <div className="flex items-center space-x-2">
                  <Shield className="w-5 h-5 text-[#176B4D]" />
                  <span className="font-serif font-semibold text-base text-[#151713]">
                    Digital Security Pass
                  </span>
                </div>
                <button
                  onClick={() => setBadgeModalWorker(null)}
                  className="text-[#666861] hover:text-[#151713] p-1 rounded-lg hover:bg-[#FAF9F6] transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Clean Physical Card Layout */}
              <div className="bg-white border-2 border-[#DCDAD4] rounded-2xl p-5 shadow-xs relative overflow-hidden space-y-4 text-center">
                {/* Header Strip */}
                <div className="flex items-center justify-between border-b border-[#ECEBE6] pb-2.5">
                  <div className="text-left">
                    <div className="font-serif font-semibold text-xs text-[#151713] tracking-wide">
                      MINE OS • SUBTERRANEAN OPERATIONS
                    </div>
                    <div className="text-[10px] text-[#666861]">
                      Statutory DGMS Security Credential
                    </div>
                  </div>
                  <span className="text-[9px] font-mono font-bold bg-[#EAF3EF] text-[#176B4D] border border-[#176B4D]/20 px-1.5 py-0.5 rounded">
                    PASS
                  </span>
                </div>

                {/* Worker Portrait & Identity */}
                <div className="flex flex-col items-center space-y-2">
                  <div className="w-20 h-24 rounded-xl bg-[#FAF9F6] border border-[#DCDAD4] overflow-hidden flex items-center justify-center shadow-xs">
                    {badgeModalWorker.photo_url ? (
                      <img
                        src={badgeModalWorker.photo_url}
                        alt={badgeModalWorker.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="font-serif font-semibold text-2xl text-[#176B4D]">
                        {badgeModalWorker.name.charAt(0)}
                      </div>
                    )}
                  </div>

                  <div>
                    <h3 className="font-serif font-semibold text-lg text-[#151713]">
                      {badgeModalWorker.name}
                    </h3>
                    <div className="text-xs text-[#666861] font-medium mt-0.5">
                      {badgeModalWorker.role === 'mine_worker'
                        ? 'Mine Worker (Subterranean Face)'
                        : badgeModalWorker.role || 'Personnel'}
                    </div>
                    <div className="inline-block mt-1 font-mono text-xs font-semibold text-[#176B4D] bg-[#EAF3EF] border border-[#2D8A61]/30 px-2.5 py-0.5 rounded-md">
                      {badgeModalWorker.worker_id || badgeModalWorker.id}
                    </div>
                  </div>
                </div>

                {/* Card Parameters Grid */}
                <div className="grid grid-cols-2 gap-2 text-left text-xs bg-[#FAF9F6] p-3 rounded-xl border border-[#ECEBE6]">
                  <div>
                    <div className="text-[10px] text-[#666861]">Zone Assignment</div>
                    <div className="font-medium text-[#151713] uppercase truncate">
                      {(badgeModalWorker.assigned_zone || badgeModalWorker.zoneId || 'Zone C').toUpperCase()}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-[#666861]">Shift Timing</div>
                    <div className="font-medium text-[#151713] truncate">
                      {badgeModalWorker.shift ? badgeModalWorker.shift.split(' ')[0] + ' ' + badgeModalWorker.shift.split(' ')[1] : 'Shift A'}
                    </div>
                  </div>
                  <div className="col-span-2 pt-1 border-t border-[#ECEBE6] flex items-center justify-between">
                    <span className="text-[10px] text-[#666861]">Clearance Level</span>
                    <span className="font-mono text-[10px] text-[#151713] font-semibold">DGMS Level 1</span>
                  </div>
                  <div className="col-span-2 pt-1 border-t border-[#ECEBE6]">
                    <div className="text-[10px] text-[#666861]">RFID Card Serial</div>
                    <div className="font-mono text-[11px] text-[#176B4D] font-semibold truncate">
                      {badgeModalWorker.rfid_tag || badgeModalWorker.rfid || `RFID-${badgeModalWorker.worker_id || badgeModalWorker.id}-4G`}
                    </div>
                  </div>
                </div>

                {/* Footer Strip */}
                <div className="flex items-center justify-between pt-1 text-[10px] font-mono text-[#666861]">
                  <span>Gate Turnstile Synced</span>
                  <span className="text-[#2D8A61] font-semibold">AUTHORITY ACTIVE ✓</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-2 pt-1">
                <button
                  onClick={() => window.print()}
                  className="w-full py-2.5 rounded-xl bg-[#176B4D] hover:bg-[#13563D] text-white font-semibold text-xs flex items-center justify-center space-x-1.5 shadow-xs transition-colors"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Physical Badge</span>
                </button>

                <button
                  onClick={() => setBadgeModalWorker(null)}
                  className="px-4 py-2.5 rounded-xl bg-white hover:bg-[#FAF9F6] border border-[#DCDAD4] text-[#151713] font-semibold text-xs transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ControlRoomLayout>
  );
};
