"use client";

import { useEffect } from "react";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import app from "@/lib/firebase";

export default function Home() {
  useEffect(() => {
    console.log("Firebase App initialized:", app.name);
  }, []);

  return (
    <main style={{ padding: "20px" }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Bem-vindo ao Barber App!
      </Typography>
      <Button variant="contained" color="primary">
        Botão de Teste Material UI
      </Button>
      <Typography variant="body2" sx={{ mt: 2 }}>
        Verifique o console do navegador para a inicialização do Firebase.
      </Typography>
    </main>
  );
}
