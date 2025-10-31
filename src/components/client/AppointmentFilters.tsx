"use client";

import {
  Box,
  Typography,
  Button,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { formatDateLabel } from "@/utils/dateFormatters";

interface AppointmentFiltersProps {
  showAll: boolean;
  viewDate: Date | null;
  includeCancelled: boolean;
  today: Date;
  totalCount: number;
  filteredCount: number;
  onShowAllChange: (showAll: boolean) => void;
  onDateChange: (date: Date | null) => void;
  onIncludeCancelledChange: (include: boolean) => void;
}

/**
 * Filtros para visualização de agendamentos
 */
export function AppointmentFilters({
  showAll,
  viewDate,
  includeCancelled,
  today,
  totalCount,
  filteredCount,
  onShowAllChange,
  onDateChange,
  onIncludeCancelledChange,
}: AppointmentFiltersProps) {
  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        Filtros
      </Typography>

      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          alignItems: { xs: "stretch", sm: "center" },
          gap: 2,
          mb: 2,
        }}
      >
        <Button
          variant={showAll ? "contained" : "outlined"}
          onClick={() => {
            onShowAllChange(true);
            onDateChange(null);
          }}
          size="medium"
          sx={{ minWidth: 150 }}
          aria-label="Mostrar todos os agendamentos"
        >
          Todos os Agendamentos
        </Button>

        <Button
          variant={
            !showAll &&
            viewDate &&
            viewDate.toDateString() === today.toDateString()
              ? "contained"
              : "outlined"
          }
          onClick={() => {
            onDateChange(today);
            onShowAllChange(false);
          }}
          size="medium"
          aria-label="Mostrar agendamentos de hoje"
        >
          Hoje
        </Button>

        <DatePicker
          label="Escolha a Data"
          value={viewDate}
          onChange={(newValue) => {
            onDateChange(newValue);
            onShowAllChange(false);
          }}
          slotProps={{
            textField: {
              "aria-label": "Selecionar data para filtrar agendamentos",
            },
          }}
        />

        <FormControlLabel
          control={
            <Checkbox
              checked={includeCancelled}
              onChange={(e) => onIncludeCancelledChange(e.target.checked)}
              inputProps={{
                "aria-label": "Mostrar agendamentos cancelados",
              }}
            />
          }
          label="Mostrar Cancelados"
        />
      </Box>

      <Typography variant="body2" color="text.secondary">
        {showAll
          ? `Exibindo todos os agendamentos (${totalCount} total)`
          : viewDate
          ? `Filtrado para ${formatDateLabel(
              viewDate
            )} (${filteredCount} agendamento${filteredCount !== 1 ? "s" : ""})`
          : "Selecione uma data para filtrar"}
      </Typography>
    </Box>
  );
}
