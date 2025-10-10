import { useMemo } from "react";
import { Client } from "@/types/client";
import { PaymentStatus, PlanNames } from "./usePlans";
import { addMonths, isAfter, isBefore, differenceInDays } from "date-fns";

export interface ClientEligibility {
  canSchedule: boolean;
  isExpired: boolean;
  isPaymentLate: boolean;
  daysUntilExpiry: number;
  reasonsBlocked: string[];
  warningMessage?: string;
}

/**
 * Hook para verificar elegibilidade do cliente para agendamento
 */
export function useClientEligibility(client: Client | null): ClientEligibility {
  return useMemo(() => {
    if (!client) {
      return {
        canSchedule: false,
        isExpired: true,
        isPaymentLate: false,
        daysUntilExpiry: 0,
        reasonsBlocked: ["Cliente não encontrado"],
      };
    }

    const today = new Date();
    const expiryDate = new Date(client.planExpiryDate);
    const isExpired = isBefore(expiryDate, today);
    const isPaymentLate = client.paymentStatus === PaymentStatus.LATE;
    const daysUntilExpiry = differenceInDays(expiryDate, today);

    const reasonsBlocked: string[] = [];
    let warningMessage: string | undefined;

    // Verificar se o plano está vencido
    if (isExpired) {
      reasonsBlocked.push("Plano vencido");
    }

    // Verificar se o pagamento está em atraso
    if (isPaymentLate) {
      reasonsBlocked.push("Pagamento em atraso");
    }

    // Verificar se está próximo do vencimento (7 dias)
    if (!isExpired && daysUntilExpiry <= 7 && daysUntilExpiry > 0) {
      warningMessage = `Seu plano vence em ${daysUntilExpiry} dia(s). Renove para continuar agendando.`;
    }

    const canSchedule = reasonsBlocked.length === 0;

    return {
      canSchedule,
      isExpired,
      isPaymentLate,
      daysUntilExpiry,
      reasonsBlocked,
      warningMessage,
    };
  }, [client]);
}

/**
 * Função utilitária para calcular a data de vencimento baseada no plano
 */
export function calculatePlanExpiryDate(
  plan: PlanNames,
  startDate: Date = new Date()
): Date {
  // Todos os planos atualmente são mensais
  return addMonths(startDate, 1);
}

/**
 * Função para verificar se um cliente está elegível para agendamento
 */
export function isClientEligibleForBooking(client: Client): boolean {
  const today = new Date();
  const expiryDate = new Date(client.planExpiryDate);

  // Verifica se o plano não está vencido
  const isNotExpired = isAfter(expiryDate, today);

  // Verifica se o pagamento não está em atraso
  const isPaymentUpToDate = client.paymentStatus === PaymentStatus.PAID;

  return isNotExpired && isPaymentUpToDate;
}

/**
 * Função para obter o status de vencimento do plano
 */
export function getPlanExpiryStatus(planExpiryDate: Date): {
  status: "active" | "warning" | "expired";
  message: string;
  daysUntilExpiry: number;
} {
  const today = new Date();
  const expiryDate = new Date(planExpiryDate);
  const daysUntilExpiry = differenceInDays(expiryDate, today);

  if (daysUntilExpiry < 0) {
    return {
      status: "expired",
      message: `Plano vencido há ${Math.abs(daysUntilExpiry)} dia(s)`,
      daysUntilExpiry,
    };
  } else if (daysUntilExpiry <= 7) {
    return {
      status: "warning",
      message: `Plano vence em ${daysUntilExpiry} dia(s)`,
      daysUntilExpiry,
    };
  } else {
    return {
      status: "active",
      message: `Plano ativo por mais ${daysUntilExpiry} dia(s)`,
      daysUntilExpiry,
    };
  }
}

export default useClientEligibility;
