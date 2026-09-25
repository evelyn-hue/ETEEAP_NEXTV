import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import * as jose from "jose";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect admin routes
  if (pathname.startsWith("/admin")) {
    const token = request.cookies.get("token")?.value;

    if (!token) {
      const signInUrl = new URL("/auth/signin", request.url);
      signInUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(signInUrl);
    }

    try {
      const secret = new TextEncoder().encode(process.env.JWT_SECRET || "");
      const { payload } = await jose.jwtVerify(token, secret);

      const payloadData = payload as {
        final_data?: { data?: Array<{ email?: string; role?: string }> };
        email?: string;
        role?: string;
      };

      const email =
        payloadData.final_data?.data?.[0]?.email || payloadData.email || "";
      const role =
        payloadData.final_data?.data?.[0]?.role ||
        payloadData.role ||
        (email.toLowerCase() === "admin@admin.com" ? "admin" : "applicant");

      const isAdmin = role === "admin" || email.toLowerCase() === "admin@admin.com";

      if (!isAdmin) {
        // Non-admin logged in user trying to access admin panel
        return NextResponse.redirect(new URL("/", request.url));
      }
    } catch {
      // Invalid token
      const signInUrl = new URL("/auth/signin", request.url);
      signInUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(signInUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
