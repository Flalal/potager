import { NextResponse } from "next/server";
import { verifySession } from "@/lib/session";
import { listPlantations, addPlantation } from "@/lib/garden-store";
import type { Plantation } from "@/lib/garden";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await verifySession())) {
    return new NextResponse(null, { status: 401 });
  }
  return NextResponse.json(listPlantations());
}

export async function POST(request: Request) {
  if (!(await verifySession())) {
    return new NextResponse(null, { status: 401 });
  }
  const body = (await request.json()) as Partial<Plantation>;
  if (!body?.uid || !body?.plantId) {
    return NextResponse.json({ error: "uid et plantId requis" }, { status: 400 });
  }
  addPlantation({
    uid: String(body.uid),
    plantId: String(body.plantId),
    datePlantation: body.datePlantation ?? "",
    quantite: Number(body.quantite ?? 1),
    emplacement: body.emplacement ?? "",
    notes: body.notes ?? "",
  });
  return NextResponse.json({ ok: true }, { status: 201 });
}
