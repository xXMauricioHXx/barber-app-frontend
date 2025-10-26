"use client";

import { AppBar, Toolbar, Typography, Button, Box } from "@mui/material";
import { useClientAuth } from "@/context/ClientAuthContext";
import { signOut } from "@/lib/auth";
import { useRouter } from "next/navigation";

export default function ClientNavbar() {
  const { user, clientData } = useClientAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await signOut();
      router.push("/user/login");
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  };

  return (
    <AppBar
      position="fixed"
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1,
        backgroundColor: (theme) => theme.palette.primary.main,
      }}
    >
      <Toolbar>
        <Typography
          variant="h6"
          component="div"
          sx={{
            flexGrow: 1,
            fontSize: { xs: "1rem", sm: "1.125rem", md: "1.25rem" },
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
          title="BarberApp - Cliente"
        >
          BarberApp - Cliente
        </Typography>

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            ml: 1,
          }}
        >
          <Typography
            variant="body2"
            sx={{
              display: { xs: "none", sm: "block" },
              maxWidth: { sm: "120px", md: "220px", lg: "300px" },
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
            title={clientData?.name || user?.email || ""}
          >
            {clientData?.name || user?.email}
          </Typography>

          <Button color="inherit" onClick={handleLogout}>
            Sair
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
