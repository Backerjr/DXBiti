import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  try {
    const lead = await req.json();

    // TODO: Replace with your persistence (Airtable/HubSpot/Notion/Vercel KV/Webhook)
    // Example: await fetch("https://hooks.zapier.com/hooks/catch/...", {
    //   method: "POST",
    //   body: JSON.stringify(lead),
    // });

    return NextResponse.json({ ok: true, received: lead });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message || "Unknown error" },
      { status: 500 }
    );
  }
}
