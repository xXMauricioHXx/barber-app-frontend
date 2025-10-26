"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Box, CircularProgress, Typography, Alert } from "@mui/material";
import { barberService } from "@/services/barberService";

interface BarberAuthGuardProps {
  children: React.ReactNode;
}

export default function BarberAuthGuard({ children }: BarberAuthGuardProps) {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [isBarber, setIsBarber] = useState<boolean | null>(null);
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkBarberStatus = async () => {
      if (authLoading) {
        return;
      }

      if (!user) {
        router.push("/login");
        return;
      }

      try {
        setChecking(true);
        setError(null);

        // Verifica se o usuário existe na coleção de barbeiros
        const barber = await barberService.getBarber(user.uid);

        if (!barber) {
          // Usuário não é um barbeiro cadastrado
          setIsBarber(false);
          setError(
            "Você não tem permissão para acessar esta área. Esta área é restrita para barbeiros cadastrados."
          );

          // Redireciona para a área de cliente após um breve delay
          setTimeout(() => {
            router.push("/client");
          }, 3000);
        } else {
          // Usuário é um barbeiro válido
          setIsBarber(true);
        }
      } catch (error) {
        console.error("Erro ao verificar status de barbeiro:", error);
        setError("Erro ao verificar permissões. Tente novamente.");
        setIsBarber(false);
      } finally {
        setChecking(false);
      }
    };

    checkBarberStatus();
  }, [user, authLoading, router]);

  // Mostra loading enquanto verifica autenticação
  if (authLoading || checking) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
        gap={2}
      >
        <CircularProgress size={60} />
        <Typography variant="h6" color="text.secondary">
          Verificando permissões...
        </Typography>
      </Box>
    );
  }

  // Mostra erro se o usuário não for um barbeiro
  if (error || isBarber === false) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
        gap={2}
        px={3}
      >
        <Alert severity="error" sx={{ maxWidth: 600 }}>
          <Typography variant="h6" gutterBottom>
            Acesso Negado
          </Typography>
          <Typography variant="body1">
            {error ||
              "Você não tem permissão para acessar esta área. Redirecionando..."}
          </Typography>
        </Alert>
      </Box>
    );
  }

  // Usuário não autenticado
  if (!user) {
    return null;
  }

  // Usuário é um barbeiro válido, mostra o conteúdo
  if (isBarber) {
    return <>{children}</>;
  }

  return null;
}
