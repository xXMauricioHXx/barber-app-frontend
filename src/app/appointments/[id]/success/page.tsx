"use client";

import { Box, Typography, Paper, Container, Button } from "@mui/material";
import { CheckCircle } from "@mui/icons-material";
import { useParams, useRouter } from "next/navigation";

export default function AppointmentSuccessPage() {
  const router = useRouter();
  const resolvedParams = useParams();
  const clientId = resolvedParams?.id as string;

  const handleNewAppointment = () => {
    router.push(`/appointments/${clientId}`);
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper sx={{ p: 4, textAlign: "center" }}>
        <Box sx={{ mb: 3 }}>
          <CheckCircle color="success" sx={{ fontSize: 64, mb: 2 }} />
          <Typography
            variant="h4"
            component="h1"
            gutterBottom
            color="success.main"
          >
            Agendamento Confirmado!
          </Typography>
        </Box>

        <Typography variant="h6" gutterBottom color="text.secondary">
          Seu agendamento foi realizado com sucesso
        </Typography>

        <Typography variant="body1" sx={{ mb: 4 }}>
          Você receberá uma confirmação e lembretes sobre seu agendamento.
          Chegue com 10 minutos de antecedência no horário marcado.
        </Typography>

        <Box
          sx={{
            display: "flex",
            gap: 2,
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          <Button variant="contained" onClick={handleNewAppointment}>
            Fazer Novo Agendamento
          </Button>
        </Box>

        <Box sx={{ mt: 4, pt: 3, borderTop: 1, borderColor: "divider" }}>
          <Typography variant="caption" color="text.secondary">
            Em caso de dúvidas ou necessidade de reagendamento, entre em contato
            conosco.
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
}
