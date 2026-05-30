import { NextResponse } from "next/server";
import { verifySession } from "@/lib/session";
import { listPlots, addPlot } from "@/lib/plots-store";
import type { Plot } from "@/lib/plots";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await verifySession())) {
    return new NextResponse(null, { status: 401 });
  }
  return NextResponse.json(listPlots());
}

export async function POST(request: Request) {
  if (!(await verifySession())) {
    return new NextResponse(null, { status: 401 });
  }
  const body = (await request.json()) as Partial<Plot>;
  if (!body?.id || !body?.nom) {
    return NextResponse.json({ error: "id et nom requis" }, { status: 400 });
  }
  const rows = Number(body.rows ?? 1);
  const cols = Number(body.cols ?? 1);
  const cells = Array.isArray(body.cells)
    ? body.cells
    : Array<string | null>(rows * cols).fill(null);
  addPlot({ id: String(body.id), nom: String(body.nom), rows, cols, cells });
  return NextResponse.json({ ok: true }, { status: 201 });
}
