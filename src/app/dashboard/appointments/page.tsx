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
} from "@mui/material";
import {
  Schedule as ScheduleIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
  AccessTime as AccessTimeIcon,
  Work as WorkIcon,
} from "@mui/icons-material";
import { useAuth } from "@/context/AuthContext";
import { useAppointments } from "@/context/AppointmentContext";
import { AppointmentStatusCard } from "@/components/AppointmentStatusCard";
import React, { useEffect, useMemo } from "react";
import {
  formatTime,
  formatDateExtended,
  formatForDateTimeInput,
  addHoursToDate,
} from "@/lib/dateUtils";

export default function AppointmentsPage() {
  const { user } = useAuth();
  const {
    appointments,
    loading,
    error,
    selectedDate,
    setSelectedDate,
    loadAppointmentsByDate,
    getAppointmentsByStatus,
  } = useAppointments();

  useEffect(() => {
    if (user?.uid) {
      loadAppointmentsByDate(user.uid, selectedDate);
    }
  }, [user?.uid, selectedDate, loadAppointmentsByDate]);

  const formatEndTime = (startDate: Date): string => {
    const endDate = addHoursToDate(startDate, 1);
    return formatTime(endDate);
  };

  const getServiceTypeColor = (
    serviceType: string
  ): "primary" | "secondary" | "default" => {
    switch (serviceType) {
      case "Cabelo":
        return "primary";
      case "Cabelo e Barba":
        return "secondary";
      default:
        return "default";
    }
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

  const formatSelectedDate = (date: Date): string => {
    return formatDateExtended(date);
  };

  const formatDateForInput = (date: Date): string => {
    return formatForDateTimeInput(date).split("T")[0];
  };

  const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = new Date(event.target.value + "T00:00:00");
    setSelectedDate(newDate);
  };

  const handleRetry = () => {
    if (user?.uid) {
      loadAppointmentsByDate(user.uid, selectedDate);
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
      <Typography variant="h4" gutterBottom>
        Agenda
      </Typography>

      {/* Seletor de Data */}
      <Box sx={{ mb: 3 }}>
        <TextField
          label="Selecionar Data"
          type="date"
          value={formatDateForInput(selectedDate)}
          onChange={handleDateChange}
          InputLabelProps={{
            shrink: true,
          }}
          sx={{ mr: 2 }}
          inputProps={{
            "aria-label": "Selecionar data para visualizar agendamentos",
          }}
        />
      </Box>

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

      <Typography
        variant="h6"
        color="text.secondary"
        sx={{ textTransform: "capitalize", mt: 1, mb: 2 }}
      >
        {formatSelectedDate(selectedDate)}
      </Typography>
      <Paper sx={{ overflow: "hidden" }}>
        {appointments.length === 0 ? (
          <Box sx={{ p: 4, textAlign: "center" }}>
            <ScheduleIcon
              sx={{ fontSize: 64, color: "text.disabled", mb: 2 }}
            />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Nenhum agendamento para esta data
            </Typography>
            <Typography variant="body2" color="text.disabled">
              Os agendamentos aparecerão aqui quando forem criados
            </Typography>
          </Box>
        ) : (
          <List sx={{ py: 0 }}>
            {appointments.map((appointment, index) => (
              <React.Fragment key={appointment.id}>
                <ListItem
                  sx={{
                    py: 2,
                    px: 3,
                    alignItems: "flex-start",
                  }}
                >
                  <ListItemIcon sx={{ mt: 1 }}>
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
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
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
                            <Typography variant="body2" color="text.secondary">
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
                            <Typography variant="body2" color="text.secondary">
                              {appointment?.selectedBarber?.name}
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    }
                  />
                </ListItem>
                {index < appointments.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        )}
      </Paper>
    </Box>
  );
}
