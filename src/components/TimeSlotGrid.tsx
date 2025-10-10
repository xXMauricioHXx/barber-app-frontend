import React from "react";
import { Box, Typography, Chip, Alert, Paper, Stack } from "@mui/material";
import {
  WbSunny as MorningIcon,
  LightMode as AfternoonIcon,
} from "@mui/icons-material";
import { groupTimeSlotsByPeriod } from "@/utils/timeSlots";

interface TimeSlotGridProps {
  availableSlots: string[];
  selectedTime: string;
  onTimeSelect: (time: string) => void;
  disabled?: boolean;
  showPeriodDivision?: boolean;
}

export const TimeSlotGrid: React.FC<TimeSlotGridProps> = ({
  availableSlots,
  selectedTime,
  onTimeSelect,
  disabled = false,
  showPeriodDivision = true,
}) => {
  const { morning, afternoon } = groupTimeSlotsByPeriod(availableSlots);

  const renderTimeSlots = (
    slots: string[],
    title: string,
    icon: React.ReactNode
  ) => (
    <Box sx={{ mb: 3 }}>
      <Typography
        variant="subtitle2"
        gutterBottom
        sx={{ display: "flex", alignItems: "center", gap: 1 }}
      >
        {icon}
        {title}
        <Typography variant="caption" color="text.secondary">
          ({slots.length} {slots.length === 1 ? "horário" : "horários"})
        </Typography>
      </Typography>

      {slots.length === 0 ? (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ fontStyle: "italic" }}
        >
          Nenhum horário disponível neste período
        </Typography>
      ) : (
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: 1,
            mt: 1,
          }}
        >
          {slots.map((time) => (
            <Chip
              key={time}
              label={time}
              onClick={() => !disabled && onTimeSelect(time)}
              color={selectedTime === time ? "primary" : "default"}
              variant={selectedTime === time ? "filled" : "outlined"}
              clickable={!disabled}
              disabled={disabled}
              sx={{
                minWidth: 80,
                height: 40,
                fontSize: "0.875rem",
                fontWeight: selectedTime === time ? 600 : 400,
                "&:hover": {
                  transform: !disabled ? "scale(1.05)" : "none",
                  transition: "transform 0.2s ease-in-out",
                },
                "&.MuiChip-colorPrimary": {
                  backgroundColor: "primary.main",
                  color: "primary.contrastText",
                  fontWeight: 600,
                },
              }}
            />
          ))}
        </Box>
      )}
    </Box>
  );

  if (availableSlots.length === 0) {
    return (
      <Alert severity="warning" sx={{ mt: 2 }}>
        <Typography variant="body2">
          Não há horários disponíveis para a data e profissional selecionados.
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Tente selecionar uma data diferente ou outro profissional.
        </Typography>
      </Alert>
    );
  }

  return (
    <Paper variant="outlined" sx={{ p: 2, mt: 2 }}>
      <Typography variant="h6" gutterBottom>
        Horários Disponíveis
      </Typography>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Selecione um horário disponível para seu agendamento
      </Typography>

      {showPeriodDivision ? (
        <Stack spacing={2}>
          {morning.length > 0 &&
            renderTimeSlots(
              morning,
              "Manhã",
              <MorningIcon sx={{ fontSize: 20, color: "warning.main" }} />
            )}

          {afternoon.length > 0 &&
            renderTimeSlots(
              afternoon,
              "Tarde",
              <AfternoonIcon sx={{ fontSize: 20, color: "info.main" }} />
            )}
        </Stack>
      ) : (
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: 1,
          }}
        >
          {availableSlots.map((time) => (
            <Chip
              key={time}
              label={time}
              onClick={() => !disabled && onTimeSelect(time)}
              color={selectedTime === time ? "primary" : "default"}
              variant={selectedTime === time ? "filled" : "outlined"}
              clickable={!disabled}
              disabled={disabled}
              sx={{
                minWidth: 80,
                height: 40,
                fontSize: "0.875rem",
                fontWeight: selectedTime === time ? 600 : 400,
                "&:hover": {
                  transform: !disabled ? "scale(1.05)" : "none",
                  transition: "transform 0.2s ease-in-out",
                },
                "&.MuiChip-colorPrimary": {
                  backgroundColor: "primary.main",
                  color: "primary.contrastText",
                  fontWeight: 600,
                },
              }}
            />
          ))}
        </Box>
      )}

      {selectedTime && (
        <Alert severity="success" sx={{ mt: 2 }}>
          <Typography variant="body2">
            <strong>Horário selecionado:</strong> {selectedTime}
          </Typography>
        </Alert>
      )}
    </Paper>
  );
};

export default TimeSlotGrid;
