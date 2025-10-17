import { PlanNames } from "../hooks/usePlans";
import { Appointment } from "./appointment";

export interface Client {
  id?: string;
  name: string;
  nickname?: string;
  birthDate?: Date;
  phone: string;
  email?: string;
  plan?: PlanNames;
  paymentStatus: string;
  planExpiryDate?: Date;
  createdAt: Date;
  updatedAt: Date;
  appointments?: Appointment[];
  stripeCustomerId?: string;
  paymentMethodBrand?: string;
  paymentMethodLast4?: string;
}

export interface CreateClientData {
  name: string;
  nickname?: string;
  birthDate?: Date;
  phone: string;
  email?: string;
  plan?: PlanNames;
  paymentStatus?: string;
  planExpiryDate?: Date;
}

export interface ClientRegistrationData {
  name: string;
  nickname: string;
  birthDate: Date | null;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
}
