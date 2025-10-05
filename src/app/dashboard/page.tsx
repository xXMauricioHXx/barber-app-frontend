"use client";

import {
  Box,
  Typography,
  Button,
  AppBar,
  Toolbar,
  Container,
} from "@mui/material";
import { useAuth } from "@/context/AuthContext";
import { signOut } from "@/lib/auth";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await signOut();
      router.push("/login");
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  };

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            BarberApp - Dashboard
          </Typography>
          <Button color="inherit" onClick={handleLogout}>
            Sair
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ textAlign: "center", py: 4 }}>
          <Typography variant="h4" gutterBottom>
            Bem-vindo ao Dashboard!
          </Typography>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Olá, {user?.email}
          </Typography>
          <Typography variant="body1" sx={{ mt: 2 }}>
            Você está autenticado com sucesso no sistema de agendamento da
            barbearia.
          </Typography>
        </Box>
      </Container>
    </>
  );
}
