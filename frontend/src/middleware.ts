import { NextResponse, NextRequest } from "next/server";

const PUBLIC_PATHS = ["/", "/login", "/signup", "/forgot-password", "/admin/login", "/help", "/feedback", "/blog", "/plans", "/integrations", "/chat"];
const PUBLIC_PREFIXES = ["/_next", "/api", "/static", "/favicon", "/logo", "/manifest", "/og-image"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public files and APIs
  if (PUBLIC_PREFIXES.some(p => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  const isPublic = PUBLIC_PATHS.some(p => pathname === p || (p !== "/" && pathname.startsWith(p + "/")));

  if (isPublic) {
    return NextResponse.next();
  }

  // Protected routes: check token presence
  const token = request.cookies.get("amplizo_token")?.value
    || request.headers.get("authorization")?.replace("Bearer ", "");

  // Also allow if localStorage has token (we can't read localStorage in middleware, so we rely on cookie)
  // For now, check both cookie and a custom header set by client
  const cookieToken = request.cookies.get("amplizo_token")?.value;

  if (!cookieToken) {
    // Not authenticated, redirect to login
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|logo.png|manifest.json|og-image.svg|robots.txt|sitemap.xml).*)",
  ],
};
