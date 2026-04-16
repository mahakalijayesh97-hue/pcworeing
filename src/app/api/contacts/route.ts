import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import clientPromise from "@/lib/mongodb";

export async function GET() {
  try {
    const contacts = await prisma.contact.findMany({
      orderBy: { updatedAt: 'desc' },
    });
    return NextResponse.json(contacts);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch contacts" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log('Incoming POST /api/contacts:', body);
    const { name, phoneNumber, pendingAmount } = body;

    if (!phoneNumber) {
      return NextResponse.json({ error: "Phone number is required" }, { status: 400 });
    }

    const contactName = name || 'Unknown';
    const amount = parseFloat(pendingAmount?.toString() || "0") || 0;

    const client = await clientPromise;
    const db = client.db();

    // Use native driver to bypass transaction requirements (no replica set needed)
    const result = await db.collection("Contact").updateOne(
      { phoneNumber },
      { 
        $set: { 
          name: contactName, 
          pendingAmount: amount,
          updatedAt: new Date()
        },
        $setOnInsert: { 
          createdAt: new Date() 
        }
      },
      { upsert: true }
    );

    return NextResponse.json({ success: true, result });
  } catch (error: any) {
    console.error('Contact Save Error:', error);
    return NextResponse.json({ 
      error: "Failed to save contact", 
      details: error.message 
    }, { status: 500 });
  }
}
