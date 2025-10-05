"use client";

import { Box, Typography, Button, Container } from "@mui/material";
import Link from "next/link";
import { Home, ArrowBack } from "@mui/icons-material";

export default function NotFound() {
  return (
    <Container maxWidth="md">
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          textAlign: "center",
          gap: 4,
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
              fontSize: { xs: "6rem", md: "8rem" },
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
              fontSize: { xs: "6rem", md: "8rem" },
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
                fontSize: { xs: "2rem", md: "3rem" },
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
              fontSize: { xs: "6rem", md: "8rem" },
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
              fontSize: { xs: "1.5rem", md: "2rem" },
            }}
          >
            Oops! Página não encontrada
          </Typography>

          <Typography
            variant="h6"
            sx={{
              color: "text.secondary",
              mb: 4,
              fontSize: { xs: "1rem", md: "1.25rem" },
              lineHeight: 1.6,
            }}
          >
            Parece que você tentou acessar uma página que não existe. Que tal
            voltarmos ao seu salão?
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
            href="/"
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
            Ir para o início
          </Button>

          <Button
            onClick={() => window.history.back()}
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
        </Box>

        {/* Decoração adicional */}
        <Box
          sx={{
            position: "absolute",
            top: { xs: 20, md: 40 },
            right: { xs: 20, md: 40 },
            opacity: 0.1,
            fontSize: { xs: "3rem", md: "4rem" },
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
            fontSize: { xs: "2rem", md: "3rem" },
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
