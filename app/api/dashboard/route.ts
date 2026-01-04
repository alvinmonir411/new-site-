import { NextResponse } from "next/server";
import clientPromise from "../../lib/mongodb";

export async function GET() {
    try {
        const client = await clientPromise;
        const db = client.db("MONGODB_DB");

        // Sort by createdAt descending (newest first)
        const payments = await db
            .collection("payments")
            .find({})
            .sort({ createdAt: -1 })
            .toArray();

        return NextResponse.json({ success: true, data: payments });
    } catch (error) {
        console.error("Dashboard API Error:", error);
        return NextResponse.json(
            { success: false, error: "Failed to fetch dashboard data" },
            { status: 500 }
        );
    }
}
