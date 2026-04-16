import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendSMS } from "@/lib/sms-service";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const now = new Date();
    // Get time in India (IST)
    const currentTime = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Asia/Kolkata',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }).format(now);
    
    console.log(`[CRON] ${now.toISOString()} - Server time check: ${currentTime} IST`);

    const settings = await prisma.settings.findFirst();
    if (!settings || !settings.smsEnabled) {
      return NextResponse.json({ message: "SMS is disabled or settings missing" });
    }

    const intervals = JSON.parse(settings.intervals || '[]');
    if (!intervals.includes(currentTime)) {
      return NextResponse.json({ message: "No schedule for this time", currentTime });
    }

    const contacts = await prisma.contact.findMany({
      where: { pendingAmount: { gt: 0 } }
    });

    const results = [];
    for (const contact of contacts) {
      const message = settings.smsTemplate.replace('##PENDING_AMOUNT##', contact.pendingAmount.toString());
      const result = await sendSMS(contact.phoneNumber, message);
      results.push({ contact: contact.name, result });
    }

    return NextResponse.json({ 
      success: true, 
      time: currentTime, 
      sentCount: results.length,
      details: results 
    });

  } catch (error: any) {
    console.error('[CRON ERROR]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
