import { NextResponse } from "next/server";
import { verifySession } from "@/lib/session";
import { removeEntry } from "@/lib/journal-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

export async function DELETE(_request: Request, ctx: Ctx) {
  if (!(await verifySession())) {
    return new NextResponse(null, { status: 401 });
  }
  const { id } = await ctx.params;
  removeEntry(id);
  return NextResponse.json({ ok: true });
}
