"use client";

import { useState, useCallback } from "react";
import { Appointment } from "@/types/appointment";
import { appointmentService } from "@/services/appointmentService";

/**
 * Hook para gerenciar o cancelamento de agendamentos
 */
export function useAppointmentCancel() {
  const [cancelling, setCancelling] = useState(false);
  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const openCancelDialog = useCallback((appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setDialogOpen(true);
  }, []);

  const closeCancelDialog = useCallback(() => {
    if (!cancelling) {
      setDialogOpen(false);
      setSelectedAppointment(null);
    }
  }, [cancelling]);

  const cancelAppointment = useCallback(
    async (barberId: string, clientId: string) => {
      if (!selectedAppointment?.id) {
        setError("Dados do agendamento incompletos");
        return false;
      }

      try {
        setCancelling(true);
        setError(null);

        await appointmentService.cancelAppointmentByClient(
          barberId,
          selectedAppointment.id,
          clientId
        );

        setSuccess("Agendamento cancelado com sucesso!");
        setDialogOpen(false);
        setSelectedAppointment(null);
        return true;
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Erro ao cancelar agendamento"
        );
        return false;
      } finally {
        setCancelling(false);
      }
    },
    [selectedAppointment]
  );

  const clearMessages = useCallback(() => {
    setError(null);
    setSuccess(null);
  }, []);

  return {
    cancelling,
    selectedAppointment,
    dialogOpen,
    error,
    success,
    openCancelDialog,
    closeCancelDialog,
    cancelAppointment,
    clearMessages,
  };
}
