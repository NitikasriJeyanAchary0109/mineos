import {
  NotificationDispatch,
  NotificationChannel,
  NotificationType,
  AutomatedSafetyRule,
} from '../types/safety';

const STORAGE_KEY = 'msafe_statutory_notifications_outbox';
const RULES_STORAGE_KEY = 'msafe_automated_safety_rules';

const DEFAULT_RULES: AutomatedSafetyRule[] = [
  {
    id: 'rule-gas-breach',
    name: 'Critical Multi-Gas Threshold Breach',
    description: 'Auto-broadcast SMS and Priority App Push when CH4 > 300 ppm or CO > 35 ppm in any subterranean zone.',
    triggerEvent: 'ATMOSPHERIC_GAS_THRESHOLD_EXCEEDED',
    channel: 'SMS',
    targetRole: 'Shift In-Charge & Mine Safety Director',
    templateSubject: 'CRITICAL: Multi-Gas Atmospheric Breach in Zone',
    enabled: true,
    triggersCount: 3,
    lastTriggered: '14:28 IST (Zone C)',
  },
  {
    id: 'rule-imu-fall-sos',
    name: 'Man-Down / 6-Axis IMU Fall Detected',
    description: 'Auto-dispatch SMS and Push notification to Emergency Rescue Squad when miner fall or SOS distress is triggered.',
    triggerEvent: 'WORKER_IMU_FALL_OR_SOS',
    channel: 'IN_APP_PUSH',
    targetRole: 'Emergency Rescue Team & Shift In-Charge',
    templateSubject: 'EMERGENCY: Miner Distress / Impact Alert',
    enabled: true,
    triggersCount: 1,
    lastTriggered: '06:20 IST (Sunil Marandi)',
  },
  {
    id: 'rule-champion-streak',
    name: 'Safety Champion Milestone Commendation',
    description: 'Auto-award DGMS Safety Exemplar Badge and dispatch celebratory SMS when a miner completes 30 consecutive zero-violation shifts.',
    triggerEvent: 'COMPLIANCE_STREAK_30_SHIFTS',
    channel: 'SMS',
    targetRole: 'Qualifying Underground Coal Miner',
    templateSubject: 'Mine Safety Champion Recognition',
    enabled: true,
    triggersCount: 5,
    lastTriggered: 'Yesterday 14:00 IST',
  },
  {
    id: 'rule-repeat-offender',
    name: 'Repeat Safety Non-Compliance Warning',
    description: 'Auto-issue formal warning notice via SMS citing DGMS Coal Mines Regulations 1957 when >=2 violations occur in 14 days.',
    triggerEvent: 'RECURRENT_NON_COMPLIANCE_DETECTED',
    channel: 'SMS',
    targetRole: 'Non-Compliant Miner & Shift In-Charge',
    templateSubject: 'Statutory Safety Warning Notice',
    enabled: true,
    triggersCount: 2,
    lastTriggered: '14:28 IST (Sunil Marandi)',
  },
  {
    id: 'rule-daily-digest',
    name: 'Statutory Shift Safety Handover Digest',
    description: 'Auto-dispatch comprehensive DGMS Form IV safety audit digest via Email to Mine General Manager and Regional DGMS Inspector.',
    triggerEvent: 'SHIFT_CHANGE_HANDOVER_COMPLETED',
    channel: 'EMAIL',
    targetRole: 'Mine General Manager & DGMS Inspector',
    templateSubject: 'DGMS Statutory Safety Audit Digest',
    enabled: true,
    triggersCount: 14,
    lastTriggered: '06:05 IST (Shift A Handover)',
  },
];

const DEFAULT_DISPATCHES: NotificationDispatch[] = [
  {
    id: 'notif-101',
    timestamp: '14:28:15 IST',
    channel: 'SMS',
    recipientName: 'Sunil Marandi',
    recipientRole: 'Continuous Haulage Driver',
    recipientContact: '+91 98721-44109',
    type: 'CRITICAL_BREACH_ALERT',
    subject: 'DGMS Safety Alert: Missing Steel-Toe Boots',
    message:
      'CRITICAL: Safety inspection flag in Zone C (Deep Longwall Face). Steel-toe boots missing during continuous haulage operation. Immediate compliance required under DGMS Coal Mines Regulations 1957.',
    status: 'DELIVERED',
    workerId: 'WM-6288',
    zoneId: 'zone-c',
  },
  {
    id: 'notif-102',
    timestamp: '14:28:16 IST',
    channel: 'SMS',
    recipientName: 'Ashok Varma (Shift In-Charge)',
    recipientRole: 'Shift In-Charge (Shift A)',
    recipientContact: '+91 94311-88204',
    type: 'REPEAT_OFFENDER_WARNING',
    subject: 'Escalation Notice: Recurrent Safety Non-Compliance',
    message:
      'Worker Sunil Marandi (WM-6288) logged 2nd PPE safety violation in 14 days. Incident escalated to Safety Officer for mandatory DGMS refresher training scheduling.',
    status: 'DELIVERED',
    workerId: 'WM-6288',
    zoneId: 'zone-c',
  },
  {
    id: 'notif-103',
    timestamp: '12:00:00 IST',
    channel: 'SMS',
    recipientName: 'Devendra Sharma',
    recipientRole: 'Haulage Locomotive Driver',
    recipientContact: '+91 98352-19021',
    type: 'SAFETY_CHAMPION_COMMENDATION',
    subject: 'Congratulations: DGMS Safety Exemplar Milestone',
    message:
      'Commendation: You have achieved 38 consecutive subterranean shifts with 100% PPE compliance! DGMS Safety Exemplar Badge awarded. Thank you for championing subterranean zero-harm.',
    status: 'DELIVERED',
    workerId: 'WM-9021',
    zoneId: 'zone-a',
  },
  {
    id: 'notif-104',
    timestamp: '06:05:00 IST',
    channel: 'EMAIL',
    recipientName: 'Director K. V. Rao',
    recipientRole: 'Mine General Manager',
    recipientContact: 'kv.rao@jharia-mines.in',
    type: 'STATUTORY_DAILY_DIGEST',
    subject: 'DGMS Statutory Form IV Safety Audit Digest — Shift A Handover',
    message:
      'Daily Subterranean Safety Summary: 7 Active Personnel, 98.4% PPE Compliance, Nominal Gas levels (CH4 <250 ppm, CO <5 ppm). Official DGMS Form IV statutory log archive attached.',
    status: 'DELIVERED',
    zoneId: 'zone-a',
  },
  {
    id: 'notif-105',
    timestamp: '06:22:10 IST',
    channel: 'IN_APP_PUSH',
    recipientName: 'Subterranean Control Room',
    recipientRole: 'Mine Operations Team',
    recipientContact: 'Console-01 / Push Service',
    type: 'GAS_HAZARD_WARNING',
    subject: 'Environmental Advisory: Airflow Nominal in Zone D',
    message:
      'Ventilation Substation fan monitoring reports 6.2 m/s airflow velocity. All methane and carbon monoxide transponders well below DGMS threshold levels.',
    status: 'DELIVERED',
    zoneId: 'zone-d',
  },
];

class NotificationService {
  // Play realistic electronic two-tone notification dispatch chime
  public playDispatchChime(): void {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.08); // A5

      gain.gain.setValueAtTime(0.18, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } catch {
      // Audio playback non-blocking
    }
  }

  // Request browser native desktop push notification permission
  public async requestDesktopPermission(): Promise<boolean> {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return false;
    }
    if (Notification.permission === 'granted') {
      return true;
    }
    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return false;
  }

  // Send browser native desktop push notification
  public sendDesktopPush(title: string, body: string): void {
    try {
      if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
        new Notification(`[Mine OS] ${title}`, {
          body,
          icon: '/favicon.ico',
        });
      }
    } catch {
      // Non-blocking
    }
  }

  // Get all outbox dispatches
  public getOutbox(): NotificationDispatch[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_DISPATCHES));
        return DEFAULT_DISPATCHES;
      }
      return JSON.parse(data);
    } catch {
      return DEFAULT_DISPATCHES;
    }
  }

  // Dispatch a notification
  public dispatch(
    payload: Omit<NotificationDispatch, 'id' | 'timestamp' | 'status'> & {
      status?: 'DELIVERED' | 'SENT' | 'FAILED';
    }
  ): NotificationDispatch {
    const current = this.getOutbox();
    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-IN', { hour12: false }) + ' IST';

    const newDispatch: NotificationDispatch = {
      id: `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: timeStr,
      status: payload.status || 'DELIVERED',
      ...payload,
    };

    const updated = [newDispatch, ...current];
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to persist notification dispatch', e);
    }

    // Play chime & trigger native desktop push
    this.playDispatchChime();
    this.sendDesktopPush(newDispatch.subject, newDispatch.message);

    // Trigger cross-component reactive update
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('msafe_outbox_updated', { detail: newDispatch }));
    }

    return newDispatch;
  }

  // Direct Custom Dispatch
  public dispatchCustom(params: {
    recipientName: string;
    recipientRole: string;
    recipientContact: string;
    channel: NotificationChannel;
    type: NotificationType;
    subject: string;
    message: string;
    workerId?: string;
    zoneId?: string;
  }): NotificationDispatch {
    return this.dispatch(params);
  }

  // Resend existing dispatch
  public resendDispatch(id: string): NotificationDispatch | null {
    const outbox = this.getOutbox();
    const target = outbox.find((d) => d.id === id);
    if (!target) return null;

    return this.dispatch({
      channel: target.channel,
      recipientName: target.recipientName,
      recipientRole: target.recipientRole,
      recipientContact: target.recipientContact,
      type: target.type,
      subject: `[RESENT] ${target.subject}`,
      message: target.message,
      workerId: target.workerId,
      zoneId: target.zoneId,
    });
  }

  // Helper dispatchers
  public dispatchSmsBreachAlert(
    workerId: string,
    workerName: string,
    missingItems: string[],
    zone: string
  ): NotificationDispatch {
    return this.dispatch({
      channel: 'SMS',
      recipientName: workerName,
      recipientRole: 'Subterranean Miner',
      recipientContact: '+91 98721-44109',
      type: 'CRITICAL_BREACH_ALERT',
      subject: 'DGMS Safety Alert: Missing PPE Detected',
      message: `ALERT: Worker ${workerId} (${workerName}) detected in ${zone} without mandatory PPE: ${missingItems
        .join(', ')
        .toUpperCase()}. Immediate compliance required under DGMS Coal Mines Regulations 1957.`,
      workerId,
      zoneId: zone.toLowerCase().includes('zone-c') ? 'zone-c' : 'zone-a',
    });
  }

  public dispatchWarningNotice(
    workerId: string,
    workerName: string,
    reason: string
  ): NotificationDispatch {
    return this.dispatch({
      channel: 'SMS',
      recipientName: workerName,
      recipientRole: 'Subterranean Miner',
      recipientContact: '+91 98721-44109',
      type: 'REPEAT_OFFENDER_WARNING',
      subject: 'Statutory Safety Disciplinary Notice',
      message: `STATUTORY WARNING: Worker ${workerId} (${workerName}) has been flagged for recurrent safety non-compliance (${reason}). Mandatory DGMS subterranean safety refresher session scheduled.`,
      workerId,
    });
  }

  public dispatchChampionCommendation(
    workerId: string,
    workerName: string,
    streak: number
  ): NotificationDispatch {
    return this.dispatch({
      channel: 'SMS',
      recipientName: workerName,
      recipientRole: 'Safety Champion',
      recipientContact: '+91 98352-19021',
      type: 'SAFETY_CHAMPION_COMMENDATION',
      subject: 'Mine Safety Champion Recognition',
      message: `COMMENDATION: Worker ${workerId} (${workerName}) has completed ${streak} consecutive safe subterranean shifts with 100% PPE compliance! DGMS Safety Exemplar Badge awarded.`,
      workerId,
    });
  }

  public dispatchEmailDigest(
    period: string,
    recipientEmail: string,
    recipientRole: string,
    totalAudited: number,
    complianceRate: string
  ): NotificationDispatch {
    return this.dispatch({
      channel: 'EMAIL',
      recipientName: recipientEmail.split('@')[0].toUpperCase(),
      recipientRole,
      recipientContact: recipientEmail,
      type: period.toLowerCase().includes('month') ? 'MONTHLY_DGMS_SUMMARY' : 'STATUTORY_DAILY_DIGEST',
      subject: `DGMS Statutory Safety Audit Digest — ${period}`,
      message: `Official Subterranean Compliance Summary for ${period}: ${totalAudited} personnel audited, ${complianceRate}% overall PPE compliance rate. Zero fatalities. Official DGMS Form IV compliance sheet attached.`,
    });
  }

  public dispatchEvacuationBroadcast(zone: string, reason: string): NotificationDispatch {
    return this.dispatch({
      channel: 'SMS',
      recipientName: 'All Underground Personnel & Shift Supervisors',
      recipientRole: 'Subterranean Workforce',
      recipientContact: 'BROADCAST (+91 94311-88204)',
      type: 'EMERGENCY_EVACUATION_BROADCAST',
      subject: `EMERGENCY EVACUATION ORDER: ${zone.toUpperCase()}`,
      message: `URGENT DGMS ORDER: Immediate evacuation ordered for ${zone} due to ${reason}. Follow primary intake drift haulage routes toward Hoist Shaft #4 immediately.`,
      zoneId: zone.toLowerCase().includes('zone-c') ? 'zone-c' : 'zone-a',
    });
  }

  // Automated Safety Rules Management
  public getRules(): AutomatedSafetyRule[] {
    try {
      const data = localStorage.getItem(RULES_STORAGE_KEY);
      if (!data) {
        localStorage.setItem(RULES_STORAGE_KEY, JSON.stringify(DEFAULT_RULES));
        return DEFAULT_RULES;
      }
      return JSON.parse(data);
    } catch {
      return DEFAULT_RULES;
    }
  }

  public toggleRule(ruleId: string): AutomatedSafetyRule[] {
    const rules = this.getRules();
    const updated = rules.map((r) => {
      if (r.id === ruleId) {
        return { ...r, enabled: !r.enabled };
      }
      return r;
    });
    try {
      localStorage.setItem(RULES_STORAGE_KEY, JSON.stringify(updated));
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('msafe_rules_updated'));
      }
    } catch (e) {
      console.error(e);
    }
    return updated;
  }

  public triggerRule(ruleId: string): NotificationDispatch | null {
    const rules = this.getRules();
    const rule = rules.find((r) => r.id === ruleId);
    if (!rule) return null;

    // Increment count & timestamp
    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-IN', { hour12: false }) + ' IST';
    const updatedRules = rules.map((r) => {
      if (r.id === ruleId) {
        return { ...r, triggersCount: r.triggersCount + 1, lastTriggered: timeStr };
      }
      return r;
    });
    localStorage.setItem(RULES_STORAGE_KEY, JSON.stringify(updatedRules));

    // Dispatch rule notification
    return this.dispatch({
      channel: rule.channel,
      recipientName: rule.targetRole,
      recipientRole: 'Statutory Safety Recipient',
      recipientContact: rule.channel === 'SMS' ? '+91 94311-88204' : 'safety-officer@jharia-mines.in',
      type: 'CUSTOM_DIRECT_DISPATCH',
      subject: `[AUTO-RULE TRIGGERED] ${rule.templateSubject}`,
      message: `AUTOMATED SAFETY RULE "${rule.name}": Event ${rule.triggerEvent} satisfied. Protocol notification dispatched under DGMS Subterranean Safety Framework.`,
    });
  }

  // Export Outbox to CSV
  public exportOutboxCsv(): void {
    const dispatches = this.getOutbox();
    const headers = ['ID', 'Timestamp', 'Channel', 'Recipient Name', 'Role', 'Contact', 'Type', 'Subject', 'Message', 'Status'];
    const rows = dispatches.map((d) => [
      d.id,
      `"${d.timestamp}"`,
      d.channel,
      `"${d.recipientName}"`,
      `"${d.recipientRole}"`,
      `"${d.recipientContact}"`,
      d.type,
      `"${d.subject.replace(/"/g, '""')}"`,
      `"${d.message.replace(/"/g, '""')}"`,
      d.status,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Mine_OS_Notification_Outbox_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // Clear outbox
  public clearOutbox(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_DISPATCHES));
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('msafe_outbox_updated'));
      }
    } catch (e) {
      console.error(e);
    }
  }
}

export const notificationService = new NotificationService();
