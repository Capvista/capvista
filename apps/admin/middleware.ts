import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_PATHS = ["/login", "/signup"];

const PROTECTED_PATHS = [
  "/companies",
  "/deals",
  "/investors",
  "/investments",
  "/users",
  "/activity",
  "/monitoring",
];

function decodeJwtPayload(token: string): Record<string, any> | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const payload = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const decoded = atob(payload);
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip static files and API routes
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const token = request.cookies.get("capvista_admin_token")?.value;
  const payload = token ? decodeJwtPayload(token) : null;

  const isPublicPath = PUBLIC_PATHS.includes(pathname);
  const isTempToken = payload?.type === "mfa_pending";
  const isFullToken = payload && !isTempToken;
  const mfaEnabled = payload?.mfa_enabled === true;

  // /login → public, redirect to dashboard if fully authenticated
  if (isPublicPath) {
    if (isFullToken) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    return NextResponse.next();
  }

  // No token at all → redirect to login
  if (!payload) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // /setup-mfa → requires auth, mfa_enabled must be false
  if (pathname === "/setup-mfa") {
    if (mfaEnabled) {
      // MFA already set up, they shouldn't be here
      return NextResponse.redirect(new URL("/", request.url));
    }
    return NextResponse.next();
  }

  // /verify-mfa → requires valid temp token (mfa_pending)
  if (pathname === "/verify-mfa") {
    if (!isTempToken) {
      // Not a temp token — either go to dashboard or login
      return isFullToken
        ? NextResponse.redirect(new URL("/", request.url))
        : NextResponse.redirect(new URL("/login", request.url));
    }
    return NextResponse.next();
  }

  // All other routes (dashboard, users, companies, etc.) → require full JWT
  if (isTempToken) {
    // User has temp token, needs to complete MFA
    return NextResponse.redirect(new URL("/verify-mfa", request.url));
  }

  if (!isFullToken) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // If user has full token but MFA not enabled, redirect to setup
  if (!mfaEnabled) {
    return NextResponse.redirect(new URL("/setup-mfa", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
