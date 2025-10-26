import { format, isToday, isTomorrow } from "date-fns";
import { ptBR } from "date-fns/locale";

/**
 * Formata uma data com label amigável (Hoje, Amanhã, ou dd/MM/yyyy)
 */
export function formatDateLabel(date: Date): string {
  if (isToday(date)) return "Hoje";
  if (isTomorrow(date)) return "Amanhã";
  return format(date, "dd/MM/yyyy", { locale: ptBR });
}

/**
 * Formata hora no padrão HH:mm
 */
export function formatTime(date: Date): string {
  return format(date, "HH:mm", { locale: ptBR });
}

/**
 * Formata data completa: "dd/MM/yyyy às HH:mm"
 */
export function formatDateTime(date: Date): string {
  return format(date, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
}

/**
 * Formata data e hora separadamente com labels amigáveis
 */
export function formatAppointmentDateTime(date: Date): {
  dateLabel: string;
  timeLabel: string;
} {
  return {
    dateLabel: formatDateLabel(date),
    timeLabel: formatTime(date),
  };
}
