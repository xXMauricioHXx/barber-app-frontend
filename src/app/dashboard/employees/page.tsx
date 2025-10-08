"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  CircularProgress,
  Alert,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Card,
  CardContent,
  Avatar,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import {
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Person as PersonIcon,
} from "@mui/icons-material";
import { useRouter } from "next/navigation";
import { Employee } from "@/types/employee";
import { employeeService } from "@/services/employeesService";
import { useAuth } from "@/context/AuthContext";
import { Breadcrumbs } from "@/components";

export default function EmployeesPage() {
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(
    null
  );
  const { user } = useAuth();

  const loadEmployees = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const employeesList = await employeeService.getEmployees(user?.uid || "");
      setEmployees(employeesList);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erro ao carregar funcionários"
      );
    } finally {
      setLoading(false);
    }
  }, [user?.uid]);

  useEffect(() => {
    if (user?.uid) {
      loadEmployees();
    }
  }, [user?.uid, loadEmployees]);

  const handleNewEmployee = () => {
    router.push("/dashboard/employees/new");
  };

  const handleMenuOpen = (
    event: React.MouseEvent<HTMLElement>,
    employee: Employee
  ) => {
    setAnchorEl(event.currentTarget);
    setSelectedEmployee(employee);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedEmployee(null);
  };

  const handleEditEmployee = () => {
    if (selectedEmployee) {
      router.push(`/dashboard/employees/${selectedEmployee.id}/edit`);
    }
    handleMenuClose();
  };

  const handleDeleteEmployee = async () => {
    if (selectedEmployee && selectedEmployee.id) {
      try {
        await employeeService.deleteEmployee(
          user?.uid || "",
          selectedEmployee.id
        );
        await loadEmployees(); // Recarrega a lista
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Erro ao deletar funcionário"
        );
      }
    }
    handleMenuClose();
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const renderMobileEmployeeCard = (employee: Employee) => (
    <Card key={employee.id} sx={{ mb: 2 }}>
      <CardContent>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            mb: 2,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Avatar sx={{ bgcolor: "primary.main" }}>
              {employee.name.charAt(0).toUpperCase()}
            </Avatar>
            <Box>
              <Typography variant="h6" component="div">
                {employee.name}
              </Typography>
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 1, mt: 0.5 }}
              >
                <PersonIcon fontSize="small" color="action" />
                <Typography variant="body2" color="text.secondary">
                  Funcionário
                </Typography>
              </Box>
            </Box>
          </Box>
          <IconButton
            size="small"
            onClick={(e) => handleMenuOpen(e, employee)}
            aria-label={`Ações para ${employee.name}`}
          >
            <MoreVertIcon />
          </IconButton>
        </Box>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Cadastrado em: {formatDate(employee.createdAt)}
          </Typography>
          {employee.updatedAt.getTime() !== employee.createdAt.getTime() && (
            <Typography variant="body2" color="text.secondary">
              Atualizado em: {formatDate(employee.updatedAt)}
            </Typography>
          )}
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Box>
      <Breadcrumbs />

      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
          flexDirection: isMobile ? "column" : "row",
          gap: isMobile ? 2 : 0,
        }}
      >
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleNewEmployee}
          fullWidth={isMobile}
        >
          Novo Funcionário
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box
          sx={{ display: "flex", justifyContent: "center", p: 4 }}
          role="status"
          aria-label="Carregando funcionários"
        >
          <CircularProgress />
        </Box>
      ) : employees.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: "center" }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Nenhum funcionário cadastrado
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Comece adicionando o primeiro funcionário da sua barbearia.
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleNewEmployee}
            fullWidth={isMobile}
          >
            Cadastrar Primeiro Funcionário
          </Button>
        </Paper>
      ) : isMobile ? (
        <Box>{employees.map(renderMobileEmployeeCard)}</Box>
      ) : (
        <TableContainer component={Paper}>
          <Table aria-label="Tabela de funcionários">
            <TableHead>
              <TableRow>
                <TableCell>Nome</TableCell>
                <TableCell>Data Cadastro</TableCell>
                <TableCell>Última Atualização</TableCell>
                <TableCell align="right">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {employees.map((employee) => (
                <TableRow key={employee.id} hover>
                  <TableCell>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <Avatar
                        sx={{ bgcolor: "primary.main", width: 32, height: 32 }}
                      >
                        {employee.name.charAt(0).toUpperCase()}
                      </Avatar>
                      <Typography variant="body2" fontWeight="medium">
                        {employee.name}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {formatDate(employee.createdAt)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {formatDate(employee.updatedAt)}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      onClick={(e) => handleMenuOpen(e, employee)}
                      aria-label={`Ações para ${employee.name}`}
                    >
                      <MoreVertIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
      >
        <MenuItem onClick={handleEditEmployee}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Editar</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleDeleteEmployee}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Excluir</ListItemText>
        </MenuItem>
      </Menu>
    </Box>
  );
}
