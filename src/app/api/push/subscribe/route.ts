import { NextResponse } from "next/server";
import { verifySession } from "@/lib/session";
import { savePushSub, removePushSub, PushSub } from "@/lib/push-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!(await verifySession())) {
    return new NextResponse(null, { status: 401 });
  }
  const sub = (await request.json()) as PushSub;
  if (!sub?.endpoint || !sub?.keys?.p256dh || !sub?.keys?.auth) {
    return NextResponse.json({ error: "abonnement invalide" }, { status: 400 });
  }
  savePushSub(sub);
  return NextResponse.json({ ok: true }, { status: 201 });
}

export async function DELETE(request: Request) {
  if (!(await verifySession())) {
    return new NextResponse(null, { status: 401 });
  }
  const { endpoint } = (await request.json().catch(() => ({}))) as {
    endpoint?: string;
  };
  if (endpoint) removePushSub(endpoint);
  return NextResponse.json({ ok: true });
}
