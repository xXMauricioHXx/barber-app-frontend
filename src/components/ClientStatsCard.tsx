import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  CircularProgress,
  Alert,
} from "@mui/material";
import {
  Group as GroupIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  CheckCircle as CheckCircleIcon,
} from "@mui/icons-material";
import { Client } from "@/types/client";
import { clientService } from "@/services/clientService";
import { useAuth } from "@/context/AuthContext";
import {
  isClientEligibleForBooking,
  getPlanExpiryStatus,
} from "@/hooks/useClientEligibility";

interface ClientStatsData {
  total: number;
  active: number;
  expired: number;
  warning: number;
  paymentLate: number;
}

export default function ClientStatsCard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<ClientStatsData>({
    total: 0,
    active: 0,
    expired: 0,
    warning: 0,
    paymentLate: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const loadClientStats = async () => {
      if (!user?.uid) return;

      try {
        setLoading(true);
        setError("");

        const clients = await clientService.getClients(user.uid);

        const stats: ClientStatsData = {
          total: clients.length,
          active: 0,
          expired: 0,
          warning: 0,
          paymentLate: 0,
        };

        clients.forEach((client: Client) => {
          const expiryStatus =
            client.planExpiryDate && getPlanExpiryStatus(client.planExpiryDate);
          const isEligible = isClientEligibleForBooking(client);

          if (client.paymentStatus === "Em Atraso") {
            stats.paymentLate++;
          }

          if (expiryStatus?.status === "expired") {
            stats.expired++;
          } else if (expiryStatus?.status === "warning") {
            stats.warning++;
          } else if (isEligible) {
            stats.active++;
          }
        });

        setStats(stats);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Erro ao carregar estatísticas"
        );
      } finally {
        setLoading(false);
      }
    };

    loadClientStats();
  }, [user?.uid]);

  if (loading) {
    return (
      <Card>
        <CardContent>
          <Box sx={{ display: "flex", justifyContent: "center", p: 2 }}>
            <CircularProgress size={24} />
          </Box>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent>
          <Alert severity="error" sx={{ p: 1 }}>
            {error}
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
          <GroupIcon color="primary" />
          <Typography variant="h6">Status dos Clientes</Typography>
        </Box>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {/* Total de Clientes */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography variant="body2" color="text.secondary">
              Total de Clientes
            </Typography>
            <Typography variant="h6" color="primary.main">
              {stats.total}
            </Typography>
          </Box>

          {/* Clientes Ativos */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <CheckCircleIcon fontSize="small" color="success" />
              <Typography variant="body2">Ativos</Typography>
            </Box>
            <Chip label={stats.active} color="success" size="small" />
          </Box>

          {/* Clientes com Aviso */}
          {stats.warning > 0 && (
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <WarningIcon fontSize="small" color="warning" />
                <Typography variant="body2">Vencendo em Breve</Typography>
              </Box>
              <Chip label={stats.warning} color="warning" size="small" />
            </Box>
          )}

          {/* Clientes Vencidos */}
          {stats.expired > 0 && (
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <ErrorIcon fontSize="small" color="error" />
                <Typography variant="body2">Planos Vencidos</Typography>
              </Box>
              <Chip label={stats.expired} color="error" size="small" />
            </Box>
          )}

          {/* Pagamentos em Atraso */}
          {stats.paymentLate > 0 && (
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <ErrorIcon fontSize="small" color="error" />
                <Typography variant="body2">Pagamento em Atraso</Typography>
              </Box>
              <Chip label={stats.paymentLate} color="error" size="small" />
            </Box>
          )}
        </Box>

        {stats.total === 0 && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ textAlign: "center", mt: 2 }}
          >
            Nenhum cliente cadastrado
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}
