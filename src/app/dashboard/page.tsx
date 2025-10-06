"use client";

import { Box, Typography, Card, CardContent } from "@mui/material";
import { useAuth } from "@/context/AuthContext";
import { useAppointments } from "@/context/AppointmentContext";
import { AppointmentStatsCard } from "@/components";
import React, { useEffect } from "react";
import { barberService } from "@/services/barberService";

export default function DashboardPage() {
  const { user } = useAuth();
  const { refreshStats } = useAppointments();
  const [barber, setBarber] = React.useState<{ name: string } | null>(null);

  const loadBarber = React.useCallback(async () => {
    try {
      const barber = await barberService.getBarber(user?.uid || "");
      setBarber(barber);
    } catch (err) {
      console.error(err);
    }
  }, [user?.uid]);

  useEffect(() => {
    loadBarber();
    if (user?.uid) {
      refreshStats(user.uid);
    }
  }, [user?.uid, refreshStats, loadBarber]);

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>

      <Typography variant="h6" color="text.secondary" gutterBottom>
        Bem-vindo, {barber?.name || user?.email}!
      </Typography>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, 1fr)",
            lg: "repeat(4, 1fr)",
          },
          gap: 3,
          mt: 3,
        }}
      >
        <AppointmentStatsCard variant="today" showLastUpdated />
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Clientes Ativos
            </Typography>
            <Typography variant="h4" color="success.main">
              0
            </Typography>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Faturamento Mensal
            </Typography>
            <Typography variant="h4" color="warning.main">
              R$ 0,00
            </Typography>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Avaliação Média
            </Typography>
            <Typography variant="h4" color="info.main">
              4.8
            </Typography>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}
