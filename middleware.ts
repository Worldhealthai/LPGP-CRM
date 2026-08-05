import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

// How close to expiry (seconds) before we do a full network refresh.
const REFRESH_MARGIN_S = 60;

function b64Decode(s: string): string {
  s = s.replace(/-/g, "+").replace(/_/g, "/");
  const pad = s.length % 4;
  if (pad) s += "=".repeat(4 - pad);
  return atob(s);
}

/**
 * Read the Supabase session expiry straight from the auth cookie — no network.
 * Returns null when there's no session cookie (or it's unreadable).
 * This is a UX gate only; real authorization happens server-side per action.
 */
function sessionExpSeconds(req: NextRequest, supabaseUrl: string): number | null {
  try {
    const ref = new URL(supabaseUrl).hostname.split(".")[0];
    const base = `sb-${ref}-auth-token`;
    let raw = req.cookies.get(base)?.value ?? null;
    if (!raw) {
      // Large sessions are chunked into base.0, base.1, ...
      const chunks: string[] = [];
      for (let i = 0; i < 10; i++) {
        const c = req.cookies.get(`${base}.${i}`)?.value;
        if (c == null) break;
        chunks.push(c);
      }
      raw = chunks.length ? chunks.join("") : null;
    }
    if (!raw) return null;
    if (raw.startsWith("base64-")) raw = b64Decode(raw.slice(7));
    const session = JSON.parse(raw) as { access_token?: string; expires_at?: number };
    if (typeof session.expires_at === "number") return session.expires_at;
    const token = session.access_token;
    if (!token) return null;
    const payload = JSON.parse(b64Decode(token.split(".")[1] ?? "")) as { exp?: number };
    return typeof payload.exp === "number" ? payload.exp : null;
  } catch {
    return null;
  }
}

export async function middleware(req: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Auth not configured → don't gate; the app renders a "connect Supabase" state.
  if (!url || !anon) return NextResponse.next();

  const path = req.nextUrl.pathname;
  const isLogin = path === "/login";

  // ---- Fast path: decide from the cookie alone (zero network) -------------
  const exp = sessionExpSeconds(req, url);
  const now = Date.now() / 1000;

  if (exp !== null && exp > now + REFRESH_MARGIN_S) {
    // Fresh session — let it straight through.
    if (isLogin) {
      const to = req.nextUrl.clone();
      to.pathname = "/";
      to.search = "";
      return NextResponse.redirect(to);
    }
    return NextResponse.next();
  }

  if (exp === null) {
    // No session at all — no point asking Supabase.
    if (!isLogin) {
      const to = req.nextUrl.clone();
      to.pathname = "/login";
      to.searchParams.set("next", path === "/" ? "" : path);
      return NextResponse.redirect(to);
    }
    return NextResponse.next();
  }

  // ---- Slow path: token expired / about to — refresh via Supabase ---------
  let res = NextResponse.next({ request: req });
  const supabase = createServerClient(url, anon, {
    cookies: {
      getAll() {
        return req.cookies.getAll();
      },
      setAll(list) {
        list.forEach(({ name, value }) => req.cookies.set(name, value));
        res = NextResponse.next({ request: req });
        list.forEach(({ name, value, options }) => res.cookies.set(name, value, options));
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user && !isLogin) {
    const to = req.nextUrl.clone();
    to.pathname = "/login";
    to.searchParams.set("next", path === "/" ? "" : path);
    return NextResponse.redirect(to);
  }
  if (user && isLogin) {
    const to = req.nextUrl.clone();
    to.pathname = "/";
    to.search = "";
    return NextResponse.redirect(to);
  }
  return res;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)"],
};
