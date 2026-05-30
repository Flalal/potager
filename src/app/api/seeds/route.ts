import { NextResponse } from "next/server";
import { verifySession } from "@/lib/session";
import { listSeeds, setSeed } from "@/lib/seeds-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await verifySession())) {
    return new NextResponse(null, { status: 401 });
  }
  return NextResponse.json(listSeeds());
}

export async function POST(request: Request) {
  if (!(await verifySession())) {
    return new NextResponse(null, { status: 401 });
  }
  const { plantId, has } = (await request.json()) as {
    plantId?: string;
    has?: boolean;
  };
  if (!plantId) {
    return NextResponse.json({ error: "plantId requis" }, { status: 400 });
  }
  setSeed(plantId, Boolean(has));
  return NextResponse.json({ ok: true });
}
