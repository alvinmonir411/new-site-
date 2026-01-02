import clientPromise from "./mongodb";

const DB_NAME = "MONGODB_DB";
const COLLECTION = "payments";

export async function createPayment(data: {
  registrationNumber: string;
  registrationLocation: string;
  vehicleType: string;
  cleanAirZone: string;
  selectedDates: string[];
  email: string;
  totalAmount: number;
  stripeSessionId: string;
}) {
  const client = await clientPromise;
  const db = client.db(DB_NAME);

  return db.collection(COLLECTION).insertOne({
    ...data,
    paymentStatus: "pending",
    createdAt: new Date(),
    updatedAt: new Date(),
  });
}

export async function markPaymentPaid(sessionId: string) {
  console.log("mark by payment done ");
  const client = await clientPromise;
  const db = client.db(DB_NAME);

  return db.collection(COLLECTION).updateOne(
    { stripeSessionId: sessionId },
    {
      $set: {
        status: "paid",
        updatedAt: new Date(),
      },
    }
  );
}
