export type PlansItem = {
  name: string;
  price: number;
  duration: string;
};

export enum PlanNames {
  BASIC = "Básico",
  PREMIUM = "Premium",
  PREMIUM_PLUS = "Premium+",
  NOT_SELECTED = "Não Selecionado",
}

export enum PaymentStatus {
  PAID = "Pago",
  LATE = "Em Atraso",
}

function usePlans() {
  const plans = [
    { name: PlanNames.BASIC, price: 50, duration: "Mensal" },
    { name: PlanNames.PREMIUM, price: 90, duration: "Mensal" },
    { name: PlanNames.PREMIUM_PLUS, price: 150, duration: "Mensal" },
  ];

  const paymentStatuses = [PaymentStatus.PAID, PaymentStatus.LATE];

  const getPlanColor = (plan: string): string => {
    switch (plan) {
      case PlanNames.BASIC:
        return "red";
      case PlanNames.PREMIUM:
        return "red";
      case PlanNames.PREMIUM_PLUS:
        return "red";
      default:
        return "red";
    }
  };

  const getPlanStyle = (plan?: string) => {
    switch (plan) {
      case PlanNames.BASIC:
        return { backgroundColor: "#01BAD1", color: "#fff" };
      case PlanNames.PREMIUM:
        return { backgroundColor: "#FF9F43", color: "#fff" };
      case PlanNames.PREMIUM_PLUS:
        return { backgroundColor: "#7367F0", color: "#fff" };
      default:
        return { backgroundColor: "#01BAD1", color: "#fff" };
    }
  };

  const getPaymentStatusColor = (
    status: PaymentStatus
  ): "success" | "error" => {
    return status === PaymentStatus.PAID ? "success" : "error";
  };

  const defaultPlan = plans[0];
  const defaultPlanStatus = PaymentStatus.PAID;

  return {
    plans,
    getPlanColor,
    getPaymentStatusColor,
    defaultPlan,
    defaultPlanStatus,
    getPlanStyle,
    paymentStatuses,
  };
}

export default usePlans;
