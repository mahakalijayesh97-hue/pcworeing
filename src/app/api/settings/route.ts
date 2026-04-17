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
    const body = await request.json();
    console.log('Incoming POST /api/settings:', body);
    const { smsEnabled, intervals, smsTemplate } = body;

    const currentSettings = await prisma.settings.findFirst();
    const intervalStr = typeof intervals === 'string' ? intervals : JSON.stringify(intervals || []);

    let result;
    if (currentSettings) {
      result = await prisma.settings.update({
        where: { id: currentSettings.id },
        data: {
          smsEnabled: smsEnabled ?? false,
          intervals: intervalStr,
          smsTemplate: smsTemplate || "" 
        }
      });
    } else {
      result = await prisma.settings.create({
        data: {
          smsEnabled: smsEnabled ?? false,
          intervals: intervalStr,
          smsTemplate: smsTemplate || "" 
        }
      });
    }

    return NextResponse.json({ success: true, settings: result });
  } catch (error: any) {
    console.error('Settings Save Error:', error);
    return NextResponse.json({ 
      error: "Failed to save settings", 
      details: error.message 
    }, { status: 500 });
  }
}
