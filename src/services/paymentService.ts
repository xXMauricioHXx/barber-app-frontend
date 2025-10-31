export interface AddPaymentMethodData {
  paymentMethodId: string;
  clientId: string;
}

class PaymentService {
  private baseURL =
    "http://127.0.0.1:5001/barber-app-frontend/us-central1/payments-";

  async addPaymentMethod(data: AddPaymentMethodData): Promise<void> {
    try {
      await fetch(`${this.baseURL}addPaymentMethod`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
    } catch (error) {
      console.error("Error adding payment method:", error);
      throw error;
    }
  }
}

export const paymentService = new PaymentService();
