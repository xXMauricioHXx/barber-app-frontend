"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { Appointment } from "@/types/appointment";
import { appointmentService } from "@/services/appointmentService";

interface AppointmentStats {
  todayTotal: number;
  weekTotal: number;
  monthTotal: number;
  lastUpdated: Date | null;
}

interface AppointmentContextType {
  appointments: Appointment[];
  stats: AppointmentStats;
  loading: boolean;
  error: string | null;
  selectedDate: Date;
  loadTodayAppointments: (barberId: string) => Promise<void>;
  loadAppointmentsByDate: (barberId: string, date: Date) => Promise<void>;
  refreshStats: (barberId: string) => Promise<void>;
  getTodayTotal: () => number;
  getAppointmentsByStatus: (status: string) => Appointment[];
  setSelectedDate: (date: Date) => void;
  clearCache: () => void;
}

const AppointmentContext = createContext<AppointmentContextType>({
  appointments: [],
  stats: {
    todayTotal: 0,
    weekTotal: 0,
    monthTotal: 0,
    lastUpdated: null,
  },
  loading: false,
  error: null,
  selectedDate: new Date(),
  loadTodayAppointments: async () => {},
  loadAppointmentsByDate: async () => {},
  refreshStats: async () => {},
  getTodayTotal: () => 0,
  getAppointmentsByStatus: () => [],
  setSelectedDate: () => {},
  clearCache: () => {},
});

export const useAppointments = () => {
  const context = useContext(AppointmentContext);
  if (!context) {
    throw new Error(
      "useAppointments deve ser usado dentro de um AppointmentProvider"
    );
  }
  return context;
};

interface AppointmentProviderProps {
  children: React.ReactNode;
}

export const AppointmentProvider = ({ children }: AppointmentProviderProps) => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [stats, setStats] = useState<AppointmentStats>({
    todayTotal: 0,
    weekTotal: 0,
    monthTotal: 0,
    lastUpdated: null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const loadTodayAppointments = useCallback(async (barberId: string) => {
    try {
      setLoading(true);
      setError(null);

      const todayAppointments = await appointmentService.getTodayAppointments(
        barberId
      );
      setAppointments(todayAppointments);

      // Atualizar estatísticas
      setStats((prev) => ({
        ...prev,
        todayTotal: todayAppointments.length,
        lastUpdated: new Date(),
      }));
    } catch (err) {
      console.error("Erro ao carregar agendamentos:", err);
      setError(
        err instanceof Error ? err.message : "Erro ao carregar agendamentos"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const loadAppointmentsByDate = useCallback(
    async (barberId: string, date: Date) => {
      try {
        setLoading(true);
        setError(null);

        const dateAppointments =
          await appointmentService.getAppointmentsByBarberAndDate(
            barberId,
            date
          );
        setAppointments(dateAppointments);

        // Atualizar estatísticas se for data de hoje
        const today = new Date();
        const isToday = date.toDateString() === today.toDateString();

        if (isToday) {
          setStats((prev) => ({
            ...prev,
            todayTotal: dateAppointments.length,
            lastUpdated: new Date(),
          }));
        }
      } catch (err) {
        console.error("Erro ao carregar agendamentos:", err);
        setError(
          err instanceof Error ? err.message : "Erro ao carregar agendamentos"
        );
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const refreshStats = useCallback(async (barberId: string) => {
    try {
      const statsData = await appointmentService.getAppointmentStats(barberId);

      setStats({
        todayTotal: statsData.today,
        weekTotal: statsData.week,
        monthTotal: statsData.month,
        lastUpdated: new Date(),
      });
    } catch (err) {
      console.error("Erro ao atualizar estatísticas:", err);
    }
  }, []);

  const getTodayTotal = useCallback(() => {
    return stats.todayTotal;
  }, [stats.todayTotal]);

  const getAppointmentsByStatus = useCallback(
    (status: string) => {
      return appointments.filter(
        (appointment) => appointment.status === status
      );
    },
    [appointments]
  );

  const clearCache = useCallback(() => {
    setAppointments([]);
    setStats({
      todayTotal: 0,
      weekTotal: 0,
      monthTotal: 0,
      lastUpdated: null,
    });
    setError(null);
    setSelectedDate(new Date());
  }, []);

  const value = {
    appointments,
    stats,
    loading,
    error,
    selectedDate,
    loadTodayAppointments,
    loadAppointmentsByDate,
    refreshStats,
    getTodayTotal,
    getAppointmentsByStatus,
    setSelectedDate,
    clearCache,
  };

  return (
    <AppointmentContext.Provider value={value}>
      {children}
    </AppointmentContext.Provider>
  );
};
