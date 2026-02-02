import { NextResponse } from "next/server";
import { get } from "@vercel/edge-config";

export const runtime = "edge";

export async function GET() {
  try {
    const data = await get("dashboardData");

    if (!data) {
      return NextResponse.json({ error: "No cached data" }, { status: 404 });
    }

    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60",
      },
    });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
