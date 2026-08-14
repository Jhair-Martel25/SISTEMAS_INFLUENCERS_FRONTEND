import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/** Rutas públicas (no requieren sesión). Todo lo demás está protegido. */
const publicRoutes = ["/login", "/agendar"];

function isPublicRoute(pathname: string): boolean {
  return publicRoutes.some((route) => pathname.startsWith(route));
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("sp_token")?.value;

  // Ruta interna sin token → manda al login (con redirect para volver luego).
  if (!isPublicRoute(pathname) && !token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Ya logueado intentando ir al login → manda al dashboard.
  if (pathname === "/login" && token) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|images/).*)"],
};
