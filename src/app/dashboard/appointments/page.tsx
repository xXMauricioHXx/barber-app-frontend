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
  Card,
  CardContent,
  Divider,
} from "@mui/material";
import {
  Schedule as ScheduleIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
} from "@mui/icons-material";
import { useAuth } from "@/context/AuthContext";
import React, { useEffect, useState } from "react";
import { appointmentService } from "@/services/appointmentService";
import { Appointment } from "@/types/appointment";

export default function AgendaPage() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTodayAppointments = React.useCallback(async () => {
    if (!user?.uid) return;

    try {
      setLoading(true);
      setError(null);
      const todayAppointments = await appointmentService.getTodayAppointments(
        user.uid
      );
      setAppointments(todayAppointments);
    } catch (err) {
      console.error("Erro ao carregar agendamentos:", err);
      setError(
        err instanceof Error ? err.message : "Erro ao carregar agendamentos"
      );
    } finally {
      setLoading(false);
    }
  }, [user?.uid]);

  useEffect(() => {
    loadTodayAppointments();
  }, [loadTodayAppointments]);

  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });
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

  const todayDate = new Date().toLocaleDateString("pt-BR", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

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
        Agenda Diária
      </Typography>

      <Typography
        variant="h6"
        color="text.secondary"
        gutterBottom
        sx={{ textTransform: "capitalize" }}
      >
        {todayDate}
      </Typography>

      {/* Contador de agendamentos */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <ScheduleIcon color="primary" sx={{ fontSize: 40 }} />
            <Box>
              <Typography variant="h4" color="primary">
                {appointments.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Agendamentos para hoje
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {error && (
        <Alert
          severity="error"
          sx={{ mb: 3 }}
          action={
            <Typography
              component="button"
              onClick={loadTodayAppointments}
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

      <Paper sx={{ overflow: "hidden" }}>
        {appointments.length === 0 ? (
          <Box sx={{ p: 4, textAlign: "center" }}>
            <ScheduleIcon
              sx={{ fontSize: 64, color: "text.disabled", mb: 2 }}
            />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Nenhum agendamento para hoje
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
                        }}
                      >
                        <Typography
                          variant="h6"
                          component="span"
                          sx={{ fontWeight: 600 }}
                        >
                          {formatTime(appointment.scheduledTime)}
                        </Typography>

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
