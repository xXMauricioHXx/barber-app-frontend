# Exemplos de Uso do date-fns no Barber App

Este documento demonstra como usar as funções de manipulação de data criadas com date-fns no projeto.

## 1. Formatação Básica de Datas

```typescript
import { formatDate, formatTime, formatDateTime } from "@/lib/dateUtils";

const appointment = {
  scheduledTime: new Date("2024-10-05T14:30:00"),
};

// Formatação básica
console.log(formatDate(appointment.scheduledTime)); // "05/10/2024"
console.log(formatTime(appointment.scheduledTime)); // "14:30"
console.log(formatDateTime(appointment.scheduledTime)); // "05/10/2024 14:30"
```

## 2. Usando o Hook useDateHelper

```typescript
import { useDateHelper } from "@/hooks/useDateHelper";

const AppointmentForm = () => {
  const {
    selectedDate,
    setSelectedDate,
    formattedDate,
    isToday,
    availableTimeSlots,
    goToNextDay,
    goToPreviousDay,
    greeting,
  } = useDateHelper();

  return (
    <div>
      <h2>{greeting}!</h2>
      <p>Data selecionada: {formattedDate}</p>
      {isToday && <p>Você está visualizando hoje!</p>}

      <button onClick={goToPreviousDay}>Dia Anterior</button>
      <button onClick={goToNextDay}>Próximo Dia</button>

      <select>
        {availableTimeSlots.map((slot) => (
          <option key={slot} value={slot}>
            {slot}
          </option>
        ))}
      </select>
    </div>
  );
};
```

## 3. Componente TimeSlotSelector

```typescript
import { TimeSlotSelector } from "@/components";

const BookingPage = () => {
  const [appointments] = useState([
    { scheduledTime: new Date("2024-10-05T09:00:00") },
    { scheduledTime: new Date("2024-10-05T14:00:00") },
  ]);

  const handleTimeSelect = (selectedDateTime: Date) => {
    console.log("Horário selecionado:", selectedDateTime);
    // Lógica para criar o agendamento
  };

  return (
    <TimeSlotSelector
      appointments={appointments}
      onTimeSelect={handleTimeSelect}
    />
  );
};
```

## 4. Filtragem de Agendamentos por Período

```typescript
import { appointmentService } from "@/services/appointmentService";
import { getStartOfWeek, getEndOfWeek } from "@/lib/dateUtils";

const DashboardPage = () => {
  const loadWeeklyAppointments = async (barberId: string) => {
    // O service já usa date-fns internamente
    const appointments = await appointmentService.getWeekAppointments(barberId);

    // Ou você pode usar as funções diretamente:
    const today = new Date();
    const startOfWeek = getStartOfWeek(today);
    const endOfWeek = getEndOfWeek(today);

    const customPeriodAppointments =
      await appointmentService.getAppointmentsByBarberAndDateRange(
        barberId,
        startOfWeek,
        endOfWeek
      );

    return appointments;
  };
};
```

## 5. Validação e Verificação de Disponibilidade

```typescript
import {
  isTimeSlotAvailable,
  combineDateTime,
  isValidDate,
  getCurrentDate,
} from "@/lib/dateUtils";

const validateBooking = (date: Date, time: string, appointments: any[]) => {
  // Verificar se a data é válida
  if (!isValidDate(date)) {
    throw new Error("Data inválida");
  }

  // Combinar data e hora
  const dateTime = combineDateTime(date, time);

  // Verificar se não é no passado
  if (dateTime < getCurrentDate()) {
    throw new Error("Não é possível agendar no passado");
  }

  // Verificar disponibilidade
  if (!isTimeSlotAvailable(dateTime, appointments)) {
    throw new Error("Horário não disponível");
  }

  return true;
};
```

## 6. Estatísticas com Períodos

```typescript
import { isDateToday, isDateThisWeek, isDateThisMonth } from "@/lib/dateUtils";

const getAppointmentStats = (appointments: any[]) => {
  const today = appointments.filter((apt) =>
    isDateToday(apt.scheduledTime)
  ).length;

  const thisWeek = appointments.filter((apt) =>
    isDateThisWeek(apt.scheduledTime)
  ).length;

  const thisMonth = appointments.filter((apt) =>
    isDateThisMonth(apt.scheduledTime)
  ).length;

  return { today, thisWeek, thisMonth };
};
```

## 7. Navegação de Calendário

```typescript
import {
  addDaysToDate,
  subtractDaysFromDate,
  areSameDay,
} from "@/lib/dateUtils";

const CalendarNavigation = () => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const goToNextDay = () => {
    setCurrentDate((prev) => addDaysToDate(prev, 1));
  };

  const goToPreviousDay = () => {
    setCurrentDate((prev) => subtractDaysFromDate(prev, 1));
  };

  const isSelectedDate = (date: Date) => {
    return areSameDay(currentDate, date);
  };

  return (
    <div>
      <button onClick={goToPreviousDay}>←</button>
      <span>{formatDate(currentDate)}</span>
      <button onClick={goToNextDay}>→</button>
    </div>
  );
};
```

## 8. Inputs de Formulário

```typescript
import { formatForDateTimeInput } from "@/lib/dateUtils";

const AppointmentForm = () => {
  const [appointmentDate, setAppointmentDate] = useState(new Date());

  return (
    <form>
      <input
        type="datetime-local"
        value={formatForDateTimeInput(appointmentDate)}
        onChange={(e) => setAppointmentDate(new Date(e.target.value))}
      />
    </form>
  );
};
```

## Benefícios do date-fns

1. **Imutabilidade**: Todas as funções retornam novas instâncias de Date
2. **Modularidade**: Importe apenas as funções que você precisa
3. **TypeScript**: Suporte nativo ao TypeScript
4. **Internacionalização**: Suporte ao português brasileiro (ptBR)
5. **Consistência**: API consistente em todo o projeto
6. **Performance**: Otimizado e leve
7. **Facilidade**: Funções intuitivas e bem documentadas

## Principais Funções Disponíveis

- `formatDate()`: Formata datas em pt-BR
- `formatTime()`: Formata apenas o horário
- `formatDateTime()`: Formata data e hora
- `getStartOfDay()`, `getEndOfDay()`: Início e fim do dia
- `getStartOfWeek()`, `getEndOfWeek()`: Início e fim da semana
- `isDateToday()`, `isDateThisWeek()`, `isDateThisMonth()`: Verificações de período
- `addDaysToDate()`, `subtractDaysFromDate()`: Manipulação de datas
- `generateTimeSlots()`: Gera horários disponíveis
- `isTimeSlotAvailable()`: Verifica disponibilidade
- `getGreeting()`: Saudação baseada no horário
