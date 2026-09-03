import { useEffect, useState, useRef, useCallback } from 'react';
import { supabase, isSupabaseConfigured, BACKEND_API_URL } from '../lib/supabase';
import {
  Worker,
  SafetyAlert,
  EnvironmentTelemetry,
  BackendConnection,
} from '../types/safety';

interface UseLiveWorkerDataReturn {
  connection: BackendConnection;
  environmentByZone: Record<string, EnvironmentTelemetry>;
  latestAlerts: SafetyAlert[];
  activeEmergency: SafetyAlert | null;
  dismissEmergency: () => void;
  triggerEmergency: (alert: SafetyAlert) => void;
}

const DEFAULT_ENVIRONMENT: Record<string, EnvironmentTelemetry> = {
  'zone-a': {
    zone_id: 'zone-a',
    mq2: 45,
    mq4: 110,
    mq7: 15,
    mq9: 35,
    mq135: 60,
    temperature: 23.5,
    flame_detected: false,
    timestamp: new Date().toISOString(),
  },
  'zone-b': {
    zone_id: 'zone-b',
    mq2: 52,
    mq4: 135,
    mq7: 20,
    mq9: 42,
    mq135: 65,
    temperature: 26.8,
    flame_detected: false,
    timestamp: new Date().toISOString(),
  },
  'zone-c': {
    zone_id: 'zone-c',
    mq2: 78,
    mq4: 240,
    mq7: 32,
    mq9: 58,
    mq135: 85,
    temperature: 31.2,
    flame_detected: false,
    timestamp: new Date().toISOString(),
  },
  'zone-d': {
    zone_id: 'zone-d',
    mq2: 40,
    mq4: 95,
    mq7: 12,
    mq9: 30,
    mq135: 55,
    temperature: 28.4,
    flame_detected: false,
    timestamp: new Date().toISOString(),
  },
};

export function useLiveWorkerData(
  onWearableUpdate?: (data: any) => void,
  onEnvironmentUpdate?: (data: EnvironmentTelemetry) => void,
  onAlertTriggered?: (alert: SafetyAlert) => void,
  onPpeUpdate?: (data: any) => void
): UseLiveWorkerDataReturn {
  const [connection, setConnection] = useState<BackendConnection>({
    state: 'connecting',
    source: isSupabaseConfigured ? 'Supabase Realtime' : 'Express Ingestion API',
    latencyMs: 18,
    lastPing: 'Connecting...',
  });

  const [environmentByZone, setEnvironmentByZone] =
    useState<Record<string, EnvironmentTelemetry>>(DEFAULT_ENVIRONMENT);
  const [latestAlerts, setLatestAlerts] = useState<SafetyAlert[]>([]);
  const [activeEmergency, setActiveEmergency] = useState<SafetyAlert | null>(() => {
    try {
      const saved = localStorage.getItem('msafe_active_emergency');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return null;
  });

  const isMountedRef = useRef(true);

  const triggerEmergency = useCallback((alert: SafetyAlert) => {
    setActiveEmergency(alert);
    try {
      localStorage.setItem('msafe_active_emergency', JSON.stringify(alert));
      if (typeof BroadcastChannel !== 'undefined') {
        const bc = new BroadcastChannel('msafe_sos_channel');
        bc.postMessage({ type: 'SOS_TRIGGERED', alert });
        bc.close();
      }
    } catch (e) {}
  }, []);

  const dismissEmergency = useCallback(() => {
    setActiveEmergency(null);
    try {
      localStorage.removeItem('msafe_active_emergency');
      if (typeof BroadcastChannel !== 'undefined') {
        const bc = new BroadcastChannel('msafe_sos_channel');
        bc.postMessage({ type: 'SOS_RESOLVED' });
        bc.close();
      }
    } catch (e) {}
  }, []);

  // Listen to SOS broadcast channel across tabs & roles
  useEffect(() => {
    let bc: BroadcastChannel | null = null;
    if (typeof BroadcastChannel !== 'undefined') {
      bc = new BroadcastChannel('msafe_sos_channel');
      bc.onmessage = (event) => {
        if (event.data?.type === 'SOS_TRIGGERED') {
          setActiveEmergency(event.data.alert);
        } else if (event.data?.type === 'SOS_RESOLVED') {
          setActiveEmergency(null);
        }
      };
    }

    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'msafe_active_emergency') {
        if (e.newValue) {
          try {
            setActiveEmergency(JSON.parse(e.newValue));
          } catch (err) {}
        } else {
          setActiveEmergency(null);
        }
      }
    };
    window.addEventListener('storage', handleStorage);

    return () => {
      if (bc) bc.close();
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  // --------------------------------------------------------------------------
  // 1. SUPABASE REALTIME SUBSCRIPTION (When Cloud Credentials Configured)
  // --------------------------------------------------------------------------
  useEffect(() => {
    if (!supabase || !isSupabaseConfigured) return;

    const channel = supabase
      .channel('msafe-realtime-sub')
      // A. Wearable stream (Heart rate, SpO2, Fall, SOS)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'wearable_readings' },
        (payload) => {
          const row = payload.new as any;
          if (onWearableUpdate) onWearableUpdate(row);

          if (row.fall_detected || row.sos_triggered) {
            const emergency: SafetyAlert = {
              id: row.id || `EMG-${Date.now()}`,
              workerId: row.worker_id,
              workerName: row.worker_name,
              zoneId: 'zone-c',
              zoneName: 'Zone C — Deep Extraction Face',
              type: row.fall_detected ? 'fall' : 'sos',
              severity: 'critical',
              title: row.fall_detected
                ? '🚨 EMERGENCY: FALL / IMPACT DETECTED'
                : `🚨 EMERGENCY SOS BROADCAST: ${row.worker_name?.toUpperCase()}`,
              description: `Realtime trigger from ESP32 wearable (${row.worker_id}). HR: ${row.heart_rate} bpm, SpO2: ${row.spo2}%.`,
              timestamp: 'Just now',
              acknowledged: false,
            };
            setActiveEmergency(emergency);
            setLatestAlerts((prev) => [emergency, ...prev]);
            if (onAlertTriggered) onAlertTriggered(emergency);
          }
        }
      )
      // B. Environment stream (MQ Gas sensors)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'environment_readings' },
        (payload) => {
          const row = payload.new as any;
          const telemetry: EnvironmentTelemetry = {
            zone_id: row.zone_id,
            mq2: Number(row.mq2) || 0,
            mq4: Number(row.mq4) || 0,
            mq7: Number(row.mq7) || 0,
            mq9: Number(row.mq9) || 0,
            mq135: Number(row.mq135) || 0,
            temperature: Number(row.temperature) || 25,
            flame_detected: Boolean(row.flame_detected),
            timestamp: row.timestamp || new Date().toISOString(),
          };

          setEnvironmentByZone((prev) => ({
            ...prev,
            [row.zone_id]: telemetry,
          }));

          if (onEnvironmentUpdate) onEnvironmentUpdate(telemetry);
        }
      )
      // C. Alerts stream
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'alerts' },
        (payload) => {
          const row = payload.new as any;
          const alertItem: SafetyAlert = {
            id: row.id,
            workerId: row.worker_id,
            workerName: row.worker_name,
            zoneId: row.zone_id || 'zone-c',
            zoneName: row.zone_id ? row.zone_id.toUpperCase() : 'ZONE C',
            type: row.type || 'system',
            severity: row.severity || 'info',
            title: row.message || 'Safety Alert',
            description: row.message,
            timestamp: 'Just now',
            acknowledged: Boolean(row.resolved),
          };

          setLatestAlerts((prev) => [alertItem, ...prev]);
          if (alertItem.severity === 'critical') {
            setActiveEmergency(alertItem);
          }
          if (onAlertTriggered) onAlertTriggered(alertItem);
        }
      )
      // D. PPE Entry Log stream (Jetson AI)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'ppe_entry_logs' },
        (payload) => {
          const row = payload.new as any;
          if (onPpeUpdate) onPpeUpdate(row);
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setConnection({
            state: 'connected',
            source: 'Supabase Realtime (Cloud Postgres)',
            latencyMs: 14,
            lastPing: 'Synced Live',
          });
        } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
          setConnection((prev) => ({
            ...prev,
            state: 'disconnected',
            lastPing: 'Reconnecting...',
          }));
        }
      });

    return () => {
      if (supabase) {
        supabase.removeChannel(channel);
      }
    };
  }, [onWearableUpdate, onEnvironmentUpdate, onAlertTriggered, onPpeUpdate]);

  // --------------------------------------------------------------------------
  // 2. EXPRESS BACKEND LIVE POLLING FALLBACK / LOCAL SIMULATOR
  // --------------------------------------------------------------------------
  useEffect(() => {
    isMountedRef.current = true;

    const pollBackend = async () => {
      try {
        const start = performance.now();
        const res = await fetch(`${BACKEND_API_URL}/api/readings/latest`, {
          signal: AbortSignal.timeout(2000),
        });

        if (!isMountedRef.current) return;

        if (res.ok) {
          const latency = Math.round(performance.now() - start);
          const data = await res.json();

          setConnection({
            state: 'connected',
            source: data.cloud_connected
              ? 'Supabase Cloud (via Ingestion API)'
              : 'Express Ingestion API (Port 3001)',
            latencyMs: latency,
            lastPing: new Date().toLocaleTimeString(),
          });

          // Sync wearables
          if (data.wearables && onWearableUpdate) {
            Object.values(data.wearables).forEach((w: any) => {
              onWearableUpdate(w);
              if (w.mpu6050?.fall_detected || w.sos_triggered) {
                const emergency: SafetyAlert = {
                  id: `ALT-${w.worker_id}`,
                  workerId: w.worker_id,
                  workerName: w.worker_name,
                  zoneId: 'zone-c',
                  zoneName: 'Zone C — Deep Extraction Face',
                  type: w.mpu6050?.fall_detected ? 'fall' : 'sos',
                  severity: 'critical',
                  title: w.mpu6050?.fall_detected
                    ? '🚨 EMERGENCY: FALL / IMPACT DETECTED'
                    : `🚨 EMERGENCY SOS BROADCAST: ${w.worker_name?.toUpperCase()}`,
                  description: `Realtime trigger from ESP32 wearable (${w.worker_id}). Deceleration IMU trigger. HR: ${w.heart_rate} bpm.`,
                  timestamp: 'Just now',
                  acknowledged: false,
                };
                setActiveEmergency(emergency);
                if (onAlertTriggered) onAlertTriggered(emergency);
              }
            });
          }

          // Sync environment
          if (data.environment) {
            setEnvironmentByZone((prev) => ({
              ...prev,
              ...data.environment,
            }));
            if (onEnvironmentUpdate) {
              Object.values(data.environment).forEach((env: any) => {
                onEnvironmentUpdate(env);
              });
            }
          }

          // Sync PPE
          if (data.ppe_scans && onPpeUpdate) {
            Object.values(data.ppe_scans).forEach((p: any) => {
              onPpeUpdate(p);
            });
          }
        } else {
          setConnection((prev) => ({
            ...prev,
            state: isSupabaseConfigured ? prev.state : 'disconnected',
            lastPing: 'API Offline',
          }));
        }
      } catch (err) {
        if (!isMountedRef.current) return;
        setConnection((prev) => ({
          ...prev,
          state: isSupabaseConfigured ? prev.state : 'disconnected',
          lastPing: 'No response from localhost:3001',
        }));
      }
    };

    pollBackend();
    const interval = setInterval(pollBackend, 2500);

    return () => {
      isMountedRef.current = false;
      clearInterval(interval);
    };
  }, [onWearableUpdate, onEnvironmentUpdate, onAlertTriggered, onPpeUpdate]);

  return {
    connection,
    environmentByZone,
    latestAlerts,
    activeEmergency,
    dismissEmergency,
    triggerEmergency,
  };
}
