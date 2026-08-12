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

    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ success: false, error: "No file provided" }, { status: 400 });
    }

    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: "Only JPG, PNG, or WebP images are allowed." },
        { status: 400 }
      );
    }

    const buffer = await file.arrayBuffer();
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const filePath = `content-${Date.now()}-${safeName}`;

    const { error: uploadError } = await supabaseServer.storage
      .from("posts_media")
      .upload(filePath, buffer, {
        cacheControl: "3600",
        upsert: false,
        contentType: file.type,
      });

    if (uploadError) {
      return NextResponse.json({ success: false, error: uploadError.message }, { status: 500 });
    }

    const { data: publicUrlData } = supabaseServer.storage
      .from("posts_media")
      .getPublicUrl(filePath);

    return NextResponse.json(
      { success: true, data: { url: publicUrlData.publicUrl } },
      { status: 200 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Error:", message);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
