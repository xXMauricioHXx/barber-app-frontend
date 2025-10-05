"use client";

import { Box, Typography } from "@mui/material";

export default function SettingsPage() {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Configurações
      </Typography>
      <Typography variant="body1" color="text.secondary">
        Aqui serão exibidas as configurações do sistema.
      </Typography>
    </Box>
  );
}
