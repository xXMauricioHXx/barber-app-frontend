"use client";

import { Box, Typography, Paper, Card, CardContent } from "@mui/material";
import { useAuth } from "@/context/AuthContext";

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>

      <Typography variant="h6" color="text.secondary" gutterBottom>
        Bem-vindo, {user?.email}!
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
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Agendamentos Hoje
            </Typography>
            <Typography variant="h4" color="primary">
              5
            </Typography>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Clientes Ativos
            </Typography>
            <Typography variant="h4" color="success.main">
              24
            </Typography>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Faturamento Mensal
            </Typography>
            <Typography variant="h4" color="warning.main">
              R$ 2.850
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

      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          Próximos Agendamentos
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Aqui serão exibidos os próximos agendamentos do dia...
        </Typography>
      </Paper>
    </Box>
  );
}
