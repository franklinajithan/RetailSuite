// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(_req: NextRequest) {
  // Guard pages with auth here if you like; APIs are excluded via matcher.
  return NextResponse.next();
}

export const config = {
  // Exclude API routes, Next internals, and any file with an extension
  matcher: ["/((?!api|_next|.*\\..*|favicon.ico).*)"],
};
