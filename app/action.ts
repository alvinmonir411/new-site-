"use server";

import clientPromise from "./lib/mongodb";
import { stripe } from "./lib/stripe";

const PRICE_PER_DAY = 1400;

export async function createCheckoutSession(formData: FormData) {
  const data = Object.fromEntries(formData);

  const selectedDates = formData.getAll("selectedDates") as string[];

  if (!selectedDates.length) {
    throw new Error("No dates selected");
  }

  const totalDays = selectedDates.length;
  const totalAmountPounds = totalDays * 1400;

  // 1️⃣ Save payment as PENDING
  const client = await clientPromise;
  const db = client.db("MONGODB_DB");

  const paymentDoc = {
    registrationNumber: data.registrationNumber,
    registrationLocation: data.registrationLocation,
    vehicleType: data.vehicleType,
    cleanAirZone: data.cleanAirZone,
    selectedDates,
    email: data.email,
    totalAmount: totalAmountPounds,
    currency: "GBP",
    status: "pending",
    createdAt: new Date(),
  };

  const result = await db.collection("payments").insertOne(paymentDoc);

  // 2️⃣ Create Stripe Checkout Session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "payment",
    line_items: [
      {
        price_data: {
          currency: "gbp",
          product_data: {
            name: `Clean Air Zone Charge - ${data.cleanAirZone}`,
          },
          unit_amount: totalAmountPounds,
        },
        quantity: 1,
      },
    ],
    customer_email: data.email as string,
    metadata: {
      paymentId: result.insertedId.toString(),
    },
    success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/success?session_id={CHECKOUT_SESSION_ID}`,

    cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/?canceled=true`,
  });

  // 3️⃣ Update DB with Stripe Session ID
  await db.collection("payments").updateOne(
    { _id: result.insertedId },
    {
      $set: {
        stripeSessionId: session.id,
      },
    }
  );

  return { url: session.url };
}
