import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const isAuthPage = request.nextUrl.pathname === "/";
  const isProtectedRoute = !isAuthPage;

  if (isProtectedRoute) {
    // Check if user is authenticated (this will be handled client-side)
    // For now, we'll let the client-side handle the redirect
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
