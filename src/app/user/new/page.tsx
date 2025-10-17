"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Container,
  Avatar,
} from "@mui/material";
import { PersonAdd } from "@mui/icons-material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { ptBR } from "date-fns/locale";
import { signUp, AuthError } from "@/lib/auth";
import { doc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { PlanNames } from "@/hooks/usePlans";
import { clientService } from "@/services/clientService";
import { ClientRegistrationData } from "@/types/client";

export default function ClientRegistrationPage() {
  const [formData, setFormData] = useState<ClientRegistrationData>({
    name: "",
    nickname: "",
    birthDate: null,
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const router = useRouter();

  const handleInputChange =
    (field: keyof ClientRegistrationData) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData((prev) => ({
        ...prev,
        [field]: e.target.value,
      }));
    };

  const handleDateChange = (date: Date | null) => {
    setFormData((prev) => ({
      ...prev,
      birthDate: date,
    }));
  };

  const validateForm = (): boolean => {
    const {
      name,
      nickname,
      birthDate,
      email,
      phone,
      password,
      confirmPassword,
    } = formData;

    if (!name.trim()) {
      setError("Nome é obrigatório.");
      return false;
    }

    if (!nickname.trim()) {
      setError("Apelido é obrigatório.");
      return false;
    }

    if (!birthDate) {
      setError("Data de nascimento é obrigatória.");
      return false;
    }

    if (!email.trim() || !email.includes("@")) {
      setError("E-mail válido é obrigatório.");
      return false;
    }

    if (!phone.trim()) {
      setError("Telefone é obrigatório.");
      return false;
    }

    if (password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres.");
      return false;
    }

    if (password !== confirmPassword) {
      setError("As senhas não coincidem.");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      await clientService.create(formData as ClientRegistrationData);

      router.push("/client/dashboard");
    } catch (error) {
      const authError = error as AuthError;
      setError(authError.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
      <Container component="main" maxWidth="sm">
        <Box
          sx={{
            marginTop: { xs: 0, sm: 4 },
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            minHeight: "100vh",
          }}
        >
          <Card sx={{ mt: 4, width: "100%", maxWidth: 600 }}>
            <CardContent sx={{ p: 4 }}>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  mb: 3,
                }}
              >
                <Avatar sx={{ m: 1, bgcolor: "secondary.main" }}>
                  <PersonAdd />
                </Avatar>
                <Typography component="h1" variant="h4" gutterBottom>
                  Criar Conta
                </Typography>
                <Typography variant="h6" color="text.secondary">
                  Junte-se ao BarberApp
                </Typography>
              </Box>

              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}

              <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
                <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
                  <TextField
                    required
                    fullWidth
                    label="Nome Completo"
                    value={formData.name}
                    onChange={handleInputChange("name")}
                    disabled={loading}
                    autoFocus
                  />
                  <TextField
                    required
                    fullWidth
                    label="Apelido"
                    value={formData.nickname}
                    onChange={handleInputChange("nickname")}
                    disabled={loading}
                  />
                </Box>

                <Box sx={{ mb: 2 }}>
                  <DatePicker
                    label="Data de Nascimento"
                    value={formData.birthDate}
                    onChange={handleDateChange}
                    disabled={loading}
                    maxDate={
                      new Date(Date.now() - 16 * 365 * 24 * 60 * 60 * 1000)
                    }
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        required: true,
                      },
                    }}
                  />
                </Box>

                <TextField
                  required
                  fullWidth
                  label="E-mail"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange("email")}
                  disabled={loading}
                  autoComplete="email"
                  sx={{ mb: 2 }}
                />

                <TextField
                  required
                  fullWidth
                  label="Telefone"
                  value={formData.phone}
                  onChange={handleInputChange("phone")}
                  disabled={loading}
                  placeholder="(11) 99999-9999"
                  sx={{ mb: 2 }}
                />

                <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
                  <TextField
                    required
                    fullWidth
                    label="Senha"
                    type="password"
                    value={formData.password}
                    onChange={handleInputChange("password")}
                    disabled={loading}
                    autoComplete="new-password"
                  />
                  <TextField
                    required
                    fullWidth
                    label="Confirmar Senha"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={handleInputChange("confirmPassword")}
                    disabled={loading}
                    autoComplete="new-password"
                  />
                </Box>

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  sx={{ mt: 3, mb: 2, py: 1.5 }}
                  disabled={loading}
                >
                  {loading ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    "Criar Conta"
                  )}
                </Button>

                <Box sx={{ textAlign: "center", mt: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Já tem uma conta?{" "}
                    <Link href="/client/login" style={{ color: "inherit" }}>
                      Faça login aqui
                    </Link>
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>

          <Typography variant="body2" color="text.secondary" sx={{ mt: 4 }}>
            Área do Cliente - BarberApp
          </Typography>
        </Box>
      </Container>
    </LocalizationProvider>
  );
}
