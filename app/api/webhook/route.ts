// app/api/webhook/route.ts
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

import { ObjectId } from "mongodb";
import { connectToDatabase } from "@/app/lib/mongodb";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-12-15.clover" as const,
  typescript: true,
});
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

// Configuration for reading the raw body
export const config = {
  api: {
    bodyParser: false,
  },
};

// Helper function to read the raw body buffer (Fixed to prevent ts(2504) error)
async function buffer(readable: ReadableStream<Uint8Array> | null) {
  const chunks: Buffer[] = [];

  if (readable) {
    for await (const chunk of readable as any) {
      // Type cast to any for async iterator compatibility
      chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
    }
  }
  return Buffer.concat(chunks);
}

export async function POST(req: NextRequest) {
  const rawBody = await buffer(req.body as ReadableStream<Uint8Array>);
  const sig = req.headers.get("stripe-signature");

  if (!sig) {
    return new NextResponse("Missing Stripe signature", { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
  } catch (err: any) {
    console.log(`❌ Webhook Error: ${err.message}`);
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
  }

  await connectToDatabase();
  const { db } = await connectToDatabase();

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const orderDbId = session.metadata?.orderDbId;

    if (!orderDbId) {
      return new NextResponse("Missing orderDbId in metadata", { status: 400 });
    }

    try {
      const newStatus = session.payment_status === "paid" ? "PAID" : "FAILED";

      const updateResult = await db.collection("orders").updateOne(
        { _id: new ObjectId(orderDbId) },
        {
          $set: {
            orderStatus: newStatus,
            stripePaymentId: session.id,
            updatedAt: new Date(),
          },
        }
      );

      if (updateResult.matchedCount === 0) {
        console.error(`Order not found for DB ID: ${orderDbId}`);
      }

      // 📧 Email Sending Logic goes here (e.g., using Resend or Nodemailer)
    } catch (updateError) {
      console.error("Error updating DB:", updateError);
      return new NextResponse("Internal Server Error while updating DB", {
        status: 500,
      });
    }
  }

  return NextResponse.json({ received: true }, { status: 200 });
}
