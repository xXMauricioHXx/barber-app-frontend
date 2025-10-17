"use client";

import {
  Box,
  Typography,
  Container,
  Card,
  CardContent,
  Button,
} from "@mui/material";
import { useClientAuth } from "@/context/ClientAuthContext";
import { signOut } from "@/lib/auth";
import { useRouter } from "next/navigation";

export default function ClientDashboard() {
  const { user, clientData } = useClientAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await signOut();
      router.push("/client/login");
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box sx={{ textAlign: "center", mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          Dashboard do Cliente
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Bem-vindo, {clientData?.name || user?.email}!
        </Typography>
      </Box>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Informações da Conta
          </Typography>
          {clientData && (
            <Box sx={{ mt: 2 }}>
              <Typography>
                <strong>Nome:</strong> {clientData.name}
              </Typography>
              <Typography>
                <strong>Apelido:</strong> {clientData.nickname}
              </Typography>
              <Typography>
                <strong>E-mail:</strong> {clientData.email}
              </Typography>
              <Typography>
                <strong>Telefone:</strong> {clientData.phone}
              </Typography>
              <Typography>
                <strong>Plano:</strong> {clientData.plan}
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      <Box sx={{ textAlign: "center" }}>
        <Button variant="outlined" onClick={handleLogout}>
          Sair
        </Button>
      </Box>
    </Container>
  );
}
