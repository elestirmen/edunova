import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const response = NextResponse.next();
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  if (
    pathname.startsWith("/panel") ||
    pathname.startsWith("/api/admin") ||
    pathname.startsWith("/api/teacher") ||
    pathname.startsWith("/api/student") ||
    pathname.startsWith("/api/parent") ||
    pathname.startsWith("/api/profile") ||
    pathname.startsWith("/api/notifications")
  ) {
    const token = await getToken({ req: request });

    if (!token) {
      if (pathname.startsWith("/api/")) {
        return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
      }
      const url = request.nextUrl.clone();
      url.pathname = "/giris";
      return NextResponse.redirect(url);
    }

    if (pathname.startsWith("/api/admin") && token.role !== "ADMIN") {
      return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
    }
    if (pathname.startsWith("/api/teacher") && token.role !== "TEACHER") {
      return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
    }
    if (pathname.startsWith("/api/student") && token.role !== "STUDENT") {
      return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
    }
    if (pathname.startsWith("/api/parent") && token.role !== "PARENT") {
      return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/panel/:path*",
    "/api/admin/:path*",
    "/api/teacher/:path*",
    "/api/student/:path*",
    "/api/parent/:path*",
    "/api/profile/:path*",
    "/api/notifications/:path*",
  ],
};
