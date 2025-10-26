"use client";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  CircularProgress,
} from "@mui/material";
import { Cancel as CancelIcon } from "@mui/icons-material";
import { Appointment } from "@/types/appointment";
import { formatDateLabel, formatTime } from "@/utils/dateFormatters";

interface CancelAppointmentDialogProps {
  open: boolean;
  appointment: Appointment | null;
  cancelling: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

/**
 * Dialog de confirmação para cancelamento de agendamento
 */
export function CancelAppointmentDialog({
  open,
  appointment,
  cancelling,
  onClose,
  onConfirm,
}: CancelAppointmentDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={() => !cancelling && onClose()}
      aria-labelledby="cancel-appointment-dialog-title"
      aria-describedby="cancel-appointment-dialog-description"
    >
      <DialogTitle id="cancel-appointment-dialog-title">
        Cancelar Agendamento
      </DialogTitle>
      <DialogContent>
        <DialogContentText id="cancel-appointment-dialog-description">
          {appointment && (
            <>
              Tem certeza que deseja cancelar seu agendamento para{" "}
              <strong>
                {formatDateLabel(appointment.scheduledTime)} às{" "}
                {formatTime(appointment.scheduledTime)}
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
        <Button onClick={onClose} disabled={cancelling}>
          Manter Agendamento
        </Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          color="error"
          disabled={cancelling}
          startIcon={
            cancelling ? (
              <CircularProgress size={16} color="inherit" />
            ) : (
              <CancelIcon />
            )
          }
        >
          {cancelling ? "Cancelando..." : "Cancelar Agendamento"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
