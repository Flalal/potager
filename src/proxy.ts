import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const SESSION_COOKIE = "potager_session";

/**
 * Garde des routes (ex-middleware, renommé « Proxy » en Next 16).
 * Vérification optimiste : on ne lit que la présence du cookie de session,
 * la validation réelle en base se fait côté route handlers / DAL.
 *
 * Si HOUSEHOLD_PASSWORD n'est pas défini, l'auth est désactivée (accès libre).
 */
export function proxy(request: NextRequest) {
  const authEnabled = Boolean(process.env.HOUSEHOLD_PASSWORD);
  if (!authEnabled) return NextResponse.next();

  const { pathname } = request.nextUrl;
  const isLogin = pathname === "/login";
  const hasSession = Boolean(request.cookies.get(SESSION_COOKIE)?.value);

  if (!hasSession && !isLogin) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  if (hasSession && isLogin) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  // Exclut les routes API (qui se protègent elles-mêmes), les assets Next,
  // le service worker, le manifest et les icônes.
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|sw.js|manifest.webmanifest|icon-.*\\.png|apple-icon.png).*)",
  ],
};
