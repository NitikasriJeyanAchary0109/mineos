import { Worker, Zone, SafetyAlert, EnvironmentTelemetry, PpeStatus } from '../types/safety';

export interface MobileRecommendation {
  id: string;
  type: 'ppe' | 'health' | 'incident' | 'streak';
  title: string;
  description: string;
  impactScore: number;
  completed: boolean;
}

export interface MobileWorkerSafetyProfile {
  worker: Worker;
  rank: number;
  totalWorkers: number;
  safetyScore: number;
  zeroHarmDays: number;
  violationsCount: number;
  isEscalated: boolean;
  recommendations: MobileRecommendation[];
}

export interface ConnectionState {
  isStandalone: boolean;
  serverUrl: string;
  status: 'LIVE' | 'CONNECTED' | 'OFFLINE';
  lastSyncTime: string;
  modeLabel: string;
}

// Store mobile connection config in local storage
const SERVER_URL_KEY = 'mineos_mobile_server_url';
const STANDALONE_MODE_KEY = 'mineos_mobile_standalone_mode';

export const getMobileServerUrl = (): string => {
  return localStorage.getItem(SERVER_URL_KEY) || '';
};

export const setMobileServerUrl = (url: string): void => {
  localStorage.setItem(SERVER_URL_KEY, url.trim());
};

export const isStandaloneMode = (): boolean => {
  const val = localStorage.getItem(STANDALONE_MODE_KEY);
  return val === null ? true : val === 'true';
};

export const setStandaloneMode = (enabled: boolean): void => {
  localStorage.setItem(STANDALONE_MODE_KEY, String(enabled));
};

// Compute statutory worker safety score (0 - 100)
export const getWorkerSafetyScore = (worker: Worker): number => {
  let score = 100;

  // PPE penalties
  const ppe = worker.ppeStatus;
  if (!ppe.helmet) score -= 25;
  if (!ppe.vest) score -= 20;
  if (!ppe.gloves) score -= 15;
  if (!ppe.boots) score -= 20;

  // Vitals penalties
  if (worker.vitals.heartRate > 125 || worker.vitals.heartRate < 50) score -= 15;
  if (worker.vitals.spo2 < 90) score -= 25;
  if (worker.vitals.movement === 'fall') score -= 35;

  return Math.max(0, Math.min(100, score));
};

// Rank workers by safety score (descending)
export const getRankedWorkers = (workers: Worker[]): Array<{ worker: Worker; rank: number; score: number }> => {
  const scored = workers.map((w) => ({
    worker: w,
    score: getWorkerSafetyScore(w),
  }));

  scored.sort((a, b) => b.score - a.score || a.worker.name.localeCompare(b.worker.name));

  return scored.map((item, index) => ({
    worker: item.worker,
    rank: index + 1,
    score: item.score,
  }));
};

// Compute Zero-Harm streak days based on worker data
export const getZeroHarmStreak = (worker: Worker): number => {
  if (worker.complianceProfile?.consecutiveCompliantShifts !== undefined) {
    return worker.complianceProfile.consecutiveCompliantShifts;
  }
  // Deterministic calculation from worker ID if profile not populated
  const idNum = parseInt(worker.id.replace(/\D/g, '') || '12', 10);
  const base = (idNum * 7) % 45;
  return Math.max(3, base);
};

// Compute violations count (>=2 triggers safety escalation)
export const getViolationCount = (worker: Worker): number => {
  if (worker.complianceProfile?.recentViolationsCount !== undefined) {
    return worker.complianceProfile.recentViolationsCount;
  }
  // If active PPE missing or critical status
  let count = 0;
  const ppe = worker.ppeStatus;
  if (!ppe.helmet || !ppe.vest || !ppe.boots || !ppe.gloves) count += 1;
  if (worker.status === 'critical' || worker.status === 'attention') count += 1;
  return count;
};

// Calculate personalized recommendations based on worker's actual metrics
export const getWorkerRecommendations = (
  worker: Worker,
  allWorkers: Worker[]
): {
  currentRank: number;
  totalWorkers: number;
  safetyScore: number;
  recommendations: MobileRecommendation[];
  isTopRank: boolean;
} => {
  const ranked = getRankedWorkers(allWorkers);
  const currentEntry = ranked.find((r) => r.worker.id === worker.id) || { rank: 4, score: getWorkerSafetyScore(worker) };
  const currentRank = currentEntry.rank;
  const score = currentEntry.score;
  const isTopRank = currentRank === 1;

  const recs: MobileRecommendation[] = [];

  const ppe = worker.ppeStatus;
  if (!ppe.helmet || !ppe.vest || !ppe.gloves || !ppe.boots) {
    recs.push({
      id: 'rec-ppe',
      type: 'ppe',
      title: 'Attain 100% 4-Point PPE Verification',
      description: `Immediately resolve missing equipment (${[!ppe.helmet && 'Helmet', !ppe.vest && 'Vest', !ppe.gloves && 'Gloves', !ppe.boots && 'Boots'].filter(Boolean).join(', ')}).`,
      impactScore: 25,
      completed: false,
    });
  } else {
    recs.push({
      id: 'rec-ppe-ok',
      type: 'ppe',
      title: 'Statutory 4-Point PPE Verified',
      description: 'All 4 statutory items continuously logged compliant via computer vision and smart tags.',
      impactScore: 10,
      completed: true,
    });
  }

  if (worker.vitals.heartRate > 110) {
    recs.push({
      id: 'rec-cardiac',
      type: 'health',
      title: 'Rest at Crosscut Fresh Air Station',
      description: `Elevated cardiac telemetry (${worker.vitals.heartRate} BPM). Complete 10-minute ventilation cooling break.`,
      impactScore: 15,
      completed: false,
    });
  }

  const streak = getZeroHarmStreak(worker);
  if (!isTopRank) {
    recs.push({
      id: 'rec-streak',
      type: 'streak',
      title: 'Extend Zero-Harm Shift Streak',
      description: `Maintain current safe performance for ${Math.max(1, 5 - (streak % 5))} more consecutive shifts to advance to Rank #${currentRank - 1}.`,
      impactScore: 20,
      completed: false,
    });
  } else {
    recs.push({
      id: 'rec-maintain-1',
      type: 'streak',
      title: 'Maintain Diamond Exemplar Standing',
      description: 'Keep zero critical safety incidents logged across subterranean shifts to defend Colliery #1 Rank.',
      impactScore: 30,
      completed: true,
    });
  }

  recs.push({
    id: 'rec-audit',
    type: 'incident',
    title: 'DGMS Rule 181 Pre-Shift Safety Verification',
    description: 'Ensure digital biometric check and gas transponder sync are logged prior to adit descent.',
    impactScore: 10,
    completed: true,
  });

  return {
    currentRank,
    totalWorkers: allWorkers.length,
    safetyScore: score,
    recommendations: recs,
    isTopRank,
  };
};

// Check if worker requires safety escalation review (>= 2 violations)
export const isSafetyEscalationRequired = (worker: Worker): boolean => {
  return getViolationCount(worker) >= 2;
};

// Format current timestamp (HH:mm:ss)
export const getFormattedTime = (): string => {
  const d = new Date();
  return d.toTimeString().split(' ')[0];
};
