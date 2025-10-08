import { PlanNames } from "@/hooks/usePlans";
import { Appointment } from "./appointment";

export interface Client {
  id?: string;
  name: string;
  phone: string;
  plan: PlanNames;
  paymentStatus: string;
  createdAt: Date;
  updatedAt: Date;
  appointments?: Appointment[];
}

export interface CreateClientData {
  name: string;
  phone: string;
  plan: PlanNames;
  paymentStatus: string;
}
