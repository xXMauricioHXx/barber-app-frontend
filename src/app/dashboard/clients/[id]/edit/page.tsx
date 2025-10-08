"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  Box,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  Snackbar,
  Alert,
  CircularProgress,
  Skeleton,
} from "@mui/material";
import { Save as SaveIcon } from "@mui/icons-material";
import { CreateClientData, Client } from "@/types/client";
import { clientService } from "@/services/clientService";
import { useAuth } from "@/context/AuthContext";
import { Custom404, Breadcrumbs } from "@/components";
import usePlans from "@/hooks/usePlans";

export default function EditClientPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const { plans, paymentStatuses, defaultPlan, defaultPlanStatus } = usePlans();

  const clientId = params.id as string;

  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [clientNotFound, setClientNotFound] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });

  const [formData, setFormData] = useState<CreateClientData>({
    name: "",
    phone: "",
    plan: defaultPlan.name,
    paymentStatus: defaultPlanStatus,
  });

  const [errors, setErrors] = useState({
    name: "",
    phone: "",
  });

  useEffect(() => {
    const loadClient = async () => {
      try {
        setLoading(true);
        const clientData = await clientService.getClientById(
          user?.uid || "",
          clientId
        );

        if (!clientData) {
          setClientNotFound(true);
          return;
        }

        setClient(clientData);
        setFormData({
          name: clientData.name,
          phone: clientData.phone,
          plan: clientData.plan,
          paymentStatus: clientData.paymentStatus,
        });
      } catch (error) {
        setSnackbar({
          open: true,
          message:
            error instanceof Error ? error.message : "Erro ao carregar cliente",
          severity: "error",
        });
        router.push("/dashboard/clients");
      } finally {
        setLoading(false);
      }
    };

    if (clientId && user?.uid) {
      loadClient();
    }
  }, [clientId, user?.uid, router]);

  // Se o cliente não foi encontrado, mostra a página 404 customizada
  if (clientNotFound) {
    return (
      <Custom404
        title="Cliente não encontrado"
        message="O cliente que você está procurando não existe ou foi removido do sistema. Verifique se o ID está correto ou volte para a lista de clientes."
        homeLink="/dashboard/clients"
        backLink="/dashboard/clients"
      />
    );
  }

  const validateForm = (): boolean => {
    const newErrors = {
      name: "",
      phone: "",
    };

    if (!formData.name.trim()) {
      newErrors.name = "Nome é obrigatório";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Telefone é obrigatório";
    } else if (!/^[\d\s\(\)\-\+]+$/.test(formData.phone)) {
      newErrors.phone = "Formato de telefone inválido";
    }

    setErrors(newErrors);
    return !newErrors.name && !newErrors.phone;
  };

  const handleInputChange = (field: keyof CreateClientData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (errors[field as keyof typeof errors]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setSaving(true);

    try {
      await clientService.updateClient(user?.uid || "", clientId, formData);

      setSnackbar({
        open: true,
        message: "Cliente atualizado com sucesso!",
        severity: "success",
      });

      setTimeout(() => {
        router.push("/dashboard/clients");
      }, 1000);
    } catch (error) {
      setSnackbar({
        open: true,
        message:
          error instanceof Error ? error.message : "Erro ao atualizar cliente",
        severity: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    router.push("/dashboard/clients");
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  return (
    <Box>
      <Breadcrumbs
        title={
          loading ? "Carregando..." : `Editar Cliente: ${client?.name || ""}`
        }
      />

      <Card sx={{ maxWidth: 600 }}>
        <CardContent sx={{ p: 4 }}>
          {loading ? (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
              <Skeleton variant="rounded" height={56} />
              <Skeleton variant="rounded" height={56} />
              <Box sx={{ display: "flex", gap: 2 }}>
                <Skeleton variant="rounded" height={56} sx={{ flex: 1 }} />
                <Skeleton variant="rounded" height={56} sx={{ flex: 1 }} />
              </Box>
            </Box>
          ) : (
            <>
              <form onSubmit={handleSubmit}>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                  <TextField
                    fullWidth
                    label="Nome Completo"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    error={!!errors.name}
                    helperText={errors.name}
                    required
                    disabled={saving}
                  />

                  <TextField
                    fullWidth
                    label="Telefone"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    error={!!errors.phone}
                    helperText={errors.phone}
                    placeholder="(11) 99999-9999"
                    required
                    disabled={saving}
                  />

                  <Box
                    sx={{
                      display: "flex",
                      gap: 2,
                      flexDirection: { xs: "column", sm: "row" },
                    }}
                  >
                    <FormControl fullWidth disabled={saving}>
                      <InputLabel>Plano</InputLabel>
                      <Select
                        value={formData.plan}
                        label="Plano"
                        onChange={(e) =>
                          handleInputChange("plan", e.target.value)
                        }
                      >
                        {plans.map((plan) => (
                          <MenuItem key={plan.name} value={plan.name}>
                            {plan.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>

                    <FormControl fullWidth disabled={saving}>
                      <InputLabel>Status do Pagamento</InputLabel>
                      <Select
                        value={formData.paymentStatus}
                        label="Status do Pagamento"
                        onChange={(e) =>
                          handleInputChange("paymentStatus", e.target.value)
                        }
                      >
                        {paymentStatuses.map((status) => (
                          <MenuItem key={status} value={status}>
                            {status}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Box>

                  <Box
                    sx={{
                      display: "flex",
                      gap: 2,
                      justifyContent: "flex-end",
                      mt: 2,
                    }}
                  >
                    <Button
                      variant="outlined"
                      onClick={handleCancel}
                      disabled={saving}
                    >
                      Cancelar
                    </Button>
                    <Button
                      type="submit"
                      variant="contained"
                      startIcon={
                        saving ? <CircularProgress size={20} /> : <SaveIcon />
                      }
                      disabled={saving}
                    >
                      {saving ? "Salvando..." : "Salvar Alterações"}
                    </Button>
                  </Box>
                </Box>
              </form>
            </>
          )}
        </CardContent>
      </Card>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
