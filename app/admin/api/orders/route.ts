// app/admin/api/orders/route.ts
import { connectToDatabase } from "@/app/lib/mongodb";
import { NextResponse } from "next/server";

// NOTE: Add strong authentication (e.g., NextAuth.js) here in a real application!
export async function GET() {
  const { db } = await connectToDatabase();

  try {
    const orders = await db
      .collection("orders")
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    // JSON-এর জন্য ObjectId কে string-এ রূপান্তর করে safe ডেটা তৈরি করুন
    const safeOrders = orders.map((order) => ({
      id: order._id.toHexString(),
      regNo: order.registrationNumber,
      total: (order.totalAmount / 100).toFixed(2), // Cents to currency
      status: order.orderStatus,
      dates: order.selectedDates,
      email: order.customerEmail,
      createdAt: order.createdAt,
    }));

    return NextResponse.json(safeOrders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    return new NextResponse("Failed to fetch orders", { status: 500 });
  }
}
