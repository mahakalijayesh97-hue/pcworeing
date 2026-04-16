import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import clientPromise from "@/lib/mongodb";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    let settings = await prisma.settings.findFirst();
    if (!settings) {
      // For initial creation, we still might hit the issue if we use prisma
      // But let's try to keep GET simple and use native for POST
      return NextResponse.json({
        smsEnabled: false,
        intervals: "[]",
        smsTemplate: "Tamara ##PENDING_AMOUNT## Chintanbhai ne apvana baki che, aje api desho."
      });
    }
    return NextResponse.json(settings);
  } catch (error: any) {
    console.error('Prisma Error:', error);
    return NextResponse.json({ 
      error: "Failed to fetch settings", 
      details: error.message 
    }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log('Incoming POST /api/settings:', body);
    const { smsEnabled, intervals, smsTemplate } = body;

    const client = await clientPromise;
    const db = client.db();

    const result = await db.collection("Settings").updateOne(
      {}, // Empty filter targets the first document
      { 
        $set: { 
          smsEnabled: smsEnabled ?? false,
          intervals: typeof intervals === 'string' ? intervals : JSON.stringify(intervals || []),
          smsTemplate: smsTemplate || "" 
        } 
      },
      { upsert: true }
    );

    return NextResponse.json({ success: true, result });
  } catch (error: any) {
    console.error('Settings Save Error:', error);
    return NextResponse.json({ 
      error: "Failed to save settings", 
      details: error.message 
    }, { status: 500 });
  }
}
