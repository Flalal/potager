import { NextResponse } from "next/server";
import { verifySession } from "@/lib/session";
import { listEntries, addEntry } from "@/lib/journal-store";
import type { JournalEntry } from "@/lib/journal";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await verifySession())) {
    return new NextResponse(null, { status: 401 });
  }
  return NextResponse.json(listEntries());
}

export async function POST(request: Request) {
  if (!(await verifySession())) {
    return new NextResponse(null, { status: 401 });
  }
  const body = (await request.json()) as Partial<JournalEntry>;
  if (!body?.id || !body?.date || !body?.type) {
    return NextResponse.json(
      { error: "id, date et type requis" },
      { status: 400 }
    );
  }
  const q = body.quantite;
  addEntry({
    id: String(body.id),
    date: String(body.date),
    type: body.type,
    plantId: body.plantId ?? "",
    titre: body.titre ?? "",
    note: body.note ?? "",
    quantite: q === null || q === undefined ? null : Number(q),
    unite: body.unite ?? "",
  });
  return NextResponse.json({ ok: true }, { status: 201 });
}
