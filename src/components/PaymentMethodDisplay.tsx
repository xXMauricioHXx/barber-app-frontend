"use client";

import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  Alert,
  Stack,
  Divider,
} from "@mui/material";
import {
  CreditCard as CreditCardIcon,
  Security as SecurityIcon,
} from "@mui/icons-material";
import { Client } from "@/types/client";

interface PaymentMethodDisplayProps {
  client: Client;
}

export function PaymentMethodDisplay({ client }: PaymentMethodDisplayProps) {
  const hasPaymentMethod =
    client.stripeCustomerId &&
    client.paymentMethodBrand &&
    client.paymentMethodLast4;

  if (!hasPaymentMethod) {
    return (
      <Alert severity="info" sx={{ mb: 2 }}>
        <Typography variant="body2">
          Nenhum método de pagamento cadastrado ainda.
        </Typography>
      </Alert>
    );
  }

  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Typography
          variant="h6"
          gutterBottom
          sx={{ display: "flex", alignItems: "center", gap: 1 }}
        >
          <CreditCardIcon />
          Método de Pagamento Ativo
        </Typography>

        <Stack spacing={2}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Chip
              label={client.paymentMethodBrand?.toUpperCase()}
              color="primary"
              size="small"
            />
            <Typography variant="body1">
              •••• •••• •••• {client.paymentMethodLast4}
            </Typography>
          </Box>

          <Divider />

          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <SecurityIcon fontSize="small" color="success" />
            <Typography variant="body2" color="success.main">
              Método seguro - criptografado pelo Stripe
            </Typography>
          </Box>

          <Typography variant="caption" color="text.secondary">
            ID do Cliente Stripe: {client.stripeCustomerId}
          </Typography>
        </Stack>
      </CardContent>
    </Card>
  );
}
