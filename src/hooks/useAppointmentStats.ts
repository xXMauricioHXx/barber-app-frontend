import { useAppointments } from "@/context/AppointmentContext";

/**
 * Hook personalizado para acessar facilmente o total de agendamentos
 * sem a necessidade de chamar a API repetidamente
 */
export const useAppointmentStats = () => {
  const { stats, refreshStats } = useAppointments();

  return {
    /**
     * Total de agendamentos para hoje
     */
    todayTotal: stats.todayTotal,

    /**
     * Total de agendamentos para a semana atual
     */
    weekTotal: stats.weekTotal,

    /**
     * Total de agendamentos para o mês atual
     */
    monthTotal: stats.monthTotal,

    /**
     * Data da última atualização das estatísticas
     */
    lastUpdated: stats.lastUpdated,

    /**
     * Força a atualização das estatísticas
     * @param barberId - ID do barbeiro
     */
    refresh: refreshStats,

    /**
     * Verifica se os dados estão atualizados (menos de 5 minutos)
     */
    isStale: stats.lastUpdated
      ? Date.now() - stats.lastUpdated.getTime() > 5 * 60 * 1000
      : true,
  };
};
