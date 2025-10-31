"use client";

import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Alert,
  CircularProgress,
  Divider,
  TextField,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Button,
  ButtonGroup,
  Checkbox,
} from "@mui/material";
import {
  Schedule as ScheduleIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
  AccessTime as AccessTimeIcon,
  Work as WorkIcon,
  ViewList as ViewListIcon,
  Today as TodayIcon,
  CalendarMonth as CalendarMonthIcon,
} from "@mui/icons-material";
import { useAuth } from "@/context/AuthContext";
import { useAppointments } from "@/context/AppointmentContext";
import { AppointmentStatusCard } from "@/components/AppointmentStatusCard";
import { AppointmentActionButtons } from "@/components";
import { Breadcrumbs } from "@/components";
import React, { useEffect, useMemo, useState } from "react";
import {
  formatTime,
  formatDateExtended,
  formatForDateTimeInput,
  addHoursToDate,
} from "@/lib/dateUtils";
import { Appointment } from "@/types/appointment";

export default function AppointmentsPage() {
  const { user } = useAuth();
  const {
    appointments,
    loading,
    error,
    selectedDate,
    setSelectedDate,
    loadAllAppointments,
    loadAppointmentsByDate,
    loadTodayAppointments,
    getAppointmentsByStatus,
  } = useAppointments();

  // Estados locais para filtros e visualização
  const [viewMode, setViewMode] = useState<"today" | "date" | "all">("today");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [shouldListCanceledAppointments, setShouldListCanceledAppointments] =
    useState<boolean>(false);

  // Carrega agendamentos baseado no modo de visualização
  useEffect(() => {
    if (!user?.uid) return;

    const loadAppointments = async () => {
      try {
        if (viewMode === "today") {
          await loadTodayAppointments(user.uid);
        } else if (viewMode === "date") {
          await loadAppointmentsByDate(user.uid, selectedDate);
        } else if (viewMode === "all") {
          await loadAllAppointments(user.uid);
        }
      } catch (error) {
        console.error("Erro ao carregar agendamentos:", error);
      }
    };

    loadAppointments();
  }, [
    user?.uid,
    viewMode,
    selectedDate,
    loadAllAppointments,
    loadAppointmentsByDate,
    loadTodayAppointments,
  ]);

  // Filtra agendamentos por status quando necessário
  const filteredAppointments = useMemo(() => {
    const appointmentsWithoutCanceled = shouldListCanceledAppointments
      ? appointments
      : appointments.filter((apt) => apt.status !== "Cancelado");

    if (statusFilter === "all") {
      return appointmentsWithoutCanceled;
    }
    return appointmentsWithoutCanceled.filter(
      (appointment) => appointment.status === statusFilter
    );
  }, [appointments, statusFilter, shouldListCanceledAppointments]);

  // Agrupa agendamentos por data quando exibindo todos
  const groupedAppointments = useMemo(() => {
    if (viewMode !== "all") {
      return {};
    }

    return filteredAppointments.reduce((groups, appointment) => {
      const dateKey = formatDateExtended(appointment.scheduledTime);
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(appointment);
      return groups;
    }, {} as Record<string, Appointment[]>);
  }, [filteredAppointments, viewMode]);

  const formatEndTime = (startDate: Date): string => {
    const endDate = addHoursToDate(startDate, 1);
    return formatTime(endDate);
  };

  const getStatusColor = (
    status: string
  ): "info" | "success" | "default" | "error" => {
    switch (status) {
      case "Agendado":
        return "info";
      case "Confirmado":
        return "success";
      case "Concluído":
        return "default";
      case "Cancelado":
        return "error";
      default:
        return "default";
    }
  };

  const formatDateForInput = (date: Date): string => {
    return formatForDateTimeInput(date).split("T")[0];
  };

  const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = new Date(event.target.value + "T00:00:00");
    setSelectedDate(newDate);
    if (viewMode === "date") {
      // A atualização será feita pelo useEffect
    }
  };

  const handleViewModeChange = (newMode: "today" | "date" | "all") => {
    setViewMode(newMode);
  };

  const handleStatusFilterChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setStatusFilter(event.target.value);
  };

  const handleRetry = () => {
    if (user?.uid) {
      loadAllAppointments(user.uid);
    }
  };

  const handleStatusUpdate = () => {
    if (user?.uid) {
      loadAllAppointments(user.uid);
    }
  };

  const statusMemory = useMemo(() => {
    const scheduled = getAppointmentsByStatus("Agendado");
    const confirmed = getAppointmentsByStatus("Confirmado");
    const concluded = getAppointmentsByStatus("Concluído");
    const canceled = getAppointmentsByStatus("Cancelado");

    return {
      scheduled: scheduled.length,
      confirmed: confirmed.length,
      concluded: concluded.length,
      canceled: canceled.length,
    };
  }, [getAppointmentsByStatus]);

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "400px",
        }}
      >
        <CircularProgress size={40} />
      </Box>
    );
  }

  return (
    <Box>
      <Breadcrumbs />

      {/* Controles de Visualização */}

      {/* Cards de Estatísticas por Status */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, 1fr)",
            md: "repeat(4, 1fr)",
          },
          gap: 2,
          mb: 3,
        }}
      >
        <AppointmentStatusCard
          status="Agendado"
          count={statusMemory.scheduled}
          variant="outlined"
        />
        <AppointmentStatusCard
          status="Confirmado"
          count={statusMemory.confirmed}
          variant="outlined"
        />
        <AppointmentStatusCard
          status="Concluído"
          count={statusMemory.concluded}
          variant="outlined"
        />
        <AppointmentStatusCard
          status="Cancelado"
          count={statusMemory.canceled}
          variant="outlined"
        />
      </Box>

      {error && (
        <Alert
          severity="error"
          sx={{ mb: 3 }}
          action={
            <Typography
              component="button"
              onClick={handleRetry}
              sx={{
                background: "none",
                border: "none",
                color: "inherit",
                textDecoration: "underline",
                cursor: "pointer",
              }}
            >
              Tentar novamente
            </Typography>
          }
        >
          {error}
        </Alert>
      )}
      <Box sx={{ mb: 3 }}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Filtros e Visualização
          </Typography>

          {/* Seletor de Modo de Visualização */}
          <Box sx={{ mb: 2 }}>
            <ButtonGroup variant="outlined" sx={{ mb: 2 }}>
              <Button
                variant={viewMode === "today" ? "contained" : "outlined"}
                onClick={() => handleViewModeChange("today")}
                startIcon={<TodayIcon />}
              >
                Hoje
              </Button>
              <Button
                variant={viewMode === "date" ? "contained" : "outlined"}
                onClick={() => handleViewModeChange("date")}
                startIcon={<CalendarMonthIcon />}
              >
                Data Específica
              </Button>
              <Button
                variant={viewMode === "all" ? "contained" : "outlined"}
                onClick={() => handleViewModeChange("all")}
                startIcon={<ViewListIcon />}
              >
                Todos
              </Button>
            </ButtonGroup>
          </Box>

          {/* Seletor de Data (apenas quando modo = date) */}
          {viewMode === "date" && (
            <Box sx={{ mb: 2 }}>
              <TextField
                label="Selecionar Data"
                type="date"
                value={formatDateForInput(selectedDate)}
                onChange={handleDateChange}
                InputLabelProps={{
                  shrink: true,
                }}
                sx={{ mr: 2, minWidth: 200 }}
                inputProps={{
                  "aria-label": "Selecionar data para visualizar agendamentos",
                }}
              />
            </Box>
          )}

          {/* Filtro por Status */}
          <Box sx={{ mb: 2 }}>
            <FormControl component="fieldset">
              <FormLabel component="legend">Filtrar por Status</FormLabel>
              <RadioGroup
                row
                value={statusFilter}
                onChange={handleStatusFilterChange}
                sx={{ mt: 1 }}
              >
                <FormControlLabel
                  value="all"
                  control={<Radio />}
                  label="Todos"
                />
                <FormControlLabel
                  value="Agendado"
                  control={<Radio />}
                  label="Agendado"
                />
                <FormControlLabel
                  value="Confirmado"
                  control={<Radio />}
                  label="Confirmado"
                />
                <FormControlLabel
                  value="Concluído"
                  control={<Radio />}
                  label="Concluído"
                />
                {/* <FormControlLabel
                  value="Cancelado"
                  control={<Radio />}
                  label="Cancelado"
                /> */}
              </RadioGroup>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={shouldListCanceledAppointments}
                    onChange={(e) =>
                      setShouldListCanceledAppointments(e.target.checked)
                    }
                  />
                }
                label="Mostrar Agendamentos Cancelados"
              />
            </FormControl>
          </Box>
        </Paper>
      </Box>

      {filteredAppointments.length === 0 && (
        <Paper sx={{ overflow: "hidden" }}>
          <Box sx={{ p: 4, textAlign: "center" }}>
            <ScheduleIcon
              sx={{ fontSize: 64, color: "text.disabled", mb: 2 }}
            />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Nenhum agendamento encontrado
            </Typography>
            <Typography variant="body2" color="text.disabled">
              {viewMode === "today" && "Não há agendamentos para hoje"}
              {viewMode === "date" &&
                `Não há agendamentos para ${formatDateExtended(selectedDate)}`}
              {viewMode === "all" &&
                statusFilter !== "all" &&
                `Não há agendamentos com status "${statusFilter}"`}
              {viewMode === "all" &&
                statusFilter === "all" &&
                "Quando novos agendamentos forem criados, eles aparecerão aqui"}
            </Typography>
          </Box>
        </Paper>
      )}

      {/* Renderização para modo "all" (agrupado por data) */}
      {viewMode === "all" && filteredAppointments.length > 0 && (
        <>
          {Object.entries(groupedAppointments)
            .sort(
              ([dateA], [dateB]) =>
                new Date(dateB).getTime() - new Date(dateA).getTime()
            )
            .map(([dateKey, dayAppointments]) => (
              <Box key={dateKey} sx={{ mb: 3 }}>
                <Typography
                  variant="h6"
                  color="primary"
                  sx={{
                    textTransform: "capitalize",
                    mb: 2,
                    fontWeight: 600,
                    borderBottom: 1,
                    borderColor: "divider",
                    pb: 1,
                  }}
                >
                  {dateKey} ({dayAppointments.length} agendamento
                  {dayAppointments.length !== 1 ? "s" : ""})
                </Typography>
                <Paper sx={{ overflow: "hidden" }}>
                  <List sx={{ py: 0 }}>
                    {dayAppointments
                      .sort(
                        (a, b) =>
                          a.scheduledTime.getTime() - b.scheduledTime.getTime()
                      )
                      .map((appointment, index) => (
                        <React.Fragment key={appointment.id}>
                          <ListItem
                            sx={{
                              py: 2,
                              px: 3,
                              alignItems: "flex-start",
                              flexDirection: { xs: "column", sm: "row" },
                              gap: { xs: 2, sm: 0 },
                            }}
                          >
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "flex-start",
                                flex: 1,
                              }}
                            >
                              <ListItemIcon sx={{ mt: 1, mr: 2 }}>
                                <ScheduleIcon color="primary" />
                              </ListItemIcon>
                              <ListItemText
                                primary={
                                  <Box
                                    sx={{
                                      display: "flex",
                                      alignItems: "center",
                                      gap: 1,
                                      mb: 1,
                                      flexWrap: "wrap",
                                    }}
                                  >
                                    <Box
                                      sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 1,
                                      }}
                                    >
                                      <AccessTimeIcon sx={{ fontSize: 16 }} />
                                      <Typography
                                        variant="h6"
                                        component="span"
                                        sx={{ fontWeight: 600 }}
                                      >
                                        {formatTime(appointment.scheduledTime)}{" "}
                                        -{" "}
                                        {formatEndTime(
                                          appointment.scheduledTime
                                        )}
                                      </Typography>
                                    </Box>
                                    <Chip
                                      label={appointment.status}
                                      size="small"
                                      color={getStatusColor(appointment.status)}
                                    />
                                  </Box>
                                }
                                secondary={
                                  <Box sx={{ mt: 1 }}>
                                    <Box
                                      sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 1,
                                        mb: 1,
                                      }}
                                    >
                                      <PersonIcon sx={{ fontSize: 16 }} />
                                      <Typography variant="body2">
                                        {appointment.clientName}
                                      </Typography>
                                      {appointment.clientPlan && (
                                        <Chip
                                          label={`Plano ${appointment.clientPlan}`}
                                          size="small"
                                          variant="outlined"
                                          sx={{ ml: 1 }}
                                        />
                                      )}
                                    </Box>
                                    {appointment.clientPhone && (
                                      <Box
                                        sx={{
                                          display: "flex",
                                          alignItems: "center",
                                          gap: 1,
                                        }}
                                      >
                                        <PhoneIcon sx={{ fontSize: 16 }} />
                                        <Typography
                                          variant="body2"
                                          color="text.secondary"
                                        >
                                          {appointment.clientPhone}
                                        </Typography>
                                      </Box>
                                    )}
                                    {appointment?.selectedBarber?.name && (
                                      <Box
                                        sx={{
                                          display: "flex",
                                          alignItems: "center",
                                          gap: 1,
                                          mt: 1,
                                        }}
                                      >
                                        <WorkIcon sx={{ fontSize: 16 }} />
                                        <Typography
                                          variant="body2"
                                          color="text.secondary"
                                        >
                                          {appointment?.selectedBarber?.name}
                                        </Typography>
                                      </Box>
                                    )}
                                  </Box>
                                }
                              />
                            </Box>
                            {user?.uid && (
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: {
                                    xs: "flex-start",
                                    sm: "center",
                                  },
                                  justifyContent: {
                                    xs: "flex-start",
                                    sm: "flex-end",
                                  },
                                  width: { xs: "100%", sm: "auto" },
                                  minWidth: { sm: "200px" },
                                }}
                              >
                                <AppointmentActionButtons
                                  appointment={appointment}
                                  barberId={user.uid}
                                  onStatusUpdate={handleStatusUpdate}
                                />
                              </Box>
                            )}
                          </ListItem>
                          {index < dayAppointments.length - 1 && <Divider />}
                        </React.Fragment>
                      ))}
                  </List>
                </Paper>
              </Box>
            ))}
        </>
      )}

      {/* Renderização para modos "today" e "date" (lista simples) */}
      {(viewMode === "today" || viewMode === "date") &&
        filteredAppointments.length > 0 && (
          <>
            {viewMode === "date" && (
              <Typography
                variant="h6"
                color="primary"
                sx={{
                  textTransform: "capitalize",
                  mb: 2,
                  fontWeight: 600,
                  borderBottom: 1,
                  borderColor: "divider",
                  pb: 1,
                }}
              >
                {formatDateExtended(selectedDate)} (
                {filteredAppointments.length} agendamento
                {filteredAppointments.length !== 1 ? "s" : ""})
              </Typography>
            )}
            {viewMode === "today" && (
              <Typography
                variant="h6"
                color="primary"
                sx={{
                  textTransform: "capitalize",
                  mb: 2,
                  fontWeight: 600,
                  borderBottom: 1,
                  borderColor: "divider",
                  pb: 1,
                }}
              >
                Hoje ({filteredAppointments.length} agendamento
                {filteredAppointments.length !== 1 ? "s" : ""})
              </Typography>
            )}
            <Paper sx={{ overflow: "hidden" }}>
              <List sx={{ py: 0 }}>
                {filteredAppointments
                  .sort(
                    (a, b) =>
                      a.scheduledTime.getTime() - b.scheduledTime.getTime()
                  )
                  .map((appointment, index) => (
                    <React.Fragment key={appointment.id}>
                      <ListItem
                        sx={{
                          py: 2,
                          px: 3,
                          alignItems: "flex-start",
                          flexDirection: { xs: "column", sm: "row" },
                          gap: { xs: 2, sm: 0 },
                        }}
                      >
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "flex-start",
                            flex: 1,
                          }}
                        >
                          <ListItemIcon sx={{ mt: 1, mr: 2 }}>
                            <ScheduleIcon color="primary" />
                          </ListItemIcon>
                          <ListItemText
                            primary={
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 1,
                                  mb: 1,
                                  flexWrap: "wrap",
                                }}
                              >
                                <Box
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 1,
                                  }}
                                >
                                  <AccessTimeIcon sx={{ fontSize: 16 }} />
                                  <Typography
                                    variant="h6"
                                    component="span"
                                    sx={{ fontWeight: 600 }}
                                  >
                                    {formatTime(appointment.scheduledTime)} -{" "}
                                    {formatEndTime(appointment.scheduledTime)}
                                  </Typography>
                                </Box>
                                <Chip
                                  label={appointment.status}
                                  size="small"
                                  color={getStatusColor(appointment.status)}
                                />
                              </Box>
                            }
                            secondary={
                              <Box sx={{ mt: 1 }}>
                                <Box
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 1,
                                    mb: 1,
                                  }}
                                >
                                  <PersonIcon sx={{ fontSize: 16 }} />
                                  <Typography variant="body2">
                                    {appointment.clientName}
                                  </Typography>
                                  {appointment.clientPlan && (
                                    <Chip
                                      label={`Plano ${appointment.clientPlan}`}
                                      size="small"
                                      variant="outlined"
                                      sx={{ ml: 1 }}
                                    />
                                  )}
                                </Box>
                                {appointment.clientPhone && (
                                  <Box
                                    sx={{
                                      display: "flex",
                                      alignItems: "center",
                                      gap: 1,
                                    }}
                                  >
                                    <PhoneIcon sx={{ fontSize: 16 }} />
                                    <Typography
                                      variant="body2"
                                      color="text.secondary"
                                    >
                                      {appointment.clientPhone}
                                    </Typography>
                                  </Box>
                                )}
                                {appointment?.selectedBarber?.name && (
                                  <Box
                                    sx={{
                                      display: "flex",
                                      alignItems: "center",
                                      gap: 1,
                                      mt: 1,
                                    }}
                                  >
                                    <WorkIcon sx={{ fontSize: 16 }} />
                                    <Typography
                                      variant="body2"
                                      color="text.secondary"
                                    >
                                      {appointment?.selectedBarber?.name}
                                    </Typography>
                                  </Box>
                                )}
                              </Box>
                            }
                          />
                        </Box>
                        {user?.uid && (
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: { xs: "flex-start", sm: "center" },
                              justifyContent: {
                                xs: "flex-start",
                                sm: "flex-end",
                              },
                              width: { xs: "100%", sm: "auto" },
                              minWidth: { sm: "200px" },
                            }}
                          >
                            <AppointmentActionButtons
                              appointment={appointment}
                              barberId={user.uid}
                              onStatusUpdate={handleStatusUpdate}
                            />
                          </Box>
                        )}
                      </ListItem>
                      {index < filteredAppointments.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
              </List>
            </Paper>
          </>
        )}
    </Box>
  );
}
