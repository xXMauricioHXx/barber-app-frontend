"use client";

import { useState, useEffect } from "react";
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
  Chip,
  IconButton,
  CircularProgress,
  Alert,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import {
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Phone as PhoneIcon,
} from "@mui/icons-material";
import { useRouter } from "next/navigation";
import { Client } from "@/types/client";
import { clientService } from "@/services/clientService";
import { useAuth } from "@/context/AuthContext";

export default function ClientsPage() {
  const router = useRouter();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      setLoading(true);
      setError("");
      const clientsList = await clientService.getClients(user?.uid || "");
      setClients(clientsList);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erro ao carregar clientes"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleNewClient = () => {
    router.push("/dashboard/clients/new");
  };

  const handleMenuOpen = (
    event: React.MouseEvent<HTMLElement>,
    client: Client
  ) => {
    setAnchorEl(event.currentTarget);
    setSelectedClient(client);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedClient(null);
  };

  const handleEditClient = () => {
    if (selectedClient) {
      router.push(`/dashboard/clients/${selectedClient.id}/edit`);
    }
    handleMenuClose();
  };

  const handleDeleteClient = async () => {
    if (selectedClient && selectedClient.id) {
      try {
        await clientService.deleteClient(user?.uid || "", selectedClient.id);
        await loadClients(); // Recarrega a lista
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Erro ao deletar cliente"
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
    }).format(date);
  };

  const getPaymentStatusColor = (status: string): "success" | "error" => {
    return status === "Pago" ? "success" : "error";
  };

  const getPlanColor = (plan: string): "default" | "primary" | "secondary" => {
    switch (plan) {
      case "Básico":
        return "default";
      case "Premium":
        return "primary";
      case "VIP":
        return "secondary";
      default:
        return "default";
    }
  };

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h4" component="h1">
          Clientes
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleNewClient}
        >
          Novo Cliente
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
          <CircularProgress />
        </Box>
      ) : clients.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: "center" }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Nenhum cliente cadastrado
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Comece adicionando o primeiro cliente da sua barbearia.
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleNewClient}
          >
            Cadastrar Primeiro Cliente
          </Button>
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Nome</TableCell>
                <TableCell>Telefone</TableCell>
                <TableCell>Plano</TableCell>
                <TableCell>Status Pagamento</TableCell>
                <TableCell>Data Cadastro</TableCell>
                <TableCell align="right">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {clients.map((client) => (
                <TableRow key={client.id} hover>
                  <TableCell>
                    <Typography variant="body2" fontWeight="medium">
                      {client.name}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <PhoneIcon fontSize="small" color="action" />
                      <Typography variant="body2">{client.phone}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={client.plan}
                      color={getPlanColor(client.plan)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={client.paymentStatus}
                      color={getPaymentStatusColor(client.paymentStatus)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {formatDate(client.createdAt)}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      onClick={(e) => handleMenuOpen(e, client)}
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
        <MenuItem onClick={handleEditClient}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Editar</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleDeleteClient}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Excluir</ListItemText>
        </MenuItem>
      </Menu>
    </Box>
  );
}
