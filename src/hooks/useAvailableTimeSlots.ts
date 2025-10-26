"use client";

import { useMemo } from "react";
import { format } from "date-fns";
import { Appointment } from "@/types/appointment";
import { Barber } from "@/types/barbers";
import { generateTimeSlots, filterAvailableSlots } from "@/utils/timeSlots";

/**
 * Hook para calcular slots de horário disponíveis
 * Responsável por filtrar horários ocupados e retornar apenas disponíveis
 */
export function useAvailableTimeSlots(
  selectedDate: Date | null,
  selectedEmployee: string,
  barber: Barber | null,
  existingAppointments: Appointment[]
) {
  return useMemo(() => {
    if (!selectedDate || !selectedEmployee || !barber) {
      return [];
    }

    const startWork = barber.startWork || "08:00";
    const endWork = barber.endWork || "18:00";
    const allSlots = generateTimeSlots(startWork, endWork, 30);

    if (!existingAppointments || existingAppointments.length === 0) {
      return allSlots;
    }

    const dateAppointments = existingAppointments.filter((apt) => {
      const aptDate = apt.scheduledTime;
      return (
        aptDate.getDate() === selectedDate.getDate() &&
        aptDate.getMonth() === selectedDate.getMonth() &&
        aptDate.getFullYear() === selectedDate.getFullYear() &&
        apt.selectedBarber?.id === selectedEmployee
      );
    });

    const busyTimes = dateAppointments.map((apt) =>
      format(apt.scheduledTime, "HH:mm")
    );

    return filterAvailableSlots(allSlots, busyTimes);
  }, [selectedDate, selectedEmployee, existingAppointments, barber]);
}
