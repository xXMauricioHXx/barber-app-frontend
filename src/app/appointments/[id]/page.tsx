"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  Container,
} from "@mui/material";
import { Client } from "@/types/client";

export default function AppointmentPage() {
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const resolvedParams = useParams();
  const clientId = resolvedParams?.id as string;

  useEffect(() => {
    const loadClient = async () => {
      if (!clientId) {
        setError("ID do cliente não fornecido");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        // Como não temos o barberId na URL, precisaremos buscar de forma diferente
        // Por enquanto, vamos mostrar uma página simples
        setClient({
          id: clientId,
          name: "Cliente",
          phone: "",
          plan: "Básico",
          paymentStatus: "Pago",
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Erro ao carregar cliente"
        );
      } finally {
        setLoading(false);
      }
    };

    loadClient();
  }, [clientId]);

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 2,
          }}
        >
          <CircularProgress />
          <Typography>Carregando...</Typography>
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Agendamento Online
        </Typography>

        <Typography
          variant="h6"
          component="h2"
          gutterBottom
          align="center"
          color="text.secondary"
        >
          Barbearia - Sistema de Agendamento
        </Typography>

        {client && (
          <Box sx={{ mt: 4 }}>
            <Typography variant="body1" align="center">
              Página de agendamento para o cliente ID:{" "}
              <strong>{clientId}</strong>
            </Typography>
            <Typography
              variant="body2"
              align="center"
              color="text.secondary"
              sx={{ mt: 2 }}
            >
              Esta página será desenvolvida para permitir que o cliente realize
              seu agendamento.
            </Typography>
          </Box>
        )}

        <Box sx={{ mt: 4, textAlign: "center" }}>
          <Typography variant="caption" color="text.secondary">
            Link público de agendamento - não requer autenticação
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
}
