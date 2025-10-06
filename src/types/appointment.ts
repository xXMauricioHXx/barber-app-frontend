import { Employee } from "./employee";

export interface Appointment {
  id?: string;
  clientName: string;
  clientPhone?: string;
  scheduledTime: Date;
  serviceType: "Cabelo" | "Cabelo e Barba";
  clientPlan: "Básico" | "Premium" | "VIP" | "Gold" | "Platinum";
  status: "Agendado" | "Confirmado" | "Concluído" | "Cancelado";
  barberId: string;
  clientId?: string;
  createdAt: Date;
  updatedAt: Date;
  selectedBarber?: Employee;
}

export interface CreateAppointmentData {
  clientName: string;
  clientPhone?: string;
  scheduledTime: Date;
  serviceType: "Cabelo" | "Cabelo e Barba";
  clientPlan?: "Básico" | "Premium" | "VIP" | "Gold" | "Platinum";
  status: "Agendado" | "Confirmado" | "Concluído" | "Cancelado";
  clientId: string;
  selectedBarber?: Employee;
}
