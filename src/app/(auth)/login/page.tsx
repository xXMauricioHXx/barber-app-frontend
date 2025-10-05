"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
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
  Divider,
} from "@mui/material";
import { LockOutlined, Google } from "@mui/icons-material";
import { signIn, signInWithGoogle, AuthError } from "@/lib/auth";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      setError("Por favor, preencha todos os campos.");
      return;
    }

    if (!email.includes("@")) {
      setError("Por favor, insira um e-mail válido.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await signIn(email, password);
      router.push("/dashboard");
    } catch (error) {
      const authError = error as AuthError;
      setError(authError.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    setError("");

    try {
      await signInWithGoogle();
      router.push("/dashboard");
    } catch (error) {
      const authError = error as AuthError;
      setError(authError.message);
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: { xs: 0, sm: 4 },
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          minHeight: "100vh",
        }}
      >
        <Card sx={{ mt: 8, width: "100%", maxWidth: 400 }}>
          <CardContent sx={{ p: 4 }}>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                mb: 3,
              }}
            >
              <Avatar sx={{ m: 1, bgcolor: "primary.main" }}>
                <LockOutlined />
              </Avatar>
              <Typography component="h1" variant="h4" gutterBottom>
                BarberApp
              </Typography>
              <Typography variant="h6" color="text.secondary">
                Faça login para continuar
              </Typography>
            </Box>

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="E-mail"
                name="email"
                autoComplete="email"
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                type="email"
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Senha"
                type="password"
                id="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2, py: 1.5 }}
                disabled={loading || googleLoading}
              >
                {loading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  "Entrar"
                )}
              </Button>

              <Divider sx={{ my: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  ou
                </Typography>
              </Divider>

              <Button
                fullWidth
                variant="outlined"
                startIcon={
                  googleLoading ? <CircularProgress size={20} /> : <Google />
                }
                onClick={handleGoogleSignIn}
                disabled={loading || googleLoading}
                sx={{ py: 1.5, mb: 2 }}
              >
                {googleLoading ? "Entrando..." : "Continuar com Google"}
              </Button>
            </Box>
          </CardContent>
        </Card>

        <Typography variant="body2" color="text.secondary" sx={{ mt: 4 }}>
          Sistema de Agendamento para Barbearias
        </Typography>
      </Box>
    </Container>
  );
}
