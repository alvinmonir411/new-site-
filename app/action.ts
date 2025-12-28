"use server";

import { redirect } from "next/navigation";
import { stripe } from "./lib/stripe";

export async function createCheckoutSession(formData: FormData) {
  const data = Object.fromEntries(formData);

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "gbp", // ✅ Changed to GBP (British Pound)
          product_data: {
            name: `Vehicle Compliance Check - ${data.cleanAirZone || "Zone"}`,
            description: `${data.registrationNumber || "Vehicle"}`,
          },
          unit_amount: 1400, // ✅ £14.00 = 1400 pence (cents)
        },
        quantity: 1,
      },
    ],
    mode: "payment",
    success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/?canceled=true`,
    customer_email: data.email as string,
    metadata: {
      registrationNumber: data.registrationNumber as string,
      cleanAirZone: data.cleanAirZone as string,
    },
  });

  if (!session.url) {
    throw new Error("Failed to create checkout session");
  }

  return { url: session.url };
}
