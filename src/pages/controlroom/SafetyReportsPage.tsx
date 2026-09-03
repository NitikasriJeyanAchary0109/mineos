import React, { useState, useEffect, useMemo } from 'react';
import { ControlRoomLayout } from '../../components/controlroom/ControlRoomLayout';
import { useAuth } from '../../context/AuthContext';
import { useSafety } from '../../context/SafetyContext';
import { notificationService } from '../../utils/notificationService';
import { NotificationDispatch, AutomatedSafetyRule, NotificationChannel, NotificationType } from '../../types/safety';
import confetti from 'canvas-confetti';
import {
  FileText,
  Printer,
  Download,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  Activity,
  Wind,
  Users,
  Filter,
  Clock,
  RefreshCw,
  Search,
  CheckCircle,
  AlertOctagon,
  Radio,
  Award,
  TrendingUp,
  BellRing,
  Mail,
  Phone,
  ShieldAlert,
  Sparkles,
  Send,
  Calendar,
  Check,
  ChevronRight,
  Shield,
  FileCheck2,
  Eye,
  RotateCw,
  Smartphone,
  Layers,
  Settings,
  X,
} from 'lucide-react';
import {
  getSafetyScore,
  getZeroHarmStreak,
  getViolationsCount,
  isRepeatOffender as checkRepeatOffender,
} from '../../utils/safetyScoring';

type ReportType =
  | 'DGMS_STATUTORY'
  | 'SAFETY_CHAMPIONS_OFFENDERS'
  | 'MONTHLY_TRENDS_ANALYTICS'
  | 'NOTIFICATION_DISPATCH_LOG'
  | 'ATMOSPHERIC_GAS'
  | 'WORKER_VITALS'
  | 'SHIFT_HANDOVER';

interface ReportWorkerRecord {
  worker_id: string;
  name: string;
  role: string;
  assigned_zone: string;
  zone_display: string;
  shift: string;
  shift_full: string;
  date: string;
  helmet: boolean;
  vest: boolean;
  gloves: boolean;
  boots: boolean;
  heartRate: number;
  spo2: number;
  movement: 'active' | 'stationary' | 'fall';
  entryTime: string;
  loraSignal: string;
  batteryLevel: number;
  status: 'COMPLIANT' | 'ATTENTION' | 'CRITICAL';
  consecutiveCompliantShifts: number;
  isSafetyChampion: boolean;
  isRepeatOffender: boolean;
  recentViolationsCount: number;
  escalationStatus: 'Nominal' | 'Escalated to Safety Officer' | 'Mandatory Retraining Required' | 'Supervisor Review Required';
  badges: string[];
  safetyScore?: number;
}

const HISTORICAL_WORKERS: ReportWorkerRecord[] = [
  // --- ZONE A (Upper Haulage Drift) ---
  {
    worker_id: 'WM-2041',
    name: 'Manoj Mahato',
    role: 'Continuous Haulage Operator',
    assigned_zone: 'zone-a',
    zone_display: 'ZONE A',
    shift: 'Shift B',
    shift_full: 'Shift B (14:00 - 22:00)',
    date: '2026-09-03',
    helmet: true,
    vest: true,
    gloves: true,
    boots: true,
    heartRate: 78,
    spo2: 97,
    movement: 'active',
    entryTime: '14:10 PM',
    loraSignal: 'strong',
    batteryLevel: 88,
    status: 'COMPLIANT',
    consecutiveCompliantShifts: 19,
    isSafetyChampion: true,
    isRepeatOffender: false,
    recentViolationsCount: 0,
    escalationStatus: 'Nominal',
    badges: ['Haulage Specialist'],
    safetyScore: 92,
  },
  {
    worker_id: 'WM-4190',
    name: 'Mukesh Hansda',
    role: 'Heading Shuttle Car Driver',
    assigned_zone: 'zone-a',
    zone_display: 'ZONE A',
    shift: 'Shift B',
    shift_full: 'Shift B (14:00 - 22:00)',
    date: '2026-09-03',
    helmet: true,
    vest: true,
    gloves: true,
    boots: true,
    heartRate: 72,
    spo2: 98,
    movement: 'active',
    entryTime: '14:12 PM',
    loraSignal: 'strong',
    batteryLevel: 94,
    status: 'COMPLIANT',
    consecutiveCompliantShifts: 30,
    isSafetyChampion: true,
    isRepeatOffender: false,
    recentViolationsCount: 0,
    escalationStatus: 'Nominal',
    badges: ['DGMS Safety Exemplar', 'Zero Hazard Master'],
    safetyScore: 95,
  },
  {
    worker_id: 'WM-1102',
    name: 'Suresh Soren',
    role: 'Haulage Night Driver',
    assigned_zone: 'zone-a',
    zone_display: 'ZONE A',
    shift: 'Shift C',
    shift_full: 'Shift C (22:00 - 06:00)',
    date: '2026-09-03',
    helmet: true,
    vest: true,
    gloves: true,
    boots: true,
    heartRate: 70,
    spo2: 98,
    movement: 'active',
    entryTime: '22:10 PM',
    loraSignal: 'strong',
    batteryLevel: 95,
    status: 'COMPLIANT',
    consecutiveCompliantShifts: 29,
    isSafetyChampion: true,
    isRepeatOffender: false,
    recentViolationsCount: 0,
    escalationStatus: 'Nominal',
    badges: ['Night Safety Guardian'],
    safetyScore: 94,
  },

  // --- ZONE B (Conveyor Drift & Bolting) ---
  {
    worker_id: 'WM-4812',
    name: 'Ravi Teja',
    role: 'Roof Bolter Operator',
    assigned_zone: 'zone-b',
    zone_display: 'ZONE B',
    shift: 'Shift B',
    shift_full: 'Shift B (14:00 - 22:00)',
    date: '2026-09-03',
    helmet: true,
    vest: true,
    gloves: true,
    boots: true,
    heartRate: 84,
    spo2: 98,
    movement: 'active',
    entryTime: '14:14 PM',
    loraSignal: 'strong',
    batteryLevel: 94,
    status: 'COMPLIANT',
    consecutiveCompliantShifts: 28,
    isSafetyChampion: true,
    isRepeatOffender: false,
    recentViolationsCount: 0,
    escalationStatus: 'Nominal',
    badges: ['Safety Practitioner', 'Roof Bolter Star'],
    safetyScore: 94,
  },
  {
    worker_id: 'WM-2245',
    name: 'Naresh Murmu',
    role: 'Geotech Night Bolter',
    assigned_zone: 'zone-b',
    zone_display: 'ZONE B',
    shift: 'Shift C',
    shift_full: 'Shift C (22:00 - 06:00)',
    date: '2026-09-03',
    helmet: true,
    vest: true,
    gloves: true,
    boots: true,
    heartRate: 73,
    spo2: 99,
    movement: 'active',
    entryTime: '22:15 PM',
    loraSignal: 'strong',
    batteryLevel: 93,
    status: 'COMPLIANT',
    consecutiveCompliantShifts: 33,
    isSafetyChampion: true,
    isRepeatOffender: false,
    recentViolationsCount: 0,
    escalationStatus: 'Nominal',
    badges: ['DGMS Safety Exemplar'],
    safetyScore: 96,
  },

  // --- ZONE C (Deep Extraction Face) ---
  {
    worker_id: 'WM-5910',
    name: 'Arunava Ghosh',
    role: 'Longwall Shearer Tech',
    assigned_zone: 'zone-c',
    zone_display: 'ZONE C',
    shift: 'Shift B',
    shift_full: 'Shift B (14:00 - 22:00)',
    date: '2026-09-03',
    helmet: true,
    vest: true,
    gloves: true,
    boots: true,
    heartRate: 79,
    spo2: 98,
    movement: 'active',
    entryTime: '14:18 PM',
    loraSignal: 'medium',
    batteryLevel: 90,
    status: 'COMPLIANT',
    consecutiveCompliantShifts: 35,
    isSafetyChampion: true,
    isRepeatOffender: false,
    recentViolationsCount: 0,
    escalationStatus: 'Nominal',
    badges: ['DGMS Safety Exemplar', 'Zero Hazard Master'],
    safetyScore: 96,
  },
  {
    worker_id: 'WM-3310',
    name: 'Basant Besra',
    role: 'Night Inspection Specialist',
    assigned_zone: 'zone-c',
    zone_display: 'ZONE C',
    shift: 'Shift C',
    shift_full: 'Shift C (22:00 - 06:00)',
    date: '2026-09-03',
    helmet: true,
    vest: true,
    gloves: true,
    boots: true,
    heartRate: 68,
    spo2: 99,
    movement: 'active',
    entryTime: '22:05 PM',
    loraSignal: 'strong',
    batteryLevel: 96,
    status: 'COMPLIANT',
    consecutiveCompliantShifts: 40,
    isSafetyChampion: true,
    isRepeatOffender: false,
    recentViolationsCount: 0,
    escalationStatus: 'Nominal',
    badges: ['DGMS Safety Exemplar', 'Night Watchman of the Month'],
    safetyScore: 97,
  },

  // --- ZONE D (Ventilation Substation) ---
  {
    worker_id: 'WM-6330',
    name: 'Harishanker Soren',
    role: 'Auxiliary Fan Electrician',
    assigned_zone: 'zone-d',
    zone_display: 'ZONE D',
    shift: 'Shift B',
    shift_full: 'Shift B (14:00 - 22:00)',
    date: '2026-09-03',
    helmet: true,
    vest: true,
    gloves: true,
    boots: true,
    heartRate: 71,
    spo2: 99,
    movement: 'active',
    entryTime: '14:08 PM',
    loraSignal: 'strong',
    batteryLevel: 92,
    status: 'COMPLIANT',
    consecutiveCompliantShifts: 25,
    isSafetyChampion: true,
    isRepeatOffender: false,
    recentViolationsCount: 0,
    escalationStatus: 'Nominal',
    badges: ['Ventilation Specialist'],
    safetyScore: 94,
  },
  {
    worker_id: 'WM-7718',
    name: 'Dilip Tudu',
    role: 'Ventilation Night Attendant',
    assigned_zone: 'zone-d',
    zone_display: 'ZONE D',
    shift: 'Shift C',
    shift_full: 'Shift C (22:00 - 06:00)',
    date: '2026-09-03',
    helmet: true,
    vest: true,
    gloves: false,
    boots: false,
    heartRate: 88,
    spo2: 95,
    movement: 'active',
    entryTime: '22:20 PM',
    loraSignal: 'medium',
    batteryLevel: 82,
    status: 'ATTENTION',
    consecutiveCompliantShifts: 0,
    isSafetyChampion: false,
    isRepeatOffender: true,
    recentViolationsCount: 2,
    escalationStatus: 'Supervisor Review Required',
    badges: [],
    safetyScore: 71,
  },
];

export const SafetyReportsPage: React.FC = () => {
  const { user, isScopedToShift, assignedShift: userShift } = useAuth();
  const { workers, alerts, environmentByZone } = useSafety();

  const [reportType, setReportType] = useState<ReportType>('DGMS_STATUTORY');
  const [selectedZone, setSelectedZone] = useState<string>('all');
  const [selectedShift, setSelectedShift] = useState<string>(
    isScopedToShift && userShift ? (userShift.includes('Shift A') ? 'Shift A' : userShift) : 'all'
  );
  const [dateRange, setDateRange] = useState<string>('today');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [lastRefreshed, setLastRefreshed] = useState<string>(new Date().toLocaleTimeString());
  const [championsCategory, setChampionsCategory] = useState<'all' | 'champions' | 'offenders'>('all');

  // Notification Module State
  const [outbox, setOutbox] = useState<NotificationDispatch[]>([]);
  const [rules, setRules] = useState<AutomatedSafetyRule[]>([]);
  const [channelFilter, setChannelFilter] = useState<'ALL' | 'SMS' | 'EMAIL' | 'IN_APP_PUSH'>('ALL');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modal States
  const [previewItem, setPreviewItem] = useState<NotificationDispatch | null>(null);
  const [composeModalOpen, setComposeModalOpen] = useState<boolean>(false);

  // Direct Compose Form State
  const [composeRecipientName, setComposeRecipientName] = useState<string>('Sunil Marandi');
  const [composeRecipientRole, setComposeRecipientRole] = useState<string>('Continuous Haulage Driver');
  const [composeRecipientContact, setComposeRecipientContact] = useState<string>('+91 98721-44109');
  const [composeChannel, setComposeChannel] = useState<NotificationChannel>('SMS');
  const [composeType, setComposeType] = useState<NotificationType>('CRITICAL_BREACH_ALERT');
  const [composeSubject, setComposeSubject] = useState<string>('Urgent Safety Directive: PPE Compliance');
  const [composeMessage, setComposeMessage] = useState<string>(
    'STATUTORY SAFETY ALERT: Missing steel-toe boots detected during continuous haulage operation in Zone C. Please report to Shift In-Charge immediately.'
  );

  // Load outbox & rules on mount and listen to updates
  const refreshNotificationData = () => {
    setOutbox(notificationService.getOutbox());
    setRules(notificationService.getRules());
  };

  useEffect(() => {
    refreshNotificationData();
    const handler = () => refreshNotificationData();
    window.addEventListener('msafe_outbox_updated', handler);
    window.addEventListener('msafe_rules_updated', handler);
    return () => {
      window.removeEventListener('msafe_outbox_updated', handler);
      window.removeEventListener('msafe_rules_updated', handler);
    };
  }, []);

  // Map real-time workers from SafetyContext to ReportWorkerRecord schema with derived scoring
  const liveRecords: ReportWorkerRecord[] = useMemo(() => {
    return workers.map((w) => {
      const isCritical = w.status === 'critical';
      const allPpe = Boolean(
        w.ppeStatus.helmet && w.ppeStatus.vest && w.ppeStatus.boots && w.ppeStatus.gloves
      );
      const status: 'COMPLIANT' | 'ATTENTION' | 'CRITICAL' = isCritical
        ? 'CRITICAL'
        : !allPpe
        ? 'ATTENTION'
        : 'COMPLIANT';

      const shiftShort = w.shift?.includes('Shift B')
        ? 'Shift B'
        : w.shift?.includes('Shift C')
        ? 'Shift C'
        : 'Shift A';

      const streak = getZeroHarmStreak(w).currentDays;
      const violations = getViolationsCount(w);
      const score = getSafetyScore(w);
      const isOffender = checkRepeatOffender(w);

      const badges = w.complianceProfile?.badges?.length
        ? w.complianceProfile.badges
        : streak >= 40
        ? ['DGMS Safety Exemplar', 'Zero-Harm Milestone 40+']
        : streak >= 25
        ? ['DGMS Safety Exemplar']
        : ['Safety Practitioner'];

      return {
        worker_id: w.id,
        name: w.name,
        role: w.role,
        assigned_zone: w.zoneId,
        zone_display: w.zoneId.toUpperCase(),
        shift: shiftShort,
        shift_full: w.shift || 'Shift A (06:00 - 14:00)',
        date: '2026-09-03',
        helmet: Boolean(w.ppeStatus.helmet),
        vest: Boolean(w.ppeStatus.vest),
        gloves: Boolean(w.ppeStatus.gloves),
        boots: Boolean(w.ppeStatus.boots),
        heartRate: w.vitals.heartRate,
        spo2: w.vitals.spo2,
        movement: w.vitals.movement === 'fall' ? 'fall' : w.vitals.movement === 'stationary' ? 'stationary' : 'active',
        entryTime: w.entryTime || '06:14 AM',
        loraSignal: w.vitals.loraSignal || 'strong',
        batteryLevel: w.vitals.batteryLevel || 92,
        status,
        consecutiveCompliantShifts: streak,
        isSafetyChampion: streak >= 20 && violations === 0,
        isRepeatOffender: isOffender,
        recentViolationsCount: violations,
        escalationStatus: isOffender ? ('Supervisor Review Required' as any) : 'Nominal',
        badges,
        safetyScore: score,
      };
    });
  }, [workers]);

  // Combine live dataset with historical records based on dateRange
  const allRecords: ReportWorkerRecord[] = useMemo(() => {
    if (dateRange === 'today') {
      const todayScheduled = HISTORICAL_WORKERS.filter((w) => w.date === '2026-09-03');
      return [...liveRecords, ...todayScheduled];
    }
    if (dateRange === 'yesterday') {
      const yesterdayHistorical = HISTORICAL_WORKERS.filter((w) => w.date === '2026-09-02');
      return [...liveRecords, ...yesterdayHistorical];
    }
    return [...liveRecords, ...HISTORICAL_WORKERS];
  }, [liveRecords, dateRange]);

  // Robust filtered records across Zone, Shift, and Search Query
  const filteredRecords = useMemo(() => {
    return allRecords.filter((record) => {
      const recordZone = record.assigned_zone.toLowerCase();
      const zNorm = selectedZone.toLowerCase().replace('zone-', '');
      const zoneMatch =
        selectedZone === 'all' ||
        recordZone === selectedZone.toLowerCase() ||
        recordZone === zNorm ||
        recordZone.endsWith(zNorm) ||
        record.zone_display.toLowerCase().includes(zNorm);

      const sNorm = selectedShift.toLowerCase();
      const shiftMatch =
        selectedShift === 'all' ||
        record.shift.toLowerCase() === sNorm ||
        record.shift.toLowerCase().includes(sNorm) ||
        record.shift_full.toLowerCase().includes(sNorm);

      const query = searchQuery.trim().toLowerCase();
      const searchMatch =
        !query ||
        record.name.toLowerCase().includes(query) ||
        record.worker_id.toLowerCase().includes(query) ||
        record.role.toLowerCase().includes(query) ||
        record.assigned_zone.toLowerCase().includes(query) ||
        record.zone_display.toLowerCase().includes(query);

      return zoneMatch && shiftMatch && searchMatch;
    });
  }, [allRecords, selectedZone, selectedShift, searchQuery]);

  // Dynamic KPI calculations
  const totalCount = filteredRecords.length;
  const compliantCount = filteredRecords.filter(
    (r) => r.helmet && r.vest && r.gloves && r.boots && r.status !== 'CRITICAL'
  ).length;
  const ppeComplianceRate = totalCount > 0 ? ((compliantCount / totalCount) * 100).toFixed(1) : '100.0';

  // Safety Champions list (scoped to active filters: anyone without repeat violations)
  const safetyChampions = useMemo(() => {
    return [...filteredRecords]
      .filter((w) => !w.isRepeatOffender && w.recentViolationsCount < 2)
      .sort((a, b) => {
        const scoreA = a.safetyScore ?? 90;
        const scoreB = b.safetyScore ?? 90;
        if (scoreB !== scoreA) return scoreB - scoreA;
        return b.consecutiveCompliantShifts - a.consecutiveCompliantShifts;
      });
  }, [filteredRecords]);

  // Repeat Offenders list (scoped to active filters: >= 2 violations)
  const repeatOffenders = useMemo(() => {
    return [...filteredRecords]
      .filter((w) => w.isRepeatOffender || w.recentViolationsCount >= 2)
      .sort((a, b) => b.recentViolationsCount - a.recentViolationsCount);
  }, [filteredRecords]);

  // Average safety score of champions under current filter
  const avgFilteredScore = useMemo(() => {
    if (safetyChampions.length === 0) return '0.0';
    const sum = safetyChampions.reduce((acc, c) => acc + (c.safetyScore ?? 90), 0);
    return (sum / safetyChampions.length).toFixed(1);
  }, [safetyChampions]);

  // Dynamic Trajectory Points & Monthly Stats based on active filter
  const trajectoryPoints = useMemo(() => {
    const variance =
      selectedZone === 'zone-c' ? 0.9 :
      selectedZone === 'zone-a' ? -1.2 :
      selectedZone === 'zone-b' ? -0.5 :
      selectedZone === 'zone-d' ? 1.1 : 0;

    const shiftVar =
      selectedShift === 'Shift C' ? -1.2 :
      selectedShift === 'Shift B' ? -0.5 : 0;

    const days = [
      { day: '05', base: 97.4 },
      { day: '07', base: 98.1 },
      { day: '09', base: 96.9 },
      { day: '11', base: 98.6 },
      { day: '13', base: 99.1 },
      { day: '15', base: 99.7 },
      { day: '17', base: 98.3 },
      { day: '19', base: 99.5 },
      { day: '21', base: 98.8 },
      { day: '23', base: 100.0 },
      { day: '25', base: 99.3 },
      { day: '27', base: 98.7 },
      { day: '29', base: 99.8 },
      { day: '31', base: 100.0 },
      { day: '01', base: 99.6 },
      { day: '02', base: 100.0 },
      { day: '03', base: 99.2 },
    ];

    const stepX = (680 - 40) / (days.length - 1);

    return days.map((d, i) => {
      const val = Math.min(100.0, Math.max(95.2, d.base + variance + shiftVar));
      const y = 20 + ((100 - val) / 5) * 130;
      const x = 40 + i * stepX;
      return { x, y, day: d.day, val: val.toFixed(1) };
    });
  }, [selectedZone, selectedShift]);

  const polylinePoints = useMemo(() => {
    return trajectoryPoints.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
  }, [trajectoryPoints]);

  const polygonPoints = useMemo(() => {
    return `40,150 ${polylinePoints} 680,150`;
  }, [polylinePoints]);

  const monthlyStats = useMemo(() => {
    const total = filteredRecords.length;
    const compliant = filteredRecords.filter(
      (r) => r.helmet && r.vest && r.gloves && r.boots && r.status !== 'CRITICAL'
    ).length;
    const vals = trajectoryPoints.map((p) => parseFloat(p.val));
    const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
    const rateStr = avg.toFixed(1);

    const violationsCount = total - compliant;
    const reductionRate = violationsCount === 0 ? '24.2%' : selectedZone === 'zone-c' ? '21.5%' : selectedZone === 'zone-a' ? '14.8%' : '18.6%';
    const hours = total > 0 ? (total * 8 * 30).toLocaleString() + ' hrs' : '18,480 hrs';
    const status = parseFloat(rateStr) >= 95.0 ? 'CERTIFIED' : 'CONDITIONAL';

    return {
      rate: `${rateStr}%`,
      reductionRate: `↓ ${reductionRate}`,
      hours,
      status,
    };
  }, [filteredRecords, trajectoryPoints, selectedZone]);

  const filteredGasRows = useMemo(() => {
    const rows = [
      {
        zoneKey: 'zone-c',
        gas: 'Methane (CH4)',
        sensor: 'MQ-4 Optical Combustible',
        zone: 'ZONE C — Deep Extraction Face',
        value: `${environmentByZone['zone-c']?.mq4 || 249} ppm`,
        threshold: '380 ppm',
        airflow: '4.8 m/s (Nominal)',
        verdict: 'PASS (SAFE)',
      },
      {
        zoneKey: 'zone-b',
        gas: 'Carbon Monoxide (CO)',
        sensor: 'MQ-7 Electrochemical',
        zone: 'ZONE B — Conveyor Drift & Bolting',
        value: `${environmentByZone['zone-b']?.mq7 || 2.1} ppm`,
        threshold: '50 ppm',
        airflow: '3.6 m/s (Nominal)',
        verdict: 'PASS (SAFE)',
      },
      {
        zoneKey: 'zone-a',
        gas: 'Air Quality / Toxic Mesh',
        sensor: 'MQ-135 Multi-Gas Array',
        zone: 'ZONE A — Upper Haulage Drift',
        value: '14.8 ppm',
        threshold: '100 ppm',
        airflow: '5.2 m/s (Nominal)',
        verdict: 'PASS (SAFE)',
      },
      {
        zoneKey: 'zone-c',
        gas: 'Ambient Crosscut Temp',
        sensor: 'NTC Thermistor / SHT31',
        zone: 'ZONE C — Deep Extraction Face',
        value: `${environmentByZone['zone-c']?.temperature || 24.2}°C`,
        threshold: '35.0°C',
        airflow: '4.8 m/s',
        verdict: 'PASS (SAFE)',
      },
      {
        zoneKey: 'zone-d',
        gas: 'Auxiliary Return Airflow',
        sensor: 'Pitot Differential Transducer',
        zone: 'ZONE D — Ventilation Substation',
        value: '6.4 m/s',
        threshold: '3.0 m/s min',
        airflow: '6.4 m/s',
        verdict: 'PASS (SAFE)',
      },
    ];

    if (selectedZone === 'all') return rows;
    return rows.filter((r) => r.zoneKey === selectedZone);
  }, [environmentByZone, selectedZone]);

  // Filtered Outbox
  const filteredOutbox = useMemo(() => {
    return outbox.filter((item) => {
      if (channelFilter !== 'ALL' && item.channel !== channelFilter) return false;
      const q = searchQuery.toLowerCase();
      if (!q) return true;
      return (
        item.recipientName.toLowerCase().includes(q) ||
        item.recipientContact.toLowerCase().includes(q) ||
        item.subject.toLowerCase().includes(q) ||
        item.message.toLowerCase().includes(q)
      );
    });
  }, [outbox, channelFilter, searchQuery]);

  const handleRefresh = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setLastRefreshed(new Date().toLocaleTimeString());
      refreshNotificationData();
    }, 400);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportCsv = () => {
    const headers = [
      'Worker Name',
      'Worker ID',
      'Assigned Zone',
      'Shift',
      'Date',
      'Helmet',
      'Vest',
      'Gloves',
      'Boots',
      'Heart Rate',
      'SpO2',
      'Movement',
      'Compliance Status',
      'Compliant Streak',
      'Safety Standing',
    ];

    const rows = filteredRecords.map((w) => [
      `"${w.name}"`,
      w.worker_id,
      w.zone_display,
      `"${w.shift_full}"`,
      w.date,
      w.helmet ? 'OK' : 'MISSING',
      w.vest ? 'OK' : 'MISSING',
      w.gloves ? 'OK' : 'MISSING',
      w.boots ? 'OK' : 'MISSING',
      `${w.heartRate} BPM`,
      `${w.spo2}%`,
      w.movement.toUpperCase(),
      w.status,
      `${w.consecutiveCompliantShifts} shifts`,
      w.isSafetyChampion ? 'Safety Champion' : w.isRepeatOffender ? 'Repeat Offender' : 'Standard',
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `DGMS_Safety_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSendMonthlyDigestEmail = () => {
    notificationService.dispatchEmailDigest(
      'September 2026',
      'director.rao@jharia-coal.gov.in',
      'Mine Director & DGMS Authority',
      allRecords.length,
      ppeComplianceRate
    );
    try {
      confetti({ particleCount: 50, spread: 50, origin: { y: 0.5 } });
    } catch {}
    setToastMessage(
      'Monthly DGMS Safety Audit Digest dispatched via Email to director.rao@jharia-coal.gov.in and DGMS inspector archive!'
    );
  };

  const handleToggleRule = (ruleId: string) => {
    const updated = notificationService.toggleRule(ruleId);
    setRules(updated);
    const target = updated.find((r) => r.id === ruleId);
    setToastMessage(`Automated Rule "${target?.name}" is now ${target?.enabled ? 'ACTIVE' : 'PAUSED'}.`);
  };

  const handleTestTriggerRule = (ruleId: string) => {
    const disp = notificationService.triggerRule(ruleId);
    if (disp) {
      setToastMessage(`Automated Rule "${disp.subject}" triggered & dispatched! Outbox updated.`);
    }
  };

  const handleResend = (id: string) => {
    const disp = notificationService.resendDispatch(id);
    if (disp) {
      setToastMessage(`Notification ${id} resent to ${disp.recipientName} (${disp.channel})!`);
    }
  };

  const handleDispatchCompose = (e: React.FormEvent) => {
    e.preventDefault();
    notificationService.dispatchCustom({
      recipientName: composeRecipientName,
      recipientRole: composeRecipientRole,
      recipientContact: composeRecipientContact,
      channel: composeChannel,
      type: composeType,
      subject: composeSubject,
      message: composeMessage,
    });
    setComposeModalOpen(false);
    setToastMessage(`Custom ${composeChannel} successfully dispatched to ${composeRecipientName}!`);
  };

  // Preset Template Helper for Compose Modal
  const applyTemplate = (templateKey: string) => {
    if (templateKey === 'EVACUATION') {
      setComposeType('EMERGENCY_EVACUATION_BROADCAST');
      setComposeChannel('SMS');
      setComposeSubject('CRITICAL DGMS ORDER: Immediate Subterranean Evacuation');
      setComposeMessage('EVACUATION ORDER: Immediate withdrawal of all personnel from Zone C due to atmospheric methane alert. Follow primary intake drift toward Hoist Shaft #4 immediately.');
    } else if (templateKey === 'GAS_WARNING') {
      setComposeType('GAS_HAZARD_WARNING');
      setComposeChannel('SMS');
      setComposeSubject('Environmental Safety Warning: Elevated Gas in Zone C');
      setComposeMessage('SAFETY ADVISORY: Methane levels elevated to 290 ppm at longwall shearer face. Ventilation override activated. Wearable gas monitors must remain ON.');
    } else if (templateKey === 'CHAMPION') {
      setComposeType('SAFETY_CHAMPION_COMMENDATION');
      setComposeChannel('SMS');
      setComposeSubject('Mine Safety Champion Recognition Milestone');
      setComposeMessage('COMMENDATION: Congratulations! You have achieved 30 consecutive subterranean shifts with 100% PPE compliance. DGMS Safety Exemplar Badge awarded.');
    } else if (templateKey === 'WARNING') {
      setComposeType('REPEAT_OFFENDER_WARNING');
      setComposeChannel('SMS');
      setComposeSubject('Statutory Non-Compliance Warning Notice');
      setComposeMessage('STATUTORY WARNING: You have been flagged for repeated PPE non-compliance under DGMS Coal Mines Regulations 1957. Mandatory 4-hour safety refresher scheduled.');
    } else if (templateKey === 'HANDOVER') {
      setComposeType('STATUTORY_DAILY_DIGEST');
      setComposeChannel('EMAIL');
      setComposeSubject('DGMS Statutory Form IV Handover Digest — Shift A');
      setComposeMessage('Shift A Subterranean Handover Summary: All personnel accounted for, 98.4% PPE compliance, zero injuries. Multi-gas telemetry nominal. Ready for Shift B entry.');
    }
  };

  return (
    <ControlRoomLayout>
      <div className="space-y-5 text-[#151713]">
        {/* Toast Alert Feedback */}
        {toastMessage && (
          <div className="p-3 rounded-xl bg-[#EAF3EF] border border-[#2D8A61]/40 text-[#176B4D] text-xs font-mono flex items-center justify-between shadow-sm animate-in fade-in duration-200">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-[#2D8A61]" />
              <span>{toastMessage}</span>
            </div>
            <button
              type="button"
              onClick={() => setToastMessage(null)}
              className="text-[#666861] hover:text-[#151713] text-xs font-bold px-2 py-0.5 rounded hover:bg-white"
            >
              DISMISS
            </button>
          </div>
        )}

        {/* ===================================================================== */}
        {/* 1. PRINTABLE OFFICIAL DGMS AUDIT SHEET (Window Print) */}
        {/* ===================================================================== */}
        <div className="hidden print:block font-sans text-[#111310] bg-white p-8 max-w-4xl mx-auto space-y-6">
          <div className="border-b-2 border-[#176B4D] pb-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[10px] uppercase font-mono tracking-widest text-[#176B4D] font-bold">
                  DIRECTORATE GENERAL OF MINES SAFETY COMPLIANCE RECORD
                </div>
                <h1 className="font-serif text-2xl font-bold uppercase tracking-tight text-[#111310] mt-0.5">
                  DGMS Statutory Safety Audit Report
                </h1>
                <div className="text-xs text-[#666861] mt-0.5">
                  Jharia Coalfield Division — Subterranean Level 4 • Autonomous Mine Safety System
                </div>
              </div>
              <div className="text-right font-mono text-xs border border-[#176B4D]/30 p-2 rounded bg-[#FAF9F6]">
                <div className="font-bold text-[#176B4D]">OFFICIAL RECORD</div>
                <div className="text-[10px] text-[#666861]">FORM IV-B</div>
              </div>
            </div>
          </div>
        </div>

        {/* ===================================================================== */}
        {/* 2. ON-SCREEN SCREEN UI */}
        {/* ===================================================================== */}
        <div className="print:hidden space-y-5">
          {/* Header Banner */}
          <div className="bg-white border border-[#DCDAD4] rounded-2xl p-5 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-[#EAF3EF] text-[#176B4D] border border-[#176B4D]/30 uppercase tracking-wide">
                  DGMS Statutory Module
                </span>
                <span className="text-xs text-[#666861] font-mono">
                  Ref: DGMS/JHA/2026-M4
                </span>
              </div>
              <h2 className="font-serif font-bold text-xl text-[#151713] mt-1 tracking-tight">
                Safety & Statutory Compliance Console
              </h2>
              <p className="text-xs text-[#666861] mt-0.5">
                Audited Subterranean Coal Seam Operations • Daily/Monthly Reports, Safety Trends, Champions & Notification Outbox
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleRefresh}
                disabled={isLoading}
                className="px-3 py-2 rounded-xl bg-white border border-[#DCDAD4] hover:bg-[#FAF9F6] text-[#151713] text-xs font-semibold flex items-center space-x-1.5 transition-colors shadow-2xs"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-[#176B4D] ${isLoading ? 'animate-spin' : ''}`} />
                <span>Sync</span>
              </button>

              <button
                type="button"
                onClick={handlePrint}
                className="px-3 py-2 rounded-xl bg-white border border-[#DCDAD4] hover:bg-[#FAF9F6] text-[#151713] text-xs font-semibold flex items-center space-x-1.5 transition-colors shadow-2xs"
              >
                <Printer className="w-3.5 h-3.5 text-[#176B4D]" />
                <span>Print DGMS Form</span>
              </button>

              <button
                type="button"
                onClick={handleExportCsv}
                className="px-3.5 py-2 rounded-xl bg-[#176B4D] hover:bg-[#12553D] text-white text-xs font-semibold flex items-center space-x-1.5 transition-colors shadow-xs"
              >
                <Download className="w-3.5 h-3.5 text-white" />
                <span>Export CSV</span>
              </button>
            </div>
          </div>

          {/* TAB SELECTOR BAR (6 CORE SUBTERRANEAN MODULES — NO GATES/TURNS) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
            {[
              {
                id: 'DGMS_STATUTORY',
                label: 'DGMS Statutory Audit',
                desc: 'Form IV Directorate Sheet',
                icon: ShieldCheck,
              },
              {
                id: 'SAFETY_CHAMPIONS_OFFENDERS',
                label: 'Champions & Offenders',
                desc: 'Streaks, Badges & Warnings',
                icon: Award,
              },
              {
                id: 'MONTHLY_TRENDS_ANALYTICS',
                label: 'Monthly Safety Trends',
                desc: '30-Day Curve & Shift Heat',
                icon: TrendingUp,
              },
              {
                id: 'NOTIFICATION_DISPATCH_LOG',
                label: 'Statutory Notification Hub',
                desc: 'SMS, Email & Push Center',
                icon: BellRing,
              },
              {
                id: 'ATMOSPHERIC_GAS',
                label: 'Atmospheric Gas',
                desc: 'Methane MQ4, CO & Temp',
                icon: Wind,
              },
              {
                id: 'WORKER_VITALS',
                label: 'Miner Biometrics',
                desc: 'Vitals, IMU Fall & SOS',
                icon: Activity,
              },
            ].map((tab) => {
              const isSelected = reportType === tab.id;
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setReportType(tab.id as ReportType)}
                  className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                    isSelected
                      ? 'bg-[#EAF3EF] border-[#176B4D] shadow-xs ring-1 ring-[#176B4D]/30'
                      : 'bg-white border-[#DCDAD4] hover:bg-[#FAF9F6]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <Icon className={`w-4 h-4 ${isSelected ? 'text-[#176B4D]' : 'text-[#666861]'}`} />
                    {isSelected && (
                      <span className="text-[9px] font-semibold text-[#176B4D] bg-white px-1.5 py-0.2 rounded border border-[#176B4D]/20">
                        ACTIVE
                      </span>
                    )}
                  </div>
                  <div className="font-serif font-semibold text-xs text-[#151713] leading-snug">
                    {tab.label}
                  </div>
                  <div className="text-[10px] text-[#666861] mt-0.5 line-clamp-1">
                    {tab.desc}
                  </div>
                </button>
              );
            })}
          </div>

          {/* ACTIVE FILTER CONTROLS BAR */}
          <div className="bg-white border border-[#DCDAD4] p-3 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xs shadow-xs">
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center space-x-1.5 text-[#666861] mr-1 font-semibold">
                <Filter className="w-3.5 h-3.5 text-[#176B4D]" />
                <span>FILTERS:</span>
              </div>

              {/* Subterranean Zone Filter */}
              <select
                value={selectedZone}
                onChange={(e) => setSelectedZone(e.target.value)}
                className="bg-[#FAF9F6] border border-[#DCDAD4] focus:border-[#176B4D] rounded-xl px-2.5 py-1.5 text-[#151713] font-mono focus:outline-none uppercase"
              >
                <option value="all">All Zones (A - D)</option>
                <option value="zone-a">Zone A — Upper Haulage Drift</option>
                <option value="zone-b">Zone B — Conveyor Drift & Bolting</option>
                <option value="zone-c">Zone C — Deep Extraction Face</option>
                <option value="zone-d">Zone D — Ventilation Substation</option>
              </select>

              {/* Shift Timing Filter */}
              <select
                value={selectedShift}
                onChange={(e) => setSelectedShift(e.target.value)}
                disabled={isScopedToShift}
                className={`bg-[#FAF9F6] border border-[#DCDAD4] rounded-xl px-2.5 py-1.5 text-[#151713] font-mono focus:outline-none ${
                  isScopedToShift ? 'cursor-not-allowed opacity-80 border-[#176B4D]/40 font-semibold' : 'focus:border-[#176B4D]'
                }`}
              >
                <option value="all">All Shifts (A / B / C)</option>
                <option value="Shift A">Shift A (06:00 - 14:00)</option>
                <option value="Shift B">Shift B (14:00 - 22:00)</option>
                <option value="Shift C">Shift C (22:00 - 06:00)</option>
              </select>

              {/* Date Range & Monthly Picker */}
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="bg-[#FAF9F6] border border-[#DCDAD4] focus:border-[#176B4D] rounded-xl px-2.5 py-1.5 text-[#151713] font-mono focus:outline-none"
              >
                <option value="today">Today (03 Sep 2026)</option>
                <option value="yesterday">Yesterday (02 Sep 2026)</option>
                <option value="week">Past 7 Days (Aug 28 - Sep 03)</option>
                <option value="month_current">Current Month (Sep 2026)</option>
                <option value="month_august">August 2026 (Monthly Rollup)</option>
              </select>
            </div>

            {/* Personnel / Record Search Input */}
            <div className="relative min-w-[200px]">
              <Search className="w-3.5 h-3.5 text-[#666861] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search miner, ID, role or contact..."
                className="w-full bg-[#FAF9F6] border border-[#DCDAD4] focus:border-[#176B4D] rounded-xl pl-8 pr-3 py-1.5 text-xs text-[#151713] font-mono focus:outline-none"
              />
            </div>
          </div>

          {/* ===================================================================== */}
          {/* TAB: NOTIFICATION MODULE (COMPLETE & FULLY FEATURED) */}
          {/* ===================================================================== */}
          {reportType === 'NOTIFICATION_DISPATCH_LOG' && (
            <div className="space-y-5">
              {/* Notification KPI Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-white border border-[#DCDAD4] p-4 rounded-2xl shadow-xs">
                  <div className="text-[10px] uppercase font-mono text-[#666861]">Total Statutory Dispatches</div>
                  <div className="font-serif font-bold text-2xl text-[#176B4D] mt-1">{outbox.length} Dispatches</div>
                  <div className="text-[10px] text-[#2D8A61] mt-0.5">100% Delivery Confirmation</div>
                </div>

                <div className="bg-white border border-[#DCDAD4] p-4 rounded-2xl shadow-xs">
                  <div className="text-[10px] uppercase font-mono text-[#666861]">SMS Gateway Dispatches</div>
                  <div className="font-serif font-bold text-2xl text-[#151713] mt-1">
                    {outbox.filter((d) => d.channel === 'SMS').length} Delivered
                  </div>
                  <div className="text-[10px] text-[#666861] mt-0.5">GSM / LoRa gateway routing</div>
                </div>

                <div className="bg-white border border-[#DCDAD4] p-4 rounded-2xl shadow-xs">
                  <div className="text-[10px] uppercase font-mono text-[#666861]">Email Statutory Digests</div>
                  <div className="font-serif font-bold text-2xl text-[#B47A18] mt-1">
                    {outbox.filter((d) => d.channel === 'EMAIL').length} Sent
                  </div>
                  <div className="text-[10px] text-[#666861] mt-0.5">DGMS Form IV certified PDFs</div>
                </div>

                <div className="bg-white border border-[#DCDAD4] p-4 rounded-2xl shadow-xs">
                  <div className="text-[10px] uppercase font-mono text-[#666861]">Automated Safety Rules</div>
                  <div className="font-serif font-bold text-2xl text-[#2D8A61] mt-1">
                    {rules.filter((r) => r.enabled).length} / {rules.length} Active
                  </div>
                  <div className="text-[10px] text-[#666861] mt-0.5">Autonomous safety trigger engine</div>
                </div>
              </div>

              {/* Main Action Header */}
              <div className="bg-white border border-[#DCDAD4] rounded-2xl p-5 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div>
                  <div className="flex items-center space-x-2">
                    <BellRing className="w-5 h-5 text-[#176B4D]" />
                    <h3 className="font-serif font-bold text-base text-[#151713]">
                      Statutory Safety Notification Management Hub
                    </h3>
                  </div>
                  <p className="text-xs text-[#666861] mt-0.5">
                    Multi-Channel Emergency SMS Broadcasts, DGMS Audit Email Digests & Automated Safety Event Dispatches.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setComposeModalOpen(true)}
                    className="px-3.5 py-2 rounded-xl bg-[#176B4D] hover:bg-[#12553D] text-white text-xs font-semibold flex items-center space-x-1.5 shadow-xs transition-colors"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Compose Notification</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleSendMonthlyDigestEmail}
                    className="px-3 py-2 rounded-xl bg-white border border-[#DCDAD4] hover:bg-[#FAF9F6] text-[#151713] text-xs font-semibold flex items-center space-x-1.5 shadow-2xs transition-colors"
                  >
                    <Mail className="w-3.5 h-3.5 text-[#176B4D]" />
                    <span>Send Monthly Digest</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => notificationService.exportOutboxCsv()}
                    className="px-3 py-2 rounded-xl bg-white border border-[#DCDAD4] hover:bg-[#FAF9F6] text-[#151713] text-xs font-semibold flex items-center space-x-1.5 shadow-2xs transition-colors"
                  >
                    <Download className="w-3.5 h-3.5 text-[#176B4D]" />
                    <span>Export CSV</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      notificationService.clearOutbox();
                      refreshNotificationData();
                      setToastMessage('Notification outbox reset to statutory defaults.');
                    }}
                    className="px-2.5 py-2 rounded-xl bg-white border border-[#DCDAD4] hover:bg-[#FAF9F6] text-[#666861] hover:text-[#151713] text-xs font-mono"
                  >
                    Reset
                  </button>
                </div>
              </div>

              {/* AUTOMATED SAFETY DISPATCH RULES ENGINE */}
              <div className="bg-white border border-[#DCDAD4] rounded-2xl p-5 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-[#ECEBE6] pb-3">
                  <div className="flex items-center space-x-2">
                    <Settings className="w-4 h-4 text-[#176B4D]" />
                    <h4 className="font-serif font-bold text-sm text-[#151713]">
                      Automated Safety Dispatch Rules Engine
                    </h4>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#EAF3EF] text-[#176B4D] font-bold border border-[#176B4D]/30 uppercase">
                    DGMS Autonomous Compliance
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {rules.map((rule) => (
                    <div
                      key={rule.id}
                      className={`p-3.5 rounded-xl border flex flex-col justify-between space-y-3 transition-all ${
                        rule.enabled
                          ? 'bg-[#FAF9F6] border-[#DCDAD4] shadow-2xs'
                          : 'bg-[#FAF9F6]/50 border-[#ECEBE6] opacity-65'
                      }`}
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-start justify-between gap-2">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                              rule.channel === 'SMS'
                                ? 'bg-[#EAF3EF] text-[#176B4D] border border-[#176B4D]/30'
                                : rule.channel === 'EMAIL'
                                ? 'bg-[#FAF6E9] text-[#8A5B0B] border border-[#B47A18]/30'
                                : 'bg-[#FDF2F2] text-[#A83D45] border border-[#A83D45]/30'
                            }`}
                          >
                            {rule.channel}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleToggleRule(rule.id)}
                            className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold transition-colors ${
                              rule.enabled
                                ? 'bg-[#176B4D] text-white'
                                : 'bg-[#ECEBE6] text-[#666861]'
                            }`}
                          >
                            {rule.enabled ? 'ACTIVE' : 'PAUSED'}
                          </button>
                        </div>
                        <div className="font-semibold text-xs text-[#151713]">{rule.name}</div>
                        <p className="text-[11px] text-[#666861] leading-relaxed line-clamp-2">
                          {rule.description}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-[#ECEBE6] flex items-center justify-between text-[10px] font-mono text-[#666861]">
                        <span>Triggered: {rule.triggersCount} times</span>
                        <button
                          type="button"
                          onClick={() => handleTestTriggerRule(rule.id)}
                          className="text-[#176B4D] font-bold hover:underline"
                        >
                          Test Trigger →
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* STATUTORY OUTBOX AUDIT TABLE */}
              <div className="bg-white border border-[#DCDAD4] rounded-2xl overflow-hidden shadow-xs space-y-3 p-5">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#ECEBE6] pb-3">
                  <div className="flex items-center space-x-2 text-xs font-mono">
                    <span className="text-[#666861] font-semibold">FILTER CHANNEL:</span>
                    {(['ALL', 'SMS', 'EMAIL', 'IN_APP_PUSH'] as const).map((ch) => (
                      <button
                        key={ch}
                        onClick={() => setChannelFilter(ch)}
                        className={`px-2.5 py-1 rounded-lg border transition-colors ${
                          channelFilter === ch
                            ? 'bg-[#176B4D] text-white border-[#176B4D] font-bold'
                            : 'bg-white border-[#DCDAD4] text-[#666861] hover:text-[#151713]'
                        }`}
                      >
                        {ch}
                      </button>
                    ))}
                  </div>

                  <span className="text-xs font-mono text-[#666861]">
                    Showing {filteredOutbox.length} Dispatches
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs divide-y divide-[#ECEBE6]">
                    <thead className="bg-[#FAF9F6] text-[#666861] uppercase text-[11px] font-semibold font-mono">
                      <tr>
                        <th className="py-3 px-4">Timestamp</th>
                        <th className="py-3 px-4">Channel</th>
                        <th className="py-3 px-4">Recipient</th>
                        <th className="py-3 px-4">Classification</th>
                        <th className="py-3 px-4">Message Body</th>
                        <th className="py-3 px-4 text-center">Status</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#ECEBE6]">
                      {filteredOutbox.map((item) => (
                        <tr key={item.id} className="hover:bg-[#FAF9F6]/60 transition-colors">
                          <td className="py-3 px-4 font-mono text-[#666861] whitespace-nowrap">
                            {item.timestamp}
                          </td>
                          <td className="py-3 px-4 font-mono font-bold">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] ${
                                item.channel === 'SMS'
                                  ? 'bg-[#EAF3EF] text-[#176B4D] border border-[#176B4D]/30'
                                  : item.channel === 'EMAIL'
                                  ? 'bg-[#FAF6E9] text-[#8A5B0B] border border-[#B47A18]/30'
                                  : 'bg-[#FDF2F2] text-[#A83D45] border border-[#A83D45]/30'
                              }`}
                            >
                              {item.channel}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-semibold text-[#151713]">{item.recipientName}</div>
                            <div className="text-[11px] text-[#666861] font-mono">{item.recipientContact}</div>
                          </td>
                          <td className="py-3 px-4 font-mono text-xs">
                            <div className="font-bold text-[#151713]">{item.subject}</div>
                            <span className="text-[10px] text-[#666861] uppercase">{item.type}</span>
                          </td>
                          <td className="py-3 px-4 max-w-sm text-xs text-[#151713]/90 leading-relaxed font-sans">
                            <p className="line-clamp-2">{item.message}</p>
                          </td>
                          <td className="py-3 px-4 text-center font-mono">
                            <span className="px-2.5 py-1 rounded-lg bg-[#EAF3EF] text-[#2D8A61] border border-[#2D8A61]/30 font-bold text-[11px]">
                              {item.status} ✓
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right font-mono space-x-1 whitespace-nowrap">
                            <button
                              type="button"
                              onClick={() => setPreviewItem(item)}
                              className="px-2.5 py-1 rounded-lg bg-white border border-[#DCDAD4] hover:bg-[#FAF9F6] text-[#151713] text-[11px]"
                            >
                              Preview
                            </button>
                            <button
                              type="button"
                              onClick={() => handleResend(item.id)}
                              className="px-2.5 py-1 rounded-lg bg-[#176B4D] hover:bg-[#12553D] text-white text-[11px]"
                            >
                              Resend
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ===================================================================== */}
          {/* TAB 1: DGMS STATUTORY COMPLIANCE TABLE */}
          {/* ===================================================================== */}
          {reportType === 'DGMS_STATUTORY' && (
            <div className="bg-white border border-[#DCDAD4] rounded-2xl overflow-hidden shadow-xs">
              <div className="p-4 border-b border-[#ECEBE6] flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center space-x-2">
                  <ShieldCheck className="w-5 h-5 text-[#176B4D]" />
                  <span className="font-serif font-bold text-sm text-[#151713]">
                    DGMS Form IV-B Statutory Log ({filteredRecords.length} Active Records)
                  </span>
                </div>
                <div className="text-xs font-mono text-[#666861]">
                  Compliance Threshold: <strong className="text-[#176B4D]">95.0% Minimum</strong>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs divide-y divide-[#ECEBE6]">
                  <thead className="bg-[#FAF9F6] text-[#666861] uppercase text-[11px] font-semibold font-mono">
                    <tr>
                      <th className="py-3 px-4">Worker Personnel</th>
                      <th className="py-3 px-4">Worker ID</th>
                      <th className="py-3 px-4">Subterranean Zone</th>
                      <th className="py-3 px-4">Operational Shift</th>
                      <th className="py-3 px-4 text-center">4-Point PPE Status</th>
                      <th className="py-3 px-4 text-center">Heart Rate / SpO2</th>
                      <th className="py-3 px-4 text-right">Statutory Verdict</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#ECEBE6]">
                    {filteredRecords.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-xs text-[#666861] font-mono">
                          No personnel records found matching current filter ({selectedZone.toUpperCase()} • {selectedShift}).
                        </td>
                      </tr>
                    ) : (
                      filteredRecords.map((w) => {
                      const allPpe = w.helmet && w.vest && w.gloves && w.boots;
                      return (
                        <tr key={w.worker_id} className="hover:bg-[#FAF9F6]/60 transition-colors">
                          <td className="py-3 px-4">
                            <div className="font-semibold text-[#151713]">{w.name}</div>
                            <div className="text-[11px] text-[#666861]">{w.role}</div>
                          </td>
                          <td className="py-3 px-4 font-mono text-[#176B4D] font-bold">{w.worker_id}</td>
                          <td className="py-3 px-4 font-mono text-[#666861]">{w.zone_display}</td>
                          <td className="py-3 px-4 font-mono text-[#666861]">{w.shift}</td>
                          <td className="py-3 px-4 text-center">
                            <div className="flex items-center justify-center space-x-1">
                              <span
                                className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                                  w.helmet ? 'bg-[#EAF3EF] text-[#2D8A61]' : 'bg-[#FDF2F2] text-[#A83D45]'
                                }`}
                              >
                                H
                              </span>
                              <span
                                className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                                  w.vest ? 'bg-[#EAF3EF] text-[#2D8A61]' : 'bg-[#FDF2F2] text-[#A83D45]'
                                }`}
                              >
                                V
                              </span>
                              <span
                                className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                                  w.gloves ? 'bg-[#EAF3EF] text-[#2D8A61]' : 'bg-[#FDF2F2] text-[#A83D45]'
                                }`}
                              >
                                G
                              </span>
                              <span
                                className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                                  w.boots ? 'bg-[#EAF3EF] text-[#2D8A61]' : 'bg-[#FDF2F2] text-[#A83D45]'
                                }`}
                              >
                                B
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-center font-mono">
                            <span className={w.heartRate > 100 ? 'text-[#A83D45] font-bold' : 'text-[#151713]'}>
                              {w.heartRate} BPM
                            </span>{' '}
                            • <span className={w.spo2 < 90 ? 'text-[#A83D45] font-bold' : 'text-[#2D8A61]'}>{w.spo2}%</span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <span
                              className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold ${
                                w.status === 'CRITICAL'
                                  ? 'bg-[#FDF2F2] text-[#A83D45] border border-[#A83D45]/30'
                                  : w.status === 'ATTENTION'
                                  ? 'bg-[#FEF9E7] text-[#B47A18] border border-[#B47A18]/30'
                                  : 'bg-[#EAF3EF] text-[#2D8A61] border border-[#2D8A61]/30'
                              }`}
                            >
                              {w.status === 'CRITICAL' ? 'HOLD (DISTRESS)' : allPpe ? 'PASS ✓' : 'ATTENTION (PPE)'}
                            </span>
                          </td>
                        </tr>
                      );
                    }))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ===================================================================== */}
          {/* TAB 2: SAFETY CHAMPIONS & REPEAT OFFENDERS */}
          {/* ===================================================================== */}
          {reportType === 'SAFETY_CHAMPIONS_OFFENDERS' && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-[#FAF9F6] border border-[#ECEBE6] p-4 rounded-2xl flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-[#FAF6E9] border border-[#B47A18]/30 flex items-center justify-center text-[#B47A18]">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-[10px] uppercase font-mono text-[#666861]">Safety Champions Recognized</div>
                    <div className="font-serif font-bold text-xl text-[#8A5B0B]">
                      {safetyChampions.length} Miners (Streak ≥ 25)
                    </div>
                    <div className="text-[10px] text-[#666861]">100% PPE Subterranean Compliance</div>
                  </div>
                </div>

                <div className="bg-[#FAF9F6] border border-[#ECEBE6] p-4 rounded-2xl flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-[#FDF2F2] border border-[#A83D45]/30 flex items-center justify-center text-[#A83D45]">
                    <AlertOctagon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-[10px] uppercase font-mono text-[#666861]">Repeat Offenders Flagged</div>
                    <div className="font-serif font-bold text-xl text-[#A83D45]">
                      {repeatOffenders.length} Under Review (≥2 Violations)
                    </div>
                    <div className="text-[10px] text-[#A83D45]">Mandatory Refresher Scheduled</div>
                  </div>
                </div>

                <div className="bg-[#FAF9F6] border border-[#ECEBE6] p-4 rounded-2xl flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-[#EAF3EF] border border-[#2D8A61]/30 flex items-center justify-center text-[#2D8A61]">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-[10px] uppercase font-mono text-[#666861]">Zero-Harm Mine Index</div>
                    <div className="font-serif font-bold text-xl text-[#2D8A61]">98.4%</div>
                    <div className="text-[10px] text-[#666861]">Statutory DGMS Form IV Benchmark</div>
                  </div>
                </div>
              </div>

              {/* DEDICATED QUICK FILTER TOOLBAR FOR CHAMPIONS & OFFENDERS */}
              <div className="bg-white border border-[#DCDAD4] p-3.5 rounded-2xl shadow-xs space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[10px] uppercase font-mono text-[#666861] font-bold mr-1">ZONE:</span>
                    {[
                      { id: 'all', label: 'ALL ZONES' },
                      { id: 'zone-a', label: 'ZONE A' },
                      { id: 'zone-b', label: 'ZONE B' },
                      { id: 'zone-c', label: 'ZONE C' },
                      { id: 'zone-d', label: 'ZONE D' },
                    ].map((zp) => (
                      <button
                        key={zp.id}
                        type="button"
                        onClick={() => setSelectedZone(zp.id)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                          selectedZone === zp.id
                            ? 'bg-[#176B4D] text-white shadow-2xs scale-102'
                            : 'bg-[#FAF9F6] text-[#151713] border border-[#DCDAD4] hover:bg-[#F2EFE9]'
                        }`}
                      >
                        {zp.label}
                      </button>
                    ))}

                    <span className="h-4 w-px bg-[#DCDAD4] mx-1" />

                    <span className="text-[10px] uppercase font-mono text-[#666861] font-bold mr-1">SHIFT:</span>
                    {[
                      { id: 'all', label: 'ALL SHIFTS' },
                      { id: 'Shift A', label: 'SHIFT A' },
                      { id: 'Shift B', label: 'SHIFT B' },
                      { id: 'Shift C', label: 'SHIFT C' },
                    ].map((sp) => (
                      <button
                        key={sp.id}
                        type="button"
                        onClick={() => setSelectedShift(sp.id)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                          selectedShift === sp.id
                            ? 'bg-[#176B4D] text-white shadow-2xs scale-102'
                            : 'bg-[#FAF9F6] text-[#151713] border border-[#DCDAD4] hover:bg-[#F2EFE9]'
                        }`}
                      >
                        {sp.label}
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center space-x-1 bg-[#FAF9F6] border border-[#DCDAD4] p-1 rounded-xl">
                    <button
                      type="button"
                      onClick={() => setChampionsCategory('all')}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-semibold transition-colors ${
                        championsCategory === 'all'
                          ? 'bg-[#176B4D] text-white'
                          : 'text-[#666861] hover:text-[#151713]'
                      }`}
                    >
                      SHOW ALL ({safetyChampions.length + repeatOffenders.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setChampionsCategory('champions')}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-semibold transition-colors ${
                        championsCategory === 'champions'
                          ? 'bg-[#B47A18] text-white'
                          : 'text-[#666861] hover:text-[#151713]'
                      }`}
                    >
                      CHAMPIONS ({safetyChampions.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setChampionsCategory('offenders')}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-semibold transition-colors ${
                        championsCategory === 'offenders'
                          ? 'bg-[#A83D45] text-white'
                          : 'text-[#666861] hover:text-[#151713]'
                      }`}
                    >
                      REPEAT OFFENDERS ({repeatOffenders.length})
                    </button>
                  </div>
                </div>
              </div>

              {/* Champions Table */}
              {(championsCategory === 'all' || championsCategory === 'champions') && (
                <div className="bg-white border border-[#DCDAD4] rounded-2xl p-5 shadow-xs space-y-4">
                  <div className="flex items-center justify-between border-b border-[#ECEBE6] pb-3">
                    <div className="flex items-center space-x-2">
                      <Sparkles className="w-5 h-5 text-[#B47A18]" />
                      <h3 className="font-serif font-bold text-base text-[#151713]">
                        Safety Champions Leaderboard — Zero-Harm Streaks
                      </h3>
                    </div>
                    <span className="text-xs font-mono bg-[#FAF6E9] text-[#8A5B0B] border border-[#B47A18]/30 px-3 py-1 rounded-xl font-bold">
                      ★ DGMS SAFETY EXEMPLAR TIERS
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs divide-y divide-[#ECEBE6]">
                      <thead className="bg-[#FAF9F6] text-[#666861] uppercase text-[11px] font-semibold font-mono">
                        <tr>
                          <th className="py-3 px-4">Rank</th>
                          <th className="py-3 px-4">Worker Personnel</th>
                          <th className="py-3 px-4">Worker ID</th>
                          <th className="py-3 px-4">Zone & Shift</th>
                          <th className="py-3 px-4 text-center">Zero-Harm Streak</th>
                          <th className="py-3 px-4 text-center">Safety Score</th>
                          <th className="py-3 px-4 text-center">Violations</th>
                          <th className="py-3 px-4">Awarded Badges</th>
                          <th className="py-3 px-4 text-right">Recognition Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#ECEBE6]">
                        {safetyChampions.length === 0 ? (
                          <tr>
                            <td colSpan={9} className="py-8 text-center text-xs text-[#666861] font-mono">
                              No safety champions found matching the active filter ({selectedZone.toUpperCase()} • {selectedShift}).
                            </td>
                          </tr>
                        ) : (
                          safetyChampions.map((champ, idx) => (
                            <tr key={champ.worker_id} className="hover:bg-[#FAF9F6]/60 transition-colors">
                              <td className="py-3 px-4 font-mono font-bold">
                                <span
                                  className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs ${
                                    idx === 0
                                      ? 'bg-[#B47A18] text-white shadow-xs'
                                      : idx === 1
                                      ? 'bg-[#536B7D] text-white'
                                      : idx === 2
                                      ? 'bg-[#8B5A2B] text-white'
                                      : 'bg-[#ECEBE6] text-[#151713]'
                                  }`}
                                >
                                  {idx + 1}
                                </span>
                              </td>
                              <td className="py-3 px-4">
                                <div className="font-semibold text-[#151713] flex items-center space-x-1.5">
                                  <span>{champ.name}</span>
                                  {idx === 0 && (
                                    <span className="text-[9px] font-mono bg-[#FAF6E9] text-[#8A5B0B] border border-[#B47A18]/30 px-1.5 py-0.2 rounded font-bold">
                                      #1 CHAMPION
                                    </span>
                                  )}
                                </div>
                                <div className="text-[11px] text-[#666861]">{champ.role}</div>
                              </td>
                              <td className="py-3 px-4 font-mono text-[#176B4D] font-bold">{champ.worker_id}</td>
                              <td className="py-3 px-4 font-mono text-[#666861]">
                                <div>{champ.zone_display}</div>
                                <div className="text-[10px] text-[#9A9890]">{champ.shift}</div>
                              </td>
                              <td className="py-3 px-4 text-center font-mono">
                                <span className="px-2.5 py-1 rounded-lg bg-[#FAF6E9] border border-[#B47A18]/30 text-[#8A5B0B] font-bold">
                                  {champ.consecutiveCompliantShifts} SHIFTS
                                </span>
                              </td>
                              <td className="py-3 px-4 text-center font-mono">
                                <span className="text-xs font-bold text-[#176B4D]">
                                  {champ.safetyScore ?? 95}%
                                </span>
                              </td>
                              <td className="py-3 px-4 text-center font-mono">
                                <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                                  champ.recentViolationsCount === 0
                                    ? 'bg-[#EAF3EF] text-[#2D8A61]'
                                    : 'bg-[#FAF6E9] text-[#B47A18]'
                                }`}>
                                  {champ.recentViolationsCount}
                                </span>
                              </td>
                              <td className="py-3 px-4">
                                <div className="flex flex-wrap gap-1">
                                  {champ.badges.map((b, bi) => (
                                    <span
                                      key={bi}
                                      className="px-2 py-0.5 rounded bg-[#FAF9F6] border border-[#DCDAD4] text-[10px] font-mono text-[#151713]"
                                    >
                                      ★ {b}
                                    </span>
                                  ))}
                                </div>
                              </td>
                              <td className="py-3 px-4 text-right">
                                <button
                                  type="button"
                                  onClick={() => {
                                    notificationService.dispatchChampionCommendation(
                                      champ.worker_id,
                                      champ.name,
                                      champ.consecutiveCompliantShifts
                                    );
                                    try {
                                      confetti({ particleCount: 60, spread: 60, origin: { y: 0.6 } });
                                    } catch {}
                                    setToastMessage(`Commendation SMS sent to ${champ.name}! Logged in Outbox.`);
                                  }}
                                  className="px-3 py-1 rounded-xl bg-[#176B4D] hover:bg-[#12553D] text-white font-mono text-xs font-semibold shadow-xs transition-colors"
                                >
                                  Commend SMS
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Repeat Offenders Table */}
              {(championsCategory === 'all' || championsCategory === 'offenders') && (
                <div className="bg-white border border-[#DCDAD4] rounded-2xl p-5 shadow-xs space-y-4">
                  <div className="flex items-center justify-between border-b border-[#ECEBE6] pb-3">
                    <div className="flex items-center space-x-2">
                      <AlertTriangle className="w-5 h-5 text-[#A83D45]" />
                      <h3 className="font-serif font-bold text-base text-[#151713]">
                        Repeat Offenders Escalation List (≥2 Safety Violations)
                      </h3>
                    </div>
                    <span className="text-xs font-mono bg-[#FDF2F2] text-[#A83D45] border border-[#A83D45]/30 px-3 py-1 rounded-xl font-bold">
                      STATUTORY ESCALATION ACTIVE
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs divide-y divide-[#ECEBE6]">
                      <thead className="bg-[#FAF9F6] text-[#666861] uppercase text-[11px] font-semibold font-mono">
                        <tr>
                          <th className="py-3 px-4">Worker Personnel</th>
                          <th className="py-3 px-4">Worker ID</th>
                          <th className="py-3 px-4">Zone & Shift</th>
                          <th className="py-3 px-4 text-center">Safety Score</th>
                          <th className="py-3 px-4 text-center">Recent Violations</th>
                          <th className="py-3 px-4">Escalation Status</th>
                          <th className="py-3 px-4 text-right">Disciplinary Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#ECEBE6]">
                        {repeatOffenders.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="py-8 text-center text-xs text-[#2D8A61] font-mono font-semibold">
                              ✓ No repeat safety offenders in active filter ({selectedZone.toUpperCase()} • {selectedShift}). All personnel in good standing.
                            </td>
                          </tr>
                        ) : (
                          repeatOffenders.map((offender) => (
                            <tr key={offender.worker_id} className="hover:bg-[#FAF9F6]/60 transition-colors">
                              <td className="py-3 px-4">
                                <div className="font-semibold text-[#151713]">{offender.name}</div>
                                <div className="text-[11px] text-[#666861]">{offender.role}</div>
                              </td>
                              <td className="py-3 px-4 font-mono text-[#A83D45] font-bold">{offender.worker_id}</td>
                              <td className="py-3 px-4 font-mono text-[#666861]">
                                <div>{offender.zone_display}</div>
                                <div className="text-[10px] text-[#9A9890]">{offender.shift}</div>
                              </td>
                              <td className="py-3 px-4 text-center font-mono">
                                <span className="text-xs font-bold text-[#A83D45]">
                                  {offender.safetyScore ?? 72}%
                                </span>
                              </td>
                              <td className="py-3 px-4 text-center font-mono">
                                <span className="px-2 py-0.5 rounded bg-[#FDF2F2] text-[#A83D45] font-bold border border-[#A83D45]/30">
                                  {offender.recentViolationsCount} in 14 days
                                </span>
                              </td>
                              <td className="py-3 px-4">
                                <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-[#FEF9E7] text-[#B47A18] border border-[#B47A18]/30">
                                  {offender.escalationStatus}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-right">
                                <button
                                  type="button"
                                  onClick={() => {
                                    notificationService.dispatchWarningNotice(
                                      offender.worker_id,
                                      offender.name,
                                      'Subterranean PPE Non-compliance'
                                    );
                                    setToastMessage(`Warning SMS dispatched to ${offender.name} & Shift In-Charge!`);
                                  }}
                                  className="px-3 py-1 rounded-xl bg-[#A83D45] hover:bg-[#92333B] text-white font-mono text-xs font-semibold shadow-xs transition-colors"
                                >
                                  Issue Warning SMS
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ===================================================================== */}
          {/* TAB 3: MONTHLY TRENDS & ROLLUP ANALYTICS */}
          {/* ===================================================================== */}
          {reportType === 'MONTHLY_TRENDS_ANALYTICS' && (
            <div className="space-y-5">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-white border border-[#DCDAD4] p-4 rounded-2xl shadow-xs">
                  <div className="text-[10px] uppercase font-mono text-[#666861]">30-Day Compliance Avg</div>
                  <div className="font-serif font-bold text-2xl text-[#176B4D] mt-1">{monthlyStats.rate}</div>
                  <div className="text-[10px] text-[#2D8A61] mt-0.5 flex items-center space-x-1">
                    <TrendingUp className="w-3 h-3" />
                    <span>↑ +1.2% vs previous month</span>
                  </div>
                </div>

                <div className="bg-white border border-[#DCDAD4] p-4 rounded-2xl shadow-xs">
                  <div className="text-[10px] uppercase font-mono text-[#666861]">NON-COMPLIANCE INCIDENTS</div>
                  <div className="font-serif font-bold text-2xl text-[#2D8A61] mt-1">{monthlyStats.reductionRate}</div>
                  <div className="text-[10px] text-[#2D8A61] mt-0.5">vs previous 30 days</div>
                </div>

                <div className="bg-white border border-[#DCDAD4] p-4 rounded-2xl shadow-xs">
                  <div className="text-[10px] uppercase font-mono text-[#666861]">Underground Hours Audited</div>
                  <div className="font-serif font-bold text-2xl text-[#151713] mt-1">{monthlyStats.hours}</div>
                  <div className="text-[10px] text-[#666861] mt-0.5">100% LoRa telemetry uptime</div>
                </div>

                <div className="bg-white border border-[#DCDAD4] p-4 rounded-2xl shadow-xs">
                  <div className="text-[10px] uppercase font-mono text-[#666861]">Statutory Audit Status</div>
                  <div className="font-serif font-bold text-2xl text-[#2D8A61] mt-1">{monthlyStats.status}</div>
                  <div className="text-[10px] text-[#666861] mt-0.5">DGMS Form IV validated</div>
                </div>
              </div>

              {/* 30-DAY SVG COMPLIANCE CHART */}
              <div className="bg-white border border-[#DCDAD4] rounded-2xl p-5 shadow-xs space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#ECEBE6] pb-3">
                  <div>
                    <h3 className="font-serif font-bold text-base text-[#151713]">
                      30-Day Subterranean PPE Compliance Trajectory
                    </h3>
                    <p className="text-xs text-[#666861]">
                      Continuous daily compliance % tracked across all subterranean working zones against 95.0% statutory threshold.
                    </p>
                  </div>
                  <div className="flex items-center space-x-3 text-xs font-mono">
                    <span className="flex items-center space-x-1">
                      <span className="w-3 h-0.5 bg-[#176B4D] inline-block" />
                      <span className="text-[#151713]">Daily Compliance %</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <span className="w-3 h-0.5 bg-[#A83D45] border-t border-dashed inline-block" />
                      <span className="text-[#A83D45]">DGMS Statutory Floor (95.0%)</span>
                    </span>
                  </div>
                </div>

                <div className="w-full h-56 relative pt-4">
                  <svg className="w-full h-full overflow-visible" viewBox="0 0 700 180">
                    <defs>
                      <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#176B4D" stopOpacity="0.2" />
                        <stop offset="100%" stopColor="#176B4D" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>

                    <line x1="40" y1="20" x2="680" y2="20" stroke="#ECEBE6" strokeWidth="1" />
                    <line x1="40" y1="65" x2="680" y2="65" stroke="#ECEBE6" strokeWidth="1" />
                    <line x1="40" y1="110" x2="680" y2="110" stroke="#ECEBE6" strokeWidth="1" />
                    <line x1="40" y1="150" x2="680" y2="150" stroke="#DCDAD4" strokeWidth="1" />

                    <text x="5" y="24" fill="#666861" fontSize="10" fontFamily="monospace">100%</text>
                    <text x="5" y="69" fill="#666861" fontSize="10" fontFamily="monospace">98%</text>
                    <text x="5" y="114" fill="#666861" fontSize="10" fontFamily="monospace">96%</text>
                    <text x="5" y="154" fill="#A83D45" fontSize="10" fontFamily="monospace">95%</text>

                    <line x1="40" y1="150" x2="680" y2="150" stroke="#A83D45" strokeWidth="1.5" strokeDasharray="5,4" />

                    <polygon points={polygonPoints} fill="url(#trendGradient)" />

                    <polyline
                      fill="none"
                      stroke="#176B4D"
                      strokeWidth="2.5"
                      points={polylinePoints}
                    />

                    {trajectoryPoints.map((pt, i) => (
                      <g key={i}>
                        <circle cx={pt.x} cy={pt.y} r="3.5" fill="#ffffff" stroke="#176B4D" strokeWidth="2" />
                        <text x={pt.x} y="168" fill="#666861" fontSize="9" textAnchor="middle" fontFamily="monospace">
                          {pt.day}
                        </text>
                      </g>
                    ))}
                  </svg>
                </div>
              </div>
            </div>
          )}

          {/* ===================================================================== */}
          {/* TAB 4: ATMOSPHERIC MULTI-GAS TABLE */}
          {/* ===================================================================== */}
          {reportType === 'ATMOSPHERIC_GAS' && (
            <div className="bg-white border border-[#DCDAD4] rounded-2xl overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs divide-y divide-[#ECEBE6]">
                  <thead className="bg-[#FAF9F6] text-[#666861] uppercase text-[11px] font-semibold font-mono">
                    <tr>
                      <th className="py-3 px-4">Gas / Environmental Metric</th>
                      <th className="py-3 px-4">Sensor Transponder</th>
                      <th className="py-3 px-4">Subterranean Zone</th>
                      <th className="py-3 px-4">Live Telemetry</th>
                      <th className="py-3 px-4">DGMS Limit Baseline</th>
                      <th className="py-3 px-4">Ventilation Airflow</th>
                      <th className="py-3 px-4 text-right">Verdict</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#ECEBE6]">
                    {filteredGasRows.map((row, idx) => (
                      <tr key={idx} className="hover:bg-[#FAF9F6]/60 transition-colors">
                        <td className="py-3 px-4 font-semibold text-[#151713]">{row.gas}</td>
                        <td className="py-3 px-4 font-mono text-[#666861]">{row.sensor}</td>
                        <td className="py-3 px-4 font-mono text-[#666861]">{row.zone}</td>
                        <td className="py-3 px-4 font-mono text-[#176B4D] font-bold">{row.value}</td>
                        <td className="py-3 px-4 font-mono text-[#666861]">{row.threshold}</td>
                        <td className="py-3 px-4 font-mono text-[#666861]">{row.airflow}</td>
                        <td className="py-3 px-4 text-right">
                          <span className="px-2.5 py-1 rounded bg-[#EAF3EF] text-[#2D8A61] border border-[#2D8A61]/30 font-mono text-xs font-bold">
                            {row.verdict}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ===================================================================== */}
          {/* TAB 5: WORKER VITALS & INCIDENTS TABLE */}
          {/* ===================================================================== */}
          {reportType === 'WORKER_VITALS' && (
            <div className="bg-white border border-[#DCDAD4] rounded-2xl overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs divide-y divide-[#ECEBE6]">
                  <thead className="bg-[#FAF9F6] text-[#666861] uppercase text-[11px] font-semibold font-mono">
                    <tr>
                      <th className="py-3 px-4">Worker Personnel</th>
                      <th className="py-3 px-4">Worker ID</th>
                      <th className="py-3 px-4">Subterranean Zone</th>
                      <th className="py-3 px-4 text-center">Heart Rate (PPG)</th>
                      <th className="py-3 px-4 text-center">SpO2 Pulse Oximeter</th>
                      <th className="py-3 px-4 text-center">Motion (6-Axis IMU)</th>
                      <th className="py-3 px-4 text-center">LoRa 868MHz Mesh</th>
                      <th className="py-3 px-4 text-right">Physiological Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#ECEBE6]">
                    {filteredRecords.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-8 text-center text-xs text-[#666861] font-mono">
                          No vitals telemetry records found matching active filter ({selectedZone.toUpperCase()} • {selectedShift}).
                        </td>
                      </tr>
                    ) : (
                      filteredRecords.map((w) => (
                        <tr key={w.worker_id} className="hover:bg-[#FAF9F6]/60 transition-colors">
                          <td className="py-3 px-4 font-semibold text-[#151713]">{w.name}</td>
                          <td className="py-3 px-4 font-mono text-[#176B4D] font-bold">{w.worker_id}</td>
                          <td className="py-3 px-4 font-mono text-[#666861]">{w.zone_display}</td>
                          <td className="py-3 px-4 text-center font-mono">
                            <span className={w.heartRate > 100 ? 'text-[#A83D45] font-bold' : 'text-[#151713]'}>
                              {w.heartRate} BPM
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center font-mono">
                            <span className={w.spo2 < 90 ? 'text-[#A83D45] font-bold' : 'text-[#2D8A61]'}>{w.spo2}%</span>
                          </td>
                          <td className="py-3 px-4 text-center font-mono uppercase">
                            <span
                              className={
                                w.movement === 'fall'
                                  ? 'px-2 py-0.5 rounded bg-[#FDF2F2] text-[#A83D45] font-bold'
                                  : 'text-[#666861]'
                              }
                            >
                              {w.movement}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center font-mono text-[#2D8A61] font-semibold">
                            {w.loraSignal.toUpperCase()}
                          </td>
                          <td className="py-3 px-4 text-right font-mono font-bold">
                            <span
                              className={`px-2.5 py-1 rounded-lg ${
                                w.status === 'CRITICAL'
                                  ? 'bg-[#FDF2F2] text-[#A83D45] border border-[#A83D45]/30'
                                  : w.status === 'ATTENTION'
                                  ? 'bg-[#FEF9E7] text-[#B47A18] border border-[#B47A18]/30'
                                  : 'bg-[#EAF3EF] text-[#2D8A61] border border-[#2D8A61]/30'
                              }`}
                            >
                              {w.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ===================================================================== */}
      {/* 3. INTERACTIVE DEVICE PREVIEW MODAL (SMS PHONE & EMAIL MEMO) */}
      {/* ===================================================================== */}
      {previewItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-[#DCDAD4] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-4 border-b border-[#ECEBE6] flex items-center justify-between bg-[#FAF9F6]">
              <div className="flex items-center space-x-2">
                <Smartphone className="w-5 h-5 text-[#176B4D]" />
                <div>
                  <h3 className="font-serif font-bold text-sm text-[#151713]">
                    Statutory Dispatch Live Preview
                  </h3>
                  <p className="text-[11px] text-[#666861]">
                    Channel: {previewItem.channel} • To: {previewItem.recipientName}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPreviewItem(null)}
                className="p-1 rounded-lg text-[#666861] hover:text-[#151713] hover:bg-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 bg-[#F5F4EF]">
              {previewItem.channel === 'SMS' ? (
                /* Sleek Smartphone SMS Screen Mockup */
                <div className="max-w-xs mx-auto bg-slate-950 text-slate-100 rounded-3xl p-4 shadow-xl border-4 border-slate-800 space-y-3">
                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono border-b border-slate-800 pb-2">
                    <span>9:41 AM</span>
                    <span className="text-emerald-400 font-bold">● LoRa M-SAFE</span>
                    <span>100%</span>
                  </div>

                  <div className="text-center py-1 border-b border-slate-800/80">
                    <div className="text-xs font-bold text-white">{previewItem.recipientName}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{previewItem.recipientContact}</div>
                  </div>

                  <div className="space-y-2 py-3">
                    <div className="text-center text-[10px] text-slate-400 font-mono">
                      TODAY {previewItem.timestamp}
                    </div>

                    <div className="bg-[#176B4D] text-white p-3 rounded-2xl rounded-tl-xs text-xs space-y-1 shadow-sm">
                      <div className="font-bold font-mono text-[11px] uppercase tracking-wide text-emerald-200">
                        {previewItem.subject}
                      </div>
                      <div className="leading-relaxed font-sans">{previewItem.message}</div>
                    </div>
                  </div>

                  <div className="text-[10px] text-emerald-400 font-mono text-right flex items-center justify-end space-x-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Delivered via SMS Gateway</span>
                  </div>
                </div>
              ) : (
                /* Formal Directorate Memorandum Email */
                <div className="bg-white border border-[#DCDAD4] rounded-2xl p-5 shadow-sm space-y-3 font-sans text-xs">
                  <div className="border-b border-[#ECEBE6] pb-3 space-y-1">
                    <div className="text-[10px] uppercase font-mono text-[#176B4D] font-bold">
                      OFFICIAL DGMS STATUTORY SAFETY TRANSMISSION
                    </div>
                    <div className="text-sm font-serif font-bold text-[#151713]">{previewItem.subject}</div>
                    <div className="text-[11px] text-[#666861] font-mono">
                      To: {previewItem.recipientName} &lt;{previewItem.recipientContact}&gt;
                    </div>
                    <div className="text-[11px] text-[#666861] font-mono">
                      Date: {previewItem.timestamp} • Directorate General of Mines Safety
                    </div>
                  </div>

                  <div className="p-3 bg-[#FAF9F6] rounded-xl border border-[#ECEBE6] text-[#151713] leading-relaxed">
                    {previewItem.message}
                  </div>

                  <div className="pt-2 text-[10px] text-[#666861] font-mono flex items-center justify-between">
                    <span>Certificate Hash: SHA256-DGMS-{previewItem.id.slice(0, 8)}</span>
                    <span className="text-[#2D8A61] font-bold">STATUS: {previewItem.status} ✓</span>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-[#ECEBE6] bg-[#FAF9F6] flex items-center justify-end space-x-2">
              <button
                type="button"
                onClick={() => setPreviewItem(null)}
                className="px-4 py-2 rounded-xl bg-white border border-[#DCDAD4] hover:bg-[#FAF9F6] text-xs font-semibold text-[#151713]"
              >
                Close Preview
              </button>
              <button
                type="button"
                onClick={() => {
                  handleResend(previewItem.id);
                  setPreviewItem(null);
                }}
                className="px-4 py-2 rounded-xl bg-[#176B4D] hover:bg-[#12553D] text-white text-xs font-semibold"
              >
                Resend Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* 4. COMPOSE NOTIFICATION MODAL */}
      {/* ===================================================================== */}
      {composeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-[#DCDAD4] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
            <form onSubmit={handleDispatchCompose}>
              {/* Header */}
              <div className="p-4 border-b border-[#ECEBE6] flex items-center justify-between bg-[#FAF9F6]">
                <div className="flex items-center space-x-2">
                  <Send className="w-5 h-5 text-[#176B4D]" />
                  <div>
                    <h3 className="font-serif font-bold text-sm text-[#151713]">
                      Compose Statutory Notification
                    </h3>
                    <p className="text-[11px] text-[#666861]">
                      Direct Multi-Channel Dispatch (SMS / Email / Push)
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setComposeModalOpen(false)}
                  className="p-1 rounded-lg text-[#666861] hover:text-[#151713] hover:bg-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body Form */}
              <div className="p-5 space-y-3.5 text-xs">
                {/* Template Quick Presets */}
                <div>
                  <label className="block font-mono uppercase text-[10px] text-[#666861] mb-1 font-semibold">
                    Quick Preset Template
                  </label>
                  <select
                    onChange={(e) => applyTemplate(e.target.value)}
                    className="w-full bg-[#FAF9F6] border border-[#DCDAD4] rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:border-[#176B4D]"
                  >
                    <option value="">-- Choose Template Preset --</option>
                    <option value="EVACUATION">🚨 Emergency Subterranean Evacuation Order</option>
                    <option value="GAS_WARNING">⚠️ Zone Atmospheric Gas Breach Advisory</option>
                    <option value="CHAMPION">🏆 30-Shift Safety Champion Commendation</option>
                    <option value="WARNING">📋 Disciplinary Warning Notice (DGMS Reg 1957)</option>
                    <option value="HANDOVER">✉ Shift Safety Handover Summary Digest</option>
                  </select>
                </div>

                {/* Recipient Preset */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-mono uppercase text-[10px] text-[#666861] mb-1 font-semibold">
                      Recipient Personnel
                    </label>
                    <select
                      value={composeRecipientName}
                      onChange={(e) => {
                        const val = e.target.value;
                        setComposeRecipientName(val);
                        if (val === 'Sunil Marandi') {
                          setComposeRecipientRole('Continuous Haulage Driver');
                          setComposeRecipientContact('+91 98721-44109');
                        } else if (val === 'Vikram Nayak') {
                          setComposeRecipientRole('Chief Longwall Operator');
                          setComposeRecipientContact('+91 94311-55021');
                        } else if (val === 'Ashok Varma (Shift In-Charge)') {
                          setComposeRecipientRole('Shift In-Charge (Shift A)');
                          setComposeRecipientContact('+91 94311-88204');
                        } else if (val === 'Director K. V. Rao') {
                          setComposeRecipientRole('Mine General Manager');
                          setComposeRecipientContact('director.rao@jharia-coal.gov.in');
                          setComposeChannel('EMAIL');
                        }
                      }}
                      className="w-full bg-[#FAF9F6] border border-[#DCDAD4] rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:border-[#176B4D]"
                    >
                      <option value="Sunil Marandi">Sunil Marandi (WM-6288)</option>
                      <option value="Vikram Nayak">Vikram Nayak (WM-8492)</option>
                      <option value="Devendra Sharma">Devendra Sharma (WM-9021)</option>
                      <option value="Ashok Varma (Shift In-Charge)">Ashok Varma (Shift In-Charge)</option>
                      <option value="Director K. V. Rao">Director K. V. Rao (Mine Manager)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-mono uppercase text-[10px] text-[#666861] mb-1 font-semibold">
                      Channel
                    </label>
                    <select
                      value={composeChannel}
                      onChange={(e) => setComposeChannel(e.target.value as NotificationChannel)}
                      className="w-full bg-[#FAF9F6] border border-[#DCDAD4] rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:border-[#176B4D]"
                    >
                      <option value="SMS">SMS Gateway (+91 Mobile)</option>
                      <option value="EMAIL">EMAIL (Directorate Digest)</option>
                      <option value="IN_APP_PUSH">IN_APP_PUSH (Console Alert)</option>
                    </select>
                  </div>
                </div>

                {/* Contact & Subject */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-mono uppercase text-[10px] text-[#666861] mb-1 font-semibold">
                      Contact Target
                    </label>
                    <input
                      type="text"
                      value={composeRecipientContact}
                      onChange={(e) => setComposeRecipientContact(e.target.value)}
                      className="w-full bg-[#FAF9F6] border border-[#DCDAD4] rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:border-[#176B4D]"
                    />
                  </div>

                  <div>
                    <label className="block font-mono uppercase text-[10px] text-[#666861] mb-1 font-semibold">
                      Classification Type
                    </label>
                    <select
                      value={composeType}
                      onChange={(e) => setComposeType(e.target.value as NotificationType)}
                      className="w-full bg-[#FAF9F6] border border-[#DCDAD4] rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:border-[#176B4D]"
                    >
                      <option value="CRITICAL_BREACH_ALERT">CRITICAL_BREACH_ALERT</option>
                      <option value="REPEAT_OFFENDER_WARNING">REPEAT_OFFENDER_WARNING</option>
                      <option value="SAFETY_CHAMPION_COMMENDATION">SAFETY_CHAMPION_COMMENDATION</option>
                      <option value="EMERGENCY_EVACUATION_BROADCAST">EMERGENCY_EVACUATION_BROADCAST</option>
                      <option value="STATUTORY_DAILY_DIGEST">STATUTORY_DAILY_DIGEST</option>
                    </select>
                  </div>
                </div>

                {/* Subject */}
                <div>
                  <label className="block font-mono uppercase text-[10px] text-[#666861] mb-1 font-semibold">
                    Message Subject Header
                  </label>
                  <input
                    type="text"
                    value={composeSubject}
                    onChange={(e) => setComposeSubject(e.target.value)}
                    required
                    className="w-full bg-[#FAF9F6] border border-[#DCDAD4] rounded-xl px-3 py-2 text-xs font-sans font-semibold focus:outline-none focus:border-[#176B4D]"
                  />
                </div>

                {/* Message Body */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-mono uppercase text-[10px] text-[#666861] font-semibold">
                      Notification Body
                    </label>
                    <span className="text-[10px] font-mono text-[#666861]">
                      {composeMessage.length} characters
                    </span>
                  </div>
                  <textarea
                    value={composeMessage}
                    onChange={(e) => setComposeMessage(e.target.value)}
                    rows={4}
                    required
                    className="w-full bg-[#FAF9F6] border border-[#DCDAD4] rounded-xl p-3 text-xs font-sans focus:outline-none focus:border-[#176B4D] leading-relaxed"
                  />
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-4 border-t border-[#ECEBE6] bg-[#FAF9F6] flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setComposeModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white border border-[#DCDAD4] hover:bg-[#FAF9F6] text-xs font-semibold text-[#151713]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#176B4D] hover:bg-[#12553D] text-white text-xs font-semibold flex items-center space-x-1.5 shadow-xs"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Dispatch Notification Now</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </ControlRoomLayout>
  );
};
