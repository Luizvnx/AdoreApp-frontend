import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import { UI_MESSAGES } from '../constants/messages';
import { getApiErrorMessage } from '../utils/messageHandler';

export interface SummaryData {
  totalVisitors: number;
  visitorsThisMonth: number;
  totalServicesRegistered: number;
  overallAvgAttendance: number;
}

export interface MonthMetric {
  label: string;
  monthIndex: number;
  count: number;
}

export interface WeekDayMetric {
  day: string;
  dayIndex: number;
  count: number;
}

export interface YearMetric {
  year: number;
  count: number;
}

export interface ServiceStat {
  serviceName: string;
  totalServices: number;
  totalPeople: number;
  avgPeople: number;
}

export interface ServiceRecord {
  id: string;
  date: string;
  serviceName: string;
  attendanceCount: number;
  preacher?: string | null;
  notes?: string | null;
  createdBy?: {
    fullName: string;
  } | null;
}

export function useServiceMetrics() {
  const { showError, showSuccess } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [summary, setSummary] = useState<SummaryData>({
    totalVisitors: 0,
    visitorsThisMonth: 0,
    totalServicesRegistered: 0,
    overallAvgAttendance: 0
  });

  const [visitorsByMonth, setVisitorsByMonth] = useState<MonthMetric[]>([]);
  const [visitorsByDayOfWeek, setVisitorsByDayOfWeek] = useState<WeekDayMetric[]>([]);
  const [visitorsByYear, setVisitorsByYear] = useState<YearMetric[]>([]);
  const [serviceStats, setServiceStats] = useState<ServiceStat[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<ServiceRecord[]>([]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [metricsRes, attendanceRes] = await Promise.all([
        api.get('/attendance/metrics'),
        api.get('/attendance')
      ]);

      if (metricsRes.data) {
        setSummary(metricsRes.data.summary || {});
        setVisitorsByMonth(metricsRes.data.visitorsByMonth || []);
        setVisitorsByDayOfWeek(metricsRes.data.visitorsByDayOfWeek || []);
        setVisitorsByYear(metricsRes.data.visitorsByYear || []);
        setServiceStats(metricsRes.data.serviceStats || []);
      }

      if (attendanceRes.data) {
        setAttendanceRecords(attendanceRes.data || []);
      }
    } catch (err) {
      showError(UI_MESSAGES.ERRORS.LOAD_METRICS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const createAttendance = async (data: { serviceName: string, attendanceCount: number, serviceDate: string, preacher?: string, notes: string }) => {
    try {
      setSaving(true);
      await api.post('/attendance', {
        date: data.serviceDate,
        serviceName: data.serviceName,
        attendanceCount: data.attendanceCount,
        preacher: data.preacher,
        notes: data.notes
      });
      showSuccess(UI_MESSAGES.SUCCESS.ATTENDANCE_REGISTERED);
      await fetchData();
      return true;
    } catch (err: any) {
      showError(getApiErrorMessage(err, UI_MESSAGES.ERRORS.REGISTER_ATTENDANCE));
      return false;
    } finally {
      setSaving(false);
    }
  };

  const deleteAttendance = async (id: string) => {
    if (!window.confirm('Deseja realmente excluir este registro de culto?')) return false;
    try {
      setDeletingId(id);
      await api.delete(`/attendance/${id}`);
      setAttendanceRecords(prev => prev.filter(item => item.id !== id));
      showSuccess(UI_MESSAGES.SUCCESS.ATTENDANCE_DELETED);
      await fetchData();
      return true;
    } catch (err) {
      showError(UI_MESSAGES.ERRORS.DELETE_ATTENDANCE);
      return false;
    } finally {
      setDeletingId(null);
    }
  };

  return {
    loading,
    saving,
    deletingId,
    summary,
    visitorsByMonth,
    visitorsByDayOfWeek,
    visitorsByYear,
    serviceStats,
    attendanceRecords,
    fetchData,
    createAttendance,
    deleteAttendance
  };
}
