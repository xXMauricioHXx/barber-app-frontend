import { NextResponse } from "next/server";
import { stripeService } from "@/server/services/stripe";

export async function POST(req: Request) {
  try {
    const { internalClientId, email, selectedPlan, barberId } =
      await req.json();

    const checkoutSession = await stripeService.generateCheckoutSession(
      internalClientId,
      email,
      selectedPlan,
      barberId
    );

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
