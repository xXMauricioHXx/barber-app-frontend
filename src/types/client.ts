export interface Client {
  id?: string;
  name: string;
  phone: string;
  plan: "Básico" | "Premium" | "VIP";
  paymentStatus: "Pago" | "Em Atraso";
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateClientData {
  name: string;
  phone: string;
  plan: "Básico" | "Premium" | "VIP";
  paymentStatus: "Pago" | "Em Atraso";
}
