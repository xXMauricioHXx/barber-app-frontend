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
  loadTodayAppointments: (barberId: string) => Promise<void>;
  refreshStats: (barberId: string) => Promise<void>;
  getTodayTotal: () => number;
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
  loadTodayAppointments: async () => {},
  refreshStats: async () => {},
  getTodayTotal: () => 0,
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

  const clearCache = useCallback(() => {
    setAppointments([]);
    setStats({
      todayTotal: 0,
      weekTotal: 0,
      monthTotal: 0,
      lastUpdated: null,
    });
    setError(null);
  }, []);

  const value = {
    appointments,
    stats,
    loading,
    error,
    loadTodayAppointments,
    refreshStats,
    getTodayTotal,
    clearCache,
  };

  return (
    <AppointmentContext.Provider value={value}>
      {children}
    </AppointmentContext.Provider>
  );
};
