import { NextResponse } from "next/server";
import { verifySession } from "@/lib/session";
import { updatePlantation, removePlantation } from "@/lib/garden-store";
import type { Plantation } from "@/lib/garden";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ uid: string }> };

export async function PATCH(request: Request, ctx: Ctx) {
  if (!(await verifySession())) {
    return new NextResponse(null, { status: 401 });
  }
  const { uid } = await ctx.params;
  const patch = (await request.json()) as Partial<Omit<Plantation, "uid">>;
  updatePlantation(uid, patch);
  return NextResponse.json({ ok: true });
}

export async function DELETE(_request: Request, ctx: Ctx) {
  if (!(await verifySession())) {
    return new NextResponse(null, { status: 401 });
  }
  const { uid } = await ctx.params;
  removePlantation(uid);
  return NextResponse.json({ ok: true });
}
