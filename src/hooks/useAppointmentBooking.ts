"use client";

import { useState, useCallback } from "react";
import { appointmentService } from "@/services/appointmentService";
import { ServiceType } from "@/types/serviceType";
import { Employee } from "@/types/employee";
import { Client } from "@/types/client";

interface BookingFormData {
  selectedEmployee: string;
  selectedDate: Date | null;
  selectedTime: string;
}

/**
 * Hook para gerenciar o processo de criação de agendamento
 * Responsável pelo estado do formulário e submissão
 */
export function useAppointmentBooking() {
  const [formData, setFormData] = useState<BookingFormData>({
    selectedEmployee: "",
    selectedDate: null,
    selectedTime: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const updateFormData = useCallback((updates: Partial<BookingFormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  }, []);

  const resetForm = useCallback(() => {
    setFormData({
      selectedEmployee: "",
      selectedDate: null,
      selectedTime: "",
    });
    setError(null);
    setSuccess(null);
  }, []);

  const submitBooking = useCallback(
    async (
      clientData: Client,
      employees: Employee[],
      serviceType: ServiceType | null
    ) => {
      const { selectedEmployee, selectedDate, selectedTime } = formData;

      if (!selectedEmployee || !selectedDate || !selectedTime || !serviceType) {
        setError("Por favor, preencha todos os campos");
        return false;
      }

      if (!clientData.stripeCustomerId) {
        setError("Não é possível realizar agendamento");
        return false;
      }

      try {
        setSubmitting(true);
        setError(null);

        const [hours, minutes] = selectedTime.split(":").map(Number);
        const scheduledDateTime = new Date(selectedDate);
        scheduledDateTime.setHours(hours, minutes, 0, 0);

        const selectedEmp = employees.find(
          (emp) => emp.id === selectedEmployee
        );

        if (!selectedEmp) {
          setError("Profissional selecionado não encontrado");
          return false;
        }

        const barberId = clientData.selectedBarbersId?.[0];
        if (!barberId) {
          setError("Estabelecimento não encontrado");
          return false;
        }

        await appointmentService.createAppointment(barberId, {
          clientName: clientData.name,
          clientPhone: clientData.phone,
          scheduledTime: scheduledDateTime,
          selectedBarber: selectedEmp,
          serviceType,
          clientPlan: clientData.plan,
          status: "Agendado",
          clientId: clientData.id || "",
        });

        setSuccess("Agendamento realizado com sucesso!");
        resetForm();
        return true;
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Erro ao realizar agendamento"
        );
        return false;
      } finally {
        setSubmitting(false);
      }
    },
    [formData, resetForm]
  );

  const clearMessages = useCallback(() => {
    setError(null);
    setSuccess(null);
  }, []);

  return {
    formData,
    updateFormData,
    submitting,
    error,
    success,
    submitBooking,
    resetForm,
    clearMessages,
  };
}
