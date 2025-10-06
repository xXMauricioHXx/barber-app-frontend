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
  Chip,
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Snackbar,
} from "@mui/material";
import {
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Phone as PhoneIcon,
  Link as LinkIcon,
} from "@mui/icons-material";
import { useRouter } from "next/navigation";
import { Client } from "@/types/client";
import { clientService } from "@/services/clientService";
import { useAuth } from "@/context/AuthContext";

export default function ClientsPage() {
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [generatedLink, setGeneratedLink] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const { user } = useAuth();

  const loadClients = useCallback(async () => {
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
  }, [user?.uid]);

  useEffect(() => {
    if (user?.uid) {
      loadClients();
    }
  }, [user?.uid, loadClients]);

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

  const handleGenerateLink = () => {
    if (selectedClient && selectedClient.id) {
      const baseUrl = window.location.origin;
      const link = `${baseUrl}/appointments/${selectedClient.id}-${user?.uid}`;
      setGeneratedLink(link);
      setLinkDialogOpen(true);
    }
    handleMenuClose();
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(generatedLink);
      setSnackbarMessage("Link copiado para a área de transferência!");
      setSnackbarOpen(true);
    } catch (err) {
      setSnackbarMessage("Erro ao copiar link");
      setSnackbarOpen(true);
    }
  };

  const handleCloseLinkDialog = () => {
    setLinkDialogOpen(false);
    setGeneratedLink("");
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
    setSnackbarMessage("");
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

  const renderMobileClientCard = (client: Client) => (
    <Card key={client.id} sx={{ mb: 2 }}>
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
              {client.name.charAt(0).toUpperCase()}
            </Avatar>
            <Box>
              <Typography variant="h6" component="div">
                {client.name}
              </Typography>
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 1, mt: 0.5 }}
              >
                <PhoneIcon fontSize="small" color="action" />
                <Typography variant="body2" color="text.secondary">
                  {client.phone}
                </Typography>
              </Box>
            </Box>
          </Box>
          <IconButton size="small" onClick={(e) => handleMenuOpen(e, client)}>
            <MoreVertIcon />
          </IconButton>
        </Box>

        <Box sx={{ display: "flex", gap: 1, mb: 2, flexWrap: "wrap" }}>
          <Chip
            label={client.plan}
            color={getPlanColor(client.plan)}
            size="small"
          />
          <Chip
            label={client.paymentStatus}
            color={getPaymentStatusColor(client.paymentStatus)}
            size="small"
          />
        </Box>

        <Typography variant="body2" color="text.secondary">
          Cadastrado em: {formatDate(client.createdAt)}
        </Typography>
      </CardContent>
    </Card>
  );

  return (
    <Box>
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
        <Typography variant={isMobile ? "h5" : "h4"} component="h1">
          Clientes
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleNewClient}
          fullWidth={isMobile}
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
            fullWidth={isMobile}
          >
            Cadastrar Primeiro Cliente
          </Button>
        </Paper>
      ) : isMobile ? (
        <Box>{clients.map(renderMobileClientCard)}</Box>
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
        <MenuItem onClick={handleGenerateLink}>
          <ListItemIcon>
            <LinkIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Gerar Link de Agendamento</ListItemText>
        </MenuItem>
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

      {/* Dialog para exibir link de agendamento */}
      <Dialog
        open={linkDialogOpen}
        onClose={handleCloseLinkDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Link de Agendamento Gerado</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Compartilhe este link com o cliente{" "}
            <strong>{selectedClient?.name}</strong> para que ele possa fazer o
            agendamento:
          </Typography>
          <TextField
            fullWidth
            value={generatedLink}
            InputProps={{
              readOnly: true,
            }}
            onClick={(e) => (e.target as HTMLInputElement).select()}
            sx={{ mb: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseLinkDialog}>Fechar</Button>
          <Button variant="contained" onClick={handleCopyLink}>
            Copiar Link
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar para feedback */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        message={snackbarMessage}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      />
    </Box>
  );
}
