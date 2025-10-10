"use client";

import React, { useState } from "react";
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Alert,
  Snackbar,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import {
  CheckCircle as ConfirmIcon,
  Cancel as CancelIcon,
} from "@mui/icons-material";
import { appointmentService } from "@/services/appointmentService";
import { Appointment } from "@/types/appointment";

interface AppointmentActionButtonsProps {
  appointment: Appointment;
  barberId: string;
  onStatusUpdate?: () => void;
  disabled?: boolean;
}

export const AppointmentActionButtons: React.FC<
  AppointmentActionButtonsProps
> = ({ appointment, barberId, onStatusUpdate, disabled = false }) => {
  const [loading, setLoading] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const canConfirm = appointment.status === "Agendado";
  const canCancel = ["Agendado", "Confirmado"].includes(appointment.status);

  const handleConfirm = async () => {
    if (!appointment.id || !appointment.clientId) {
      setError("Dados do agendamento incompletos");
      return;
    }

    try {
      setLoading(true);
      setError("");

      await appointmentService.confirmAppointment(
        barberId,
        appointment.id,
        appointment.clientId
      );

      setSuccess("Agendamento confirmado com sucesso!");
      setConfirmDialogOpen(false);
      onStatusUpdate?.();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erro ao confirmar agendamento"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!appointment.id || !appointment.clientId) {
      setError("Dados do agendamento incompletos");
      return;
    }

    try {
      setLoading(true);
      setError("");

      await appointmentService.cancelAppointment(
        barberId,
        appointment.id,
        appointment.clientId
      );

      setSuccess("Agendamento cancelado com sucesso!");
      setCancelDialogOpen(false);
      onStatusUpdate?.();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erro ao cancelar agendamento"
      );
    } finally {
      setLoading(false);
    }
  };

  if (!canConfirm && !canCancel) {
    return null;
  }

  return (
    <>
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "row", sm: "row" },
          gap: 1,
          width: { xs: "100%", sm: "auto" },
          justifyContent: { xs: "flex-start", sm: "flex-end" },
        }}
      >
        {canConfirm && (
          <Button
            variant="contained"
            color="success"
            size="small"
            startIcon={
              loading ? (
                <CircularProgress size={16} color="inherit" />
              ) : (
                <ConfirmIcon />
              )
            }
            onClick={() => setConfirmDialogOpen(true)}
            disabled={disabled || loading}
            aria-label={`Confirmar agendamento de ${appointment.clientName}`}
            sx={{
              minWidth: { xs: "auto", sm: "100px" },
              flex: { xs: 1, sm: "none" },
              fontSize: { xs: "0.75rem", sm: "0.875rem" },
            }}
          >
            <Box
              component="span"
              sx={{ display: { xs: "none", sm: "inline" } }}
            >
              Confirmar
            </Box>
            <Box
              component="span"
              sx={{ display: { xs: "inline", sm: "none" } }}
            >
              ✓
            </Box>
          </Button>
        )}

        {canCancel && (
          <Button
            variant="outlined"
            color="error"
            size="small"
            startIcon={
              loading ? (
                <CircularProgress size={16} color="inherit" />
              ) : (
                <CancelIcon />
              )
            }
            onClick={() => setCancelDialogOpen(true)}
            disabled={disabled || loading}
            aria-label={`Cancelar agendamento de ${appointment.clientName}`}
            sx={{
              minWidth: { xs: "auto", sm: "100px" },
              flex: { xs: 1, sm: "none" },
              fontSize: { xs: "0.75rem", sm: "0.875rem" },
            }}
          >
            <Box
              component="span"
              sx={{ display: { xs: "none", sm: "inline" } }}
            >
              Cancelar
            </Box>
            <Box
              component="span"
              sx={{ display: { xs: "inline", sm: "none" } }}
            >
              ✕
            </Box>
          </Button>
        )}
      </Box>

      {/* Dialog de Confirmação */}
      <Dialog
        open={confirmDialogOpen}
        onClose={() => setConfirmDialogOpen(false)}
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-description"
        fullWidth
        maxWidth="sm"
        sx={{
          "& .MuiDialog-paper": {
            margin: { xs: 2, sm: 3 },
            width: { xs: "calc(100% - 32px)", sm: "auto" },
          },
        }}
      >
        <DialogTitle id="confirm-dialog-title">
          Confirmar Agendamento
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="confirm-dialog-description">
            Tem certeza que deseja confirmar o agendamento de{" "}
            <strong>{appointment.clientName}</strong> para{" "}
            <strong>
              {appointment.scheduledTime.toLocaleDateString("pt-BR")} às{" "}
              {appointment.scheduledTime.toLocaleTimeString("pt-BR", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </strong>
            ?
          </DialogContentText>
        </DialogContent>
        <DialogActions
          sx={{
            flexDirection: { xs: "column", sm: "row" },
            gap: { xs: 1, sm: 0 },
            p: { xs: 2, sm: 1 },
          }}
        >
          <Button
            onClick={() => setConfirmDialogOpen(false)}
            disabled={loading}
            fullWidth={isMobile}
            sx={{ order: { xs: 2, sm: 1 } }}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleConfirm}
            variant="contained"
            color="success"
            disabled={loading}
            startIcon={
              loading && <CircularProgress size={16} color="inherit" />
            }
            fullWidth={isMobile}
            sx={{ order: { xs: 1, sm: 2 } }}
          >
            {loading ? "Confirmando..." : "Confirmar"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de Cancelamento */}
      <Dialog
        open={cancelDialogOpen}
        onClose={() => setCancelDialogOpen(false)}
        aria-labelledby="cancel-dialog-title"
        aria-describedby="cancel-dialog-description"
        fullWidth
        maxWidth="sm"
        sx={{
          "& .MuiDialog-paper": {
            margin: { xs: 2, sm: 3 },
            width: { xs: "calc(100% - 32px)", sm: "auto" },
          },
        }}
      >
        <DialogTitle id="cancel-dialog-title">Cancelar Agendamento</DialogTitle>
        <DialogContent>
          <DialogContentText id="cancel-dialog-description">
            Tem certeza que deseja cancelar o agendamento de{" "}
            <strong>{appointment.clientName}</strong> para{" "}
            <strong>
              {appointment.scheduledTime.toLocaleDateString("pt-BR")} às{" "}
              {appointment.scheduledTime.toLocaleTimeString("pt-BR", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </strong>
            ?
          </DialogContentText>
          <DialogContentText sx={{ mt: 1, color: "error.main" }}>
            Esta ação não pode ser desfeita.
          </DialogContentText>
        </DialogContent>
        <DialogActions
          sx={{
            flexDirection: { xs: "column", sm: "row" },
            gap: { xs: 1, sm: 0 },
            p: { xs: 2, sm: 1 },
          }}
        >
          <Button
            onClick={() => setCancelDialogOpen(false)}
            disabled={loading}
            fullWidth={isMobile}
            sx={{ order: { xs: 2, sm: 1 } }}
          >
            Manter Agendamento
          </Button>
          <Button
            onClick={handleCancel}
            variant="contained"
            color="error"
            disabled={loading}
            startIcon={
              loading && <CircularProgress size={16} color="inherit" />
            }
            fullWidth={isMobile}
            sx={{ order: { xs: 1, sm: 2 } }}
          >
            {loading ? "Cancelando..." : "Cancelar Agendamento"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbars para feedback */}
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
    </>
  );
};
