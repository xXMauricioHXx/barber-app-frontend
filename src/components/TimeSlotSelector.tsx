import React, { useState } from "react";
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Chip,
  IconButton,
  Alert,
  TextField,
} from "@mui/material";
import {
  ChevronLeft,
  ChevronRight,
  Today,
  AccessTime,
  Event,
} from "@mui/icons-material";
import { useDateHelper } from "@/hooks/useDateHelper";
import { formatForDateTimeInput } from "@/lib/dateUtils";

interface TimeSlotSelectorProps {
  appointments?: Array<{ scheduledTime: Date }>;
  onTimeSelect?: (selectedDateTime: Date) => void;
  disabled?: boolean;
}

export const TimeSlotSelector: React.FC<TimeSlotSelectorProps> = ({
  appointments = [],
  onTimeSelect,
  disabled = false,
}) => {
  const [selectedTime, setSelectedTime] = useState<string>("");

  const {
    selectedDate,
    setSelectedDate,
    formattedDate,
    isToday,
    goToNextDay,
    goToPreviousDay,
    goToToday,
    getAvailableTimeSlots,
    combineDateTime,
    greeting,
  } = useDateHelper();

  const availableSlots = getAvailableTimeSlots(appointments);

  const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = new Date(event.target.value + "T00:00:00");
    setSelectedDate(newDate);
    setSelectedTime(""); // Reset selected time when date changes
  };

  const handleTimeSelect = (timeSlot: string) => {
    if (disabled) return;

    setSelectedTime(timeSlot);
    const combinedDateTime = combineDateTime(selectedDate, timeSlot);

    if (onTimeSelect) {
      onTimeSelect(combinedDateTime);
    }
  };

  const getTimeSlotStatus = (timeSlot: string) => {
    const isAvailable = availableSlots.includes(timeSlot);
    const isSelected = selectedTime === timeSlot;

    if (isSelected) return "selected";
    if (!isAvailable) return "unavailable";
    return "available";
  };

  const getTimeSlotColor = (
    status: string
  ): "primary" | "success" | "default" => {
    switch (status) {
      case "selected":
        return "primary";
      case "unavailable":
        return "default";
      case "available":
        return "success";
      default:
        return "default";
    }
  };

  const getTimeSlotVariant = (status: string): "filled" | "outlined" => {
    switch (status) {
      case "selected":
        return "filled";
      case "unavailable":
        return "outlined";
      case "available":
        return "outlined";
      default:
        return "outlined";
    }
  };

  return (
    <Card>
      <CardContent>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            <AccessTime sx={{ mr: 1, verticalAlign: "middle" }} />
            Selecionar Horário
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {greeting}! Escolha uma data e horário para seu agendamento.
          </Typography>
        </Box>

        {/* Seletor de Data */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            <Event sx={{ mr: 1, verticalAlign: "middle" }} />
            Data do Agendamento
          </Typography>

          {/* Navegação de Data */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
            <IconButton
              onClick={goToPreviousDay}
              disabled={disabled}
              size="small"
            >
              <ChevronLeft />
            </IconButton>

            <Typography
              variant="h6"
              sx={{
                flex: 1,
                textAlign: "center",
                textTransform: "capitalize",
              }}
            >
              {formattedDate}
            </Typography>

            <IconButton onClick={goToNextDay} disabled={disabled} size="small">
              <ChevronRight />
            </IconButton>
          </Box>

          {/* Input de Data */}
          <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
            <TextField
              type="date"
              value={formatForDateTimeInput(selectedDate).split("T")[0]}
              onChange={handleDateChange}
              disabled={disabled}
              size="small"
              sx={{ flex: 1 }}
            />

            <Button
              onClick={goToToday}
              disabled={disabled || isToday}
              startIcon={<Today />}
              size="small"
            >
              Hoje
            </Button>
          </Box>
        </Box>

        {/* Status Info */}
        {isToday && (
          <Alert severity="info" sx={{ mb: 2 }}>
            Você está visualizando os horários para hoje.
          </Alert>
        )}

        {/* Seletor de Horários */}
        <Typography variant="subtitle1" gutterBottom>
          Horários Disponíveis
        </Typography>

        {availableSlots.length === 0 ? (
          <Alert severity="warning">
            Não há horários disponíveis para esta data. Tente selecionar uma
            data diferente.
          </Alert>
        ) : (
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
            {availableSlots.map((timeSlot) => {
              const status = getTimeSlotStatus(timeSlot);
              const color = getTimeSlotColor(status);
              const variant = getTimeSlotVariant(status);

              return (
                <Chip
                  key={timeSlot}
                  label={timeSlot}
                  onClick={() => handleTimeSelect(timeSlot)}
                  color={color}
                  variant={variant}
                  clickable={!disabled && status !== "unavailable"}
                  disabled={status === "unavailable" || disabled}
                  sx={{
                    minWidth: 80,
                    height: 40,
                    fontSize: "0.875rem",
                    cursor:
                      status === "unavailable" || disabled
                        ? "not-allowed"
                        : "pointer",
                    "&:hover": {
                      backgroundColor:
                        status === "available" && !disabled
                          ? "success.light"
                          : undefined,
                    },
                  }}
                />
              );
            })}
          </Box>
        )}

        {/* Seleção Atual */}
        {selectedTime && (
          <Box sx={{ mt: 3, p: 2, bgcolor: "primary.light", borderRadius: 1 }}>
            <Typography variant="subtitle2" color="primary.contrastText">
              Horário Selecionado:
            </Typography>
            <Typography variant="h6" color="primary.contrastText">
              {formattedDate} às {selectedTime}
            </Typography>
          </Box>
        )}

        {/* Legenda */}
        <Box sx={{ mt: 3, pt: 2, borderTop: 1, borderColor: "divider" }}>
          <Typography
            variant="caption"
            color="text.secondary"
            gutterBottom
            display="block"
          >
            Legenda:
          </Typography>
          <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <Chip size="small" color="success" variant="outlined" />
              <Typography variant="caption">Disponível</Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <Chip size="small" color="primary" />
              <Typography variant="caption">Selecionado</Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <Chip size="small" color="default" variant="outlined" disabled />
              <Typography variant="caption">Indisponível</Typography>
            </Box>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default TimeSlotSelector;
