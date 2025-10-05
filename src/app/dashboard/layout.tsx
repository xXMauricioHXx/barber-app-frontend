"use client";

import { useState, useEffect } from "react";
import { Box, CssBaseline, useMediaQuery, useTheme } from "@mui/material";
import AuthGuard from "@/components/AuthGuard";
import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";
import { AppointmentProvider } from "@/context/AppointmentContext";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);

  useEffect(() => {
    setSidebarOpen(!isMobile);
  }, [isMobile]);

  const handleSidebarToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleSidebarClose = () => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  return (
    <AuthGuard>
      <AppointmentProvider>
        <Box sx={{ display: "flex" }}>
          <CssBaseline />

          <Navbar onMenuClick={handleSidebarToggle} />

          <Sidebar
            open={sidebarOpen}
            onClose={handleSidebarClose}
            variant={isMobile ? "temporary" : "persistent"}
            isMobile={isMobile}
          />

          <Box
            component="main"
            sx={{
              flexGrow: 1,
              p: 3,
              mt: 8,
              minHeight: "100vh",
              backgroundColor: (theme) => theme.palette.grey[50],
              transition: (theme) =>
                theme.transitions.create(["margin"], {
                  easing: theme.transitions.easing.easeOut,
                  duration: theme.transitions.duration.enteringScreen,
                }),
            }}
          >
            {children}
          </Box>
        </Box>
      </AppointmentProvider>
    </AuthGuard>
  );
}
