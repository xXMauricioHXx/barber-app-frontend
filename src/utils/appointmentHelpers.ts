import { Appointment } from "@/types/appointment";
import { startOfDay } from "date-fns";

/**
 * Verifica se um agendamento pode ser cancelado
 */
export function canCancelAppointment(
  appointment: Appointment,
  today: Date = startOfDay(new Date())
): boolean {
  if (!["Agendado", "Confirmado"].includes(appointment.status)) {
    return false;
  }

  const appointmentTime = appointment.scheduledTime;
  const hoursDifference =
    (appointmentTime.getTime() - today.getTime()) / (1000 * 60 * 60);

  return hoursDifference >= 2;
}

/**
 * Obtém cor do chip de status baseado no status do agendamento
 */
export function getStatusColor(
  status: string
): "primary" | "info" | "success" | "error" | "default" {
  switch (status) {
    case "Agendado":
      return "primary";
    case "Confirmado":
      return "info";
    case "Concluído":
      return "success";
    case "Cancelado":
      return "error";
    default:
      return "default";
  }
}

/**
 * Filtra e ordena agendamentos baseado em critérios
 */
export function filterAndSortAppointments(
  appointments: Appointment[],
  filters: {
    showAll: boolean;
    filterDate: Date | null;
    includeCancelled: boolean;
  },
  referenceDate: Date = startOfDay(new Date())
): Appointment[] {
  let filtered = [...appointments];

  // Filtrar por data específica
  if (!filters.showAll && filters.filterDate) {
    filtered = filtered.filter((apt) => {
      const aptDate = apt.scheduledTime;
      return (
        aptDate.getDate() === filters.filterDate!.getDate() &&
        aptDate.getMonth() === filters.filterDate!.getMonth() &&
        aptDate.getFullYear() === filters.filterDate!.getFullYear()
      );
    });
  }

  // Filtrar cancelados
  if (!filters.includeCancelled) {
    filtered = filtered.filter((apt) => apt.status !== "Cancelado");
  }

  // Ordenar: futuros primeiro (próximo primeiro), passados depois (recente primeiro)
  return filtered.sort((a, b) => {
    const now = referenceDate.getTime();
    const aIsFuture = a.scheduledTime.getTime() > now;
    const bIsFuture = b.scheduledTime.getTime() > now;

    if (aIsFuture && bIsFuture) {
      return a.scheduledTime.getTime() - b.scheduledTime.getTime();
    } else if (!aIsFuture && !bIsFuture) {
      return b.scheduledTime.getTime() - a.scheduledTime.getTime();
    } else if (aIsFuture && !bIsFuture) {
      return -1;
    } else {
      return 1;
    }
  });
}
