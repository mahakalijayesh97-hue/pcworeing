import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendSMS } from "@/lib/sms-service";

export const dynamic = 'force-dynamic';

export const revalidate = 0;

export async function GET() {
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    return NextResponse.json({ success: true });
  }
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
    
    // Get current time in IST explicitly for comparison
    const istNow = new Date(new Date().toLocaleString("en-US", {timeZone: "Asia/Kolkata"}));

    const matched = intervals.some((timeStr: string) => {
      const [h, m] = timeStr.split(':').map(Number);
      const scheduledToday = new Date(istNow);
      scheduledToday.setHours(h, m, 0, 0);
      
      const diffMinutes = (istNow.getTime() - scheduledToday.getTime()) / (1000 * 60);
      // If the scheduled time was between 0 and 6 minutes ago (safe window for 5-min cron)
      return diffMinutes >= 0 && diffMinutes < 6;
    });

    if (!matched) {
      return NextResponse.json({ message: "No IST schedule match in this window", currentTimeIST: currentTime, intervals });
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
