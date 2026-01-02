import Stripe from "stripe";
import clientPromise from "@/app/lib/mongodb";
import { NextResponse } from "next/server";
import { stripe } from "@/app/lib/stripe";
import { ObjectId } from "mongodb";

export async function POST(req: Request) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature")!;
  const secret = process.env.STRIPE_WEBHOOK_SECRET!;

  console.log("sig:", sig);
  console.log("secret:", secret);

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, secret);
  } catch (err) {
    console.log(err);
    return NextResponse.json({ error: "Webhook error" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const paymentId = session?.metadata?.paymentId;
    console.log(paymentId);
    if (!paymentId) {
      console.error("No paymentId in metadata");
      return NextResponse.json({ received: false });
    }
    // Update MongoDB
    const client = await clientPromise;
    const db = client.db("MONGODB_DB");
    await db
      .collection("payments")
      .updateOne(
        { _id: new ObjectId(paymentId) },
        { $set: { status: "paid", paidAt: new Date() } }
      );
  }

  return NextResponse.json({ received: true });
}
