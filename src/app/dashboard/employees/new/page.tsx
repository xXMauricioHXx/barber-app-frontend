"use client";

import { useState } from "react";
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
} from "@mui/material";
import {
  Save as SaveIcon,
  ArrowBack as ArrowBackIcon,
} from "@mui/icons-material";
import { useRouter } from "next/navigation";
import { employeeService } from "@/services/employeesService";
import { useAuth } from "@/context/AuthContext";
import { Breadcrumbs } from "@/components";

export default function NewEmployeePage() {
  const router = useRouter();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!formData.name.trim()) {
      setError("Nome é obrigatório");
      return;
    }

    try {
      setLoading(true);
      setError("");

      await employeeService.createEmployee(user?.uid || "", {
        name: formData.name.trim(),
      });

      router.push("/dashboard/employees");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erro ao criar funcionário"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    router.push("/dashboard/employees");
  };

  return (
    <Box>
      <Breadcrumbs />

      <Paper sx={{ p: 3, maxWidth: 600 }}>
        <Typography variant="h5" component="h1" gutterBottom>
          Novo Funcionário
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
          <TextField
            fullWidth
            label="Nome"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
            disabled={loading}
            sx={{ mb: 3 }}
            inputProps={{
              "aria-describedby": "name-helper",
            }}
            helperText="Nome completo do funcionário"
          />

          <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end" }}>
            <Button
              variant="outlined"
              onClick={handleCancel}
              disabled={loading}
              startIcon={<ArrowBackIcon />}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={loading || !formData.name.trim()}
              startIcon={
                loading ? <CircularProgress size={16} /> : <SaveIcon />
              }
            >
              {loading ? "Salvando..." : "Salvar"}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}
