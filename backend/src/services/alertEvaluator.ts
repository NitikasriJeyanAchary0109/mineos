import {
  WearablePayload,
  EnvironmentPayload,
  HelmetStatusPayload,
  PpeScanPayload,
  AlertInsert,
} from '../types/ingestion';
import { supabase } from '../config/supabase';

// In-memory fallback for local simulation and dev query inspection
export const localAlertsStore: AlertInsert[] = [];

export async function evaluateAndInsertAlert(alert: AlertInsert): Promise<void> {
  // Always log locally
  localAlertsStore.unshift(alert);
  if (localAlertsStore.length > 50) localAlertsStore.pop();

  console.log(`🔔 [ALERT ${alert.severity.toUpperCase()}] ${alert.message}`);

  if (supabase) {
    try {
      const { error } = await supabase.from('alerts').insert([
        {
          worker_id: alert.worker_id || null,
          worker_name: alert.worker_name || null,
          zone_id: alert.zone_id || null,
          type: alert.type,
          severity: alert.severity,
          message: alert.message,
          timestamp: alert.timestamp,
          resolved: false,
        },
      ]);
      if (error) {
        console.error('❌ [Supabase] Error inserting alert:', error.message);
      }
    } catch (err) {
      console.error('❌ [Supabase] Exception inserting alert:', err);
    }
  }
}

export async function evaluateWearableAlerts(data: WearablePayload): Promise<void> {
  const timestamp = data.timestamp || new Date().toISOString();

  // 1. Fall Detection
  if (data.mpu6050?.fall_detected) {
    await evaluateAndInsertAlert({
      worker_id: data.worker_id,
      worker_name: data.worker_name,
      type: 'fall',
      severity: 'critical',
      message: `🚨 EMERGENCY: FALL / IMPACT DETECTED for ${data.worker_name} (${data.worker_id}). Deceleration IMU trigger.`,
      timestamp,
    });
  }

  // 2. SOS Trigger
  if (data.sos_triggered) {
    await evaluateAndInsertAlert({
      worker_id: data.worker_id,
      worker_name: data.worker_name,
      type: 'sos',
      severity: 'critical',
      message: `🚨 EMERGENCY SOS BROADCAST: ${data.worker_name} (${data.worker_id}) activated wearable distress beacon.`,
      timestamp,
    });
  }

  // 3. SpO2 Hypoxia Check
  if (data.spo2 && data.spo2 < 90) {
    await evaluateAndInsertAlert({
      worker_id: data.worker_id,
      worker_name: data.worker_name,
      type: 'health',
      severity: 'critical',
      message: `🚨 CRITICAL HYPOXIA: ${data.worker_name} blood oxygen level dropped to ${data.spo2}%. Immediate ventilation check required.`,
      timestamp,
    });
  }

  // 4. Abnormal Heart Rate
  if (data.heart_rate > 140) {
    await evaluateAndInsertAlert({
      worker_id: data.worker_id,
      worker_name: data.worker_name,
      type: 'health',
      severity: 'warning',
      message: `⚠️ ELEVATED HEART RATE: ${data.worker_name} sustained pulse at ${data.heart_rate} BPM. Rest advised.`,
      timestamp,
    });
  } else if (data.heart_rate > 0 && data.heart_rate < 45) {
    await evaluateAndInsertAlert({
      worker_id: data.worker_id,
      worker_name: data.worker_name,
      type: 'health',
      severity: 'warning',
      message: `⚠️ BRADYCARDIA ALERT: ${data.worker_name} pulse dropped to ${data.heart_rate} BPM.`,
      timestamp,
    });
  }
}

export async function evaluateEnvironmentAlerts(data: EnvironmentPayload): Promise<void> {
  const timestamp = data.timestamp || new Date().toISOString();
  const zoneTag = data.zone_id.toUpperCase();

  // 1. Flame Detection
  if (data.flame_detected) {
    await evaluateAndInsertAlert({
      zone_id: data.zone_id,
      type: 'gas',
      severity: 'critical',
      message: `🚨 ACTIVE FLAME / THERMAL EVENT DETECTED IN ${zoneTag}. Automatic suppression protocol triggered.`,
      timestamp,
    });
  }

  // 2. Methane Spike (MQ4)
  if (data.mq4 > 380) {
    await evaluateAndInsertAlert({
      zone_id: data.zone_id,
      type: 'gas',
      severity: 'critical',
      message: `🚨 CRITICAL METHANE (CH4) LEVEL IN ${zoneTag} (Sensor MQ4: ${data.mq4} ppm). Explosive threshold attention!`,
      timestamp,
    });
  } else if (data.mq4 > 250) {
    await evaluateAndInsertAlert({
      zone_id: data.zone_id,
      type: 'gas',
      severity: 'warning',
      message: `⚠️ ELEVATED METHANE CONCENTRATION IN ${zoneTag} (Sensor MQ4: ${data.mq4} ppm). Forced exhaust airflow recommended.`,
      timestamp,
    });
  }

  // 3. Carbon Monoxide (MQ7)
  if (data.mq7 > 180) {
    await evaluateAndInsertAlert({
      zone_id: data.zone_id,
      type: 'gas',
      severity: 'critical',
      message: `🚨 TOXIC CO HAZARD: Carbon Monoxide spike in ${zoneTag} (Sensor MQ7: ${data.mq7} ppm).`,
      timestamp,
    });
  }

  // 4. Smoke / Combustible (MQ2)
  if (data.mq2 > 450) {
    await evaluateAndInsertAlert({
      zone_id: data.zone_id,
      type: 'gas',
      severity: 'warning',
      message: `⚠️ SMOKE / AEROSOL SPIKE IN ${zoneTag} (Sensor MQ2: ${data.mq2} ppm).`,
      timestamp,
    });
  }

  // 5. Ambient Temperature
  if (data.temperature > 44) {
    await evaluateAndInsertAlert({
      zone_id: data.zone_id,
      type: 'system',
      severity: 'warning',
      message: `⚠️ HIGH THERMAL LOAD IN ${zoneTag} (${data.temperature}°C). Cooling unit check recommended.`,
      timestamp,
    });
  }
}

export async function evaluateHelmetAlerts(data: HelmetStatusPayload): Promise<void> {
  const timestamp = data.timestamp || new Date().toISOString();
  if (!data.helmet_worn) {
    await evaluateAndInsertAlert({
      worker_id: data.worker_id,
      worker_name: data.worker_name,
      type: 'ppe',
      severity: 'warning',
      message: `⚠️ PPE VIOLATION: Mining helmet removed by ${data.worker_name} (${data.worker_id}) while underground.`,
      timestamp,
    });
  }
}

export async function evaluatePpeEntryAlerts(data: PpeScanPayload, compliant: boolean): Promise<void> {
  if (!compliant) {
    const missing = [];
    if (!data.helmet) missing.push('Helmet');
    if (!data.vest) missing.push('Vest');
    if (!data.gloves) missing.push('Gloves');

    await evaluateAndInsertAlert({
      worker_id: data.worker_id,
      worker_name: data.worker_name,
      type: 'ppe',
      severity: 'warning',
      message: `⚠️ ENTRY GATE FLAG: ${data.worker_name} attempted entry without required gear (${missing.join(', ')}). Turnstile locked.`,
      timestamp: data.timestamp || new Date().toISOString(),
    });
  }
}
