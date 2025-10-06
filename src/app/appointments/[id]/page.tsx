"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  Container,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Card,
  CardContent,
  Chip,
  Snackbar,
  Stack,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { ptBR } from "date-fns/locale";
import { format, isToday, isTomorrow, addDays } from "date-fns";
import { Client } from "@/types/client";
import { Barber } from "@/types/barbers";
import { Appointment } from "@/types/appointment";
import { clientService } from "@/services/clientService";
import { barberService } from "@/services/barberService";
import { appointmentService } from "@/services/appointmentService";
import { employeeService } from "@/services/employeesService";
import { Employee } from "@/types/employee";

const generateTimeSlots = () => {
  const slots = [];
  for (let hour = 8; hour < 18; hour++) {
    slots.push(`${hour.toString().padStart(2, "0")}:00`);
    slots.push(`${hour.toString().padStart(2, "0")}:30`);
  }
  return slots;
};

const TIME_SLOTS = generateTimeSlots();

export default function AppointmentPage() {
  const [client, setClient] = useState<Client | null>(null);
  const [employee, setEmployees] = useState<Employee[]>([]);
  const [selectedBarber, setSelectedBarber] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [existingAppointments, setExistingAppointments] = useState<
    Appointment[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");

  const router = useRouter();
  const resolvedParams = useParams();
  const ids = resolvedParams?.id as string;
  const [clientId, barberId] = ids ? ids.split("-") : ["", ""];

  const serviceType = useMemo(() => {
    if (!client) return null;

    switch (client.plan) {
      case "Gold":
        return "Cabelo";
      case "Platinum":
        return "Cabelo e Barba";
      default:
        return "Cabelo";
    }
  }, [client]);

  const availableTimeSlots = useMemo(() => {
    if (!selectedDate || !selectedBarber || !existingAppointments) {
      return TIME_SLOTS;
    }

    const dateAppointments = existingAppointments.filter((apt) => {
      const aptDate = apt.scheduledTime;
      return (
        aptDate.getDate() === selectedDate.getDate() &&
        aptDate.getMonth() === selectedDate.getMonth() &&
        aptDate.getFullYear() === selectedDate.getFullYear()
      );
    });

    const busyTimes = dateAppointments.map((apt) =>
      format(apt.scheduledTime, "HH:mm")
    );

    return TIME_SLOTS.filter((slot) => !busyTimes.includes(slot));
  }, [selectedDate, selectedBarber, existingAppointments]);

  useEffect(() => {
    const loadData = async () => {
      if (!clientId) {
        setError("ID do cliente não fornecido");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        // Buscar cliente
        const client = await clientService.getClientById(barberId, clientId);
        if (!client) {
          setError("Cliente não encontrado");
          setLoading(false);
          return;
        }

        setClient(client);

        const employeesData = await employeeService.getEmployees(barberId);
        setEmployees(employeesData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro ao carregar dados");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [clientId]);

  // Carregar agendamentos quando barbeiro e data são selecionados
  useEffect(() => {
    const loadAppointments = async () => {
      if (!selectedBarber || !selectedDate) {
        setExistingAppointments([]);
        return;
      }

      try {
        const appointments =
          await appointmentService.getAppointmentsByBarberAndDate(
            selectedBarber,
            selectedDate
          );
        setExistingAppointments(appointments);
      } catch (err) {
        console.error("Erro ao carregar agendamentos:", err);
        setExistingAppointments([]);
      }
    };

    loadAppointments();
  }, [selectedBarber, selectedDate]);

  const handleSubmit = async () => {
    if (
      !client ||
      !selectedBarber ||
      !selectedDate ||
      !selectedTime ||
      !serviceType
    ) {
      setError("Por favor, preencha todos os campos");
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      // Criar objeto Date com data e hora selecionadas
      const [hours, minutes] = selectedTime.split(":").map(Number);
      const scheduledDateTime = new Date(selectedDate);
      scheduledDateTime.setHours(hours, minutes, 0, 0);

      await appointmentService.createAppointment(barberId, {
        clientName: client.name,
        clientPhone: client.phone,
        scheduledTime: scheduledDateTime,
        selectedBarber,
        serviceType,
        clientPlan: client.plan,
        status: "Agendado",
        clientId: client.id,
      });

      setSuccess("Agendamento realizado com sucesso!");

      // Limpar formulário
      setSelectedBarber("");
      setSelectedDate(null);
      setSelectedTime("");
      setExistingAppointments([]);

      // Redirecionar após 2 segundos
      setTimeout(() => {
        router.push(`/appointments/${ids}/success`);
      }, 500);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erro ao realizar agendamento"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const formatDateLabel = (date: Date) => {
    if (isToday(date)) return "Hoje";
    if (isTomorrow(date)) return "Amanhã";
    return format(date, "dd/MM/yyyy", { locale: ptBR });
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 2,
          }}
        >
          <CircularProgress />
          <Typography>Carregando...</Typography>
        </Box>
      </Container>
    );
  }

  if (error && !client) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Paper sx={{ p: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom align="center">
            Agendamento Online
          </Typography>

          {client && (
            <Box sx={{ mb: 4 }}>
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Bem-vindo, {client.name}!
                  </Typography>
                  <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                    <Typography variant="body2" color="text.secondary">
                      Seu plano:
                    </Typography>
                    <Chip
                      label={client.plan}
                      color={client.plan === "Platinum" ? "primary" : "default"}
                      size="small"
                    />
                  </Box>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mt: 1 }}
                  >
                    Serviço disponível: <strong>{serviceType}</strong>
                  </Typography>
                </CardContent>
              </Card>

              <Stack spacing={3}>
                {/* Seleção de Barbeiro */}
                <FormControl fullWidth>
                  <InputLabel id="barber-select-label">
                    Escolha o Profissional
                  </InputLabel>
                  <Select
                    labelId="barber-select-label"
                    value={selectedBarber}
                    label="Escolha o Profissional"
                    onChange={(e) => setSelectedBarber(e.target.value)}
                  >
                    {employee.map((barber) => (
                      <MenuItem key={barber.id} value={barber.id}>
                        {barber.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {/* Seleção de Data e Horário */}
                <Box
                  sx={{
                    display: "flex",
                    gap: 2,
                    flexDirection: { xs: "column", sm: "row" },
                  }}
                >
                  <DatePicker
                    label="Escolha a Data"
                    value={selectedDate}
                    onChange={(newValue) => {
                      setSelectedDate(newValue);
                      setSelectedTime(""); // Reset time when date changes
                    }}
                    minDate={new Date()}
                    maxDate={addDays(new Date(), 30)}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        helperText: selectedDate
                          ? formatDateLabel(selectedDate)
                          : "",
                      },
                    }}
                  />

                  <FormControl
                    fullWidth
                    disabled={!selectedDate || !selectedBarber}
                  >
                    <InputLabel id="time-select-label">
                      Escolha o Horário
                    </InputLabel>
                    <Select
                      labelId="time-select-label"
                      value={selectedTime}
                      label="Escolha o Horário"
                      onChange={(e) => setSelectedTime(e.target.value)}
                    >
                      {availableTimeSlots.map((time) => (
                        <MenuItem key={time} value={time}>
                          {time}
                        </MenuItem>
                      ))}
                    </Select>
                    {selectedDate &&
                      selectedBarber &&
                      availableTimeSlots.length === 0 && (
                        <Typography
                          variant="caption"
                          color="error"
                          sx={{ mt: 1, display: "block" }}
                        >
                          Não há horários disponíveis para esta data
                        </Typography>
                      )}
                  </FormControl>
                </Box>

                {/* Botão de Confirmação */}
                <Button
                  variant="contained"
                  size="large"
                  fullWidth
                  onClick={handleSubmit}
                  disabled={
                    submitting ||
                    !selectedBarber ||
                    !selectedDate ||
                    !selectedTime ||
                    availableTimeSlots.length === 0
                  }
                  sx={{ mt: 2 }}
                >
                  {submitting ? (
                    <>
                      <CircularProgress size={20} sx={{ mr: 1 }} />
                      Agendando...
                    </>
                  ) : (
                    "Confirmar Agendamento"
                  )}
                </Button>
              </Stack>
            </Box>
          )}
        </Paper>

        <Snackbar
          open={!!error}
          autoHideDuration={6000}
          onClose={() => setError("")}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
        >
          <Alert onClose={() => setError("")} severity="error">
            {error}
          </Alert>
        </Snackbar>

        <Snackbar
          open={!!success}
          autoHideDuration={4000}
          onClose={() => setSuccess("")}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
        >
          <Alert onClose={() => setSuccess("")} severity="success">
            {success}
          </Alert>
        </Snackbar>
      </Container>
    </LocalizationProvider>
  );
}
