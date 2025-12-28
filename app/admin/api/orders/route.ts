import { NextResponse } from "next/server";
import { connectToDatabase } from "@/app/lib/mongodb";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { db } = await connectToDatabase();

    // Fetch orders, newest first
    const orders = await db
      .collection("orders")
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    // Transform _id to string if needed, or just return as is
    const formattedOrders = orders.map(order => ({
      id: order._id.toString(),
      regNo: order.regNo || "N/A",
      total: order.total || "0.00",
      status: order.status || "PENDING",
      dates: order.dates || [],
      email: order.email || "",
      createdAt: order.createdAt || new Date().toISOString(),
    }));

    return NextResponse.json(formattedOrders);
  } catch (error) {
    console.error("Failed to fetch orders:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}
