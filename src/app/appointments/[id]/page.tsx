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
  Tabs,
  Tab,
  Divider,
  List,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material";
import {
  Event as EventIcon,
  AccessTime as TimeIcon,
  Person as PersonIcon,
  ContentCut as ServiceIcon,
  Cancel as CancelIcon,
} from "@mui/icons-material";
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
import usePlans, { PlanNames } from "@/hooks/usePlans";
import { ServiceType } from "@/types/serviceType";
import useClientEligibility from "@/hooks/useClientEligibility";

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
  // Estados para agendamento
  const [client, setClient] = useState<Client | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [barber, setBarber] = useState<Barber | null>(null);
  const [existingAppointments, setExistingAppointments] = useState<
    Appointment[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const { getPlanStyle } = usePlans();

  // Estados para visualização de agendamentos
  const [activeTab, setActiveTab] = useState(0);
  const [clientAppointments, setClientAppointments] = useState<Appointment[]>(
    []
  );
  const [viewDate, setViewDate] = useState<Date | null>(new Date());
  const [loadingAppointments, setLoadingAppointments] = useState(false);

  // Estados para cancelamento
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [selectedAppointmentToCancel, setSelectedAppointmentToCancel] =
    useState<Appointment | null>(null);
  const [cancellingAppointment, setCancellingAppointment] = useState(false);

  // Hook para verificar elegibilidade do cliente
  const clientEligibility = useClientEligibility(client);

  const router = useRouter();
  const resolvedParams = useParams();
  const ids = resolvedParams?.id as string;
  const [clientId, barberId] = ids ? ids.split("-") : ["", ""];

  // Filtrar agendamentos por data selecionada
  const filteredAppointments = useMemo(() => {
    if (!viewDate || !clientAppointments.length) {
      return [];
    }

    return clientAppointments.filter((appointment) => {
      const appointmentDate = appointment.scheduledTime;
      return (
        appointmentDate.getDate() === viewDate.getDate() &&
        appointmentDate.getMonth() === viewDate.getMonth() &&
        appointmentDate.getFullYear() === viewDate.getFullYear()
      );
    });
  }, [clientAppointments, viewDate]);

  const serviceType = useMemo(() => {
    if (!client) return null;

    switch (client.plan) {
      case PlanNames.BASIC:
        return ServiceType.HAIR;
      case PlanNames.PREMIUM:
        return ServiceType.HAIR_AND_BEARD;
      case PlanNames.PREMIUM_PLUS:
        return ServiceType.HAIR_BEARD_AND_EYEBROWS;
      default:
        return ServiceType.HAIR;
    }
  }, [client]);

  const availableTimeSlots = useMemo(() => {
    if (!selectedDate || !selectedEmployee || !existingAppointments) {
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
  }, [selectedDate, selectedEmployee, existingAppointments]);

  useEffect(() => {
    const loadData = async () => {
      if (!clientId) {
        setError("ID do cliente não fornecido");
        setLoading(false);
        return;
      }

      if (!barberId) {
        setError("ID do estabelecimento não fornecido");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const [client, employeesData, barberData] = await Promise.all([
          clientService.getClientById(barberId, clientId),
          employeeService.getEmployees(barberId),
          barberService.getBarber(barberId),
        ]);

        if (!client) {
          setError("Cliente não encontrado");
          setLoading(false);
          return;
        }

        setBarber(barberData);
        setClient(client);
        setEmployees(employeesData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro ao carregar dados");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [clientId, barberId]);

  // Carregar agendamentos do cliente
  useEffect(() => {
    const loadClientAppointments = async () => {
      if (!clientId) return;

      try {
        setLoadingAppointments(true);
        const appointments = await clientService.getClientAppointments(
          clientId
        );

        setClientAppointments(appointments);
      } catch (err) {
        console.error("Erro ao carregar agendamentos do cliente:", err);
      } finally {
        setLoadingAppointments(false);
      }
    };

    loadClientAppointments();
  }, [clientId]);

  useEffect(() => {
    const loadAppointments = async () => {
      if (!selectedEmployee || !selectedDate) {
        setExistingAppointments([]);
        return;
      }

      try {
        const appointments =
          await appointmentService.getAppointmentsByBarberAndDate(
            selectedEmployee,
            selectedDate
          );
        setExistingAppointments(appointments);
      } catch (err) {
        console.error("Erro ao carregar agendamentos:", err);
        setExistingAppointments([]);
      }
    };

    loadAppointments();
  }, [selectedEmployee, selectedDate]);

  const handleSubmit = async () => {
    if (
      !client ||
      !selectedEmployee ||
      !selectedDate ||
      !selectedTime ||
      !serviceType
    ) {
      setError("Por favor, preencha todos os campos");
      return;
    }

    // Verificar elegibilidade do cliente
    if (!clientEligibility.canSchedule) {
      const reasons = clientEligibility.reasonsBlocked.join(", ");
      setError(`Não é possível realizar agendamento: ${reasons}`);
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      // Criar objeto Date com data e hora selecionadas
      const [hours, minutes] = selectedTime.split(":").map(Number);
      const scheduledDateTime = new Date(selectedDate);
      scheduledDateTime.setHours(hours, minutes, 0, 0);

      const selectedEmp = employees.find((emp) => emp.id === selectedEmployee);

      if (!selectedEmp) {
        setError("Profissional selecionado não encontrado");
        setSubmitting(false);
        return;
      }

      await appointmentService.createAppointment(barberId, {
        clientName: client.name,
        clientPhone: client.phone,
        scheduledTime: scheduledDateTime,
        selectedBarber: selectedEmp,
        serviceType,
        clientPlan: client.plan,
        status: "Agendado",
        clientId: client.id || "",
      });

      setSuccess("Agendamento realizado com sucesso!");

      // Limpar formulário
      setSelectedEmployee("");
      setSelectedDate(null);
      setSelectedTime("");
      setExistingAppointments([]);
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

  const getStatusColor = (
    status: string
  ): "primary" | "info" | "success" | "error" | "default" => {
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
  };

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const canCancelAppointment = (appointment: Appointment): boolean => {
    // Só pode cancelar se estiver agendado ou confirmado
    if (!["Agendado", "Confirmado"].includes(appointment.status)) {
      return false;
    }

    // Verificar se não é muito próximo do horário (menos de 2 horas)
    const now = new Date();
    const appointmentTime = appointment.scheduledTime;
    const hoursDifference =
      (appointmentTime.getTime() - now.getTime()) / (1000 * 60 * 60);

    return hoursDifference >= 2;
  };

  const handleCancelAppointment = async () => {
    if (
      !selectedAppointmentToCancel ||
      !selectedAppointmentToCancel.id ||
      !clientId
    ) {
      setError("Dados do agendamento incompletos");
      return;
    }

    try {
      setCancellingAppointment(true);
      setError("");

      await appointmentService.cancelAppointmentByClient(
        barberId,
        selectedAppointmentToCancel.id,
        clientId
      );

      setSuccess("Agendamento cancelado com sucesso!");
      setCancelDialogOpen(false);
      setSelectedAppointmentToCancel(null);

      // Recarregar a lista de agendamentos
      const appointments = await clientService.getClientAppointments(clientId);
      setClientAppointments(appointments);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erro ao cancelar agendamento"
      );
    } finally {
      setCancellingAppointment(false);
    }
  };

  const openCancelDialog = (appointment: Appointment) => {
    setSelectedAppointmentToCancel(appointment);
    setCancelDialogOpen(true);
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
            Portal do Cliente
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
                      sx={getPlanStyle(client.plan)}
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
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mt: 1 }}
                  >
                    Estabelecimento: <strong>{barber?.name || "N/A"}</strong>
                  </Typography>

                  {/* Alertas de elegibilidade */}
                  {clientEligibility.warningMessage && (
                    <Alert severity="warning" sx={{ mt: 2 }}>
                      {clientEligibility.warningMessage}
                    </Alert>
                  )}

                  {!clientEligibility.canSchedule && (
                    <Alert severity="error" sx={{ mt: 2 }}>
                      <Typography variant="body2" component="div">
                        <strong>Agendamento bloqueado:</strong>
                      </Typography>
                      <Box component="ul" sx={{ mt: 1, mb: 0, pl: 2 }}>
                        {clientEligibility.reasonsBlocked.map(
                          (reason, index) => (
                            <li key={index}>{reason}</li>
                          )
                        )}
                      </Box>
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        Entre em contato com o estabelecimento para regularizar
                        sua situação.
                      </Typography>
                    </Alert>
                  )}
                </CardContent>
              </Card>

              {/* Tabs para navegar entre Novo Agendamento e Meus Agendamentos */}
              <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
                <Tabs
                  value={activeTab}
                  onChange={handleTabChange}
                  aria-label="tabs do cliente"
                >
                  <Tab label="Novo Agendamento" />
                  <Tab label="Meus Agendamentos" />
                </Tabs>
              </Box>

              {/* Tab Panel - Novo Agendamento */}
              {activeTab === 0 && (
                <Stack spacing={3}>
                  {/* Seleção de Barbeiro */}
                  <FormControl fullWidth>
                    <InputLabel id="barber-select-label">
                      Escolha o Profissional
                    </InputLabel>
                    <Select
                      labelId="barber-select-label"
                      value={selectedEmployee}
                      label="Escolha o Profissional"
                      onChange={(e) => setSelectedEmployee(e.target.value)}
                    >
                      {employees.map((barber) => (
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
                      disabled={!selectedDate || !selectedEmployee}
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
                        selectedEmployee &&
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
                      !selectedEmployee ||
                      !selectedDate ||
                      !selectedTime ||
                      availableTimeSlots.length === 0 ||
                      !clientEligibility.canSchedule
                    }
                    sx={{ mt: 2 }}
                  >
                    {submitting ? (
                      <>
                        <CircularProgress size={20} sx={{ mr: 1 }} />
                        Agendando...
                      </>
                    ) : !clientEligibility.canSchedule ? (
                      "Agendamento Bloqueado"
                    ) : (
                      "Confirmar Agendamento"
                    )}
                  </Button>
                </Stack>
              )}

              {/* Tab Panel - Meus Agendamentos */}
              {activeTab === 1 && (
                <Stack spacing={3}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                      mb: 2,
                    }}
                  >
                    <DatePicker
                      label="Filtrar por Data"
                      value={viewDate}
                      onChange={(newValue) => setViewDate(newValue)}
                      slotProps={{
                        textField: {
                          size: "small",
                          sx: { minWidth: 200 },
                        },
                      }}
                    />
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => setViewDate(new Date())}
                    >
                      Hoje
                    </Button>
                  </Box>

                  {loadingAppointments ? (
                    <Box
                      sx={{ display: "flex", justifyContent: "center", py: 4 }}
                    >
                      <CircularProgress />
                    </Box>
                  ) : filteredAppointments.length === 0 ? (
                    <Paper sx={{ p: 3, textAlign: "center" }}>
                      <Typography
                        variant="h6"
                        color="text.secondary"
                        gutterBottom
                      >
                        <EventIcon
                          sx={{
                            fontSize: 48,
                            mb: 1,
                            display: "block",
                            mx: "auto",
                          }}
                        />
                        Nenhum agendamento encontrado
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {viewDate
                          ? `Não há agendamentos para ${formatDateLabel(
                              viewDate
                            )}`
                          : "Você ainda não possui agendamentos."}
                      </Typography>
                    </Paper>
                  ) : (
                    <List>
                      {filteredAppointments.map((appointment) => (
                        <Card key={appointment.id} sx={{ mb: 2 }}>
                          <CardContent>
                            <Box
                              sx={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "flex-start",
                                mb: 2,
                              }}
                            >
                              <Typography variant="h6" component="div">
                                <TimeIcon
                                  sx={{ mr: 1, verticalAlign: "middle" }}
                                />
                                {format(appointment.scheduledTime, "HH:mm", {
                                  locale: ptBR,
                                })}
                              </Typography>
                              <Chip
                                label={appointment.status}
                                color={getStatusColor(appointment.status)}
                                size="small"
                              />
                            </Box>

                            <Divider sx={{ my: 1 }} />

                            <Stack spacing={1}>
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 1,
                                }}
                              >
                                <ServiceIcon
                                  sx={{ fontSize: 16, color: "text.secondary" }}
                                />
                                <Typography variant="body2">
                                  <strong>Serviço:</strong>{" "}
                                  {appointment.serviceType}
                                </Typography>
                              </Box>

                              {appointment.selectedBarber && (
                                <Box
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 1,
                                  }}
                                >
                                  <PersonIcon
                                    sx={{
                                      fontSize: 16,
                                      color: "text.secondary",
                                    }}
                                  />
                                  <Typography variant="body2">
                                    <strong>Profissional:</strong>{" "}
                                    {appointment.selectedBarber.name}
                                  </Typography>
                                </Box>
                              )}

                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 1,
                                }}
                              >
                                <EventIcon
                                  sx={{ fontSize: 16, color: "text.secondary" }}
                                />
                                <Typography variant="body2">
                                  <strong>Data:</strong>{" "}
                                  {formatDateLabel(appointment.scheduledTime)}
                                </Typography>
                              </Box>

                              {/* Botão de cancelamento */}
                              {canCancelAppointment(appointment) && (
                                <Box sx={{ mt: 2, pt: 1 }}>
                                  <Button
                                    variant="outlined"
                                    color="error"
                                    size="small"
                                    startIcon={<CancelIcon />}
                                    onClick={() =>
                                      openCancelDialog(appointment)
                                    }
                                    fullWidth
                                  >
                                    Cancelar Agendamento
                                  </Button>
                                </Box>
                              )}

                              {!canCancelAppointment(appointment) &&
                                ["Agendado", "Confirmado"].includes(
                                  appointment.status
                                ) && (
                                  <Box sx={{ mt: 2, pt: 1 }}>
                                    <Typography
                                      variant="caption"
                                      color="text.secondary"
                                    >
                                      Agendamentos só podem ser cancelados com
                                      pelo menos 2 horas de antecedência
                                    </Typography>
                                  </Box>
                                )}
                            </Stack>
                          </CardContent>
                        </Card>
                      ))}
                    </List>
                  )}
                </Stack>
              )}
            </Box>
          )}
        </Paper>

        {/* Dialog de Cancelamento */}
        <Dialog
          open={cancelDialogOpen}
          onClose={() => !cancellingAppointment && setCancelDialogOpen(false)}
          aria-labelledby="cancel-appointment-dialog-title"
          aria-describedby="cancel-appointment-dialog-description"
        >
          <DialogTitle id="cancel-appointment-dialog-title">
            Cancelar Agendamento
          </DialogTitle>
          <DialogContent>
            <DialogContentText id="cancel-appointment-dialog-description">
              {selectedAppointmentToCancel && (
                <>
                  Tem certeza que deseja cancelar seu agendamento para{" "}
                  <strong>
                    {formatDateLabel(selectedAppointmentToCancel.scheduledTime)}{" "}
                    às{" "}
                    {format(
                      selectedAppointmentToCancel.scheduledTime,
                      "HH:mm",
                      {
                        locale: ptBR,
                      }
                    )}
                  </strong>
                  ?
                </>
              )}
            </DialogContentText>
            <DialogContentText sx={{ mt: 1, color: "error.main" }}>
              Esta ação não pode ser desfeita.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => setCancelDialogOpen(false)}
              disabled={cancellingAppointment}
            >
              Manter Agendamento
            </Button>
            <Button
              onClick={handleCancelAppointment}
              variant="contained"
              color="error"
              disabled={cancellingAppointment}
              startIcon={
                cancellingAppointment ? (
                  <CircularProgress size={16} color="inherit" />
                ) : (
                  <CancelIcon />
                )
              }
            >
              {cancellingAppointment ? "Cancelando..." : "Cancelar Agendamento"}
            </Button>
          </DialogActions>
        </Dialog>

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
