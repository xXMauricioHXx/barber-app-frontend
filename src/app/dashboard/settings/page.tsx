"use client";

import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Stack,
} from "@mui/material";
import { Breadcrumbs } from "@/components";
import { useBarberSettings } from "@/hooks/useBarberSettings";
import { Barber } from "@/types/barbers";

export default function SettingsPage() {
  const {
    barberData,
    loading,
    saving,
    loadBarberSettings,
    saveBarberSettings,
  } = useBarberSettings();
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const [settings, setSettings] = useState<Omit<Barber, "id">>({
    name: "",
    phone: "",
    startWork: "08:00",
    endWork: "18:00",
  });

  useEffect(() => {
    loadBarberSettings();
  }, [loadBarberSettings]);

  useEffect(() => {
    if (barberData) {
      setSettings({
        name: barberData.name || "",
        phone: barberData.phone || "",
        startWork: barberData.startWork || "08:00",
        endWork: barberData.endWork || "18:00",
      });
    }
  }, [barberData]);

  const handleSave = async () => {
    setMessage(null);

    try {
      // Validação básica
      if (!settings.name.trim()) {
        setMessage({
          type: "error",
          text: "O nome é obrigatório.",
        });
        return;
      }

      // Validação de horários
      if (
        settings.startWork &&
        settings.endWork &&
        settings.startWork >= settings.endWork
      ) {
        setMessage({
          type: "error",
          text: "O horário de início deve ser anterior ao horário de término.",
        });
        return;
      }

      await saveBarberSettings(settings);

      setMessage({
        type: "success",
        text: "Configurações salvas com sucesso!",
      });
    } catch {
      setMessage({
        type: "error",
        text: "Erro ao salvar configurações.",
      });
    }
  };

  const handleInputChange =
    (field: keyof Omit<Barber, "id">) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setSettings((prev) => ({
        ...prev,
        [field]: event.target.value,
      }));
      // Limpar mensagem quando o usuário começar a editar
      if (message) {
        setMessage(null);
      }
    };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="400px"
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Breadcrumbs />

      <Typography variant="h4" component="h1" gutterBottom>
        Configurações
      </Typography>

      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Informações do Estabelecimento
          </Typography>

          {message && (
            <Alert
              severity={message.type}
              sx={{ mb: 3 }}
              onClose={() => setMessage(null)}
            >
              {message.text}
            </Alert>
          )}

          <Stack spacing={3}>
            <Box
              display="flex"
              gap={2}
              flexDirection={{ xs: "column", md: "row" }}
            >
              <TextField
                fullWidth
                label="Nome do Estabelecimento"
                value={settings.name}
                onChange={handleInputChange("name")}
                required
                variant="outlined"
                placeholder="Ex: Barbearia do João"
                helperText="Nome que aparecerá nos agendamentos e relatórios"
              />

              <TextField
                fullWidth
                label="Telefone"
                value={settings.phone}
                onChange={handleInputChange("phone")}
                variant="outlined"
                placeholder="Ex: (11) 99999-9999"
                type="tel"
                helperText="Telefone de contato do estabelecimento"
              />
            </Box>

            <Box
              display="flex"
              gap={2}
              flexDirection={{ xs: "column", md: "row" }}
            >
              <TextField
                fullWidth
                label="Horário de Início"
                value={settings.startWork}
                onChange={handleInputChange("startWork")}
                variant="outlined"
                type="time"
                InputLabelProps={{ shrink: true }}
                helperText="Horário de abertura do estabelecimento"
              />

              <TextField
                fullWidth
                label="Horário de Término"
                value={settings.endWork}
                onChange={handleInputChange("endWork")}
                variant="outlined"
                type="time"
                InputLabelProps={{ shrink: true }}
                helperText="Horário de fechamento do estabelecimento"
              />
            </Box>

            <Box display="flex" justifyContent="flex-end" mt={2}>
              <Button
                variant="contained"
                onClick={handleSave}
                disabled={saving}
                startIcon={saving ? <CircularProgress size={20} /> : null}
                size="large"
              >
                {saving ? "Salvando..." : "Salvar Configurações"}
              </Button>
            </Box>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}
