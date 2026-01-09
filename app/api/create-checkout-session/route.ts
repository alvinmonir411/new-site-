"use server";
import { stripe } from "@/app/lib/stripe";
import clientPromise from "@/app/lib/mongodb";
import { ObjectId } from "mongodb";

// Price is now dynamic, fetched from DB
const DEFAULT_PRICE = 1400;


export async function POST(req: Request) {
  const body = await req.json();
  const selectedDates: string[] = body.selectedDates;

  if (!selectedDates || selectedDates.length === 0) {
    return new Response(JSON.stringify({ error: "No dates selected" }), {
      status: 400,
    });
  }


  // Fetch dynamic price from DB
  let pricePerDay = DEFAULT_PRICE;
  try {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
    const settings = await db.collection("settings").findOne({ _id: "pricing" as any });
    console.log("DEBUG: Fetched settings from DB:", settings);
    if (settings && settings.amount) {
      pricePerDay = settings.amount;
    }
  } catch (error) {
    console.error("Error fetching dynamic price, using default:", error);
  }
  console.log("DEBUG: Using pricePerDay:", pricePerDay);


  const totalAmountGBP = selectedDates.length * pricePerDay;


  // 1️⃣ Save payment as pending in MongoDB
  const client = await clientPromise;
  const db = client.db(process.env.MONGODB_DB);

  const paymentDoc = {
    registrationNumber: body.registrationNumber,
    registrationLocation: body.registrationLocation,
    vehicleType: body.vehicleType,
    cleanAirZone: body.cleanAirZone,
    selectedDates,
    email: body.email,
    totalAmount: totalAmountGBP,
    currency: "GBP",
    status: "pending",
    createdAt: new Date(),
  };

  const result = await db.collection("payments").insertOne(paymentDoc);
  console.log(result);
  // 2️⃣ Create Stripe Checkout Session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "payment",
    line_items: [
      {
        price_data: {
          currency: "gbp",
          product_data: {
            name: `Clean Air Zone Charge - ${body.cleanAirZone}`,
            description: `Dates: ${selectedDates.join(", ")}`,
          },
          unit_amount: totalAmountGBP,
        },
        quantity: selectedDates.length,
      },
    ],
    customer_email: body.email,
    metadata: { paymentId: result.insertedId.toString() },
    success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/?canceled=true`,
  });

  // 3️⃣ Update DB with Stripe Session ID
  await db
    .collection("payments")
    .updateOne(
      { _id: result.insertedId },
      { $set: { stripeSessionId: session.id } }
    );

  return new Response(JSON.stringify({ url: session.url }), { status: 200 });
}
