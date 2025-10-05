"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Typography,
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
import {
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon,
} from "@mui/icons-material";
import { CreateClientData } from "@/types/client";
import { clientService } from "@/services/clientService";
import { useAuth } from "@/context/AuthContext";

export default function NewClientPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });

  const [formData, setFormData] = useState<CreateClientData>({
    name: "",
    phone: "",
    plan: "Básico",
    paymentStatus: "Pago",
  });

  const [errors, setErrors] = useState({
    name: "",
    phone: "",
  });

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

    setLoading(true);

    try {
      await clientService.createClient(user?.uid || "", formData);

      setSnackbar({
        open: true,
        message: "Cliente cadastrado com sucesso!",
        severity: "success",
      });

      setTimeout(() => {
        router.push("/dashboard/clients");
      }, 1000);
    } catch (error) {
      setSnackbar({
        open: true,
        message:
          error instanceof Error ? error.message : "Erro ao cadastrar cliente",
        severity: "error",
      });
    } finally {
      setLoading(false);
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
      <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={handleCancel}
          sx={{ mr: 2 }}
        >
          Voltar
        </Button>
        <Typography variant="h4" component="h1">
          Cadastrar Novo Cliente
        </Typography>
      </Box>

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
                    onChange={(e) => handleInputChange("plan", e.target.value)}
                  >
                    <MenuItem value="Básico">Básico</MenuItem>
                    <MenuItem value="Premium">Premium</MenuItem>
                    <MenuItem value="VIP">VIP</MenuItem>
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
                    <MenuItem value="Pago">Pago</MenuItem>
                    <MenuItem value="Em Atraso">Em Atraso</MenuItem>
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
  );
}
