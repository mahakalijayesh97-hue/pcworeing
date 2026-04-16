import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const revalidate = 0;

// GET Settings
export async function GET() {
  try {
    let settings = await prisma.settings.findFirst();
    if (!settings) {
      return NextResponse.json({
        smsEnabled: false,
        intervals: "[]",
        smsTemplate: "Tamara ##PENDING_AMOUNT## Chintanbhai ne apvana baki che, aje api desho."
      });
    }
    return NextResponse.json(settings);
  } catch (error) {
    console.error("GET settings error:", error);
    return NextResponse.json({
        smsEnabled: false,
        intervals: "[]",
        smsTemplate: "Tamara ##PENDING_AMOUNT## Chintanbhai ne apvana baki che, aje api desho."
    });
  }
}

// POST Settings
export async function POST(request: Request) {
  try {
    // Lazy load Mongo for Vercel build compatibility
    const { default: clientPromise } = await import("@/lib/mongodb");
    
    const body = await request.json();
    console.log('Incoming POST /api/settings:', body);
    const { smsEnabled, intervals, smsTemplate } = body;

    const client = await clientPromise;
    const db = client.db();

    const result = await db.collection("Settings").updateOne(
      {}, // Empty filter targets the first/only settings document
      { 
        $set: { 
          smsEnabled: smsEnabled ?? false,
          intervals: typeof intervals === 'string' ? intervals : JSON.stringify(intervals || []),
          smsTemplate: smsTemplate || "" 
        } 
      },
      { upsert: true }
    );

    const updated = await db.collection("Settings").findOne({});

    return NextResponse.json({ success: true, result, settings: updated });
  } catch (error: any) {
    console.error('Settings Save Error:', error);
    return NextResponse.json({ 
      error: "Failed to save settings", 
      details: error.message 
    }, { status: 500 });
  }
}
