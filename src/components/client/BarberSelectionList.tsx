"use client";

import {
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Box,
  CircularProgress,
  Alert,
} from "@mui/material";
import { Barber } from "@/types/barbers";
import { useRouter } from "next/navigation";

interface BarberSelectionListProps {
  barbers: Barber[];
  loading: boolean;
  error: string | null;
}

/**
 * Lista de barbearias disponíveis para o cliente escolher
 */
export function BarberSelectionList({
  barbers,
  loading,
  error,
}: BarberSelectionListProps) {
  const router = useRouter();

  const handleSelectBarber = (barberId: string) => {
    router.push(`/client/dashboard/barbers/${barberId}`);
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "300px",
        }}
      >
        <CircularProgress aria-label="Carregando barbearias" />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" role="alert" sx={{ mb: 3 }}>
        {error}
      </Alert>
    );
  }

  if (barbers.length === 0) {
    return (
      <Alert severity="info" sx={{ mb: 3 }}>
        Nenhuma barbearia disponível no momento.
      </Alert>
    );
  }

  return (
    <Grid container spacing={3}>
      {barbers.map((barber) => (
        <Grid key={barber.id} size={{ xs: 12, sm: 6, md: 4 }}>
          <Card
            sx={{
              height: "100%",
              display: "flex",
              flexDirection: "column",
              transition: "transform 0.2s, box-shadow 0.2s",
              "&:hover": {
                transform: "translateY(-4px)",
                boxShadow: (theme) => theme.shadows[8],
              },
            }}
          >
            <CardContent sx={{ flexGrow: 1, p: 3 }}>
              <Typography
                variant="h5"
                component="h2"
                gutterBottom
                sx={{
                  fontWeight: "bold",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
                title={barber.name}
              >
                {barber.name}
              </Typography>

              <Box sx={{ mb: 2 }}>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 1 }}
                >
                  <strong>Telefone:</strong> {barber.phone || "-"}
                </Typography>

                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 1 }}
                >
                  <strong>Horário de funcionamento:</strong>
                </Typography>

                <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                  <Chip
                    label={`Início: ${barber.startWork || "-"}`}
                    size="small"
                    variant="outlined"
                    color="primary"
                  />
                  <Chip
                    label={`Fim: ${barber.endWork || "-"}`}
                    size="small"
                    variant="outlined"
                    color="primary"
                  />
                </Box>
              </Box>

              <Box sx={{ mt: "auto", pt: 2 }}>
                <Button
                  variant="contained"
                  fullWidth
                  onClick={() => handleSelectBarber(barber.id || "")}
                  sx={{
                    borderRadius: 2,
                    textTransform: "none",
                    fontWeight: "medium",
                  }}
                  aria-label={`Selecionar barbearia ${barber.name}`}
                >
                  Ver Planos
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}
