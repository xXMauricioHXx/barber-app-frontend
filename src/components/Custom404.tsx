"use client";

import { Box, Typography, Button, Container } from "@mui/material";
import Link from "next/link";
import { Home, ArrowBack } from "@mui/icons-material";

interface Custom404Props {
  title?: string;
  message?: string;
  showBackButton?: boolean;
  backLink?: string;
  homeLink?: string;
}

export default function Custom404({
  title = "Oops! Página não encontrada",
  message = "Parece que você tentou acessar uma página que não existe. Que tal voltarmos ao seu salão?",
  showBackButton = true,
  backLink,
  homeLink = "/dashboard",
}: Custom404Props) {
  const handleGoBack = () => {
    if (backLink) {
      window.location.href = backLink;
    } else {
      window.history.back();
    }
  };

  return (
    <Container maxWidth="md">
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "60vh",
          textAlign: "center",
          gap: 4,
          py: 4,
        }}
      >
        {/* Número 404 estilizado */}
        <Box
          sx={{
            position: "relative",
            display: "flex",
            alignItems: "center",
            gap: 2,
          }}
        >
          <Typography
            variant="h1"
            sx={{
              fontSize: { xs: "4rem", md: "6rem" },
              fontWeight: "bold",
              color: "primary.main",
              lineHeight: 1,
              textShadow: "0 4px 8px rgba(103, 74, 239, 0.3)",
            }}
          >
            4
          </Typography>

          {/* Ícone de tesoura no meio dos zeros */}
          <Box
            sx={{
              position: "relative",
              fontSize: { xs: "4rem", md: "6rem" },
              fontWeight: "bold",
              color: "primary.main",
              lineHeight: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Typography
              component="span"
              sx={{
                fontSize: "inherit",
                color: "rgba(103, 74, 239, 0.3)",
              }}
            >
              0
            </Typography>
            <Box
              sx={{
                position: "absolute",
                fontSize: { xs: "1.5rem", md: "2rem" },
                color: "primary.main",
                transform: "rotate(45deg)",
              }}
            >
              ✂️
            </Box>
          </Box>

          <Typography
            variant="h1"
            sx={{
              fontSize: { xs: "4rem", md: "6rem" },
              fontWeight: "bold",
              color: "primary.main",
              lineHeight: 1,
              textShadow: "0 4px 8px rgba(103, 74, 239, 0.3)",
            }}
          >
            4
          </Typography>
        </Box>

        {/* Mensagem principal */}
        <Box sx={{ maxWidth: "600px" }}>
          <Typography
            variant="h4"
            component="h1"
            sx={{
              fontWeight: "bold",
              color: "text.primary",
              mb: 2,
              fontSize: { xs: "1.25rem", md: "1.75rem" },
            }}
          >
            {title}
          </Typography>

          <Typography
            variant="h6"
            sx={{
              color: "text.secondary",
              mb: 4,
              fontSize: { xs: "0.875rem", md: "1rem" },
              lineHeight: 1.6,
            }}
          >
            {message}
          </Typography>
        </Box>

        {/* Botões de ação */}
        <Box
          sx={{
            display: "flex",
            gap: 2,
            flexDirection: { xs: "column", sm: "row" },
            width: { xs: "100%", sm: "auto" },
          }}
        >
          <Button
            component={Link}
            href={homeLink}
            variant="contained"
            size="large"
            startIcon={<Home />}
            sx={{
              px: 4,
              py: 1.5,
              borderRadius: 2,
              textTransform: "none",
              fontSize: "1rem",
              fontWeight: "600",
              boxShadow: "0 4px 12px rgba(103, 74, 239, 0.3)",
              "&:hover": {
                boxShadow: "0 6px 16px rgba(103, 74, 239, 0.4)",
                transform: "translateY(-2px)",
              },
              transition: "all 0.3s ease",
            }}
          >
            Ir para o Dashboard
          </Button>

          {showBackButton && (
            <Button
              onClick={handleGoBack}
              variant="outlined"
              size="large"
              startIcon={<ArrowBack />}
              sx={{
                px: 4,
                py: 1.5,
                borderRadius: 2,
                textTransform: "none",
                fontSize: "1rem",
                fontWeight: "600",
                borderColor: "primary.main",
                color: "primary.main",
                "&:hover": {
                  backgroundColor: "primary.main",
                  color: "white",
                  transform: "translateY(-2px)",
                },
                transition: "all 0.3s ease",
              }}
            >
              Voltar
            </Button>
          )}
        </Box>

        {/* Decoração adicional */}
        <Box
          sx={{
            position: "absolute",
            top: { xs: 20, md: 40 },
            right: { xs: 20, md: 40 },
            opacity: 0.1,
            fontSize: { xs: "2rem", md: "3rem" },
            color: "primary.main",
            transform: "rotate(-15deg)",
            zIndex: -1,
          }}
        >
          💈
        </Box>

        <Box
          sx={{
            position: "absolute",
            bottom: { xs: 20, md: 40 },
            left: { xs: 20, md: 40 },
            opacity: 0.1,
            fontSize: { xs: "1.5rem", md: "2rem" },
            color: "primary.main",
            transform: "rotate(15deg)",
            zIndex: -1,
          }}
        >
          ✂️
        </Box>
      </Box>
    </Container>
  );
}
