"use client";

import { Box, CssBaseline } from "@mui/material";
import { ClientAuthProvider } from "@/context/ClientAuthContext";
import ClientAuthGuard from "@/components/ClientAuthGuard";
import { ClientNavbar } from "@/components";

interface ClientLayoutProps {
  children: React.ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  return (
    <ClientAuthProvider>
      <ClientAuthGuard>
        <Box sx={{ display: "flex", flexDirection: "column" }}>
          <CssBaseline />

          <ClientNavbar />

          <Box
            component="main"
            sx={{
              flexGrow: 1,
              p: { xs: 2, sm: 3 },
              mt: 8,
              minHeight: "100vh",
              backgroundColor: (theme) => theme.palette.grey[50],
            }}
          >
            {children}
          </Box>
        </Box>
      </ClientAuthGuard>
    </ClientAuthProvider>
  );
}
