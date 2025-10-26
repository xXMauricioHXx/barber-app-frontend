"use client";

import { useState, useEffect, useCallback } from "react";
import { Appointment } from "@/types/appointment";
import { clientService } from "@/services/clientService";

/**
 * Hook para gerenciar agendamentos do cliente
 * Responsável por carregar, filtrar e manipular agendamentos
 */
export function useClientAppointments(clientId: string | undefined) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadAppointments = useCallback(async () => {
    if (!clientId) return;

    try {
      setLoading(true);
      setError(null);
      const data = await clientService.getClientAppointments(clientId);
      setAppointments(data);
    } catch (err) {
      console.error("Erro ao carregar agendamentos:", err);
      setError("Erro ao carregar agendamentos. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }, [clientId]);

  useEffect(() => {
    loadAppointments();
  }, [loadAppointments]);

  const refreshAppointments = useCallback(() => {
    return loadAppointments();
  }, [loadAppointments]);

  return {
    appointments,
    loading,
    error,
    refreshAppointments,
  };
}
