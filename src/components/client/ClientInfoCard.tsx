"use client";

import { Box, Typography, Card, CardContent, Chip, Alert } from "@mui/material";
import { Client } from "@/types/client";
import { ServiceType } from "@/types/serviceType";
import usePlans from "@/hooks/usePlans";

interface ClientInfoCardProps {
  clientData: Client;
  serviceType: ServiceType | null;
  barberName?: string;
}

/**
 * Card com informações do cliente
 */
export function ClientInfoCard({
  clientData,
  serviceType,
  barberName,
}: ClientInfoCardProps) {
  const { getPlanStyle } = usePlans();

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Bem-vindo, {clientData.name}!
        </Typography>
        <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
          <Typography variant="body2" color="text.secondary">
            Seu plano:
          </Typography>
          <Chip
            label={clientData.plan}
            sx={getPlanStyle(clientData.plan)}
            size="small"
            aria-label={`Plano atual: ${clientData.plan}`}
          />
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Serviço disponível: <strong>{serviceType || "N/A"}</strong>
        </Typography>
        {barberName && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Estabelecimento: <strong>{barberName}</strong>
          </Typography>
        )}

        {!clientData.stripeCustomerId && (
          <Alert severity="error" sx={{ mt: 2 }} role="alert">
            <Typography variant="body2" component="div">
              <strong>Agendamento bloqueado:</strong>
            </Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              Entre em contato com o estabelecimento para regularizar sua
              situação.
            </Typography>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
