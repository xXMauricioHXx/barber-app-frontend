"use client";

import {
  Box,
  Typography,
  Container,
  Card,
  CardContent,
  Button,
  Alert,
  CircularProgress,
  Grid,
  Chip,
  Divider,
} from "@mui/material";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { barberService } from "@/services/barberService";
import { Barber } from "@/types/barbers";
import { useClientAuth } from "@/context/ClientAuthContext";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { PlanNames } from "@/hooks/usePlans";

interface Plan {
  type: string;
  price: number;
  duration: string;
  features: string[];
}

const DEFAULT_PLANS: Plan[] = [
  {
    type: "Básico",
    price: 59.9,
    duration: "Mensal",
    features: ["Corte de cabelo quantas vezes quiser ao mês"],
  },
  {
    type: "Premium",
    price: 89.9,
    duration: "Mensal",
    features: ["Corte de cabelo e barba quantas vezes quiser no mês"],
  },
  {
    type: "Premium+",
    price: 110.9,
    duration: "Mensal",
    features: [
      "Corte de cabelo, barba e sobrancelha quantas vezes quiser no mês",
    ],
  },
];

export default function BarberDetailPage() {
  const params = useParams();
  const router = useRouter();
  const barberId = params?.barberId as string;
  const { user, clientData } = useClientAuth();

  const [barber, setBarber] = useState<Barber | null>(null);
  const [plans, setPlans] = useState<Plan[]>(DEFAULT_PLANS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [subscribing, setSubscribing] = useState(false);
  const [subscriptionError, setSubscriptionError] = useState<string | null>(
    null
  );

  useEffect(() => {
    if (!barberId) {
      setError("ID da barbearia não encontrado.");
      setLoading(false);
      return;
    }

    const fetchBarberDetails = async () => {
      try {
        setLoading(true);
        const barberData = await barberService.getBarber(barberId);

        if (!barberData) {
          setError("Barbearia não encontrada.");
          return;
        }

        setBarber(barberData);

        // Se a barbearia tem planos customizados, usa eles, senão usa os padrões
        if (barberData.availablePlans && barberData.availablePlans.length > 0) {
          setPlans(barberData.availablePlans);
        }
      } catch (err) {
        console.error("Erro ao buscar detalhes da barbearia:", err);
        setError("Erro ao carregar detalhes da barbearia. Tente novamente.");
      } finally {
        setLoading(false);
      }
    };

    fetchBarberDetails();
  }, [barberId]);

  const handleSubscribePlan = async (plan: Plan) => {
    if (!user || !clientData) {
      setSubscriptionError("Você precisa estar logado para assinar um plano.");
      return;
    }

    if (!barberId) {
      setSubscriptionError("ID da barbearia não encontrado.");
      return;
    }

    try {
      setSubscribing(true);
      setSubscriptionError(null);

      // Mapeia o tipo do plano para PlanNames
      let planName: PlanNames;
      switch (plan.type) {
        case "Básico":
          planName = PlanNames.BASIC;
          break;
        case "Premium":
          planName = PlanNames.PREMIUM;
          break;
        case "Premium+":
          planName = PlanNames.PREMIUM_PLUS;
          break;
        default:
          planName = PlanNames.NOT_SELECTED;
      }

      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          internalClientId: user.uid,
          email: clientData.email,
          selectedPlan: planName,
          barberId,
        }),
      });

      const { url } = await res.json();
      if (url) {
        window.location.href = url;
      } else {
        console.error("Failed to get Stripe Checkout URL:", url);
      }
    } catch (err) {
      console.error("Erro ao assinar plano:", err);
      setSubscriptionError("Erro ao assinar plano. Tente novamente.");
    } finally {
      setSubscribing(false);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "50vh",
          }}
        >
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error || !barber) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error || "Barbearia não encontrada."}
        </Alert>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => router.push("/client/barber")}
        >
          Voltar para Dashboard
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Button
        variant="text"
        startIcon={<ArrowBackIcon />}
        onClick={() => router.push("/client/barber")}
        sx={{ mb: 3 }}
        aria-label="Voltar para dashboard"
      >
        Voltar
      </Button>

      {/* Informações da Barbearia */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h4" component="h1" gutterBottom>
            {barber.name}
          </Typography>

          <Divider sx={{ my: 2 }} />

          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="body1" sx={{ mb: 1 }}>
                <strong>Telefone:</strong> {barber.phone || "Não informado"}
              </Typography>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="body1" sx={{ mb: 1 }}>
                <strong>Endereço:</strong> {barber.address || "Não informado"}
              </Typography>
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Typography variant="body1" sx={{ mb: 1 }}>
                <strong>Descrição:</strong>{" "}
                {barber.description || "Sem descrição disponível."}
              </Typography>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                <Typography variant="body1">
                  <strong>Horário de Funcionamento:</strong>
                </Typography>
                <Chip
                  label={`${barber.startWork || "-"} às ${
                    barber.endWork || "-"
                  }`}
                  size="small"
                  color="primary"
                  variant="outlined"
                />
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Planos Disponíveis */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" component="h2" gutterBottom>
          Planos de Assinatura
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Escolha o plano ideal para você
        </Typography>
      </Box>

      {subscriptionError && (
        <Alert
          severity="error"
          sx={{ mb: 3 }}
          onClose={() => setSubscriptionError(null)}
        >
          {subscriptionError}
        </Alert>
      )}

      <Grid container spacing={3}>
        {plans.map((plan, index) => (
          <Grid key={index} size={{ xs: 12, sm: 6, md: 4 }}>
            <Card
              sx={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                border: plan.type === "Premium" ? "2px solid" : "1px solid",
                borderColor:
                  plan.type === "Premium" ? "primary.main" : "divider",
                position: "relative",
                transition: "transform 0.2s, box-shadow 0.2s",
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: (theme) => theme.shadows[8],
                },
              }}
            >
              {plan.type === "Premium" && (
                <Chip
                  label="Mais Popular"
                  color="primary"
                  size="small"
                  sx={{
                    position: "absolute",
                    top: 16,
                    right: 16,
                  }}
                />
              )}

              <CardContent
                sx={{
                  flexGrow: 1,
                  display: "flex",
                  flexDirection: "column",
                  p: 3,
                }}
              >
                <Typography
                  variant="h5"
                  component="h3"
                  gutterBottom
                  sx={{ fontWeight: "bold" }}
                >
                  {plan.type}
                </Typography>

                <Box sx={{ mb: 3 }}>
                  <Typography
                    variant="h4"
                    component="div"
                    sx={{ fontWeight: "bold", color: "primary.main" }}
                  >
                    R$ {plan.price.toFixed(2)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {plan.duration}
                  </Typography>
                </Box>

                <Divider sx={{ mb: 2 }} />

                <Box sx={{ flexGrow: 1, mb: 2 }}>
                  <Typography
                    variant="subtitle2"
                    gutterBottom
                    sx={{ fontWeight: "bold" }}
                  >
                    Benefícios:
                  </Typography>
                  {plan.features.map((feature, featureIndex) => (
                    <Box
                      key={featureIndex}
                      sx={{
                        display: "flex",
                        alignItems: "flex-start",
                        mb: 1,
                      }}
                    >
                      <CheckCircleIcon
                        sx={{
                          fontSize: 20,
                          color: "success.main",
                          mr: 1,
                          mt: 0.25,
                        }}
                        aria-hidden="true"
                      />
                      <Typography variant="body2">{feature}</Typography>
                    </Box>
                  ))}
                </Box>

                <Button
                  variant="contained"
                  fullWidth
                  onClick={() => handleSubscribePlan(plan)}
                  disabled={subscribing}
                  sx={{
                    mt: "auto",
                    borderRadius: 2,
                    textTransform: "none",
                    fontWeight: "medium",
                  }}
                  aria-label={`Assinar plano ${plan.type}`}
                >
                  {subscribing ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    "Assinar Plano"
                  )}
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}
