export type PpePart = 'helmet' | 'vest' | 'boots' | 'gloves';

export interface PpeStatus {
  helmet: boolean;
  vest: boolean;
  boots: boolean;
  gloves: boolean;
}

export type WorkerSafetyStatus = 'safe' | 'attention' | 'critical';

export interface WorkerVitals {
  heartRate: number;
  heartRateStatus: 'normal' | 'elevated' | 'critical';
  spo2: number; // Blood Oxygen Saturation % (e.g. 98)
  gasLevel: 'safe' | 'warning' | 'danger';
  movement: 'active' | 'stationary' | 'fall';
  batteryLevel: number;
  loraSignal: 'strong' | 'moderate' | 'weak';
  lastUpdate: string;
}

export interface AttendanceRecord {
  date: string;
  shift: string;
  checkIn: string;
  checkOut: string;
  status: 'Completed' | 'In-Progress' | 'Flagged';
  ppeScore: number;
}

export interface WorkerComplianceProfile {
  consecutiveCompliantShifts: number;
  isSafetyChampion: boolean;
  championAwardDate?: string;
  commendationCount: number;
  recentViolationsCount: number; // violations in past 14 days
  isRepeatOffender: boolean;
  escalationStatus: 'Nominal' | 'Escalated to Safety Officer' | 'Mandatory Retraining Required';
  totalTurnstileLockouts: number;
  badges: string[];
}

export type NotificationChannel = 'SMS' | 'EMAIL' | 'IN_APP_PUSH';

export type NotificationType =
  | 'CRITICAL_BREACH_ALERT'
  | 'REPEAT_OFFENDER_WARNING'
  | 'SAFETY_CHAMPION_COMMENDATION'
  | 'STATUTORY_DAILY_DIGEST'
  | 'MONTHLY_DGMS_SUMMARY'
  | 'EMERGENCY_EVACUATION_BROADCAST'
  | 'GAS_HAZARD_WARNING'
  | 'MANDATORY_RETRAINING_SUMMONS'
  | 'CUSTOM_DIRECT_DISPATCH';

export interface NotificationDispatch {
  id: string;
  timestamp: string;
  channel: NotificationChannel;
  recipientName: string;
  recipientRole: string;
  recipientContact: string; // phone or email
  type: NotificationType;
  subject: string;
  message: string;
  status: 'DELIVERED' | 'SENT' | 'FAILED';
  workerId?: string;
  zoneId?: string;
}

export interface AutomatedSafetyRule {
  id: string;
  name: string;
  description: string;
  triggerEvent: string;
  channel: NotificationChannel;
  targetRole: string;
  templateSubject: string;
  enabled: boolean;
  triggersCount: number;
  lastTriggered?: string;
}

export interface Worker {
  id: string;
  rfid: string;
  name: string;
  role: string;
  shift: string;
  wearableId: string;
  avatarUrl?: string;
  zoneId: 'zone-a' | 'zone-b' | 'zone-c' | 'zone-d';
  status: WorkerSafetyStatus;
  entryTime: string;
  faceVerified: boolean;
  rfidVerified: boolean;
  ppeStatus: PpeStatus;
  vitals: WorkerVitals;
  attendanceHistory: AttendanceRecord[];
  ppeComplianceRate: number;
  complianceProfile?: WorkerComplianceProfile;
  coordinates: [number, number, number]; // 3D coordinates in mine digital twin
}

export interface Zone {
  id: 'zone-a' | 'zone-b' | 'zone-c' | 'zone-d';
  name: string;
  shortCode: string;
  depth: string;
  temperature: string;
  airflow: string;
  environmentalStatus: 'safe' | 'warning' | 'critical';
  activeWorkersCount: number;
  coordinates: [number, number, number];
  color: string;
}

export interface EnvironmentTelemetry {
  zone_id: 'zone-a' | 'zone-b' | 'zone-c' | 'zone-d';
  mq2: number;     // Smoke / LPG / Aerosols (ppm)
  mq4: number;     // Methane (CH4) (ppm)
  mq7: number;     // Carbon Monoxide (CO) (ppm)
  mq9: number;     // Flammable gas
  mq135: number;   // General Air Quality
  temperature: number; // °C
  flame_detected: boolean;
  timestamp: string;
}

export type AlertType = 'ppe' | 'gas' | 'fall' | 'health' | 'sos' | 'system';
export type AlertSeverity = 'info' | 'warning' | 'critical';

export interface SafetyAlert {
  id: string;
  workerId?: string;
  workerName?: string;
  zoneId: 'zone-a' | 'zone-b' | 'zone-c' | 'zone-d';
  zoneName: string;
  type: AlertType;
  severity: AlertSeverity;
  title: string;
  description: string;
  timestamp: string;
  acknowledged: boolean;
  coordinates?: [number, number, number];
}

export type ConnectionState = 'connected' | 'disconnected' | 'connecting';

export interface BackendConnection {
  state: ConnectionState;
  source: string; // 'Supabase Realtime' | 'Express API' | 'Local Simulator'
  latencyMs: number;
  lastPing: string;
}
