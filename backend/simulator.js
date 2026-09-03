/**
 * ==============================================================================
 * IRON MINDS — M-SAFE HARDWARE SIMULATOR
 * Simulates continuous JSON telemetry streams from NVIDIA Jetson and sensor nodes
 * ==============================================================================
 * Usage:
 *   node backend/simulator.js
 *   API_URL=http://localhost:3001 node backend/simulator.js
 *   node backend/simulator.js --trigger-fall
 */

const API_BASE = process.env.API_URL || 'http://localhost:3001';

console.log('===============================================================');
console.log('⚡ [M-SAFE SIMULATOR] Initializing Hardware Stream Emulation');
console.log(`🎯 Target Ingestion API: ${API_BASE}`);
console.log('===============================================================');

const WORKERS = [
  { id: 'W001', name: 'Deepika', zone: 'zone-c', baseHr: 93, baseSpo2: 76 },
  { id: 'WM-8492', name: 'Vikram Nayak', zone: 'zone-c', baseHr: 74, baseSpo2: 98 },
  { id: 'WM-6288', name: 'Sunil Marandi', zone: 'zone-c', baseHr: 80, baseSpo2: 97 },
  { id: 'WM-7319', name: 'Rajesh Kumar', zone: 'zone-b', baseHr: 104 },
  { id: 'WM-5104', name: 'Amit Sengupta', zone: 'zone-d', baseHr: 68 },
  { id: 'WM-9021', name: 'Devendra Sharma', zone: 'zone-a', baseHr: 72 },
  { id: 'WM-3412', name: 'Priya Patel', zone: 'zone-b', baseHr: 76 },
];

const ZONES = [
  { id: 'zone-a', baseMq4: 110, baseMq7: 15, baseTemp: 23.5 },
  { id: 'zone-b', baseMq4: 135, baseMq7: 20, baseTemp: 26.8 },
  { id: 'zone-c', baseMq4: 240, baseMq7: 32, baseTemp: 31.2 },
  { id: 'zone-d', baseMq4: 95, baseMq7: 12, baseTemp: 28.4 },
];

let cycleCount = 0;
const triggerFallArg = process.argv.includes('--trigger-fall');

async function postJson(endpoint, data) {
  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      console.error(`❌ [HTTP ${res.status}] ${endpoint}: ${await res.text()}`);
    }
    return res.status;
  } catch (err) {
    console.warn(`⚠️ [Connection Error] Could not reach ${API_BASE}${endpoint}: ${err.message}`);
    return null;
  }
}

// 1. Wearable Stream: Every 3 seconds
async function streamWearables() {
  cycleCount++;
  // Every 10th cycle (~30s), or if flag passed, simulate a fall for Sunil Marandi
  const isFallCycle = triggerFallArg || cycleCount === 10;

  for (const w of WORKERS) {
    const isTargetFall = isFallCycle && w.id === 'WM-6288';
    const hrDelta = Math.floor(Math.random() * 7) - 3;
    const hr = isTargetFall ? 126 : Math.max(55, Math.min(130, w.baseHr + hrDelta));
    const spo2 = isTargetFall ? 94 : 97 + Math.floor(Math.random() * 3);

    const payload = {
      worker_id: w.id,
      worker_name: w.name,
      heart_rate: hr,
      spo2,
      mpu6050: {
        accel_x: isTargetFall ? 2.85 : +(Math.random() * 0.1 - 0.05).toFixed(3),
        accel_y: isTargetFall ? 3.42 : +(Math.random() * 0.1 - 0.05).toFixed(3),
        accel_z: isTargetFall ? 0.15 : +(0.95 + Math.random() * 0.1).toFixed(3),
        fall_detected: isTargetFall,
      },
      sos_triggered: false,
      timestamp: new Date().toISOString(),
    };

    if (isTargetFall) {
      console.log(`🚨 [SIMULATOR] INJECTING CRITICAL FALL EVENT FOR ${w.name} (${w.id}) in ${w.zone.toUpperCase()}!`);
    }

    await postJson('/api/sensors/wearable', payload);
  }
}

// 2. Environment Stream: Every 4 seconds
async function streamEnvironment() {
  for (const z of ZONES) {
    const mq4Delta = Math.floor(Math.random() * 20) - 10;
    const mq7Delta = Math.floor(Math.random() * 6) - 3;

    const payload = {
      zone_id: z.id,
      mq2: 45 + Math.floor(Math.random() * 15),
      mq4: Math.max(40, z.baseMq4 + mq4Delta),
      mq9: 30 + Math.floor(Math.random() * 10),
      mq135: 60 + Math.floor(Math.random() * 15),
      mq7: Math.max(5, z.baseMq7 + mq7Delta),
      temperature: +(z.baseTemp + (Math.random() * 0.8 - 0.4)).toFixed(1),
      flame_detected: false,
      timestamp: new Date().toISOString(),
    };

    await postJson('/api/sensors/environment', payload);
  }
}

// 3. Helmet Wear Check Stream: Every 8 seconds
async function streamHelmets() {
  for (const w of WORKERS) {
    const payload = {
      worker_id: w.id,
      worker_name: w.name,
      helmet_worn: true, // all workers wearing helmets
      timestamp: new Date().toISOString(),
    };
    await postJson('/api/sensors/helmet', payload);
  }
}

// 4. Entry Gate Jetson Scan: Every 20 seconds
async function streamJetsonPpeScan() {
  const sampleWorker = WORKERS[Math.floor(Math.random() * WORKERS.length)];
  const payload = {
    worker_id: sampleWorker.id,
    worker_name: sampleWorker.name,
    helmet: true,
    vest: true,
    gloves: true,
    timestamp: new Date().toISOString(),
  };
  console.log(`📹 [SIMULATOR] Jetson Camera Scan: ${sampleWorker.name} verified at Turnstile 01.`);
  await postJson('/api/entry/ppe-scan', payload);
}

// Main simulation runner loop
async function runSimulator() {
  console.log('📡 Starting continuous multi-node sensor emulation...');

  // Immediate first burst
  await streamWearables();
  await streamEnvironment();
  await streamHelmets();
  await streamJetsonPpeScan();

  // Set intervals
  setInterval(streamWearables, 3000);
  setInterval(streamEnvironment, 4000);
  setInterval(streamHelmets, 8000);
  setInterval(streamJetsonPpeScan, 20000);

  console.log('✅ Telemetry heartbeat running:');
  console.log('   - Wearables: 3s cadence (Heart Rate, SpO2, MPU6050 IMU)');
  console.log('   - Environment: 4s cadence (MQ2, MQ4 Methane, MQ7 CO, Temp)');
  console.log('   - Helmet checks: 8s cadence');
  console.log('   - Jetson Entry Scans: 20s cadence');
  console.log('   (Press Ctrl+C to terminate)');
}

runSimulator();
