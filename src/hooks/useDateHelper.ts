import { useState, useCallback, useMemo } from "react";
import {
  getCurrentDate,
  formatDate,
  formatTime,
  formatDateTime,
  addDaysToDate,
  subtractDaysFromDate,
  getStartOfDay,
  getEndOfDay,
  isDateToday,
  isDateThisWeek,
  isDateThisMonth,
  areSameDay,
  isValidDate,
  generateTimeSlots,
  isTimeSlotAvailable,
  getGreeting,
} from "@/lib/dateUtils";

interface UseDateHelperProps {
  initialDate?: Date;
  workingHours?: {
    start: number;
    end: number;
    interval: number;
  };
}

export const useDateHelper = ({
  initialDate,
  workingHours = { start: 8, end: 18, interval: 30 },
}: UseDateHelperProps = {}) => {
  const [selectedDate, setSelectedDate] = useState<Date>(
    initialDate || getCurrentDate()
  );

  // Formatação de datas
  const formattedDate = useMemo(() => formatDate(selectedDate), [selectedDate]);

  const formattedTime = useMemo(() => formatTime(selectedDate), [selectedDate]);

  const formattedDateTime = useMemo(
    () => formatDateTime(selectedDate),
    [selectedDate]
  );

  // Verificações de data
  const isToday = useMemo(() => isDateToday(selectedDate), [selectedDate]);
  const isThisWeek = useMemo(
    () => isDateThisWeek(selectedDate),
    [selectedDate]
  );
  const isThisMonth = useMemo(
    () => isDateThisMonth(selectedDate),
    [selectedDate]
  );

  // Navegação de datas
  const goToNextDay = useCallback(() => {
    setSelectedDate((prevDate) => addDaysToDate(prevDate, 1));
  }, []);

  const goToPreviousDay = useCallback(() => {
    setSelectedDate((prevDate) => subtractDaysFromDate(prevDate, 1));
  }, []);

  const goToToday = useCallback(() => {
    setSelectedDate(getCurrentDate());
  }, []);

  // Manipulação de horários
  const availableTimeSlots = useMemo(
    () =>
      generateTimeSlots(
        workingHours.start,
        workingHours.end,
        workingHours.interval
      ),
    [workingHours.start, workingHours.end, workingHours.interval]
  );

  // Verificar disponibilidade de horário
  const checkTimeSlotAvailability = useCallback(
    (
      targetDateTime: Date,
      appointments: Array<{ scheduledTime: Date }>,
      durationMinutes?: number
    ) => {
      return isTimeSlotAvailable(targetDateTime, appointments, durationMinutes);
    },
    []
  );

  // Combinar data e hora
  const combineDateTime = useCallback((date: Date, timeString: string) => {
    const [hours, minutes] = timeString.split(":").map(Number);
    const newDate = new Date(date);
    newDate.setHours(hours, minutes, 0, 0);
    return newDate;
  }, []);

  // Filtrar horários disponíveis
  const getAvailableTimeSlots = useCallback(
    (appointments: Array<{ scheduledTime: Date }>) => {
      return availableTimeSlots.filter((timeSlot) => {
        const targetDateTime = combineDateTime(selectedDate, timeSlot);
        return checkTimeSlotAvailability(targetDateTime, appointments);
      });
    },
    [
      availableTimeSlots,
      selectedDate,
      combineDateTime,
      checkTimeSlotAvailability,
    ]
  );

  // Obter período do dia
  const getPeriodRanges = useCallback(() => {
    return {
      startOfDay: getStartOfDay(selectedDate),
      endOfDay: getEndOfDay(selectedDate),
    };
  }, [selectedDate]);

  // Validação de data
  const validateDate = useCallback((date: unknown) => {
    return isValidDate(date);
  }, []);

  // Comparar datas
  const compareWithSelectedDate = useCallback(
    (dateToCompare: Date) => {
      return areSameDay(selectedDate, dateToCompare);
    },
    [selectedDate]
  );

  // Saudação baseada no horário
  const greeting = useMemo(() => getGreeting(), []);

  return {
    // Estado
    selectedDate,
    setSelectedDate,

    // Formatação
    formattedDate,
    formattedTime,
    formattedDateTime,

    // Verificações
    isToday,
    isThisWeek,
    isThisMonth,

    // Navegação
    goToNextDay,
    goToPreviousDay,
    goToToday,

    // Horários
    availableTimeSlots,
    getAvailableTimeSlots,
    checkTimeSlotAvailability,
    combineDateTime,

    // Utilitários
    getPeriodRanges,
    validateDate,
    compareWithSelectedDate,
    greeting,

    // Funções de formatação diretas
    formatDate: (date: Date) => formatDate(date),
    formatTime: (date: Date) => formatTime(date),
    formatDateTime: (date: Date) => formatDateTime(date),
  };
};

export default useDateHelper;
