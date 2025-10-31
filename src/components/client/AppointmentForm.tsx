"use client";

import {
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Button,
  CircularProgress,
  Typography,
  Alert,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { Employee } from "@/types/employee";
import { TimeSlotGrid } from "@/components";
import { formatDateLabel } from "@/utils/dateFormatters";

interface AppointmentFormProps {
  employees: Employee[];
  selectedEmployee: string;
  selectedDate: Date | null;
  selectedTime: string;
  availableTimeSlots: string[];
  minDate: Date;
  maxDate: Date;
  submitting: boolean;
  disabled: boolean;
  onEmployeeChange: (employeeId: string) => void;
  onDateChange: (date: Date | null) => void;
  onTimeChange: (time: string) => void;
  onSubmit: () => void;
}

/**
 * Formulário de criação de agendamento
 */
export function AppointmentForm({
  employees,
  selectedEmployee,
  selectedDate,
  selectedTime,
  availableTimeSlots,
  minDate,
  maxDate,
  submitting,
  disabled,
  onEmployeeChange,
  onDateChange,
  onTimeChange,
  onSubmit,
}: AppointmentFormProps) {
  const isFormComplete =
    selectedEmployee && selectedDate && selectedTime && !disabled;

  return (
    <Stack spacing={3} component="form" onSubmit={(e) => e.preventDefault()}>
      {/* Seleção de Profissional */}
      <FormControl fullWidth>
        <InputLabel id="employee-select-label">
          Escolha o Profissional
        </InputLabel>
        <Select
          labelId="employee-select-label"
          id="employee-select"
          value={selectedEmployee}
          label="Escolha o Profissional"
          onChange={(e) => onEmployeeChange(e.target.value)}
          disabled={submitting}
          inputProps={{
            "aria-label": "Selecionar profissional",
          }}
        >
          {employees.map((employee) => (
            <MenuItem key={employee.id} value={employee.id}>
              {employee.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Seleção de Data */}
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
            onDateChange(newValue);
            onTimeChange(""); // Reset time when date changes
          }}
          minDate={minDate}
          maxDate={maxDate}
          disabled={submitting}
          slotProps={{
            textField: {
              fullWidth: true,
              helperText: selectedDate ? formatDateLabel(selectedDate) : "",
              inputProps: {
                "aria-label": "Selecionar data do agendamento",
              },
            },
          }}
        />
      </Box>

      {/* Aviso de falta de horários */}
      {selectedDate && selectedEmployee && availableTimeSlots.length === 0 && (
        <Alert severity="warning" role="status">
          Não há horários disponíveis para esta data
        </Alert>
      )}

      {/* Seleção de Horários com TimeSlotGrid */}
      {selectedDate && selectedEmployee && availableTimeSlots.length > 0 && (
        <Box role="region" aria-label="Horários disponíveis">
          <Typography variant="subtitle2" gutterBottom>
            Escolha o Horário
          </Typography>
          <TimeSlotGrid
            availableSlots={availableTimeSlots}
            selectedTime={selectedTime}
            onTimeSelect={onTimeChange}
            disabled={disabled || submitting}
            showPeriodDivision={availableTimeSlots.length > 8}
          />
        </Box>
      )}

      {/* Botão de Confirmação */}
      <Button
        variant="contained"
        size="large"
        fullWidth
        onClick={onSubmit}
        disabled={submitting || !isFormComplete}
        sx={{ mt: 2 }}
        aria-label="Confirmar agendamento"
      >
        {submitting ? (
          <>
            <CircularProgress size={20} sx={{ mr: 1 }} color="inherit" />
            Agendando...
          </>
        ) : disabled ? (
          "Agendamento Bloqueado"
        ) : (
          "Confirmar Agendamento"
        )}
      </Button>
    </Stack>
  );
}
