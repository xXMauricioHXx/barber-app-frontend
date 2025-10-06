import {
  format,
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  addDays,
  subDays,
  isToday,
  isThisWeek,
  isThisMonth,
  parseISO,
  isValid,
  addHours,
  differenceInMinutes,
  isBefore,
  isAfter,
  isSameDay,
  getDay,
} from "date-fns";
import { ptBR } from "date-fns/locale";

/**
 * Formata uma data para exibição
 */
export const formatDate = (
  date: Date | string,
  pattern: string = "dd/MM/yyyy"
): string => {
  const dateObj = typeof date === "string" ? parseISO(date) : date;

  if (!isValid(dateObj)) {
    return "Data inválida";
  }

  return format(dateObj, pattern, { locale: ptBR });
};

/**
 * Formata data e hora para exibição
 */
export const formatDateTime = (date: Date | string): string => {
  return formatDate(date, "dd/MM/yyyy HH:mm");
};

/**
 * Formata apenas a hora
 */
export const formatTime = (date: Date | string): string => {
  return formatDate(date, "HH:mm");
};

/**
 * Formata data por extenso
 */
export const formatDateExtended = (date: Date | string): string => {
  return formatDate(date, "EEEE, dd 'de' MMMM 'de' yyyy");
};

/**
 * Retorna o início do dia
 */
export const getStartOfDay = (date: Date): Date => {
  return startOfDay(date);
};

/**
 * Retorna o final do dia
 */
export const getEndOfDay = (date: Date): Date => {
  return endOfDay(date);
};

/**
 * Retorna o início da semana (domingo)
 */
export const getStartOfWeek = (date: Date): Date => {
  return startOfWeek(date, { weekStartsOn: 0 }); // 0 = domingo
};

/**
 * Retorna o final da semana (sábado)
 */
export const getEndOfWeek = (date: Date): Date => {
  return endOfWeek(date, { weekStartsOn: 0 });
};

/**
 * Retorna o início do mês
 */
export const getStartOfMonth = (date: Date): Date => {
  return startOfMonth(date);
};

/**
 * Retorna o final do mês
 */
export const getEndOfMonth = (date: Date): Date => {
  return endOfMonth(date);
};

/**
 * Adiciona dias a uma data
 */
export const addDaysToDate = (date: Date, days: number): Date => {
  return addDays(date, days);
};

/**
 * Subtrai dias de uma data
 */
export const subtractDaysFromDate = (date: Date, days: number): Date => {
  return subDays(date, days);
};

/**
 * Verifica se a data é hoje
 */
export const isDateToday = (date: Date | string): boolean => {
  const dateObj = typeof date === "string" ? parseISO(date) : date;
  return isValid(dateObj) && isToday(dateObj);
};

/**
 * Verifica se a data é desta semana
 */
export const isDateThisWeek = (date: Date | string): boolean => {
  const dateObj = typeof date === "string" ? parseISO(date) : date;
  return isValid(dateObj) && isThisWeek(dateObj, { weekStartsOn: 0 });
};

/**
 * Verifica se a data é deste mês
 */
export const isDateThisMonth = (date: Date | string): boolean => {
  const dateObj = typeof date === "string" ? parseISO(date) : date;
  return isValid(dateObj) && isThisMonth(dateObj);
};

/**
 * Verifica se duas datas são do mesmo dia
 */
export const areSameDay = (
  date1: Date | string,
  date2: Date | string
): boolean => {
  const date1Obj = typeof date1 === "string" ? parseISO(date1) : date1;
  const date2Obj = typeof date2 === "string" ? parseISO(date2) : date2;

  return (
    isValid(date1Obj) && isValid(date2Obj) && isSameDay(date1Obj, date2Obj)
  );
};

/**
 * Adiciona horas a uma data
 */
export const addHoursToDate = (date: Date, hours: number): Date => {
  return addHours(date, hours);
};

/**
 * Calcula a diferença em minutos entre duas datas
 */
export const getMinutesDifference = (
  dateLeft: Date,
  dateRight: Date
): number => {
  return differenceInMinutes(dateLeft, dateRight);
};

/**
 * Verifica se uma data é anterior a outra
 */
export const isDateBefore = (date: Date, dateToCompare: Date): boolean => {
  return isBefore(date, dateToCompare);
};

/**
 * Verifica se uma data é posterior a outra
 */
export const isDateAfter = (date: Date, dateToCompare: Date): boolean => {
  return isAfter(date, dateToCompare);
};

/**
 * Retorna o dia da semana (0 = domingo, 6 = sábado)
 */
export const getDayOfWeek = (date: Date): number => {
  return getDay(date);
};

/**
 * Converte string para Date
 */
export const parseDate = (dateString: string): Date => {
  return parseISO(dateString);
};

/**
 * Verifica se uma data é válida
 */
export const isValidDate = (date: unknown): boolean => {
  if (date instanceof Date) {
    return isValid(date);
  }
  if (typeof date === "string") {
    return isValid(parseISO(date));
  }
  return false;
};

/**
 * Retorna a data atual
 */
export const getCurrentDate = (): Date => {
  return new Date();
};

/**
 * Formata data para input datetime-local
 */
export const formatForDateTimeInput = (date: Date): string => {
  return format(date, "yyyy-MM-dd'T'HH:mm");
};

/**
 * Gera array de horários disponíveis para agendamento
 */
export const generateTimeSlots = (
  startHour: number = 8,
  endHour: number = 18,
  intervalMinutes: number = 30
): string[] => {
  const slots: string[] = [];
  const baseDate = new Date();
  baseDate.setHours(startHour, 0, 0, 0);

  while (baseDate.getHours() < endHour) {
    slots.push(formatTime(baseDate));
    baseDate.setMinutes(baseDate.getMinutes() + intervalMinutes);
  }

  return slots;
};

/**
 * Verifica se um horário está disponível
 */
export const isTimeSlotAvailable = (
  targetDate: Date,
  appointments: Array<{ scheduledTime: Date }>,
  durationMinutes: number = 30
): boolean => {
  return !appointments.some((appointment) => {
    const appointmentStart = appointment.scheduledTime;
    const appointmentEnd = addHoursToDate(
      appointmentStart,
      durationMinutes / 60
    );

    return (
      (isDateAfter(targetDate, appointmentStart) &&
        isDateBefore(targetDate, appointmentEnd)) ||
      areSameDay(targetDate, appointmentStart)
    );
  });
};

/**
 * Retorna saudação baseada no horário
 */
export const getGreeting = (): string => {
  const hour = new Date().getHours();

  if (hour < 12) {
    return "Bom dia";
  } else if (hour < 18) {
    return "Boa tarde";
  } else {
    return "Boa noite";
  }
};
