/**
 * Utilitários para geração e manipulação de slots de horário
 */

/**
 * Gera slots de horário com base nos horários de funcionamento
 * @param startWork - Horário de início no formato "HH:mm" (ex: "08:00")
 * @param endWork - Horário de fim no formato "HH:mm" (ex: "18:00")
 * @param intervalMinutes - Intervalo em minutos entre slots (default: 30)
 * @returns Array de strings com horários no formato "HH:mm"
 */
export const generateTimeSlots = (
  startWork: string,
  endWork: string,
  intervalMinutes: number = 30
): string[] => {
  const slots: string[] = [];

  // Parse das strings de horário
  const [startHour, startMinute] = startWork.split(":").map(Number);
  const [endHour, endMinute] = endWork.split(":").map(Number);

  // Criar data base para manipulação
  const currentTime = new Date();
  currentTime.setHours(startHour, startMinute, 0, 0);

  const endTime = new Date();
  endTime.setHours(endHour, endMinute, 0, 0);

  // Gerar slots até o horário de fim
  while (currentTime < endTime) {
    const hours = currentTime.getHours().toString().padStart(2, "0");
    const minutes = currentTime.getMinutes().toString().padStart(2, "0");
    slots.push(`${hours}:${minutes}`);

    // Adicionar intervalo
    currentTime.setMinutes(currentTime.getMinutes() + intervalMinutes);
  }

  return slots;
};

/**
 * Agrupa horários por período (manhã/tarde)
 * @param timeSlots - Array de horários no formato "HH:mm"
 * @returns Objeto com horários agrupados por período
 */
export const groupTimeSlotsByPeriod = (timeSlots: string[]) => {
  const morning: string[] = [];
  const afternoon: string[] = [];

  timeSlots.forEach((slot) => {
    const [hour] = slot.split(":").map(Number);
    if (hour < 12) {
      morning.push(slot);
    } else {
      afternoon.push(slot);
    }
  });

  return { morning, afternoon };
};

/**
 * Filtra horários disponíveis removendo os já ocupados
 * @param allSlots - Todos os slots possíveis
 * @param bookedSlots - Slots já reservados no formato "HH:mm"
 * @returns Array com apenas os horários disponíveis
 */
export const filterAvailableSlots = (
  allSlots: string[],
  bookedSlots: string[]
): string[] => {
  return allSlots.filter((slot) => !bookedSlots.includes(slot));
};

/**
 * Converte horário string para minutos desde o início do dia
 * @param timeString - Horário no formato "HH:mm"
 * @returns Número de minutos desde 00:00
 */
export const timeStringToMinutes = (timeString: string): number => {
  const [hours, minutes] = timeString.split(":").map(Number);
  return hours * 60 + minutes;
};

/**
 * Converte minutos para horário string
 * @param minutes - Minutos desde o início do dia
 * @returns Horário no formato "HH:mm"
 */
export const minutesToTimeString = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, "0")}:${mins
    .toString()
    .padStart(2, "0")}`;
};
