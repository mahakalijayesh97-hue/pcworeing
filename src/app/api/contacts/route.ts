import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const revalidate = 0;

// GET Contacts
export async function GET() {
  // Skip DB during Vercel build
  if (process.env.NEXT_PHASE === "phase-production-build") {
    return NextResponse.json([]);
  }

  try {
    const contacts = await prisma.contact.findMany({
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json(contacts);
  } catch (error) {
    console.error("GET contacts error:", error);
    return NextResponse.json([]);
  }
}

// POST Contact
export async function POST(request: Request) {
  // Skip DB during build
  if (process.env.NEXT_PHASE === "phase-production-build") {
    return NextResponse.json({ success: true });
  }

  try {
    console.log('--- POST /api/contacts [PRISMA VERSION] ---');
    const body = await request.json();
    const { name, phoneNumber, pendingAmount } = body;

    if (!phoneNumber) {
      return NextResponse.json(
        { error: "Phone number is required" },
        { status: 400 }
      );
    }

    const contactName = name || "Unknown";
    const amount = parseFloat(pendingAmount?.toString() || "0") || 0;

    const result = await prisma.contact.upsert({
      where: { phoneNumber },
      update: {
        name: contactName,
        pendingAmount: amount,
      },
      create: {
        name: contactName,
        phoneNumber,
        pendingAmount: amount,
      },
    });

    return NextResponse.json({ success: true, result });
  } catch (error: any) {
    console.error("POST contact error:", error);

    return NextResponse.json(
      {
        error: "Failed to save contact",
        details: error.message,
      },
      { status: 500 }
    );
  }
}