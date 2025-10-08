"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  Box,
  TextField,
  Button,
  Card,
  CardContent,
  Snackbar,
  Alert,
  CircularProgress,
  Skeleton,
} from "@mui/material";
import { Save as SaveIcon } from "@mui/icons-material";
import { Employee } from "@/types/employee";
import { employeeService } from "@/services/employeesService";
import { useAuth } from "@/context/AuthContext";
import { Custom404, Breadcrumbs } from "@/components";

interface UpdateEmployeeData {
  name: string;
}

export default function EditEmployeePage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();

  const employeeId = params.id as string;

  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [employeeNotFound, setEmployeeNotFound] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });

  const [formData, setFormData] = useState<UpdateEmployeeData>({
    name: "",
  });

  const [errors, setErrors] = useState({
    name: "",
  });

  useEffect(() => {
    const loadEmployee = async () => {
      try {
        setLoading(true);
        const employeeData = await employeeService.getEmployeeById(
          user?.uid || "",
          employeeId
        );

        if (!employeeData) {
          setEmployeeNotFound(true);
          return;
        }

        setEmployee(employeeData);
        setFormData({
          name: employeeData.name,
        });
      } catch (error) {
        setSnackbar({
          open: true,
          message:
            error instanceof Error
              ? error.message
              : "Erro ao carregar funcionário",
          severity: "error",
        });
        router.push("/dashboard/employees");
      } finally {
        setLoading(false);
      }
    };

    if (employeeId && user?.uid) {
      loadEmployee();
    }
  }, [employeeId, user?.uid, router]);

  // Se o funcionário não foi encontrado, mostra a página 404 customizada
  if (employeeNotFound) {
    return (
      <Custom404
        title="Funcionário não encontrado"
        message="O funcionário que você está procurando não existe ou foi removido do sistema. Verifique se o ID está correto ou volte para a lista de funcionários."
        homeLink="/dashboard/employees"
        backLink="/dashboard/employees"
      />
    );
  }

  const validateForm = (): boolean => {
    const newErrors = {
      name: "",
    };

    if (!formData.name.trim()) {
      newErrors.name = "Nome é obrigatório";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Nome deve ter pelo menos 2 caracteres";
    }

    setErrors(newErrors);
    return !newErrors.name;
  };

  const handleInputChange = (
    field: keyof UpdateEmployeeData,
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (errors[field as keyof typeof errors]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setSaving(true);

    try {
      await employeeService.updateEmployee(user?.uid || "", employeeId, {
        name: formData.name.trim(),
      });

      setSnackbar({
        open: true,
        message: "Funcionário atualizado com sucesso!",
        severity: "success",
      });

      setTimeout(() => {
        router.push("/dashboard/employees");
      }, 1000);
    } catch (error) {
      setSnackbar({
        open: true,
        message:
          error instanceof Error
            ? error.message
            : "Erro ao atualizar funcionário",
        severity: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    router.push("/dashboard/employees");
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  return (
    <Box>
      <Breadcrumbs title={loading ? "Carregando..." : `Editar`} />

      <Card sx={{ maxWidth: 600 }}>
        <CardContent sx={{ p: 4 }}>
          {loading ? (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
              <Skeleton variant="rounded" height={56} />
            </Box>
          ) : (
            <>
              <form onSubmit={handleSubmit}>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                  <TextField
                    fullWidth
                    label="Nome do Funcionário"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    error={!!errors.name}
                    helperText={errors.name}
                    required
                    disabled={saving}
                    autoFocus
                    inputProps={{
                      maxLength: 100,
                      "aria-describedby": errors.name
                        ? "name-error"
                        : undefined,
                    }}
                  />

                  <Box
                    sx={{
                      display: "flex",
                      gap: 2,
                      justifyContent: "flex-end",
                      mt: 2,
                    }}
                  >
                    <Button
                      variant="outlined"
                      onClick={handleCancel}
                      disabled={saving}
                    >
                      Cancelar
                    </Button>
                    <Button
                      type="submit"
                      variant="contained"
                      startIcon={
                        saving ? <CircularProgress size={20} /> : <SaveIcon />
                      }
                      disabled={saving}
                    >
                      {saving ? "Salvando..." : "Salvar Alterações"}
                    </Button>
                  </Box>
                </Box>
              </form>
            </>
          )}
        </CardContent>
      </Card>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
