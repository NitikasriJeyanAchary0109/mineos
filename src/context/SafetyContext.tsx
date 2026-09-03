import React, { createContext, useContext, useState, useMemo, useCallback, useEffect } from 'react';
import {
  Worker,
  Zone,
  SafetyAlert,
  PpePart,
  PpeStatus,
  EnvironmentTelemetry,
  BackendConnection,
} from '../types/safety';
import { INITIAL_WORKERS, INITIAL_ZONES, INITIAL_ALERTS } from '../data/mockData';
import { useLiveWorkerData } from '../hooks/useLiveWorkerData';
import { useAuth } from './AuthContext';
import { BACKEND_API_URL } from '../lib/supabase';
import { sirenAudio } from '../utils/sirenAudio';

interface SafetyContextType {
  workers: Worker[];
  selectedWorkerId: string;
  selectedWorker: Worker;
  activeWorker: Worker;
  zones: Zone[];
  alerts: SafetyAlert[];
  viewMode: 'mobile' | 'desktop';
  activeAlert: SafetyAlert | null;
  activeEmergency: SafetyAlert | null;
  backendConnection: BackendConnection;
  environmentByZone: Record<string, EnvironmentTelemetry>;
  selectedZoneTelemetry: EnvironmentTelemetry;
  dismissEmergency: () => void;
  setViewMode: (mode: 'mobile' | 'desktop') => void;
  setSelectedWorkerId: (id: string) => void;
  togglePpePart: (part: PpePart) => void;
  setPpeStatus: (status: Partial<PpeStatus>) => void;
  acknowledgeAlert: (alertId: string) => void;
  triggerSimulatedFallAlert: () => void;
  triggerSimulatedGasAlert: () => void;
  triggerSos: () => void;
  resolveActiveEmergency: (targetAlertId?: string) => void;
  hasCriticalHazard: boolean;
  primaryCriticalHazard: {
    id: string;
    title: string;
    workerName: string;
    workerId: string;
    zoneId: string;
    zoneName: string;
    type: string;
    timestamp: string;
    description: string;
  } | null;
  isAlarmSilenced: boolean;
  silenceAlarm: () => void;
  resumeAlarm: () => void;
  stats: {
    underground: number;
    safe: number;
    attention: number;
    critical: number;
    ppeViolations: number;
  };
}

const SafetyContext = createContext<SafetyContextType | undefined>(undefined);

export const SafetyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [workers, setWorkers] = useState<Worker[]>(INITIAL_WORKERS);
  const [zones] = useState<Zone[]>(INITIAL_ZONES);
  const [alerts, setAlerts] = useState<SafetyAlert[]>(INITIAL_ALERTS);
  const [selectedWorkerId, setSelectedWorkerId] = useState<string>('WM-8492');
  const [activeWorkerId] = useState<string>('WM-8492');
  const [viewMode, setViewMode] = useState<'mobile' | 'desktop'>('mobile');

  // Wearable live stream handler
  const handleWearableUpdate = useCallback((data: any) => {
    if (!data?.worker_id) return;
    setWorkers((prev) =>
      prev.map((w) => {
        if (w.id === data.worker_id) {
          const hr = Number(data.heart_rate) || w.vitals.heartRate;
          const spo2 = Number(data.spo2) || w.vitals.spo2;
          const fallDetected = Boolean(data.mpu6050?.fall_detected || data.fall_detected);
          const hrStatus =
            hr > 135 || hr < 45 ? 'critical' : hr > 100 ? 'elevated' : 'normal';
          const movement = fallDetected ? 'fall' : w.vitals.movement;
          const isCritical = fallDetected || Boolean(data.sos_triggered) || hrStatus === 'critical';

          return {
            ...w,
            status: isCritical ? 'critical' : w.status === 'critical' ? 'safe' : w.status,
            vitals: {
              ...w.vitals,
              heartRate: hr,
              heartRateStatus: hrStatus,
              spo2,
              movement: isCritical ? movement : movement === 'fall' ? 'active' : movement,
              lastUpdate: 'Just now',
            },
          };
        }
        return w;
      })
    );
  }, []);

  // Environment live stream handler
  const handleEnvironmentUpdate = useCallback((data: EnvironmentTelemetry) => {
    // Sync zone status if hazardous
    // e.g. methane spike or flame
  }, []);

  // Live Alert incoming handler
  const handleAlertTriggered = useCallback((newAlert: SafetyAlert) => {
    setAlerts((prev) => {
      // Avoid duplicate alert IDs
      if (prev.some((a) => a.id === newAlert.id)) return prev;
      return [newAlert, ...prev];
    });

    if (newAlert.workerId) {
      setSelectedWorkerId(newAlert.workerId);
      setWorkers((prev) =>
        prev.map((w) =>
          w.id === newAlert.workerId
            ? {
                ...w,
                status:
                  newAlert.severity === 'critical'
                    ? 'critical'
                    : w.status === 'critical'
                    ? 'critical'
                    : 'attention',
              }
            : w
        )
      );
    }
  }, []);

  // Jetson PPE scan incoming handler
  const handlePpeUpdate = useCallback((data: any) => {
    if (!data?.worker_id) return;
    setWorkers((prev) =>
      prev.map((w) => {
        if (w.id === data.worker_id) {
          const newPpe = {
            helmet: Boolean(data.helmet),
            vest: Boolean(data.vest),
            boots: w.ppeStatus.boots, // keep boots or update
            gloves: Boolean(data.gloves),
          };
          const allGood = Object.values(newPpe).every(Boolean);
          return {
            ...w,
            ppeStatus: newPpe,
            status: allGood ? (w.vitals.movement === 'fall' ? 'critical' : 'safe') : 'attention',
          };
        }
        return w;
      })
    );
  }, []);

  // Wire Supabase Realtime + Express polling hook
  const {
    connection: backendConnection,
    environmentByZone,
    activeEmergency,
    dismissEmergency,
    triggerEmergency,
  } = useLiveWorkerData(
    handleWearableUpdate,
    handleEnvironmentUpdate,
    handleAlertTriggered,
    handlePpeUpdate
  );

  const { role, assignedZone, assignedShift, workerId } = useAuth();

  // Scope workers list based on RBAC role:
  // - shift_incharge: filtered to assignedShift (Shift A) across ALL subterranean zones (zone is NOT fixed)
  // - mine_worker: filtered to self workerId only (e.g. W001)
  // - mine_manager / safety_officer: all underground personnel across all shifts
  const visibleWorkers = useMemo(() => {
    if (role === 'shift_incharge') {
      const shiftFilter = assignedShift || 'Shift A';
      return workers.filter((w) => {
        if (!w.shift) return true;
        return (
          w.shift.toLowerCase().includes(shiftFilter.toLowerCase()) ||
          shiftFilter.toLowerCase().includes(w.shift.toLowerCase())
        );
      });
    }
    if (role === 'mine_worker' && workerId) {
      const match = workers.filter((w) => w.id === workerId);
      return match.length > 0 ? match : workers.slice(0, 1);
    }
    return workers;
  }, [workers, role, assignedShift, workerId]);

  const selectedWorker = useMemo(() => {
    return visibleWorkers.find((w) => w.id === selectedWorkerId) || visibleWorkers[0] || workers[0];
  }, [visibleWorkers, selectedWorkerId, workers]);

  const activeWorker = useMemo(() => {
    if (role === 'mine_worker' && workerId) {
      return workers.find((w) => w.id === workerId) || workers[0];
    }
    return visibleWorkers.find((w) => w.id === activeWorkerId) || visibleWorkers[0] || workers[0];
  }, [visibleWorkers, activeWorkerId, workers, role, workerId]);

  const selectedZoneTelemetry = useMemo(() => {
    const zoneKey = selectedWorker.zoneId || 'zone-c';
    return (
      environmentByZone[zoneKey] || {
        zone_id: zoneKey,
        mq2: 50,
        mq4: 150,
        mq7: 20,
        mq9: 35,
        mq135: 65,
        temperature: 28,
        flame_detected: false,
        timestamp: new Date().toISOString(),
      }
    );
  }, [environmentByZone, selectedWorker.zoneId]);

  const activeAlert = useMemo(() => {
    return alerts.find((a) => !a.acknowledged && a.severity === 'critical') || null;
  }, [alerts]);

  const primaryCriticalWorker = useMemo(() => {
    return workers.find((w) => w.status === 'critical') || null;
  }, [workers]);

  const hasCriticalHazard = Boolean(
    activeEmergency || primaryCriticalWorker || activeAlert
  );

  const primaryCriticalHazard = useMemo(() => {
    if (!hasCriticalHazard) return null;

    if (activeEmergency) {
      return {
        id: activeEmergency.id,
        title: activeEmergency.title || 'EMERGENCY SOS BROADCAST',
        workerName: activeEmergency.workerName || 'Sunil Marandi',
        workerId: activeEmergency.workerId || 'WM-6288',
        zoneId: activeEmergency.zoneId || 'zone-c',
        zoneName: activeEmergency.zoneName || 'Zone C — Deep Longwall Extraction Face',
        type: activeEmergency.type || 'sos',
        timestamp: activeEmergency.timestamp || 'Just now',
        description: activeEmergency.description || 'Emergency distress call triggered.',
      };
    }

    if (primaryCriticalWorker) {
      const zone = zones.find((z) => z.id === primaryCriticalWorker.zoneId);
      const isFall = primaryCriticalWorker.vitals?.movement === 'fall';
      const isPpeViolation = !(
        primaryCriticalWorker.ppeStatus?.helmet &&
        primaryCriticalWorker.ppeStatus?.vest &&
        primaryCriticalWorker.ppeStatus?.gloves &&
        primaryCriticalWorker.ppeStatus?.boots
      );

      const title = isFall
        ? 'FALL DETECTED'
        : isPpeViolation
        ? 'PPE SAFETY VIOLATION'
        : 'CRITICAL HAZARD DETECTED';

      return {
        id: `CRIT-${primaryCriticalWorker.id}`,
        title,
        workerName: primaryCriticalWorker.name,
        workerId: primaryCriticalWorker.id,
        zoneId: primaryCriticalWorker.zoneId,
        zoneName: zone?.name || 'Zone C — Deep Longwall Extraction Face',
        type: isFall ? 'fall' : isPpeViolation ? 'ppe' : 'distress',
        timestamp: primaryCriticalWorker.vitals?.lastUpdate || 'Just now',
        description: isFall
          ? '6-Axis IMU sensor detected high-g impact deceleration followed by zero movement.'
          : isPpeViolation
          ? 'Mandatory PPE gear missing in active extraction hazardous zone.'
          : 'Worker vitals critical — immediate operator intervention required.',
      };
    }

    if (activeAlert) {
      return {
        id: activeAlert.id,
        title: activeAlert.title || 'CRITICAL SAFETY HAZARD',
        workerName: activeAlert.workerName || 'Sunil Marandi',
        workerId: activeAlert.workerId || 'WM-6288',
        zoneId: activeAlert.zoneId || 'zone-c',
        zoneName: activeAlert.zoneName || 'Zone C — Deep Longwall Extraction Face',
        type: activeAlert.type || 'hazard',
        timestamp: activeAlert.timestamp || 'Just now',
        description: activeAlert.description || 'Subterranean safety threshold breach detected.',
      };
    }

    return null;
  }, [hasCriticalHazard, activeEmergency, primaryCriticalWorker, activeAlert, zones]);

  // Audio state control (alarm silencing for audio only, visual hazard remains ACTIVE)
  const [isAlarmSilenced, setIsAlarmSilenced] = useState(sirenAudio.getIsSilenced());

  useEffect(() => {
    const handler = (e: any) => {
      setIsAlarmSilenced(Boolean(e.detail?.isSilenced));
    };
    window.addEventListener('msafe_siren_state_change', handler);
    return () => window.removeEventListener('msafe_siren_state_change', handler);
  }, []);

  // Persistent siren loop: continues until critical incident is explicitly resolved
  useEffect(() => {
    if (hasCriticalHazard) {
      sirenAudio.start();
    } else {
      sirenAudio.stop();
    }
  }, [hasCriticalHazard]);

  const silenceAlarm = useCallback(() => {
    sirenAudio.silence();
  }, []);

  const resumeAlarm = useCallback(() => {
    sirenAudio.resume();
  }, []);

  const stats = useMemo(() => {
    const underground = visibleWorkers.length;
    const safe = visibleWorkers.filter((w) => w.status === 'safe').length;
    const attention = visibleWorkers.filter((w) => w.status === 'attention').length;
    const critical = visibleWorkers.filter((w) => w.status === 'critical').length;
    const ppeViolations = visibleWorkers.filter(
      (w) => !(w.ppeStatus.helmet && w.ppeStatus.vest && w.ppeStatus.boots && w.ppeStatus.gloves)
    ).length;

    return { underground, safe, attention, critical, ppeViolations };
  }, [visibleWorkers]);

  const togglePpePart = (part: PpePart) => {
    setWorkers((prev) =>
      prev.map((w) => {
        if (w.id === activeWorkerId || w.id === selectedWorkerId) {
          const updatedPpe = {
            ...w.ppeStatus,
            [part]: !w.ppeStatus[part],
          };
          const allGood = Object.values(updatedPpe).every(Boolean);
          return {
            ...w,
            ppeStatus: updatedPpe,
            status: allGood ? (w.vitals.movement === 'fall' ? 'critical' : 'safe') : 'attention',
          };
        }
        return w;
      })
    );
  };

  const setPpeStatus = (status: Partial<PpeStatus>) => {
    setWorkers((prev) =>
      prev.map((w) => {
        if (w.id === activeWorkerId || w.id === selectedWorkerId) {
          const updatedPpe = {
            ...w.ppeStatus,
            ...status,
          };
          const allGood = Object.values(updatedPpe).every(Boolean);
          return {
            ...w,
            ppeStatus: updatedPpe,
            status: allGood ? (w.vitals.movement === 'fall' ? 'critical' : 'safe') : 'attention',
          };
        }
        return w;
      })
    );
  };

  const acknowledgeAlert = (alertId: string) => {
    setAlerts((prev) => {
      const target = prev.find((a) => a.id === alertId);
      const isCritical = target?.severity === 'critical';
      const targetWorkerId = target?.workerId;

      if (isCritical || targetWorkerId) {
        setWorkers((wPrev) =>
          wPrev.map((w) =>
            w.id === targetWorkerId || (isCritical && w.status === 'critical')
              ? {
                  ...w,
                  status: 'safe',
                  vitals: {
                    ...w.vitals,
                    movement: 'active',
                    heartRate: 76,
                    heartRateStatus: 'normal',
                    lastUpdate: 'Just now',
                  },
                }
              : w
          )
        );

        if (isCritical) {
          dismissEmergency();
          fetch(`${BACKEND_API_URL}/api/sos/resolve`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ worker_id: targetWorkerId, resolved_by: 'Control Room Operator' }),
          }).catch((err) => console.warn('Alert resolve backend sync:', err));
        }
      }

      return prev.map((a) => (a.id === alertId ? { ...a, acknowledged: true } : a));
    });
  };

  const triggerSimulatedFallAlert = () => {
    const fallAlert: SafetyAlert = {
      id: `ALT-${Date.now().toString().slice(-4)}`,
      workerId: 'WM-6288',
      workerName: 'Sunil Marandi',
      zoneId: 'zone-c',
      zoneName: 'Zone C — Deep Extraction Face',
      type: 'fall',
      severity: 'critical',
      title: '🚨 EMERGENCY: FALL / IMPACT DETECTED',
      description: 'Wearable ESP32 IMU sensor triggered high-impact deceleration followed by zero orientation.',
      timestamp: 'Just now',
      acknowledged: false,
      coordinates: [13.2, -4.0, 8.8],
    };

    setAlerts((prev) => [fallAlert, ...prev]);
    setWorkers((prev) =>
      prev.map((w) =>
        w.id === 'WM-6288'
          ? {
              ...w,
              status: 'critical',
              vitals: {
                ...w.vitals,
                movement: 'fall',
                heartRate: 124,
                heartRateStatus: 'critical',
                lastUpdate: 'Just now',
              },
            }
          : w
      )
    );
    setSelectedWorkerId('WM-6288');
  };

  const triggerSimulatedGasAlert = () => {
    const gasAlert: SafetyAlert = {
      id: `ALT-${Date.now().toString().slice(-4)}`,
      zoneId: 'zone-c',
      zoneName: 'Zone C — Deep Extraction Face',
      type: 'gas',
      severity: 'warning',
      title: '⚠️ ELEVATED CO / METHANE SENSOR SPIKE',
      description: 'Secondary return drift sensor flagged gas presence above baseline. Forced ventilation active.',
      timestamp: 'Just now',
      acknowledged: false,
    };
    setAlerts((prev) => [gasAlert, ...prev]);
  };

  const triggerSos = () => {
    const sosAlert: SafetyAlert = {
      id: `SOS-${Date.now().toString().slice(-4)}`,
      workerId: activeWorker.id,
      workerName: activeWorker.name,
      zoneId: activeWorker.zoneId,
      zoneName: 'Zone C — Deep Extraction Face',
      type: 'sos',
      severity: 'critical',
      title: `🚨 EMERGENCY SOS BROADCAST: ${activeWorker.name.toUpperCase()}`,
      description: `Worker manually triggered emergency SOS button from wearable/mobile. Current Zone: ${activeWorker.zoneId.toUpperCase()}.`,
      timestamp: 'Just now',
      acknowledged: false,
    };

    triggerEmergency(sosAlert);
    setAlerts((prev) => [sosAlert, ...prev]);
    setWorkers((prev) =>
      prev.map((w) =>
        w.id === activeWorker.id
          ? {
              ...w,
              status: 'critical',
              vitals: {
                ...w.vitals,
                heartRate: 128,
                heartRateStatus: 'elevated',
                lastUpdate: 'Just now',
              },
            }
          : w
      )
    );

    // Broadcast and push to backend
    fetch(`${BACKEND_API_URL}/api/sos/trigger`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        worker_id: activeWorker.id,
        worker_name: activeWorker.name,
        zone_id: activeWorker.zoneId,
      }),
    }).catch((err) => console.warn('SOS trigger backend error:', err));
  };

  const resolveActiveEmergency = (targetAlertId?: string) => {
    dismissEmergency();
    setAlerts((prev) =>
      prev.map((a) => {
        if (targetAlertId) {
          return a.id === targetAlertId || a.severity === 'critical' ? { ...a, acknowledged: true } : a;
        }
        return a.severity === 'critical' ? { ...a, acknowledged: true } : a;
      })
    );
    setWorkers((prev) =>
      prev.map((w) =>
        w.status === 'critical'
          ? {
              ...w,
              status: 'safe',
              vitals: {
                ...w.vitals,
                movement: 'active',
                heartRate: 76,
                heartRateStatus: 'normal',
                lastUpdate: 'Just now',
              },
            }
          : w
      )
    );

    // Broadcast resolve to backend
    fetch(`${BACKEND_API_URL}/api/sos/resolve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ worker_id: activeWorker.id, resolved_by: 'Control Room Operator' }),
    }).catch((err) => console.warn('SOS resolve backend error:', err));
  };

  return (
    <SafetyContext.Provider
      value={{
        workers: visibleWorkers,
        selectedWorkerId,
        selectedWorker,
        activeWorker,
        zones,
        alerts,
        viewMode,
        activeAlert,
        activeEmergency,
        backendConnection,
        environmentByZone,
        selectedZoneTelemetry,
        dismissEmergency,
        setViewMode,
        setSelectedWorkerId,
        togglePpePart,
        setPpeStatus,
        acknowledgeAlert,
        triggerSimulatedFallAlert,
        triggerSimulatedGasAlert,
        triggerSos,
        resolveActiveEmergency,
        hasCriticalHazard,
        primaryCriticalHazard,
        isAlarmSilenced,
        silenceAlarm,
        resumeAlarm,
        stats,
      }}
    >
      {children}
    </SafetyContext.Provider>
  );
};

export const useSafety = () => {
  const context = useContext(SafetyContext);
  if (!context) {
    throw new Error('useSafety must be used within a SafetyProvider');
  }
  return context;
};
