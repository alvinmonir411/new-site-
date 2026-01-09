import Stripe from "stripe";
import { NextResponse } from "next/server";
import clientPromise from "@/app/lib/mongodb";
import { ObjectId } from "mongodb";
import { stripe } from "@/app/lib/stripe";

export async function POST(req: Request) {
  // 1. রিকোয়েস্ট বডিকে বাফার হিসেবে পান
  const buffer = await req.arrayBuffer();
  // 2. বাফারকে কাঁচা স্ট্রিং-এ রূপান্তর করুন
  const body = Buffer.from(buffer).toString();

  // 3. সিগনেচার হেডার্স পান
  const sig = req.headers.get("stripe-signature");

  if (!sig) {
    console.error("❌ Missing Stripe signature");
    return NextResponse.json(
      { error: "Missing stripe signature" },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  // 4. সিগনেচার যাচাই (সঠিক body এবং sig ব্যবহার করে)
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("❌ Webhook signature error:", err);
    return NextResponse.json({ error: "Webhook error" }, { status: 400 });
  }

  //... (DB আপডেটের বাকি লজিক অপরিবর্তিত থাকবে)

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    console.log("✅ Webhook received: checkout.session.completed");

    const paymentId = session.metadata?.paymentId;

    if (!paymentId) {
      console.error("❌ paymentId missing in metadata (Critical Error)");
      return NextResponse.json({ received: true }, { status: 200 });
    }

    try {
      const client = await clientPromise;
      const db = client.db(process.env.MONGODB_DB);

      const result = await db.collection("payments").updateOne(
        { _id: new ObjectId(paymentId) },
        {
          $set: {
            status: "paid",
            paidAt: new Date(),
            stripeSessionId: session.id,
          },
        }
      );

      console.log("🟢 DB update result:", result);
    } catch (dbError) {
      console.error(`❌ MongoDB update error for ID ${paymentId}:`, dbError);
      return NextResponse.json({ received: true }, { status: 200 });
    }
  }

  return NextResponse.json({ received: true }, { status: 200 });
}
