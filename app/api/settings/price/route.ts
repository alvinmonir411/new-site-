import { NextResponse } from "next/server";
import clientPromise from "@/app/lib/mongodb";

const DEFAULT_PRICE = 1400; // 14.00 GBP

export async function GET() {
    try {
        const client = await clientPromise;
        const db = client.db(process.env.MONGODB_DB);
        const settings = await db.collection("settings").findOne({ _id: "pricing" as any });

        return NextResponse.json({
            amount: settings?.amount || DEFAULT_PRICE,
            currency: "GBP",
        });
    } catch (error) {
        console.error("Error fetching price:", error);
        return NextResponse.json({ amount: DEFAULT_PRICE, currency: "GBP" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const { amount } = await req.json();

        if (typeof amount !== "number" || amount < 0) {
            return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
        }

        console.log("DEBUG: Updating price to:", amount);
        const client = await clientPromise;
        const db = client.db(process.env.MONGODB_DB);

        const result = await db.collection("settings").updateOne(
            { _id: "pricing" as any },
            { $set: { amount, currency: "GBP", updatedAt: new Date() } },
            { upsert: true }
        );
        console.log("DEBUG: Update result:", result);

        return NextResponse.json({ success: true, amount });
    } catch (error) {
        console.error("Error updating price:", error);
        return NextResponse.json({ error: "Failed to update price" }, { status: 500 });
    }
}
