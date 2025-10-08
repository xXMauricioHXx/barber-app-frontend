"use client";

import { Box, Typography } from "@mui/material";
import { Breadcrumbs } from "@/components";

export default function SettingsPage() {
  return (
    <Box>
      <Breadcrumbs />
      <Typography variant="body1" color="text.secondary">
        Aqui serão exibidas as configurações do sistema.
      </Typography>
    </Box>
  );
}
