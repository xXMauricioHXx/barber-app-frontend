"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  Container,
  Button,
  Card,
  CardContent,
  Chip,
  Snackbar,
  Stack,
  Divider,
} from "@mui/material";
import {
  CreditCard as CreditCardIcon,
  ArrowBack as ArrowBackIcon,
  Security as SecurityIcon,
} from "@mui/icons-material";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { Client } from "@/types/client";
import { clientService } from "@/services/clientService";
import { paymentService } from "@/services/paymentService";
import { PaymentMethodDisplay } from "@/components/PaymentMethodDisplay";
import usePlans from "@/hooks/usePlans";

// Inicializar Stripe (usar variável de ambiente)
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ""
);

interface CheckoutFormProps {
  clientId: string;
  client: Client;
  onSuccess: () => void;
  onError: (error: string) => void;
}

function CheckoutForm({
  clientId,
  client,
  onSuccess,
  onError,
}: CheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      onError("Stripe não foi carregado corretamente. Tente novamente.");
      return;
    }

    if (!client.email) {
      onError(
        "Email do cliente é obrigatório. Entre em contato com o estabelecimento."
      );
      return;
    }

    const cardElement = elements.getElement(CardElement);

    if (!cardElement) {
      onError("Erro ao acessar os dados do cartão. Recarregue a página.");
      return;
    }

    try {
      setIsSubmitting(true);

      // Criar PaymentMethod no Stripe
      const { error, paymentMethod } = await stripe.createPaymentMethod({
        type: "card",
        card: cardElement,
        billing_details: {
          name: client.name,
          email: client.email,
          phone: client.phone,
        },
      });

      if (error) {
        onError(error.message || "Erro ao processar os dados do cartão.");
        return;
      }

      if (!paymentMethod) {
        onError("Erro ao criar método de pagamento. Tente novamente.");
        return;
      }

      // Enviar para Firebase Cloud Function
      await paymentService.addPaymentMethod({
        paymentMethodId: paymentMethod.id,
        clientId: clientId,
      });

      onSuccess();
    } catch (error) {
      onError(
        error instanceof Error
          ? error.message
          : "Erro ao salvar método de pagamento."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: "16px",
        fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
        color: "#424242",
        "::placeholder": {
          color: "#aaa",
        },
      },
      invalid: {
        color: "#d32f2f",
        iconColor: "#d32f2f",
      },
    },
    hidePostalCode: true,
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography
            variant="h6"
            gutterBottom
            sx={{ display: "flex", alignItems: "center", gap: 1 }}
          >
            <CreditCardIcon />
            Dados do Cartão
          </Typography>

          <Box
            sx={{
              p: 2,
              border: "1px solid #e0e0e0",
              borderRadius: 1,
              backgroundColor: "#fafafa",
              mb: 2,
            }}
          >
            <CardElement options={cardElementOptions} />
          </Box>

          <Alert severity="info" sx={{ mb: 2 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
              <SecurityIcon fontSize="small" />
              <Typography variant="body2" fontWeight="medium">
                Seus dados estão seguros
              </Typography>
            </Box>
            <Typography variant="body2">
              Utilizamos a tecnologia Stripe para proteger suas informações de
              pagamento. Os dados do seu cartão são criptografados e não são
              armazenados em nossos servidores.
            </Typography>
          </Alert>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            <strong>Cliente:</strong> {client.name}
            <br />
            <strong>Email:</strong> {client.email || "Não informado"}
            <br />
            <strong>Telefone:</strong> {client.phone}
          </Typography>
        </CardContent>
      </Card>

      <Button
        type="submit"
        variant="contained"
        size="large"
        fullWidth
        disabled={!stripe || isSubmitting}
        sx={{ mb: 2 }}
      >
        {isSubmitting ? (
          <>
            <CircularProgress size={20} sx={{ mr: 1 }} />
            Processando...
          </>
        ) : (
          "Adicionar Método de Pagamento"
        )}
      </Button>

      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ display: "block", textAlign: "center" }}
      >
        Este cartão será salvo para futuras transações (mensalidades, etc.)
      </Typography>
    </Box>
  );
}

export default function AddPaymentPage() {
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const { getPlanStyle } = usePlans();
  const router = useRouter();

  const resolvedParams = useParams();
  const ids = resolvedParams?.id as string;
  const [clientId, barberId] = ids ? ids.split("-") : ["", ""];

  useEffect(() => {
    const loadClient = async () => {
      if (!clientId || !barberId) {
        setError("IDs do cliente ou estabelecimento não fornecidos");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const clientData = await clientService.getClientById(
          barberId,
          clientId
        );

        if (!clientData) {
          setError("Cliente não encontrado");
          return;
        }

        setClient(clientData);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Erro ao carregar dados do cliente"
        );
      } finally {
        setLoading(false);
      }
    };

    loadClient();
  }, [clientId, barberId]);

  const handleSuccess = () => {
    setSuccess("Método de pagamento adicionado com sucesso!");
    setTimeout(() => {
      router.push(`/appointments/${ids}`);
    }, 2000);
  };

  const handleError = (errorMessage: string) => {
    setError(errorMessage);
  };

  const handleGoBack = () => {
    router.push(`/appointments/${ids}`);
  };

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

  if (error && !client) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={handleGoBack}
        >
          Voltar
        </Button>
      </Container>
    );
  }

  if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          Configuração do Stripe não encontrada. Entre em contato com o suporte.
        </Alert>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={handleGoBack}
        >
          Voltar
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={handleGoBack}
            size="small"
          >
            Voltar
          </Button>
        </Box>

        <Typography variant="h4" component="h1" gutterBottom align="center">
          Adicionar Método de Pagamento
        </Typography>

        {client && (
          <>
            <PaymentMethodDisplay client={client} />

            <Card sx={{ mb: 4 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Informações do Cliente
                </Typography>
                <Stack spacing={1}>
                  <Typography variant="body2">
                    <strong>Nome:</strong> {client.name}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Telefone:</strong> {client.phone}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Email:</strong> {client.email || "Não informado"}
                  </Typography>
                  <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                    <Typography variant="body2">
                      <strong>Plano:</strong>
                    </Typography>
                    <Chip
                      label={client.plan}
                      sx={getPlanStyle(client.plan)}
                      size="small"
                    />
                  </Box>

                  {client.stripeCustomerId && (
                    <>
                      <Divider sx={{ my: 1 }} />
                      <Typography variant="body2" color="success.main">
                        ✓ Cliente já possui cadastro no sistema de pagamento
                      </Typography>
                      {client.paymentMethodBrand &&
                        client.paymentMethodLast4 && (
                          <Typography variant="body2" color="text.secondary">
                            Cartão atual: {client.paymentMethodBrand} ••••{" "}
                            {client.paymentMethodLast4}
                          </Typography>
                        )}
                    </>
                  )}
                </Stack>
              </CardContent>
            </Card>

            {!client.email && (
              <Alert severity="warning" sx={{ mb: 3 }}>
                Para adicionar um método de pagamento, é necessário ter um email
                cadastrado. Entre em contato com o estabelecimento para
                atualizar seus dados.
              </Alert>
            )}

            {client.email && (
              <Elements stripe={stripePromise}>
                <CheckoutForm
                  clientId={clientId}
                  client={client}
                  onSuccess={handleSuccess}
                  onError={handleError}
                />
              </Elements>
            )}
          </>
        )}
      </Paper>

      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError("")}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert onClose={() => setError("")} severity="error">
          {error}
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!success}
        autoHideDuration={4000}
        onClose={() => setSuccess("")}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert onClose={() => setSuccess("")} severity="success">
          {success}
        </Alert>
      </Snackbar>
    </Container>
  );
}
