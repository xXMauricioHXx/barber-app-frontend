"use client";

import {
  Card,
  CardContent,
  Box,
  Typography,
  Chip,
  Divider,
  Stack,
  Button,
  Paper,
  CircularProgress,
} from "@mui/material";
import {
  Event as EventIcon,
  AccessTime as TimeIcon,
  Person as PersonIcon,
  ContentCut as ServiceIcon,
  Cancel as CancelIcon,
} from "@mui/icons-material";
import { Appointment } from "@/types/appointment";
import { formatDateLabel, formatTime } from "@/utils/dateFormatters";
import {
  canCancelAppointment,
  getStatusColor,
} from "@/utils/appointmentHelpers";
import usePlans from "@/hooks/usePlans";

interface AppointmentListProps {
  appointments: Appointment[];
  loading: boolean;
  today: Date;
  onCancelClick: (appointment: Appointment) => void;
  onShowAll?: () => void;
  emptyMessage?: string;
}

/**
 * Lista de agendamentos do cliente
 */
export function AppointmentList({
  appointments,
  loading,
  today,
  onCancelClick,
  onShowAll,
  emptyMessage = "Nenhum agendamento encontrado",
}: AppointmentListProps) {
  const { getPlanStyle } = usePlans();

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
        <CircularProgress aria-label="Carregando agendamentos" />
      </Box>
    );
  }

  if (appointments.length === 0) {
    return (
      <Paper sx={{ p: 3, textAlign: "center" }}>
        <Typography variant="h6" color="text.secondary" gutterBottom>
          <EventIcon
            sx={{
              fontSize: 48,
              mb: 1,
              display: "block",
              mx: "auto",
            }}
            aria-hidden="true"
          />
          {emptyMessage}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Você ainda não possui agendamentos.
        </Typography>
        {onShowAll && (
          <Button variant="outlined" onClick={onShowAll} sx={{ mt: 2 }}>
            Ver Todos os Agendamentos
          </Button>
        )}
      </Paper>
    );
  }

  return (
    <Stack spacing={2} role="list" aria-label="Lista de agendamentos">
      {appointments.map((appointment) => (
        <Card key={appointment.id} component="article" role="listitem">
          <CardContent>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                mb: 2,
              }}
            >
              <Box>
                <Typography variant="h6" component="h3">
                  <EventIcon
                    sx={{ mr: 1, verticalAlign: "middle" }}
                    aria-hidden="true"
                  />
                  {formatDateLabel(appointment.scheduledTime)}
                </Typography>
                <Typography variant="h5" component="div" sx={{ ml: 3 }}>
                  <TimeIcon
                    sx={{ mr: 1, verticalAlign: "middle" }}
                    aria-hidden="true"
                  />
                  {formatTime(appointment.scheduledTime)}
                </Typography>
              </Box>
              <Chip
                label={appointment.status}
                color={getStatusColor(appointment.status)}
                size="small"
                aria-label={`Status: ${appointment.status}`}
              />
            </Box>

            <Divider sx={{ my: 1 }} />

            <Stack spacing={1}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <ServiceIcon
                  sx={{ fontSize: 16, color: "text.secondary" }}
                  aria-hidden="true"
                />
                <Typography variant="body2">
                  <strong>Serviço:</strong> {appointment.serviceType}
                </Typography>
              </Box>

              {appointment.selectedBarber && (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <PersonIcon
                    sx={{ fontSize: 16, color: "text.secondary" }}
                    aria-hidden="true"
                  />
                  <Typography variant="body2">
                    <strong>Profissional:</strong>{" "}
                    {appointment.selectedBarber.name}
                  </Typography>
                </Box>
              )}

              {appointment.clientPlan && (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Typography variant="body2">
                    <strong>Plano utilizado:</strong>{" "}
                    <Chip
                      label={appointment.clientPlan}
                      sx={getPlanStyle(appointment.clientPlan)}
                      size="small"
                    />
                  </Typography>
                </Box>
              )}

              {canCancelAppointment(appointment, today) && (
                <Box sx={{ mt: 2, pt: 1 }}>
                  <Button
                    variant="outlined"
                    color="error"
                    size="small"
                    startIcon={<CancelIcon />}
                    onClick={() => onCancelClick(appointment)}
                    fullWidth
                    aria-label={`Cancelar agendamento do dia ${formatDateLabel(
                      appointment.scheduledTime
                    )} às ${formatTime(appointment.scheduledTime)}`}
                  >
                    Cancelar Agendamento
                  </Button>
                </Box>
              )}

              {!canCancelAppointment(appointment, today) &&
                ["Agendado", "Confirmado"].includes(appointment.status) && (
                  <Box sx={{ mt: 2, pt: 1 }}>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      role="status"
                    >
                      Agendamentos só podem ser cancelados com pelo menos 2
                      horas de antecedência
                    </Typography>
                  </Box>
                )}
            </Stack>
          </CardContent>
        </Card>
      ))}
    </Stack>
  );
}
