import { NextResponse } from "next/server";
import { verifySession } from "@/lib/session";
import { updatePlot, removePlot } from "@/lib/plots-store";
import type { Plot } from "@/lib/plots";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, ctx: Ctx) {
  if (!(await verifySession())) {
    return new NextResponse(null, { status: 401 });
  }
  const { id } = await ctx.params;
  const patch = (await request.json()) as Partial<Omit<Plot, "id">>;
  updatePlot(id, patch);
  return NextResponse.json({ ok: true });
}

export async function DELETE(_request: Request, ctx: Ctx) {
  if (!(await verifySession())) {
    return new NextResponse(null, { status: 401 });
  }
  const { id } = await ctx.params;
  removePlot(id);
  return NextResponse.json({ ok: true });
}
