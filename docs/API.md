# MineOS Ingestion API Specification

This document provides technical reference specifications for edge devices (Nvidia Jetson AI, ESP32 smart wearables, MQ multi-gas sensor nodes) communicating with the **MineOS** real-time ingestion server.

---

## Base URL
```
http://<host>:3001/api
```

---

## 1. Edge Turnstile PPE Scan
Inspects worker equipment compliance at shaft portal turnstiles prior to entry.

- **Endpoint:** `POST /api/entry/ppe-scan`
- **Content-Type:** `application/json`

### Request Body
```json
{
  "worker_id": "WM-8492",
  "worker_name": "Vikram Nayak",
  "helmet": true,
  "vest": true,
  "gloves": true,
  "boots": true,
  "gate_id": "Turnstile-01",
  "geo_location": "Portal 01 Incline Shaft [23.795°N, 86.430°E]"
}
```

### Response (`200 OK`)
```json
{
  "status": "success",
  "compliant": true,
  "access_granted": true,
  "missing_gear": [],
  "log_id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
  "timestamp": "2026-10-20T14:30:00.000Z"
}
```

---

## 2. Wearable Worker Biometrics & IMU
Ingests continuous vitals, MPU6050 6-axis acceleration, fall flags, and emergency SOS triggers from ESP32 wearable hubs.

- **Endpoint:** `POST /api/sensors/wearable`
- **Content-Type:** `application/json`

### Request Body
```json
{
  "worker_id": "WM-6288",
  "heart_rate": 84,
  "spo2": 98,
  "body_temp": 36.8,
  "mpu6050": {
    "accel_x": 0.04,
    "accel_y": 0.98,
    "accel_z": 0.12,
    "fall_detected": false
  },
  "sos_triggered": false
}
```

### Response (`200 OK`)
```json
{
  "status": "success",
  "worker_id": "WM-6288",
  "alert_generated": false,
  "buffered": false
}
```

---

## 3. Subterranean Gas & Atmospheric Grid
Ingests toxic and explosive gas concentrations, optical flame sensor readings, and ambient temperatures across designated mine sectors.

- **Endpoint:** `POST /api/sensors/environment`
- **Content-Type:** `application/json`

### Request Body
```json
{
  "zone_id": "zone-c",
  "mq2": 78,
  "mq4": 240,
  "mq7": 28,
  "mq9": 58,
  "mq135": 85,
  "temperature": 31.2,
  "flame_detected": false
}
```

### Response (`200 OK`)
```json
{
  "status": "success",
  "zone_id": "zone-c",
  "hazard_status": "nominal"
}
```

---

## 4. System Health & Buffer Status
Checks real-time connectivity between edge server, cloud persistence (Supabase), and offline queue length.

- **Endpoint:** `GET /api/health`

### Response (`200 OK`)
```json
{
  "status": "healthy",
  "system": "IRON MINDS — M-SAFE Ingestion API",
  "version": "1.0.0",
  "cloud_database": "Local In-Memory Mode",
  "supabase_configured": false,
  "buffer_queue_size": 0,
  "timestamp": "2026-10-20T14:30:00.000Z"
}
```

---

## 5. Live Telemetry Cache Snapshot
Returns current aggregated state for active workers, zone environmental readings, and recent incident alerts.

- **Endpoint:** `GET /api/readings/latest`
