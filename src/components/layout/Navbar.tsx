"use client";

import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Button,
  Box,
} from "@mui/material";
import { Menu as MenuIcon } from "@mui/icons-material";
import { useAuth } from "@/context/AuthContext";
import { signOut } from "@/lib/auth";
import { useRouter } from "next/navigation";

interface NavbarProps {
  onMenuClick: () => void;
}

export default function Navbar({ onMenuClick }: NavbarProps) {
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
    <AppBar
      position="fixed"
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1,
        backgroundColor: (theme) => theme.palette.primary.main,
      }}
    >
      <Toolbar>
        <IconButton
          color="inherit"
          aria-label="open drawer"
          onClick={onMenuClick}
          edge="start"
          sx={{ mr: 2 }}
        >
          <MenuIcon />
        </IconButton>

        {/* título: fontSize responsivo */}
        <Typography
          variant="h6"
          component="div"
          sx={{
            flexGrow: 1,
            fontSize: { xs: "1rem", sm: "1.125rem", md: "1.25rem" }, // ajusta conforme a largura
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
          title="BarberApp - Dashboard"
        >
          BarberApp
        </Typography>

        {/* Box para alinhar email + botão; email some em telas xs */}
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
              // esconde em telas muito pequenas
              display: { xs: "none", sm: "block" },
              // truncamento para não estourar a barra
              maxWidth: { sm: "120px", md: "220px", lg: "300px" },
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
            title={user?.email || ""}
          >
            {user?.email}
          </Typography>

          <Button color="inherit" onClick={handleLogout}>
            Sair
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
