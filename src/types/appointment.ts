export interface Appointment {
  id?: string;
  clientName: string;
  clientPhone?: string;
  scheduledTime: Date;
  serviceType: "Cabelo" | "Cabelo e Barba";
  clientPlan: "Básico" | "Premium" | "VIP";
  status: "Agendado" | "Confirmado" | "Concluído" | "Cancelado";
  barberId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateAppointmentData {
  clientName: string;
  clientPhone?: string;
  scheduledTime: Date;
  serviceType: "Cabelo" | "Cabelo e Barba";
  clientPlan?: "Básico" | "Premium" | "VIP";
  status: "Agendado" | "Confirmado" | "Concluído" | "Cancelado";
}
