import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { stripe } from "@/app/lib/stripe";
import { connectToDatabase } from "@/app/lib/mongodb";
import Stripe from "stripe";

export async function POST(req: Request) {
  const body = await req.text();
  const signature = (await headers()).get("Stripe-Signature") as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error: any) {
    console.error("Webhook signature verification failed:", error.message);
    return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 });
  }

  const session = event.data.object as Stripe.Checkout.Session;

  if (event.type === "checkout.session.completed") {
    // 1. Connect to MongoDB
    const { db } = await connectToDatabase();

    // 2. Extract needed data from metadata & session
    const customerEmail = session.customer_details?.email || session.customer_email;
    const amountTotal = (session.amount_total || 0) / 100; // Convert cents to pounds

    const orderData = {
      stripeSessionId: session.id,
      regNo: session.metadata?.registrationNumber,
      cleanAirZone: session.metadata?.cleanAirZone,
      total: amountTotal.toFixed(2),
      status: "PAID",
      email: customerEmail,
      createdAt: new Date().toISOString(),
      currency: session.currency,
      dates: [new Date().toISOString().substring(0, 10)], // Defaulting to today as date isn't in metadata
    };

    console.log("Saving order to DB:", orderData);

    try {
      await db.collection("orders").insertOne(orderData);
      console.log("Order saved successfully.");
    } catch (dbError) {
      console.error("Database insertion failed:", dbError);
      return new NextResponse("Database Error", { status: 500 });
    }
  }

  return new NextResponse(null, { status: 200 });
}
