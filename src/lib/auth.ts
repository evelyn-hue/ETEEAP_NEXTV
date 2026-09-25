import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

export type AuthUser = {
  id?: string;
  email: string;
  fullName?: string;
  role?: string;
  applicant_status?: string;
  phone?: string;
  civil_status?: string;
  profilePicture?: string;
};

export async function extractToken(req?: NextRequest): Promise<string | null> {
  if (req) {
    const authHeader = req.headers.get("authorization") || "";
    if (authHeader.startsWith("Bearer ")) {
      const bearer = authHeader.slice(7).trim();
      if (bearer) return bearer;
    }
  }

  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    if (token) return token;
  } catch {
    // If called in an environment without cookies()
  }

  return null;
}

export function verifyJwtToken(token: string): { user: AuthUser | null; valid: boolean } {
  try {
    const secret = process.env.JWT_SECRET || "";
    if (!secret) return { user: null, valid: false };

    const decoded = jwt.verify(token, secret) as {
      final_data?: { data?: Array<AuthUser> };
      email?: string;
      role?: string;
      id?: string;
      fullName?: string;
    };

    const firstUserData = decoded.final_data?.data?.[0];
    const email = firstUserData?.email || decoded.email;

    if (!email) {
      return { user: null, valid: false };
    }

    const role =
      firstUserData?.role ||
      decoded.role ||
      (email.toLowerCase() === "admin@admin.com" ? "admin" : "applicant");

    const user: AuthUser = {
      id: firstUserData?.id || decoded.id,
      email: email.toLowerCase().trim(),
      fullName: firstUserData?.fullName || decoded.fullName,
      role,
      applicant_status: firstUserData?.applicant_status,
      phone: firstUserData?.phone,
      civil_status: firstUserData?.civil_status,
      profilePicture: firstUserData?.profilePicture,
    };

    return { user, valid: true };
  } catch {
    return { user: null, valid: false };
  }
}

export async function verifySession(req?: NextRequest): Promise<AuthUser | null> {
  const token = await extractToken(req);
  if (!token) return null;
  const { user, valid } = verifyJwtToken(token);
  return valid ? user : null;
}

export function isAdminUser(user: AuthUser | null): boolean {
  if (!user || !user.email) return false;
  const cleanEmail = user.email.toLowerCase().trim();
  return user.role === "admin" || cleanEmail === "admin@admin.com";
}

export async function requireAuth(req: NextRequest): Promise<
  | { ok: true; user: AuthUser; response?: never }
  | { ok: false; user?: never; response: NextResponse }
> {
  const user = await verifySession(req);
  if (!user) {
    return {
      ok: false,
      response: NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      ),
    };
  }
  return { ok: true, user };
}

export async function requireAdmin(req: NextRequest): Promise<
  | { ok: true; user: AuthUser; response?: never }
  | { ok: false; user?: never; response: NextResponse }
> {
  const authResult = await requireAuth(req);
  if (!authResult.ok) return authResult;

  if (!isAdminUser(authResult.user)) {
    return {
      ok: false,
      response: NextResponse.json(
        { success: false, error: "Administrative privilege required" },
        { status: 403 }
      ),
    };
  }

  return { ok: true, user: authResult.user };
}

export function createToken(userData: AuthUser, explicitRole?: string): string {
  const secret = process.env.JWT_SECRET || "";
  const role =
    explicitRole ||
    userData.role ||
    (userData.email.toLowerCase() === "admin@admin.com" ? "admin" : "applicant");

  const normalizedUser = {
    ...userData,
    role,
  };

  const final_data = { data: [normalizedUser] };

  return jwt.sign(
    { final_data, email: userData.email, role },
    secret,
    { expiresIn: "30d" }
  );
}

export async function setAuthCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set({
    name: "token",
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });
}
