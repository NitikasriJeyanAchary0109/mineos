export interface PpeScanPayload {
  worker_id: string;
  worker_name: string;
  helmet: boolean;
  vest: boolean;
  gloves: boolean;
  timestamp: string;
}

export interface EnvironmentPayload {
  zone_id: string;
  mq2: number;
  mq4: number;
  mq9: number;
  mq135: number;
  mq7: number;
  temperature: number;
  flame_detected: boolean;
  timestamp: string;
}

export interface WearablePayload {
  worker_id: string;
  worker_name: string;
  heart_rate: number;
  spo2: number;
  mpu6050: {
    accel_x: number;
    accel_y: number;
    accel_z: number;
    fall_detected: boolean;
  };
  sos_triggered: boolean;
  timestamp: string;
}

export interface HelmetStatusPayload {
  worker_id: string;
  worker_name: string;
  helmet_worn: boolean;
  timestamp: string;
}

export interface AlertInsert {
  worker_id?: string | null;
  worker_name?: string | null;
  zone_id?: string | null;
  type: 'ppe' | 'gas' | 'fall' | 'health' | 'sos' | 'system';
  severity: 'info' | 'warning' | 'critical';
  message: string;
  timestamp: string;
  resolved?: boolean;
}
