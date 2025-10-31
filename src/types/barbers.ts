export interface Plan {
  type: string;
  price: number;
  duration: string;
  features: string[];
}

export interface Barber {
  id?: string;
  name: string;
  phone?: string;
  startWork?: string;
  endWork?: string;
  address?: string;
  description?: string;
  availablePlans?: Plan[];
}
