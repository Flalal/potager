import { NextResponse } from "next/server";
import { verifySession } from "@/lib/session";
import { listDoneTasks, setTaskDone } from "@/lib/tasks-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await verifySession())) {
    return new NextResponse(null, { status: 401 });
  }
  return NextResponse.json(listDoneTasks());
}

export async function POST(request: Request) {
  if (!(await verifySession())) {
    return new NextResponse(null, { status: 401 });
  }
  const { key, done } = (await request.json()) as {
    key?: string;
    done?: boolean;
  };
  if (!key) {
    return NextResponse.json({ error: "key requise" }, { status: 400 });
  }
  setTaskDone(key, Boolean(done));
  return NextResponse.json({ ok: true });
}
