import "server-only";
import { PlanNames } from "@/hooks/usePlans";
import Stripe from "stripe";

export const stripe = new Stripe(
  process.env.NEXT_PUBLIC_STRIPE_SECRET_KEY || "",
  {
    httpClient: Stripe.createFetchHttpClient(),
  }
);

export const stripeService = {
  createCustomer: async (email: string, name: string) => {
    const customer = await stripeService.getCustomerByEmail(email);

    if (customer) {
      return customer;
    }

    return await stripe.customers.create({
      email,
      name,
    });
  },

  getCustomerByEmail: async (email: string) => {
    console.log("Fetching customer by email:", email);
    const customers = await stripe.customers.list({
      email,
      limit: 1,
    });

    return customers.data.length > 0 ? customers.data[0] : null;
  },

  generateCheckoutSession: async (
    internalClientId: string,
    email: string,
    selectedPlan: PlanNames,
    barberId: string
  ) => {
    let priceId = "";
    if (selectedPlan === PlanNames.BASIC) {
      priceId = process.env.NEXT_PUBLIC_PRODUCT_PRICE_BASIC_ID || "";
    } else if (selectedPlan === PlanNames.PREMIUM) {
      priceId = process.env.NEXT_PUBLIC_PRODUCT_PRICE_PREMIUM_ID || "";
    } else if (selectedPlan === PlanNames.PREMIUM_PLUS) {
      priceId = process.env.NEXT_PUBLIC_PRODUCT_PRICE_PREMIUM_PLUS_ID || "";
    }

    const customer = await stripeService.getCustomerByEmail(email);
    return await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "subscription",
      customer: customer ? customer.id : undefined,
      metadata: {
        internalClientId,
        barberId,
      },
      client_reference_id: internalClientId,
      success_url:
        "https://barberapp.com/success?session_id={CHECKOUT_SESSION_ID}",
      cancel_url: "https://barberapp.com/cancel",
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
    });
  },
};
