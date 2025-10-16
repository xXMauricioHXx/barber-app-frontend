"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
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
} from "@mui/material";
import { Save as SaveIcon } from "@mui/icons-material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { ptBR } from "date-fns/locale";
import { CreateClientData } from "@/types/client";
import { clientService } from "@/services/clientService";
import { useAuth } from "@/context/AuthContext";
import { Breadcrumbs } from "@/components";
import usePlans, { PlanNames } from "@/hooks/usePlans";
import { calculatePlanExpiryDate } from "@/hooks/useClientEligibility";

export default function NewClientPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { plans, paymentStatuses, defaultPlan, defaultPlanStatus } = usePlans();

  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });

  const [formData, setFormData] = useState<CreateClientData>({
    name: "",
    phone: "",
    email: "",
    plan: defaultPlan.name,
    paymentStatus: defaultPlanStatus,
    planExpiryDate: calculatePlanExpiryDate(defaultPlan.name),
  });

  const [errors, setErrors] = useState({
    name: "",
    phone: "",
    email: "",
  });

  const validateForm = (): boolean => {
    const newErrors = {
      name: "",
      phone: "",
      email: "",
    };

    if (!formData.name.trim()) {
      newErrors.name = "Nome é obrigatório";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Telefone é obrigatório";
    } else if (!/^[\d\s\(\)\-\+]+$/.test(formData.phone)) {
      newErrors.phone = "Formato de telefone inválido";
    }

    if (formData.email && formData.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        newErrors.email = "Formato de email inválido";
      }
    }

    setErrors(newErrors);
    return !newErrors.name && !newErrors.phone && !newErrors.email;
  };

  const handleInputChange = (
    field: keyof CreateClientData,
    value: string | Date
  ) => {
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

  const handlePlanChange = (newPlan: string) => {
    const planExpiryDate = calculatePlanExpiryDate(newPlan as PlanNames);
    setFormData((prev) => ({
      ...prev,
      plan: newPlan as PlanNames,
      planExpiryDate,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      await clientService.createClient(user?.uid || "", formData);

      setSnackbar({
        open: true,
        message: "Cliente cadastrado com sucesso!",
        severity: "success",
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message:
          error instanceof Error ? error.message : "Erro ao cadastrar cliente",
        severity: "error",
      });
    } finally {
      setLoading(false);
      router.push("/dashboard/clients");
    }
  };

  const handleCancel = () => {
    router.push("/dashboard/clients");
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
      <Box>
        <Breadcrumbs title="Cadastrar Novo Cliente" />

        <Card sx={{ maxWidth: 600 }}>
          <CardContent sx={{ p: 4 }}>
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
                  disabled={loading}
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
                  disabled={loading}
                />

                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={formData.email || ""}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  error={!!errors.email}
                  helperText={errors.email}
                  placeholder="cliente@exemplo.com"
                  disabled={loading}
                />

                <Box
                  sx={{
                    display: "flex",
                    gap: 2,
                    flexDirection: { xs: "column", sm: "row" },
                  }}
                >
                  <FormControl fullWidth disabled={loading}>
                    <InputLabel>Plano</InputLabel>
                    <Select
                      value={formData.plan}
                      label="Plano"
                      onChange={(e) => handlePlanChange(e.target.value)}
                    >
                      {plans.map((plan) => (
                        <MenuItem key={plan.name} value={plan.name}>
                          {plan.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <FormControl fullWidth disabled={loading}>
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

                <DatePicker
                  label="Data de Vencimento do Plano"
                  value={formData.planExpiryDate}
                  onChange={(newValue) =>
                    handleInputChange("planExpiryDate", newValue || new Date())
                  }
                  disabled={loading}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      helperText:
                        "A data será calculada automaticamente baseada no plano selecionado",
                    },
                  }}
                />

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
                    disabled={loading}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    startIcon={
                      loading ? <CircularProgress size={20} /> : <SaveIcon />
                    }
                    disabled={loading}
                  >
                    {loading ? "Salvando..." : "Salvar Cliente"}
                  </Button>
                </Box>
              </Box>
            </form>
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
    </LocalizationProvider>
  );
}
