"use client";

import React from "react";
import { Card, CardContent, Typography, Box } from "@mui/material";
import {
  Schedule as ScheduleIcon,
  Cancel as CancelIcon,
  CheckCircle as CheckCircleIcon,
  HourglassEmpty as PendingIcon,
} from "@mui/icons-material";

interface AppointmentStatusCardProps {
  status: "Agendado" | "Confirmado" | "Concluído" | "Cancelado";
  count: number;
  variant?: "outlined" | "elevation";
}

export const AppointmentStatusCard: React.FC<AppointmentStatusCardProps> = ({
  status,
  count,
  variant = "outlined",
}) => {
  const getStatusConfig = () => {
    switch (status) {
      case "Agendado":
        return {
          icon: <PendingIcon sx={{ fontSize: 32 }} />,
          color: "info",
          label: "Agendados",
        };
      case "Confirmado":
        return {
          icon: <CheckCircleIcon sx={{ fontSize: 32 }} />,
          color: "success",
          label: "Confirmados",
        };
      case "Concluído":
        return {
          icon: <ScheduleIcon sx={{ fontSize: 32 }} />,
          color: "primary",
          label: "Concluídos",
        };
      case "Cancelado":
        return {
          icon: <CancelIcon sx={{ fontSize: 32 }} />,
          color: "error",
          label: "Cancelados",
        };
      default:
        return {
          icon: <ScheduleIcon sx={{ fontSize: 32 }} />,
          color: "primary",
          label: "Total",
        };
    }
  };

  const config = getStatusConfig();

  return (
    <Card variant={variant} sx={{ height: "100%" }}>
      <CardContent>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Box sx={{ color: `${config.color}.main` }}>{config.icon}</Box>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h4" color={`${config.color}.main`}>
              {count}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {config.label}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default AppointmentStatusCard;
