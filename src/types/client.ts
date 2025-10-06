export interface Client {
  id?: string;
  name: string;
  phone: string;
  plan: "Básico" | "Premium" | "VIP" | "Gold" | "Platinum";
  paymentStatus: "Pago" | "Em Atraso";
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateClientData {
  name: string;
  phone: string;
  plan: "Básico" | "Premium" | "VIP" | "Gold" | "Platinum";
  paymentStatus: "Pago" | "Em Atraso";
}
