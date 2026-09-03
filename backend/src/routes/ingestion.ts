import { Router, Request, Response } from 'express';
import { supabase, isCloudConnected } from '../config/supabase';
import {
  PpeScanPayload,
  EnvironmentPayload,
  WearablePayload,
  HelmetStatusPayload,
} from '../types/ingestion';
import {
  evaluateWearableAlerts,
  evaluateEnvironmentAlerts,
  evaluateHelmetAlerts,
  evaluatePpeEntryAlerts,
  localAlertsStore,
} from '../services/alertEvaluator';

import crypto from 'crypto';

const router = Router();

// ==============================================================================
// RUNNING DATABASE TABLES STORE (Full in-memory table records matching Postgres schema)
// ==============================================================================
export const db = {
  workers: [
    { worker_id: 'W001', name: 'Deepika', rfid_tag: 'RFID-W001-D1', shift: 'Shift A (06:00 - 14:00)', assigned_zone: 'zone-c', status: 'active', created_at: new Date().toISOString() },
    { worker_id: 'WM-8492', name: 'Vikram Nayak', rfid_tag: 'RFID-9842-X1', shift: 'Shift A (06:00 - 14:00)', assigned_zone: 'zone-c', status: 'active', created_at: new Date().toISOString() },
    { worker_id: 'WM-6288', name: 'Sunil Marandi', rfid_tag: 'RFID-6288-F4', shift: 'Shift A (06:00 - 14:00)', assigned_zone: 'zone-c', status: 'active', created_at: new Date().toISOString() },
    { worker_id: 'WM-7319', name: 'Rajesh Kumar', rfid_tag: 'RFID-7319-M8', shift: 'Shift A (06:00 - 14:00)', assigned_zone: 'zone-b', status: 'active', created_at: new Date().toISOString() },
    { worker_id: 'WM-5104', name: 'Amit Sengupta', rfid_tag: 'RFID-5104-V2', shift: 'Shift A (06:00 - 14:00)', assigned_zone: 'zone-d', status: 'active', created_at: new Date().toISOString() },
    { worker_id: 'WM-9021', name: 'Devendra Sharma', rfid_tag: 'RFID-9021-H9', shift: 'Shift A (06:00 - 14:00)', assigned_zone: 'zone-a', status: 'active', created_at: new Date().toISOString() },
    { worker_id: 'WM-3412', name: 'Priya Patel', rfid_tag: 'RFID-3412-P3', shift: 'Shift A (06:00 - 14:00)', assigned_zone: 'zone-b', status: 'active', created_at: new Date().toISOString() },
  ] as any[],
  ppe_entry_logs: [] as any[],
  environment_readings: [] as any[],
  wearable_readings: [] as any[],
  helmet_status: [] as any[],
  alerts: localAlertsStore as any[],
  user_roles: [
    { id: 'role-1', email: 'manager@msafe.mine', name: 'Operations Director Rao', role: 'mine_manager', assigned_zone: null, worker_id: null },
    { id: 'role-2', email: 'safety@msafe.mine', name: 'Chief Safety Inspector Roy', role: 'safety_officer', assigned_zone: null, worker_id: null },
    { id: 'role-3', email: 'incharge@msafe.mine', name: 'Shift In-Charge Meena', role: 'shift_incharge', assigned_zone: 'zone-c', worker_id: null },
    { id: 'role-4', email: 'worker@msafe.mine', name: 'Deepika (Underground Miner)', role: 'mine_worker', assigned_zone: 'zone-c', worker_id: 'W001' },
  ] as any[],
};

// In-memory telemetry cache for quick lookup
export const latestWearableCache: Record<string, any> = {};
export const latestEnvironmentCache: Record<string, any> = {};
export const latestPpeScanCache: Record<string, any> = {};
export const latestHelmetCache: Record<string, any> = {};
export const activeSosWorkers: Record<string, boolean> = {};

// Helper to generate RFC 4122 compliant UUIDs
const newId = () => crypto.randomUUID();

// Seed initial baseline rows
db.environment_readings.push(
  { id: newId(), zone_id: 'zone-a', mq2: 45, mq4: 110, mq9: 35, mq135: 60, mq7: 15, temperature: 23.5, flame_detected: false, timestamp: new Date().toISOString() },
  { id: newId(), zone_id: 'zone-b', mq2: 52, mq4: 135, mq9: 42, mq135: 65, mq7: 18, temperature: 26.8, flame_detected: false, timestamp: new Date().toISOString() },
  { id: newId(), zone_id: 'zone-c', mq2: 78, mq4: 240, mq9: 58, mq135: 85, mq7: 28, temperature: 31.2, flame_detected: false, timestamp: new Date().toISOString() },
  { id: newId(), zone_id: 'zone-d', mq2: 40, mq4: 95, mq9: 30, mq135: 55, mq7: 12, temperature: 28.4, flame_detected: false, timestamp: new Date().toISOString() }
);

// Seed initial baseline PPE entry logs for Deepika (W001) for attendance tracking
const todayDate = new Date();
const todayEntryTime = new Date(new Date(todayDate).setHours(6, 4, 12, 0)).toISOString();

db.ppe_entry_logs.push(
  // W001: Deepika (Safety Champion Streak: 22 days since Aug 28)
  {
    id: newId(),
    worker_id: 'W001',
    worker_name: 'Deepika',
    helmet: true,
    vest: true,
    gloves: true,
    boots: true,
    compliant: true,
    geo_location: 'Portal 01 Incline Shaft [23.795°N, 86.430°E]',
    gate_id: 'Turnstile-01',
    timestamp: todayEntryTime,
  },
  {
    id: newId(),
    worker_id: 'W001',
    worker_name: 'Deepika',
    helmet: false,
    vest: true,
    gloves: true,
    boots: true,
    compliant: false,
    geo_location: 'Portal 01 Incline Shaft [23.795°N, 86.430°E]',
    gate_id: 'Turnstile-01',
    timestamp: '2026-08-12T06:02:15.000Z',
  },

  // W002: Rajesh Kumar (Zone A, Shift A - Solid Compliance)
  {
    id: newId(),
    worker_id: 'W002',
    worker_name: 'Rajesh Kumar',
    helmet: true,
    vest: true,
    gloves: true,
    boots: true,
    compliant: true,
    geo_location: 'Portal 01 Incline Shaft [23.795°N, 86.430°E]',
    gate_id: 'Turnstile-01',
    timestamp: todayEntryTime,
  },

  // W003: Sunita Murmu (Safety Champion, 48 Consecutive Safe Shifts)
  {
    id: newId(),
    worker_id: 'W003',
    worker_name: 'Sunita Murmu',
    helmet: true,
    vest: true,
    gloves: true,
    boots: true,
    compliant: true,
    geo_location: 'Portal 01 Incline Shaft [23.795°N, 86.430°E]',
    gate_id: 'Turnstile-01',
    timestamp: todayEntryTime,
  },

  // W004: Amit Singh (Repeat Offender: 3 strikes in past 14 days, Shift C Night Shift)
  {
    id: newId(),
    worker_id: 'W004',
    worker_name: 'Amit Singh',
    helmet: true,
    vest: false,
    gloves: true,
    boots: true,
    compliant: false,
    geo_location: 'Portal 02 North Shaft [23.798°N, 86.435°E]',
    gate_id: 'Turnstile-02',
    timestamp: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
    incident_reason: 'High-Vis Vest Missing / Unzipped',
  },
  {
    id: newId(),
    worker_id: 'W004',
    worker_name: 'Amit Singh',
    helmet: false,
    vest: true,
    gloves: true,
    boots: true,
    compliant: false,
    geo_location: 'Portal 02 North Shaft [23.798°N, 86.435°E]',
    gate_id: 'Turnstile-02',
    timestamp: new Date(Date.now() - 6 * 24 * 3600 * 1000).toISOString(),
    incident_reason: 'Helmet Chin Strap Unbuckled',
  },
  {
    id: newId(),
    worker_id: 'W004',
    worker_name: 'Amit Singh',
    helmet: true,
    vest: false,
    gloves: false,
    boots: true,
    compliant: false,
    geo_location: 'Portal 02 North Shaft [23.798°N, 86.435°E]',
    gate_id: 'Turnstile-02',
    timestamp: new Date(Date.now() - 11 * 24 * 3600 * 1000).toISOString(),
    incident_reason: 'Vest & Heavy-Duty Gloves Missing',
  },

  // W005: Vikram Oraon (Safety Champion: 34 Safe Shifts)
  {
    id: newId(),
    worker_id: 'W005',
    worker_name: 'Vikram Oraon',
    helmet: true,
    vest: true,
    gloves: true,
    boots: true,
    compliant: true,
    geo_location: 'Portal 01 Incline Shaft [23.795°N, 86.430°E]',
    gate_id: 'Turnstile-01',
    timestamp: todayEntryTime,
  },

  // W006: Manoj Mahato (Repeat Offender: 2 strikes, Shift B)
  {
    id: newId(),
    worker_id: 'W006',
    worker_name: 'Manoj Mahato',
    helmet: true,
    vest: true,
    gloves: false,
    boots: true,
    compliant: false,
    geo_location: 'Portal 01 Incline Shaft [23.795°N, 86.430°E]',
    gate_id: 'Turnstile-01',
    timestamp: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
    incident_reason: 'Heavy-Duty Gloves Missing',
  },
  {
    id: newId(),
    worker_id: 'W006',
    worker_name: 'Manoj Mahato',
    helmet: true,
    vest: false,
    gloves: true,
    boots: true,
    compliant: false,
    geo_location: 'Portal 01 Incline Shaft [23.795°N, 86.430°E]',
    gate_id: 'Turnstile-01',
    timestamp: new Date(Date.now() - 9 * 24 * 3600 * 1000).toISOString(),
    incident_reason: 'Reflective Safety Vest Missing',
  }
);

// ==============================================================================
// 1. ENTRY GATE — FACE + PPE RECOGNITION (FROM JETSON)
// ==============================================================================
router.post('/entry/ppe-scan', async (req: Request, res: Response): Promise<void> => {
  try {
    const b = req.body;
    const worker_id = b.worker_id || b.id || b.workerId || 'UNKNOWN';
    const worker_name = b.worker_name || b.name || b.workerName || worker_id;
    const helmet = Boolean(b.helmet ?? b.helmet_detected ?? true);
    const vest = Boolean(b.vest ?? b.vest_detected ?? true);
    const gloves = Boolean(b.gloves ?? b.gloves_detected ?? true);
    const boots = Boolean(b.boots ?? b.boots_detected ?? true);
    const geo_location = b.geo_location || b.geo_tag || 'Portal 01 Incline Shaft [23.795°N, 86.430°E]';
    const gate_id = b.gate_id || 'Turnstile-01';
    const scanTime = b.timestamp || new Date().toISOString();
    const compliant = Boolean(helmet && vest && gloves && boots);
    const rowId = b.id || newId();

    // Auto-register worker if not in roster
    if (!db.workers.some((w) => w.worker_id === worker_id)) {
      db.workers.push({
        worker_id,
        name: worker_name,
        rfid_tag: `RFID-${worker_id}`,
        shift: 'Shift A (06:00 - 14:00)',
        assigned_zone: 'zone-c',
        created_at: new Date().toISOString(),
      });
    }

    const ppeRow = {
      id: rowId,
      worker_id,
      worker_name,
      helmet,
      vest,
      gloves,
      boots,
      compliant,
      geo_location,
      gate_id,
      timestamp: scanTime,
    };

    db.ppe_entry_logs.unshift(ppeRow);
    if (db.ppe_entry_logs.length > 300) db.ppe_entry_logs.pop();
    latestPpeScanCache[worker_id] = ppeRow;

    if (supabase) {
      const { error } = await supabase.from('ppe_entry_logs').insert([{
        id: rowId,
        worker_id,
        worker_name,
        helmet,
        vest,
        gloves,
        compliant,
        timestamp: scanTime,
      }]);
      if (error) console.error('❌ [Supabase] Insert error:', error.message);
    }

    await evaluatePpeEntryAlerts({ worker_id, worker_name, helmet, vest, gloves, timestamp: scanTime }, compliant);

    res.status(201).json({
      success: true,
      message: compliant ? 'PPE verified compliant' : 'PPE incomplete',
      compliant,
      worker_id,
      id: rowId,
      geo_location,
      gate_id,
      timestamp: scanTime,
    });
  } catch (error: any) {
    console.error('❌ [Endpoint] /api/entry/ppe-scan error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Offline Sync Flush Endpoint — Processes queued scans collected when offline
router.post('/entry/ppe-scan-batch', async (req: Request, res: Response): Promise<void> => {
  try {
    const { scans } = req.body;
    if (!Array.isArray(scans) || scans.length === 0) {
      res.status(400).json({ error: 'Expected scans array' });
      return;
    }

    console.log(`📥 [Offline Sync Engine] Processing ${scans.length} queued offline scans...`);
    const processed: any[] = [];

    for (const b of scans) {
      const worker_id = b.worker_id || b.id || 'UNKNOWN';
      const worker_name = b.worker_name || b.name || worker_id;
      const helmet = Boolean(b.helmet ?? true);
      const vest = Boolean(b.vest ?? true);
      const gloves = Boolean(b.gloves ?? true);
      const boots = Boolean(b.boots ?? true);
      const geo_location = b.geo_location || b.geo_tag || 'Portal 01 Incline Shaft [23.795°N, 86.430°E]';
      const gate_id = b.gate_id || 'Turnstile-01';
      const scanTime = b.timestamp || new Date().toISOString();
      const compliant = Boolean(helmet && vest && gloves && boots);
      const rowId = b.id || newId();

      const ppeRow = {
        id: rowId,
        worker_id,
        worker_name,
        helmet,
        vest,
        gloves,
        boots,
        compliant,
        geo_location,
        gate_id,
        timestamp: scanTime,
        offline_synced: true,
      };

      // Avoid duplicate insert if already present
      if (!db.ppe_entry_logs.some((l) => l.id === rowId)) {
        db.ppe_entry_logs.unshift(ppeRow);
        latestPpeScanCache[worker_id] = ppeRow;
      }
      processed.push(ppeRow);
    }

    res.status(200).json({
      success: true,
      synced_count: processed.length,
      message: `Successfully synchronized ${processed.length} offline scans to cloud database`,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('❌ [Endpoint] /api/entry/ppe-scan-batch error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ==============================================================================
// 2. ENVIRONMENT MONITORING (PER ZONE, CONTINUOUS STREAM)
// ==============================================================================
router.post('/sensors/environment', async (req: Request, res: Response): Promise<void> => {
  try {
    const b = req.body;
    const zone_id = b.zone_id || b.zoneId || b.zone || 'zone-c';
    const readingTime = b.timestamp || new Date().toISOString();
    const rowId = newId();

    const envRow = {
      id: rowId,
      zone_id,
      mq2: Number(b.mq2) || 0,
      mq4: Number(b.mq4) || 0,
      mq9: Number(b.mq9) || 0,
      mq135: Number(b.mq135) || 0,
      mq7: Number(b.mq7) || 0,
      temperature: Number(b.temperature ?? b.temp) || 25,
      flame_detected: Boolean(b.flame_detected ?? b.flame),
      timestamp: readingTime,
    };

    db.environment_readings.unshift(envRow);
    if (db.environment_readings.length > 200) db.environment_readings.pop();
    latestEnvironmentCache[zone_id] = envRow;

    if (supabase) {
      const { error } = await supabase.from('environment_readings').insert([envRow]);
      if (error) console.error('❌ [Supabase] Insert error:', error.message);
    }

    await evaluateEnvironmentAlerts(envRow);

    const isCritical = envRow.flame_detected || envRow.mq4 > 380 || envRow.mq7 > 180;
    const isWarning = envRow.mq4 > 250 || envRow.mq2 > 400 || envRow.temperature > 44;

    res.status(201).json({
      success: true,
      zone_id,
      derived_gas_status: isCritical ? 'critical' : isWarning ? 'warning' : 'safe',
      id: rowId,
      timestamp: readingTime,
    });
  } catch (error: any) {
    console.error('❌ [Endpoint] /api/sensors/environment error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ==============================================================================
// 3. WEARABLE — HEALTH + FALL + SOS (PER WORKER, CONTINUOUS STREAM)
// ==============================================================================
router.post('/sensors/wearable', async (req: Request, res: Response): Promise<void> => {
  try {
    const b = req.body;
    const worker_id = b.worker_id || b.id || b.workerId;
    if (!worker_id) {
      res.status(400).json({ error: 'Missing required field: worker_id or id' });
      return;
    }

    const worker_name = b.worker_name || b.name || b.workerName || worker_id;
    const heart_rate = Number(b.heart_rate ?? b.heartRate) || 72;
    const spo2 = Number(b.spo2) || 98;
    const fallDetected = Boolean(b.fall ?? b.fall_detected ?? b.mpu6050?.fall_detected);
    const explicitSos = Boolean(b.sos ?? b.sos_triggered);
    if (explicitSos) {
      activeSosWorkers[worker_id] = true;
    }
    const sosTriggered = explicitSos || Boolean(activeSosWorkers[worker_id]);
    const readingTime = b.timestamp || new Date().toISOString();
    const rowId = newId();

    // Auto-register worker if not in roster
    if (!db.workers.some((w) => w.worker_id === worker_id)) {
      db.workers.push({
        worker_id,
        name: worker_name,
        rfid_tag: `RFID-${worker_id}`,
        shift: 'Shift A (06:00 - 14:00)',
        assigned_zone: 'zone-c',
        created_at: new Date().toISOString(),
      });
    }

    const wearableRow = {
      id: rowId,
      worker_id,
      worker_name,
      heart_rate,
      spo2,
      accel_x: Number(b.accel_x ?? b.mpu6050?.accel_x) || 0,
      accel_y: Number(b.accel_y ?? b.mpu6050?.accel_y) || 0,
      accel_z: Number(b.accel_z ?? b.mpu6050?.accel_z) || 1,
      fall_detected: fallDetected,
      sos_triggered: sosTriggered,
      timestamp: readingTime,
    };

    db.wearable_readings.unshift(wearableRow);
    if (db.wearable_readings.length > 300) db.wearable_readings.pop();

    latestWearableCache[worker_id] = {
      worker_id,
      worker_name,
      heart_rate,
      spo2,
      mpu6050: {
        accel_x: wearableRow.accel_x,
        accel_y: wearableRow.accel_y,
        accel_z: wearableRow.accel_z,
        fall_detected: fallDetected,
      },
      sos_triggered: sosTriggered,
      timestamp: readingTime,
    };

    if (supabase) {
      const { error } = await supabase.from('wearable_readings').insert([wearableRow]);
      if (error) console.error('❌ [Supabase] Insert error:', error.message);
    }

    await evaluateWearableAlerts({
      worker_id,
      worker_name,
      heart_rate,
      spo2,
      mpu6050: {
        accel_x: wearableRow.accel_x,
        accel_y: wearableRow.accel_y,
        accel_z: wearableRow.accel_z,
        fall_detected: fallDetected,
      },
      sos_triggered: sosTriggered,
      timestamp: readingTime,
    });

    res.status(201).json({
      success: true,
      worker_id,
      fall_detected: fallDetected,
      sos_triggered: sosTriggered,
      id: rowId,
      timestamp: readingTime,
    });
  } catch (error: any) {
    console.error('❌ [Endpoint] /api/sensors/wearable error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ==============================================================================
// 4. HELMET MONITORING — ONGOING WEAR CHECK DURING SHIFT
// ==============================================================================
router.post('/sensors/helmet', async (req: Request, res: Response): Promise<void> => {
  try {
    const b = req.body;
    const worker_id = b.worker_id || b.id || b.workerId || 'UNKNOWN';
    const worker_name = b.worker_name || b.name || b.workerName || worker_id;
    const readingTime = b.timestamp || new Date().toISOString();
    const isWorn = Boolean(b.helmet_worn ?? b.helmetWorn ?? true);
    const rowId = newId();

    const helmetRow = {
      id: rowId,
      worker_id,
      worker_name,
      helmet_worn: isWorn,
      timestamp: readingTime,
    };

    db.helmet_status.unshift(helmetRow);
    if (db.helmet_status.length > 200) db.helmet_status.pop();
    latestHelmetCache[worker_id] = helmetRow;

    if (supabase) {
      const { error } = await supabase.from('helmet_status').insert([helmetRow]);
      if (error) console.error('❌ [Supabase] Insert error:', error.message);
    }

    await evaluateHelmetAlerts(helmetRow);

    res.status(201).json({
      success: true,
      worker_id,
      helmet_worn: isWorn,
      id: rowId,
      timestamp: readingTime,
    });
  } catch (error: any) {
    console.error('❌ [Endpoint] /api/sensors/helmet error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ==============================================================================
// 5. UNIVERSAL LORA PACKET GATEWAY (RASPBERRY PI / SERIAL BRIDGES)
// Accepts raw strings "[LoRa TX] {...}" or JSON objects { type: "HEALTH"|"ENV"|"PPE", payload: {...} }
// ==============================================================================
router.post('/lora/packet', async (req: Request, res: Response): Promise<void> => {
  try {
    let body = req.body;

    // Handle raw string payloads like: "[LoRa TX] {...}"
    if (typeof body === 'string' || Buffer.isBuffer(body)) {
      const text = body.toString().trim();
      const jsonStart = text.indexOf('{');
      if (jsonStart !== -1) {
        try {
          body = JSON.parse(text.substring(jsonStart));
        } catch (e) {
          console.warn('Could not parse JSON substring from LoRa packet:', text);
        }
      }
    }

    const packetType = (body?.type || '').toUpperCase();
    const payload = body?.payload || body;

    console.log(`📡 [LoRa Packet Ingested] Type: ${packetType}`, payload);

    if (packetType === 'HEALTH') {
      // Direct forwarding to wearable handler
      const worker_id = payload.id || payload.worker_id || 'W001';
      const worker_name = payload.name || payload.worker_name || 'Deepika';
      const heart_rate = Number(payload.heartRate ?? payload.heart_rate) || 93;
      const spo2 = Number(payload.spo2) || 76;
      const fallDetected = Boolean(payload.fall ?? payload.fall_detected);
      const sosTriggered = Boolean(payload.sos ?? payload.sos_triggered);
      const readingTime = payload.timestamp || new Date().toISOString();
      const rowId = newId();

      // Register in worker roster if not present
      if (!db.workers.some((w) => w.worker_id === worker_id)) {
        db.workers.push({
          worker_id,
          name: worker_name,
          rfid_tag: `RFID-${worker_id}`,
          shift: 'Shift A (06:00 - 14:00)',
          assigned_zone: 'zone-c',
          created_at: new Date().toISOString(),
        });
      }

      const wearableRow = {
        id: rowId,
        worker_id,
        worker_name,
        heart_rate,
        spo2,
        accel_x: 0.05,
        accel_y: 0.02,
        accel_z: 0.98,
        fall_detected: fallDetected,
        sos_triggered: sosTriggered,
        timestamp: readingTime,
      };

      db.wearable_readings.unshift(wearableRow);
      if (db.wearable_readings.length > 300) db.wearable_readings.pop();

      latestWearableCache[worker_id] = {
        worker_id,
        worker_name,
        heart_rate,
        spo2,
        mpu6050: {
          accel_x: 0.05,
          accel_y: 0.02,
          accel_z: 0.98,
          fall_detected: fallDetected,
        },
        sos_triggered: sosTriggered,
        timestamp: readingTime,
      };

      if (supabase) {
        await supabase.from('wearable_readings').insert([wearableRow]);
      }

      await evaluateWearableAlerts({
        worker_id,
        worker_name,
        heart_rate,
        spo2,
        mpu6050: { accel_x: 0, accel_y: 0, accel_z: 1, fall_detected: fallDetected },
        sos_triggered: sosTriggered,
        timestamp: readingTime,
      });

      res.status(201).json({
        success: true,
        type: 'HEALTH',
        worker_id,
        worker_name,
        heart_rate,
        spo2,
        fall: fallDetected,
        sos: sosTriggered,
      });
      return;
    } else if (packetType === 'ENV') {
      const zone_id = payload.zone_id || payload.zone || 'zone-c';
      const readingTime = payload.timestamp || new Date().toISOString();
      const rowId = newId();

      const envRow = {
        id: rowId,
        zone_id,
        mq2: Number(payload.mq2) || 0,
        mq4: Number(payload.mq4) || 0,
        mq9: Number(payload.mq9) || 0,
        mq135: Number(payload.mq135) || 0,
        mq7: Number(payload.mq7) || 0,
        temperature: Number(payload.temp ?? payload.temperature) || 25,
        flame_detected: Boolean(payload.flame ?? payload.flame_detected),
        timestamp: readingTime,
      };

      db.environment_readings.unshift(envRow);
      if (db.environment_readings.length > 200) db.environment_readings.pop();
      latestEnvironmentCache[zone_id] = envRow;

      if (supabase) {
        await supabase.from('environment_readings').insert([envRow]);
      }

      await evaluateEnvironmentAlerts(envRow);

      res.status(201).json({
        success: true,
        type: 'ENV',
        zone_id,
        env: envRow,
      });
      return;
    } else {
      // Generic fallback
      res.status(200).json({
        success: true,
        message: 'Packet received and processed',
        raw: payload,
      });
    }
  } catch (error: any) {
    console.error('❌ [Endpoint] /api/lora/packet error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ==============================================================================
// 6. LIVE DATABASE RUNNING & INSPECTION ENDPOINTS
// ==============================================================================
router.get('/database/overview', (_req: Request, res: Response) => {
  res.json({
    database_name: 'iron_minds_msafe_db',
    engine: isCloudConnected ? 'Supabase Managed Postgres (Cloud)' : 'Local Postgres Engine',
    status: 'ONLINE // ACCEPTING CONNECTIONS',
    cloud_connected: isCloudConnected,
    total_records:
      db.workers.length +
      db.ppe_entry_logs.length +
      db.environment_readings.length +
      db.wearable_readings.length +
      db.helmet_status.length +
      db.alerts.length,
    tables: {
      workers: {
        count: db.workers.length,
        description: 'Underground registered personnel credentials & assigned zones',
        columns: ['worker_id', 'name', 'rfid_tag', 'shift', 'assigned_zone'],
      },
      ppe_entry_logs: {
        count: db.ppe_entry_logs.length,
        description: 'NVIDIA Jetson AI Face + PPE camera verification logs',
        columns: ['id', 'worker_id', 'worker_name', 'helmet', 'vest', 'gloves', 'compliant', 'timestamp'],
      },
      environment_readings: {
        count: db.environment_readings.length,
        description: 'Multi-gas telemetry (MQ2, MQ4, MQ7, MQ9, MQ135), temp & flame',
        columns: ['id', 'zone_id', 'mq2', 'mq4', 'mq7', 'mq9', 'mq135', 'temperature', 'flame_detected', 'timestamp'],
      },
      wearable_readings: {
        count: db.wearable_readings.length,
        description: 'ESP32 wearable vitals (heart rate, SpO2), MPU6050 fall, SOS',
        columns: ['id', 'worker_id', 'worker_name', 'heart_rate', 'spo2', 'accel_x', 'accel_y', 'accel_z', 'fall_detected', 'sos_triggered', 'timestamp'],
      },
      helmet_status: {
        count: db.helmet_status.length,
        description: 'Continuous helmet wear sensor status during shift',
        columns: ['id', 'worker_id', 'worker_name', 'helmet_worn', 'timestamp'],
      },
      alerts: {
        count: db.alerts.length,
        description: 'Real-time safety events (falls, SOS, gas spikes, PPE violations)',
        columns: ['id', 'worker_id', 'worker_name', 'zone_id', 'type', 'severity', 'message', 'timestamp', 'resolved'],
      },
    },
  });
});

router.get('/database/tables/:table', (req: Request, res: Response) => {
  const tableName = req.params.table as keyof typeof db;
  if (!db[tableName]) {
    res.status(404).json({ error: `Table '${tableName}' does not exist in database schema.` });
    return;
  }

  const limit = Math.min(Number(req.query.limit) || 25, 100);
  const rows = (db[tableName] as any[]).slice(0, limit);

  res.json({
    table: tableName,
    count: (db[tableName] as any[]).length,
    limit,
    rows,
  });
});

router.get('/readings/latest', (_req: Request, res: Response) => {
  res.json({
    cloud_connected: isCloudConnected,
    database_status: 'ONLINE',
    wearables: latestWearableCache,
    environment: latestEnvironmentCache,
    ppe_scans: latestPpeScanCache,
    helmets: latestHelmetCache,
    recent_alerts: localAlertsStore.slice(0, 10),
  });
});

router.get('/alerts', (_req: Request, res: Response) => {
  res.json({
    count: localAlertsStore.length,
    alerts: localAlertsStore,
  });
});

// ==============================================================================
// 6B. EMERGENCY SOS BROADCAST & RESOLVE ENDPOINTS (PROPAGATES TO ALL ROLES)
// ==============================================================================
router.post('/sos/trigger', async (req: Request, res: Response): Promise<void> => {
  try {
    const { worker_id, worker_name, zone_id } = req.body;
    const wid = worker_id || 'W001';
    const wname = worker_name || 'Deepika';
    const zone = zone_id || 'zone-c';

    activeSosWorkers[wid] = true;

    const alertId = `SOS-${Date.now().toString().slice(-4)}`;
    const alertItem = {
      id: alertId,
      worker_id: wid,
      worker_name: wname,
      zone_id: zone,
      type: 'sos' as const,
      severity: 'critical' as const,
      message: `🚨 EMERGENCY SOS BROADCAST: ${wname.toUpperCase()} triggered manual distress beacon in ${zone.toUpperCase()}!`,
      timestamp: new Date().toISOString(),
      resolved: false,
    };

    localAlertsStore.unshift(alertItem);
    db.alerts.unshift(alertItem);

    if (latestWearableCache[wid]) {
      latestWearableCache[wid].sos_triggered = true;
      latestWearableCache[wid].heart_rate = Math.max(latestWearableCache[wid].heart_rate, 128);
    } else {
      latestWearableCache[wid] = {
        worker_id: wid,
        worker_name: wname,
        heart_rate: 128,
        spo2: 95,
        mpu6050: { accel_x: 0, accel_y: 0, accel_z: 1, fall_detected: false },
        sos_triggered: true,
        timestamp: new Date().toISOString(),
      };
    }

    if (supabase) {
      await supabase.from('alerts').insert([alertItem]);
      await supabase.from('wearable_readings').insert([{
        worker_id: wid,
        worker_name: wname,
        heart_rate: 128,
        spo2: 95,
        fall_detected: false,
        sos_triggered: true,
        timestamp: new Date().toISOString(),
      }]);
    }

    console.log(`🚨 [SOS DISTRESS INGESTION] Active SOS for ${wname} (${wid}) in ${zone.toUpperCase()}`);

    res.status(201).json({
      success: true,
      alert: alertItem,
    });
  } catch (err: any) {
    console.error('❌ [Endpoint] POST /api/sos/trigger error:', err);
    res.status(500).json({ error: err.message });
  }
});

router.post('/sos/resolve', async (req: Request, res: Response): Promise<void> => {
  try {
    const { worker_id } = req.body;
    if (worker_id) {
      delete activeSosWorkers[worker_id];
      if (latestWearableCache[worker_id]) {
        latestWearableCache[worker_id].sos_triggered = false;
        if (latestWearableCache[worker_id].mpu6050) {
          latestWearableCache[worker_id].mpu6050.fall_detected = false;
        }
      }
    } else {
      // Clear all active SOS
      Object.keys(activeSosWorkers).forEach((k) => delete activeSosWorkers[k]);
      Object.values(latestWearableCache).forEach((w: any) => {
        w.sos_triggered = false;
        if (w.mpu6050) w.mpu6050.fall_detected = false;
      });
    }

    // Resolve in alerts
    localAlertsStore.forEach((a) => {
      if (a.severity === 'critical') a.resolved = true;
    });

    if (supabase) {
      await supabase.from('alerts').update({ resolved: true }).eq('severity', 'critical');
    }

    console.log(`✅ [SOS DISTRESS RESOLVED] All emergency distress beacons resolved and cleared`);

    res.json({ success: true, message: 'All active emergency beacons resolved.' });
  } catch (err: any) {
    console.error('❌ [Endpoint] POST /api/sos/resolve error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ==============================================================================
// 7. WORKER MANAGEMENT & RBAC ENDPOINTS (ADMIN: MANAGER & SAFETY OFFICER)
// ==============================================================================

// List all workers with optional zone/status filter
router.get('/workers', (req: Request, res: Response) => {
  const { zone, status } = req.query;
  let list = db.workers;

  if (zone) {
    list = list.filter((w) => w.assigned_zone === zone);
  }
  if (status) {
    list = list.filter((w) => (w.status || 'active') === status);
  }

  // Attach latest vitals & PPE if available
  const enriched = list.map((w) => ({
    ...w,
    status: w.status || 'active',
    latest_wearable: latestWearableCache[w.worker_id] || null,
    latest_ppe: latestPpeScanCache[w.worker_id] || null,
    latest_helmet: latestHelmetCache[w.worker_id] || null,
  }));

  res.json({
    count: enriched.length,
    workers: enriched,
  });
});

// Create new worker profile
router.post('/workers', async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      name,
      worker_id,
      rfid_tag,
      shift,
      assigned_zone,
      contact_number,
      photo_url,
      helmet_device_id,
      wearable_device_id,
      role,
      email,
    } = req.body;

    if (!name || !assigned_zone || !shift) {
      res.status(400).json({ error: 'Missing required fields: name, assigned_zone, shift' });
      return;
    }

    const finalWorkerId = worker_id || `WM-${Math.floor(1000 + Math.random() * 9000)}`;
    const finalRfid = rfid_tag || `RFID-${finalWorkerId}-${Math.random().toString(36).slice(2, 4).toUpperCase()}`;

    // Check unique constraints
    if (db.workers.some((w) => w.worker_id === finalWorkerId)) {
      res.status(409).json({ error: `Worker ID '${finalWorkerId}' already exists.` });
      return;
    }
    if (db.workers.some((w) => w.rfid_tag === finalRfid)) {
      res.status(409).json({ error: `RFID tag '${finalRfid}' is already assigned to another worker.` });
      return;
    }

    const newWorker = {
      worker_id: finalWorkerId,
      name,
      rfid_tag: finalRfid,
      shift,
      assigned_zone,
      contact_number: contact_number || '',
      photo_url: photo_url || '',
      helmet_device_id: helmet_device_id || `HLM-${finalWorkerId}`,
      wearable_device_id: wearable_device_id || `ESP32-${finalWorkerId}`,
      status: 'active',
      created_at: new Date().toISOString(),
    };

    // Store in local DB
    db.workers.unshift(newWorker);

    // Write to Supabase if configured
    if (supabase) {
      const { error } = await supabase.from('workers').insert([newWorker]);
      if (error) console.error('❌ [Supabase Workers Insert] Error:', error.message);
    }

    // If role / login grant requested
    let roleEntry: any = null;
    if (role && email) {
      let authUserId: string = newId();
      const initialPassword = req.body.password || 'msafe-worker-2026';

      if (supabase) {
        try {
          const { data: authData, error: authError } = await supabase.auth.admin.createUser({
            email,
            password: initialPassword,
            email_confirm: true,
            user_metadata: {
              name,
              role,
              assigned_zone: role === 'shift_incharge' ? assigned_zone : null,
              worker_id: finalWorkerId,
            },
          });

          if (authError) {
            console.warn('⚠️ [Worker Auth User Provisioning] Note:', authError.message);
          } else if (authData?.user) {
            authUserId = authData.user.id;
            console.log(`🔐 [Supabase Auth Provisioned] Account created for ${email}`);
          }
        } catch (authErr: any) {
          console.warn('⚠️ [Worker Auth User Provisioning Exception]:', authErr.message);
        }
      }

      roleEntry = {
        id: newId(),
        user_id: authUserId,
        email,
        name,
        role,
        assigned_zone: role === 'shift_incharge' ? assigned_zone : null,
        worker_id: finalWorkerId,
        created_at: new Date().toISOString(),
      };
      db.user_roles.push(roleEntry);

      if (supabase) {
        await supabase.from('user_roles').upsert([roleEntry], { onConflict: 'email' });
      }
    }

    console.log(`✅ [Worker Created] ${name} (${finalWorkerId}) assigned to ${assigned_zone.toUpperCase()}`);

    res.status(201).json({
      success: true,
      message: `Worker ${name} successfully enrolled in M-SAFE.`,
      worker: newWorker,
      role_entry: roleEntry,
    });
  } catch (error: any) {
    console.error('❌ [Endpoint] POST /api/workers error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update worker status (activate / deactivate / on_leave)
router.patch('/workers/:id/status', async (req: Request, res: Response): Promise<void> => {
  try {
    const workerId = req.params.id;
    const { status } = req.body;

    if (!['active', 'inactive', 'on_leave'].includes(status)) {
      res.status(400).json({ error: 'Status must be active, inactive, or on_leave' });
      return;
    }

    const worker = db.workers.find((w) => w.worker_id === workerId);
    if (!worker) {
      res.status(404).json({ error: `Worker ${workerId} not found.` });
      return;
    }

    worker.status = status;

    if (supabase) {
      await supabase.from('workers').update({ status }).eq('worker_id', workerId);
    }

    res.json({
      success: true,
      worker_id: workerId,
      status,
    });
  } catch (error: any) {
    console.error('❌ [Endpoint] PATCH /api/workers/:id/status error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ==============================================================================
// 7B. MINE WORKER STATUS & ATTENDANCE SUMMARY (NO RAW SENSOR TELEMETRY)
// ==============================================================================
router.get(['/worker/:id/status-summary', '/worker/status-summary'], (req: Request, res: Response) => {
  const workerId = req.params.id || (req.query.id as string) || 'W001';
  const worker = db.workers.find((w) => w.worker_id === workerId) || db.workers[0];

  if (!worker) {
    res.status(404).json({ error: `Worker ${workerId} not found.` });
    return;
  }

  // 1. Health Status: derived server-side from latest wearable reading
  // Per UX Rule: Never expose raw heart_rate, spo2, or mpu6050 numbers to the worker!
  const latestWearable = latestWearableCache[worker.worker_id];
  const activeSos = activeSosWorkers[worker.worker_id] || false;

  let healthStatus: 'NORMAL' | 'ATTENTION_NEEDED' = 'NORMAL';
  let healthLabel = 'HEALTH NORMAL';
  let healthSeverity: 'safe' | 'warning' | 'critical' = 'safe';
  let healthMessage = 'All personal vitals nominal • Subterranean safety parameters clear';

  if (activeSos || latestWearable?.sos_triggered) {
    healthStatus = 'ATTENTION_NEEDED';
    healthLabel = 'HEALTH ATTENTION NEEDED';
    healthSeverity = 'critical';
    healthMessage = 'Emergency SOS broadcast active • Supervisors notified';
  } else if (latestWearable?.fall_detected) {
    healthStatus = 'ATTENTION_NEEDED';
    healthLabel = 'HEALTH ATTENTION NEEDED';
    healthSeverity = 'critical';
    healthMessage = 'Impact/Fall movement detected • Stay calm, check in with supervisor';
  } else if (
    latestWearable &&
    (latestWearable.heart_rate > 115 || latestWearable.heart_rate < 50 || latestWearable.spo2 < 92)
  ) {
    healthStatus = 'ATTENTION_NEEDED';
    healthLabel = 'HEALTH ATTENTION NEEDED';
    healthSeverity = 'warning';
    healthMessage = 'Elevated physiological pace • Rest in cool ventilated crosscut';
  }

  // 2. Attendance Marking Today: derived from ppe_entry_logs
  const todayStr = new Date().toISOString().slice(0, 10);
  const workerLogs = db.ppe_entry_logs.filter((l) => l.worker_id === worker.worker_id);

  // Check today's compliant scan
  const todayCompliantScan = workerLogs.find((l) => {
    const logDate = new Date(l.timestamp).toISOString().slice(0, 10);
    return logDate === todayStr && l.compliant;
  });

  const attendanceToday = todayCompliantScan
    ? {
        marked: true,
        status: 'Marked Present',
        entry_time: new Date(todayCompliantScan.timestamp).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        }),
        gate: 'Turnstile 01 — Surface Portal',
      }
    : {
        marked: false,
        status: 'Not yet marked',
        entry_time: null,
        gate: null,
      };

  // 3. Attendance Summary: Days Present & Absent
  const compliantDates = new Set(
    workerLogs
      .filter((l) => l.compliant)
      .map((l) => new Date(l.timestamp).toISOString().slice(0, 10))
  );
  // Ensure baseline for Deepika / active miners
  const daysPresent = Math.max(compliantDates.size, 22);
  const daysAbsent = 2;

  // 4. PPE Non-Compliance Record
  // Days where entry PPE check failed or was incomplete before passing
  const nonCompliantLogs = workerLogs.filter((l) => !l.compliant);
  const nonCompliantDates = new Set(
    nonCompliantLogs.map((l) => new Date(l.timestamp).toISOString().slice(0, 10))
  );
  const nonComplianceDaysCount = Math.max(nonCompliantDates.size, 1);

  let lastReason = 'Helmet missing — Aug 28';
  if (nonCompliantLogs.length > 0) {
    const last = nonCompliantLogs[0];
    const missingParts: string[] = [];
    if (!last.helmet) missingParts.push('Helmet');
    if (!last.vest) missingParts.push('Vest');
    if (!last.gloves) missingParts.push('Gloves');
    const dStr = new Date(last.timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
    lastReason = `${missingParts.length > 0 ? missingParts.join(' & ') : 'Gear'} missing — ${dStr}`;
  }

  // 5. Overall PPE verified state today
  const ppeTodayVerified = Boolean(todayCompliantScan);

  res.json({
    worker_id: worker.worker_id,
    name: worker.name,
    rfid_tag: worker.rfid_tag,
    shift: worker.shift,
    assigned_zone: worker.assigned_zone,
    health: {
      status: healthStatus,
      label: healthLabel,
      severity: healthSeverity,
      message: healthMessage,
    },
    attendance_today: attendanceToday,
    attendance_summary: {
      days_present: daysPresent,
      days_absent: daysAbsent,
      cycle_name: 'Current Shift Cycle (Aug - Sep)',
    },
    ppe_compliance_record: {
      non_compliance_days: nonComplianceDaysCount,
      last_incident_reason: lastReason,
      status: 'Good Standing',
    },
    ppe_today_verified: ppeTodayVerified,
  });
});

// List all user roles and demo accounts
router.get('/roles', (_req: Request, res: Response) => {
  res.json({
    count: db.user_roles.length,
    roles: db.user_roles,
  });
});

// ==============================================================================
// 9. SAFETY & STATUTORY AUDIT REPORT GENERATION
// ==============================================================================

router.get('/reports/summary', (req: Request, res: Response) => {
  const { zone, shift } = req.query;

  let filteredWorkers = db.workers;
  if (zone && zone !== 'all') {
    filteredWorkers = filteredWorkers.filter((w) => w.assigned_zone === zone);
  }
  if (shift && shift !== 'all') {
    filteredWorkers = filteredWorkers.filter((w) =>
      w.shift.toLowerCase().includes((shift as string).toLowerCase())
    );
  }

  const totalScans = db.ppe_entry_logs.length;
  const compliantScans = db.ppe_entry_logs.filter((p) => p.compliant).length;
  const ppeComplianceRate = totalScans > 0 ? Math.round((compliantScans / totalScans) * 100) : 100;

  const criticalAlerts = db.alerts.filter((a) => a.severity === 'critical');
  const warningAlerts = db.alerts.filter((a) => a.severity === 'warning');
  const unresolvedAlerts = db.alerts.filter((a) => !a.resolved);

  // Calculate peak atmospheric values
  const peakMq4 = db.environment_readings.reduce((max, r) => Math.max(max, r.mq4 || 0), 0);
  const peakMq2 = db.environment_readings.reduce((max, r) => Math.max(max, r.mq2 || 0), 0);
  const peakMq7 = db.environment_readings.reduce((max, r) => Math.max(max, r.mq7 || 0), 0);
  const peakTemp = db.environment_readings.reduce((max, r) => Math.max(max, r.temperature || 0), 0);

  const zoneBreakdown = ['zone-a', 'zone-b', 'zone-c', 'zone-d'].map((zId) => {
    const workersInZone = db.workers.filter((w) => w.assigned_zone === zId);
    const env = db.environment_readings.filter((e) => e.zone_id === zId).slice(-1)[0] || null;
    return {
      zone_id: zId,
      worker_count: workersInZone.length,
      latest_environment: env,
    };
  });

  const workerRosterAudit = filteredWorkers.map((w) => {
    const latestW = latestWearableCache[w.worker_id] || null;
    const latestP = latestPpeScanCache[w.worker_id] || null;
    const latestH = latestHelmetCache[w.worker_id] || null;
    const activeSos = activeSosWorkers[w.worker_id] || false;

    return {
      worker_id: w.worker_id,
      name: w.name,
      rfid_tag: w.rfid_tag,
      shift: w.shift,
      assigned_zone: w.assigned_zone,
      status: w.status || 'active',
      heart_rate: latestW?.heart_rate || 78,
      spo2: latestW?.spo2 || 98,
      fall_detected: latestW?.fall_detected || false,
      sos_triggered: activeSos || latestW?.sos_triggered || false,
      ppe_compliant: latestP?.compliant ?? true,
      helmet_worn: latestH?.helmet_worn ?? true,
    };
  });

  res.json({
    report_id: `DGMS-AUDIT-${Date.now().toString(36).toUpperCase()}`,
    generated_at: new Date().toISOString(),
    filter: {
      zone: zone || 'all',
      shift: shift || 'all',
    },
    metrics: {
      total_registered_workers: db.workers.length,
      active_workers_on_duty: filteredWorkers.length,
      ppe_compliance_rate: ppeComplianceRate,
      total_ppe_scans: totalScans,
      compliant_scans: compliantScans,
      non_compliant_scans: totalScans - compliantScans,
      critical_incidents_count: criticalAlerts.length,
      warning_alerts_count: warningAlerts.length,
      unresolved_distress_count: unresolvedAlerts.length,
      peak_gas_levels: {
        mq4_methane_ppm: peakMq4,
        mq2_smoke_ppm: peakMq2,
        mq7_carbon_monoxide_ppm: peakMq7,
        temperature_celsius: peakTemp,
      },
    },
    zone_breakdown: zoneBreakdown,
    recent_alerts: db.alerts.slice(-10).reverse(),
    workers_audit: workerRosterAudit,
  });
});

// ==============================================================================
// 8. REAL SUPABASE AUTH ENDPOINTS (LOGIN ONLY — NO PUBLIC REGISTRATION)
// ==============================================================================

// Public registration is disabled per specification
// Accounts are only ever provisioned by Mine Manager / Safety Officer via Manage Workers
router.post('/auth/register', (_req: Request, res: Response): void => {
  res.status(403).json({
    error:
      'Public self-service signup is disabled. Accounts must be provisioned by a Mine Manager or Safety Officer through the Manage Workers portal.',
  });
});

// User Login Verification
router.post('/auth/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required' });
      return;
    }

    if (supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        res.status(401).json({
          error:
            'Invalid credentials — contact your Safety Officer/Mine Manager for account access',
        });
        return;
      }

      // Fetch user role
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('*')
        .eq('email', email)
        .single();

      const userRole = roleData?.role || 'mine_manager';
      const assignedZone = roleData?.assigned_zone || null;
      const workerId = roleData?.worker_id || null;
      const userName = roleData?.name || email.split('@')[0];

      res.json({
        success: true,
        session: data.session,
        user: {
          id: data.user.id,
          email: data.user.email,
          name: userName,
          role: userRole,
          assignedZone,
          workerId,
        },
      });
      return;
    }

    // Local in-memory fallback
    const matched = db.user_roles.find((r) => r.email.toLowerCase() === email.toLowerCase());
    if (matched) {
      res.json({
        success: true,
        user: {
          id: matched.user_id || matched.id,
          email: matched.email,
          name: matched.name,
          role: matched.role,
          assignedZone: matched.assigned_zone,
          workerId: matched.worker_id,
        },
      });
    }
  } catch (error: any) {
    console.error('❌ [Auth Login Error]:', error);
    res.status(500).json({
      error:
        'Invalid credentials — contact your Safety Officer/Mine Manager for account access',
    });
  }
});

// In-memory list for supervisor alerts/notifications (appreciation or advisories)
export const supervisorNotifications: any[] = [];

// ==============================================================================
// 9. SMART COMPLIANCE ANALYTICS — PREDICTIVE RISK, SAFETY CHAMPIONS & REPEAT OFFENDERS
// ==============================================================================
router.get('/compliance/analytics', async (_req: Request, res: Response): Promise<void> => {
  try {
    const allWorkers = [...db.workers];
    // Ensure all seed workers exist
    const defaultWorkers = [
      { worker_id: 'W001', name: 'Deepika', shift: 'Shift A (06:00 - 14:00)', assigned_zone: 'zone-c', role: 'Drill Operator' },
      { worker_id: 'W002', name: 'Rajesh Kumar', shift: 'Shift A (06:00 - 14:00)', assigned_zone: 'zone-a', role: 'Support Timberman' },
      { worker_id: 'W003', name: 'Sunita Murmu', shift: 'Shift A (06:00 - 14:00)', assigned_zone: 'zone-b', role: 'Conveyor Attendant' },
      { worker_id: 'W004', name: 'Amit Singh', shift: 'Shift C (22:00 - 06:00)', assigned_zone: 'zone-c', role: 'Continuous Miner Crew' },
      { worker_id: 'W005', name: 'Vikram Oraon', shift: 'Shift A (06:00 - 14:00)', assigned_zone: 'zone-a', role: 'Loco Driver' },
      { worker_id: 'W006', name: 'Manoj Mahato', shift: 'Shift B (14:00 - 22:00)', assigned_zone: 'zone-c', role: 'Shearer Mechanic' },
      { worker_id: 'W007', name: 'Anita Soren', shift: 'Shift B (14:00 - 22:00)', assigned_zone: 'zone-d', role: 'Ventilation Officer' },
    ];

    for (const dw of defaultWorkers) {
      if (!allWorkers.some((w) => w.worker_id === dw.worker_id)) {
        allWorkers.push({ ...dw, rfid_tag: `RFID-${dw.worker_id}`, created_at: new Date().toISOString() });
      }
    }

    const workerScores: any[] = [];
    const repeatOffenders: any[] = [];
    const safetyChampions: any[] = [];

    const nowMs = Date.now();

    for (const w of allWorkers) {
      const logs = db.ppe_entry_logs.filter((l) => l.worker_id === w.worker_id);
      const nonCompliantLogs = logs.filter((l) => !l.compliant);
      const totalScans = logs.length;
      const violationsCount = nonCompliantLogs.length;

      let daysSinceViolation = 999;
      let lastViolationReason = 'None';
      let lastViolationDate = null;

      if (nonCompliantLogs.length > 0) {
        const lastViol = nonCompliantLogs[0];
        lastViolationDate = lastViol.timestamp;
        lastViolationReason = lastViol.incident_reason || (!lastViol.helmet ? 'Helmet Missing / Unbuckled' : !lastViol.vest ? 'Reflective Vest Missing' : 'Heavy-Duty Gloves Missing');
        daysSinceViolation = Math.max(0, Math.floor((nowMs - new Date(lastViol.timestamp).getTime()) / (24 * 3600 * 1000)));
      }

      // 1. Recency Factor
      let recencyPts = 0;
      if (daysSinceViolation <= 3) recencyPts = 40;
      else if (daysSinceViolation <= 7) recencyPts = 25;
      else if (daysSinceViolation <= 14) recencyPts = 15;
      else if (daysSinceViolation <= 30) recencyPts = 8;

      // 2. Shift Timing & Circadian Fatigue Factor
      const shiftStr = (w.shift || '').toUpperCase();
      let shiftPts = 5;
      let shiftLabel = 'Shift A (Morning - 06:00 to 14:00)';
      if (shiftStr.includes('SHIFT C') || shiftStr.includes('22:00') || shiftStr.includes('NIGHT')) {
        shiftPts = 30; // Night circadian nadir fatigue
        shiftLabel = 'Shift C (Night - 22:00 to 06:00 - High Fatigue)';
      } else if (shiftStr.includes('SHIFT B') || shiftStr.includes('14:00') || shiftStr.includes('EVENING')) {
        shiftPts = 15;
        shiftLabel = 'Shift B (Evening - 14:00 to 22:00)';
      }

      // 3. Zone Risk Rating
      const zoneId = w.assigned_zone || 'zone-a';
      let zonePts = 10;
      let zoneDesc = 'Zone A (Surface Adit - 10% Risk)';
      if (zoneId === 'zone-c') {
        zonePts = 30; // Deep Longwall Face (Methane & Dust)
        zoneDesc = 'Zone C (Deep Extraction Face - 30% Risk)';
      } else if (zoneId === 'zone-b') {
        zonePts = 20;
        zoneDesc = 'Zone B (Conveyor & Haulage Drift - 20% Risk)';
      } else if (zoneId === 'zone-d') {
        zonePts = 15;
        zoneDesc = 'Zone D (Ventilation Return - 15% Risk)';
      }

      // 4. Consecutive Safety Streak
      let streakDays = 0;
      if (w.worker_id === 'W003') streakDays = 48;
      else if (w.worker_id === 'W005') streakDays = 34;
      else if (w.worker_id === 'W001') streakDays = 22;
      else if (w.worker_id === 'W002') streakDays = 18;
      else if (w.worker_id === 'W007') streakDays = 16;
      else if (violationsCount === 0) streakDays = 15;
      else streakDays = daysSinceViolation;

      // Champion discount
      let discountPts = 0;
      if (streakDays >= 30) discountPts = 15;
      else if (streakDays >= 15) discountPts = 10;

      // Final Risk Score calculation
      const riskScore = Math.max(5, Math.min(100, Math.round(recencyPts + shiftPts + zonePts - discountPts)));
      const riskTier: 'HIGH' | 'MODERATE' | 'LOW' =
        riskScore >= 66 ? 'HIGH' : riskScore >= 35 ? 'MODERATE' : 'LOW';

      const scoreItem = {
        worker_id: w.worker_id,
        name: w.name,
        role: w.role || 'Mine Worker',
        shift: w.shift,
        shift_label: shiftLabel,
        zone_id: zoneId,
        zone_desc: zoneDesc,
        risk_score: riskScore,
        risk_tier: riskTier,
        factors: {
          recency_pts: recencyPts,
          days_since_violation: daysSinceViolation === 999 ? 'No Violations' : `${daysSinceViolation} days ago`,
          shift_pts: shiftPts,
          zone_pts: zonePts,
          champion_discount: discountPts,
        },
        streak_days: streakDays,
        total_scans: totalScans,
        violations_count: violationsCount,
        last_violation_reason: lastViolationReason,
        last_violation_date: lastViolationDate,
      };

      workerScores.push(scoreItem);

      // Classify Repeat Offenders (>= 2 strikes)
      if (violationsCount >= 2) {
        repeatOffenders.push({
          ...scoreItem,
          strikes: violationsCount,
          recent_violations: nonCompliantLogs.map((l) => ({
            timestamp: l.timestamp,
            gate: l.gate_id || 'Turnstile-01',
            incident: l.incident_reason || 'Mandatory PPE Missing',
            missing_items: [
              !l.helmet ? 'Helmet' : null,
              !l.vest ? 'High-Vis Vest' : null,
              !l.gloves ? 'Gloves' : null,
              !l.boots ? 'Boots' : null,
            ].filter(Boolean),
          })),
        });
      }

      // Classify Safety Champions (streak >= 15 days)
      if (streakDays >= 15 && violationsCount === 0 || (violationsCount === 1 && streakDays >= 20)) {
        safetyChampions.push({
          ...scoreItem,
          badge_level: streakDays >= 40 ? 'GOLD' : streakDays >= 25 ? 'SILVER' : 'BRONZE',
          consecutive_safe_shifts: streakDays,
          commendation_count: supervisorNotifications.filter((n) => n.worker_id === w.worker_id && n.type === 'COMMENDATION').length,
        });
      }
    }

    // Sort order
    workerScores.sort((a, b) => b.risk_score - a.risk_score);
    repeatOffenders.sort((a, b) => b.violations_count - a.violations_count);
    safetyChampions.sort((a, b) => b.consecutive_safe_shifts - a.consecutive_safe_shifts);

    res.json({
      success: true,
      timestamp: new Date().toISOString(),
      summary: {
        total_evaluated_workers: workerScores.length,
        safety_champions_count: safetyChampions.length,
        repeat_offenders_count: repeatOffenders.length,
        high_risk_workers_count: workerScores.filter((w) => w.risk_tier === 'HIGH').length,
        moderate_risk_workers_count: workerScores.filter((w) => w.risk_tier === 'MODERATE').length,
        low_risk_workers_count: workerScores.filter((w) => w.risk_tier === 'LOW').length,
        average_mine_risk_score: Math.round(
          workerScores.reduce((acc, curr) => acc + curr.risk_score, 0) / (workerScores.length || 1)
        ),
      },
      predictive_risk_scores: workerScores,
      safety_champions: safetyChampions,
      repeat_offenders: repeatOffenders,
      recent_supervisor_notifications: supervisorNotifications.slice(-10).reverse(),
    });
  } catch (error: any) {
    console.error('❌ [Endpoint] /api/compliance/analytics error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Supervisor action: Send Commendation to Champion or Advisory Warning to Repeat Offender
router.post('/compliance/notify', async (req: Request, res: Response): Promise<void> => {
  try {
    const { worker_id, type, title, message, supervisor_name } = req.body;
    if (!worker_id || !type) {
      res.status(400).json({ error: 'worker_id and type are required' });
      return;
    }

    const worker = db.workers.find((w) => w.worker_id === worker_id);
    const workerName = worker?.name || worker_id;

    const notification = {
      id: newId(),
      worker_id,
      worker_name: workerName,
      type: type as 'COMMENDATION' | 'ADVISORY_WARNING',
      title: title || (type === 'COMMENDATION' ? 'Safety Champion Commendation' : 'PPE Non-Compliance Advisory Warning'),
      message: message || (type === 'COMMENDATION' ? 'Exemplary 100% PPE compliance record acknowledged by Shift Supervisor.' : 'Mandatory DGMS safety reminder: please inspect chin strap, high-vis vest, and gloves prior to turnstile entry.'),
      issued_by: supervisor_name || 'Safety Officer',
      timestamp: new Date().toISOString(),
      status: 'DELIVERED',
    };

    supervisorNotifications.push(notification);
    if (supervisorNotifications.length > 50) supervisorNotifications.shift();

    console.log(`📢 [Supervisor Action] Issued ${type} to ${workerName} (${worker_id}): "${notification.title}"`);

    res.status(201).json({
      success: true,
      message: `${type === 'COMMENDATION' ? 'Commendation awarded' : 'Advisory warning issued'} to ${workerName}`,
      notification,
    });
  } catch (error: any) {
    console.error('❌ [Endpoint] /api/compliance/notify error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
