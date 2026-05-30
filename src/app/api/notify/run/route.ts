import { NextResponse } from "next/server";
import { buildMonthlyDigest, sendNotification } from "@/lib/notify";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Déclencheur des notifications, appelé par un cron (sur le LXC ou ailleurs).
 * Protégé par CRON_SECRET : passez-le via l'en-tête `x-cron-secret`
 * ou le paramètre `?secret=`.
 *
 *   curl -X POST "https://potager.mondomaine.fr/api/notify/run?secret=XXXX"
 */
async function handle(request: Request): Promise<NextResponse> {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json(
      { error: "CRON_SECRET non configuré" },
      { status: 503 }
    );
  }
  const url = new URL(request.url);
  const provided =
    request.headers.get("x-cron-secret") || url.searchParams.get("secret");
  if (provided !== secret) {
    return new NextResponse(null, { status: 401 });
  }

  const digest = buildMonthlyDigest();
  const results = await sendNotification(digest);
  return NextResponse.json({ ok: true, digest, results });
}

export async function POST(request: Request) {
  return handle(request);
}

export async function GET(request: Request) {
  return handle(request);
}
