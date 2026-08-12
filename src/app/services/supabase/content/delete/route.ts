import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { supabaseServer } from "@/lib/supabase-server";
import { cookies } from "next/headers";

async function requireAdmin(req: NextRequest): Promise<{ ok: boolean; response?: NextResponse }> {
  const auth = req.headers.get("authorization") || "";
  const bearer = auth.startsWith("Bearer ") ? auth.slice(7) : null;
  const cookieToken = (await cookies()).get("token")?.value;
  const token = bearer || cookieToken;

  if (!token) {
    return {
      ok: false,
      response: NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 }),
    };
  }

  try {
    jwt.verify(token, process.env.JWT_SECRET || "");
    return { ok: true };
  } catch {
    return {
      ok: false,
      response: NextResponse.json({ success: false, error: "Invalid token" }, { status: 401 }),
    };
  }
}

export async function POST(req: NextRequest) {
  try {
    const guard = await requireAdmin(req);
    if (!guard.ok) return guard.response;

    const { id } = await req.json();
    if (!id) {
      return NextResponse.json({ success: false, error: "ID is required" }, { status: 400 });
    }

    const { error } = await supabaseServer.from("posts").delete().eq("id", id);

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "Content deleted" }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Error:", message);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
