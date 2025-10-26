"use client";

import {
  Container,
  Paper,
  Typography,
  Box,
  Tabs,
  Tab,
  Snackbar,
  Alert,
  CircularProgress,
} from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { ptBR } from "date-fns/locale";
import { useClientAuth } from "@/context/ClientAuthContext";
import { useEffect, useMemo, useState, useCallback } from "react";
import { startOfDay, addDays } from "date-fns";
import { barberService } from "@/services/barberService";
import { employeeService } from "@/services/employeesService";
import { Barber } from "@/types/barbers";
import { Employee } from "@/types/employee";
import { ServiceType } from "@/types/serviceType";
import { PlanNames } from "@/hooks/usePlans";
import { useClientAppointments } from "@/hooks/useClientAppointments";
import { useAppointmentBooking } from "@/hooks/useAppointmentBooking";
import { useAvailableTimeSlots } from "@/hooks/useAvailableTimeSlots";
import { useAppointmentCancel } from "@/hooks/useAppointmentCancel";
import { filterAndSortAppointments } from "@/utils/appointmentHelpers";
import { ClientInfoCard } from "@/components/client/ClientInfoCard";
import { AppointmentForm } from "@/components/client/AppointmentForm";
import { AppointmentList } from "@/components/client/AppointmentList";
import { AppointmentFilters } from "@/components/client/AppointmentFilters";
import { CancelAppointmentDialog } from "@/components/client/CancelAppointmentDialog";
import { BarberSelectionList } from "@/components/client/BarberSelectionList";

/**
 * Dashboard principal do cliente
 * Orquestra componentes e hooks para funcionalidade de agendamento
 */
export default function ClientDashboard() {
  const { clientData } = useClientAuth();
  const [activeTab, setActiveTab] = useState(0);
  const [barber, setBarber] = useState<Barber | null>(null);
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State para filtros de visualização
  const [showAllAppointments, setShowAllAppointments] = useState(true);
  const [viewDate, setViewDate] = useState<Date | null>(null);
  const [includeCancelled, setIncludeCancelled] = useState(false);
  const [today, setToday] = useState<Date>(startOfDay(new Date()));

  // Hooks customizados
  const {
    appointments: clientAppointments,
    loading: loadingAppointments,
    refreshAppointments,
  } = useClientAppointments(clientData?.id);

  const booking = useAppointmentBooking();
  const cancel = useAppointmentCancel();

  // Calcular slots de horário disponíveis
  const availableTimeSlots = useAvailableTimeSlots(
    booking.formData.selectedDate,
    booking.formData.selectedEmployee,
    barber,
    clientAppointments
  );

  // Datas mínima e máxima para seleção
  const maxDate = useMemo(() => addDays(today, 30), [today]);

  // Tipo de serviço baseado no plano do cliente
  const serviceType = useMemo(() => {
    if (!clientData) return null;

    switch (clientData.plan) {
      case PlanNames.BASIC:
        return ServiceType.HAIR;
      case PlanNames.PREMIUM:
        return ServiceType.HAIR_AND_BEARD;
      case PlanNames.PREMIUM_PLUS:
        return ServiceType.HAIR_BEARD_AND_EYEBROWS;
      default:
        return ServiceType.HAIR;
    }
  }, [clientData]);

  // Filtrar e ordenar agendamentos
  const filteredAppointments = useMemo(
    () =>
      filterAndSortAppointments(
        clientAppointments,
        {
          showAll: showAllAppointments,
          filterDate: viewDate,
          includeCancelled,
        },
        today
      ),
    [clientAppointments, showAllAppointments, viewDate, includeCancelled, today]
  );

  // Inicializar 'today' apenas no cliente (evitar hidratação SSR)
  useEffect(() => {
    setToday(startOfDay(new Date()));
  }, []);

  // Carregar dados do barbeiro e funcionários OU listar barbearias
  useEffect(() => {
    const fetchData = async () => {
      if (!clientData) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        // Se cliente tem barbearia selecionada, carrega dados dela
        if (clientData.selectedBarbersId?.[0]) {
          const barberId = clientData.selectedBarbersId[0];
          const [barberData, employeesData] = await Promise.all([
            barberService.getBarber(barberId),
            employeeService.getEmployees(barberId),
          ]);

          if (!barberData) {
            setError("Barbearia não encontrada.");
            return;
          }

          setBarber(barberData);
          setEmployees(employeesData);
        } else {
          // Se não tem barbearia, lista todas disponíveis
          const barbersData = await barberService.getAllBarbers();
          setBarbers(barbersData);
        }
      } catch (err) {
        console.error("Erro ao buscar dados:", err);
        setError("Erro ao carregar dados. Tente novamente.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [clientData]);

  // Handlers
  const handleTabChange = useCallback(
    (_: React.SyntheticEvent, newValue: number) => {
      setActiveTab(newValue);
    },
    []
  );

  const handleSubmitBooking = useCallback(async () => {
    if (!clientData) return;

    const success = await booking.submitBooking(
      clientData,
      employees,
      serviceType
    );

    if (success) {
      await refreshAppointments();
    }
  }, [booking, clientData, employees, serviceType, refreshAppointments]);

  const handleCancelAppointment = useCallback(async () => {
    if (!clientData?.selectedBarbersId?.[0] || !clientData.id) return;

    const success = await cancel.cancelAppointment(
      clientData.selectedBarbersId[0],
      clientData.id
    );

    if (success) {
      await refreshAppointments();
    }
  }, [cancel, clientData, refreshAppointments]);

  // Loading state
  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "50vh",
          }}
        >
          <CircularProgress aria-label="Carregando dashboard" />
        </Box>
      </Container>
    );
  }

  // Error state
  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 3 }} role="alert">
          {error}
        </Alert>
      </Container>
    );
  }

  // Cliente sem estabelecimento selecionado - Mostrar barbearias disponíveis
  if (!clientData?.selectedBarbersId?.length || !clientData.stripeCustomerId) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h3" component="h1" gutterBottom>
            Barbearias Disponíveis
          </Typography>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Bem-vindo, {clientData?.name}! Escolha uma barbearia para assinar um
            plano e começar a agendar.
          </Typography>
          <Alert severity="info" sx={{ mt: 2 }}>
            Você ainda não possui uma assinatura ativa. Selecione uma barbearia
            abaixo para visualizar os planos disponíveis.
          </Alert>
        </Box>

        <BarberSelectionList
          barbers={barbers}
          loading={loading}
          error={error}
        />
      </Container>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Paper sx={{ p: 4 }}>
          <Typography
            variant="h4"
            component="h1"
            gutterBottom
            align="center"
            id="dashboard-title"
          >
            Portal do Cliente
          </Typography>

          {clientData && (
            <ClientInfoCard
              clientData={clientData}
              serviceType={serviceType}
              barberName={barber?.name}
            />
          )}

          <Box
            sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}
            role="navigation"
            aria-label="Navegação principal"
          >
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              aria-label="Abas do dashboard"
            >
              <Tab
                label="Novo Agendamento"
                id="tab-0"
                aria-controls="panel-0"
              />
              <Tab
                label="Meus Agendamentos"
                id="tab-1"
                aria-controls="panel-1"
              />
            </Tabs>
          </Box>

          <Box
            role="tabpanel"
            hidden={activeTab !== 0}
            id="panel-0"
            aria-labelledby="tab-0"
          >
            {activeTab === 0 && (
              <AppointmentForm
                employees={employees}
                selectedEmployee={booking.formData.selectedEmployee}
                selectedDate={booking.formData.selectedDate}
                selectedTime={booking.formData.selectedTime}
                availableTimeSlots={availableTimeSlots}
                minDate={today}
                maxDate={maxDate}
                submitting={booking.submitting}
                disabled={!clientData.stripeCustomerId}
                onEmployeeChange={(id) =>
                  booking.updateFormData({ selectedEmployee: id })
                }
                onDateChange={(date) =>
                  booking.updateFormData({ selectedDate: date })
                }
                onTimeChange={(time) =>
                  booking.updateFormData({ selectedTime: time })
                }
                onSubmit={handleSubmitBooking}
              />
            )}
          </Box>

          <Box
            role="tabpanel"
            hidden={activeTab !== 1}
            id="panel-1"
            aria-labelledby="tab-1"
          >
            {activeTab === 1 && (
              <>
                <AppointmentFilters
                  showAll={showAllAppointments}
                  viewDate={viewDate}
                  includeCancelled={includeCancelled}
                  today={today}
                  totalCount={clientAppointments.length}
                  filteredCount={filteredAppointments.length}
                  onShowAllChange={setShowAllAppointments}
                  onDateChange={setViewDate}
                  onIncludeCancelledChange={setIncludeCancelled}
                />

                <AppointmentList
                  appointments={filteredAppointments}
                  loading={loadingAppointments}
                  today={today}
                  onCancelClick={cancel.openCancelDialog}
                  onShowAll={
                    !showAllAppointments
                      ? () => {
                          setShowAllAppointments(true);
                          setViewDate(null);
                        }
                      : undefined
                  }
                  emptyMessage={
                    clientAppointments.length === 0
                      ? "Nenhum agendamento encontrado"
                      : "Nenhum agendamento para esta data"
                  }
                />
              </>
            )}
          </Box>
        </Paper>

        <CancelAppointmentDialog
          open={cancel.dialogOpen}
          appointment={cancel.selectedAppointment}
          cancelling={cancel.cancelling}
          onClose={cancel.closeCancelDialog}
          onConfirm={handleCancelAppointment}
        />

        <Snackbar
          open={!!booking.error || !!cancel.error}
          autoHideDuration={6000}
          onClose={() => {
            booking.clearMessages();
            cancel.clearMessages();
          }}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
        >
          <Alert
            onClose={() => {
              booking.clearMessages();
              cancel.clearMessages();
            }}
            severity="error"
            role="alert"
          >
            {booking.error || cancel.error}
          </Alert>
        </Snackbar>

        <Snackbar
          open={!!booking.success || !!cancel.success}
          autoHideDuration={4000}
          onClose={() => {
            booking.clearMessages();
            cancel.clearMessages();
          }}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
        >
          <Alert
            onClose={() => {
              booking.clearMessages();
              cancel.clearMessages();
            }}
            severity="success"
            role="status"
          >
            {booking.success || cancel.success}
          </Alert>
        </Snackbar>
      </Container>
    </LocalizationProvider>
  );
}
