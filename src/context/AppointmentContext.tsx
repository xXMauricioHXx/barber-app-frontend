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
  viewAllAppointments: boolean;
  loadTodayAppointments: (barberId: string) => Promise<void>;
  loadAppointmentsByDate: (barberId: string, date: Date) => Promise<void>;
  loadAllAppointments: (barberId: string) => Promise<void>;
  refreshStats: (barberId: string) => Promise<void>;
  getTodayTotal: () => number;
  getAppointmentsByStatus: (status: string) => Appointment[];
  setSelectedDate: (date: Date) => void;
  setViewAllAppointments: (viewAll: boolean) => void;
  clearCache: () => void;
  filterAppointmentsByDate: (date: Date) => Appointment[];
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
  viewAllAppointments: false,
  loadTodayAppointments: async () => {},
  loadAppointmentsByDate: async () => {},
  loadAllAppointments: async () => {},
  refreshStats: async () => {},
  getTodayTotal: () => 0,
  getAppointmentsByStatus: () => [],
  setSelectedDate: () => {},
  setViewAllAppointments: () => {},
  clearCache: () => {},
  filterAppointmentsByDate: () => [],
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
  const [viewAllAppointments, setViewAllAppointments] = useState(false);

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

  const filterAppointmentsByDate = useCallback(
    (date: Date) => {
      const filteredAppointments = appointments.filter((appointment) => {
        const appointmentDate = new Date(appointment.scheduledTime);
        return (
          appointmentDate.getFullYear() === date.getFullYear() &&
          appointmentDate.getMonth() === date.getMonth() &&
          appointmentDate.getDate() === date.getDate()
        );
      });

      setAppointments(filteredAppointments);

      return filteredAppointments;
    },
    [appointments]
  );

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

  const loadAllAppointments = useCallback(async (barberId: string) => {
    try {
      setLoading(true);
      setError(null);

      const allAppointments =
        await appointmentService.getAllAppointmentsByBarber(barberId);
      console.log("All Appointments:", allAppointments);
      setAppointments(allAppointments);
    } catch (err) {
      console.error("Erro ao carregar todos os agendamentos:", err);
      setError(
        err instanceof Error ? err.message : "Erro ao carregar agendamentos"
      );
    } finally {
      setLoading(false);
    }
  }, []);

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
    setViewAllAppointments(false);
  }, []);

  const value = {
    appointments,
    stats,
    loading,
    error,
    selectedDate,
    viewAllAppointments,
    loadTodayAppointments,
    loadAppointmentsByDate,
    loadAllAppointments,
    refreshStats,
    getTodayTotal,
    getAppointmentsByStatus,
    setSelectedDate,
    setViewAllAppointments,
    clearCache,
    filterAppointmentsByDate,
  };

  return (
    <AppointmentContext.Provider value={value}>
      {children}
    </AppointmentContext.Provider>
  );
};
