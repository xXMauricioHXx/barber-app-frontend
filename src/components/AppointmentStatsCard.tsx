"use client";

import React from "react";
import { Card, CardContent, Typography, Box, Chip } from "@mui/material";
import {
  Schedule as ScheduleIcon,
  CalendarMonth as CalendarIcon,
  DateRange as DateRangeIcon,
} from "@mui/icons-material";
import { useAppointmentStats } from "@/hooks/useAppointmentStats";
import { formatTime } from "@/lib/dateUtils";

interface AppointmentStatsCardProps {
  variant?: "today" | "week" | "month";
  showLastUpdated?: boolean;
}

export const AppointmentStatsCard: React.FC<AppointmentStatsCardProps> = ({
  variant = "today",
  showLastUpdated = false,
}) => {
  const { todayTotal, weekTotal, monthTotal, lastUpdated, isStale } =
    useAppointmentStats();

  const getStatsConfig = () => {
    switch (variant) {
      case "today":
        return {
          title: "Agendamentos Hoje",
          value: todayTotal,
          icon: <ScheduleIcon sx={{ fontSize: 40 }} />,
          color: "primary",
        };
      case "week":
        return {
          title: "Agendamentos Semana",
          value: weekTotal,
          icon: <DateRangeIcon sx={{ fontSize: 40 }} />,
          color: "secondary",
        };
      case "month":
        return {
          title: "Agendamentos Mês",
          value: monthTotal,
          icon: <CalendarIcon sx={{ fontSize: 40 }} />,
          color: "warning",
        };
      default:
        return {
          title: "Agendamentos",
          value: 0,
          icon: <ScheduleIcon sx={{ fontSize: 40 }} />,
          color: "primary",
        };
    }
  };

  const config = getStatsConfig();

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Box sx={{ color: `${config.color}.main` }}>{config.icon}</Box>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" gutterBottom>
              {config.title}
            </Typography>
            <Typography variant="h4" color={`${config.color}.main`}>
              {config.value}
            </Typography>
            {showLastUpdated && lastUpdated && (
              <Box
                sx={{ mt: 1, display: "flex", alignItems: "center", gap: 1 }}
              >
                <Typography variant="caption" color="text.disabled">
                  Atualizado: {formatTime(lastUpdated)}
                </Typography>
                {isStale && (
                  <Chip
                    label="Desatualizado"
                    size="small"
                    color="warning"
                    variant="outlined"
                  />
                )}
              </Box>
            )}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default AppointmentStatsCard;
