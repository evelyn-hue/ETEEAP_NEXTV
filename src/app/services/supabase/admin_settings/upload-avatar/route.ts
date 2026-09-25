import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";
import { requireAdmin } from "@/lib/auth";
import { MAX_FILE_SIZE } from "@/lib/documents";

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAdmin(req);
    if (!auth.ok) {
      return auth.response;
    }

    let userId = auth.user.id;
    if (!userId) {
      const { data: userData } = await supabaseServer
        .from("auth")
        .select("id")
        .eq("email", auth.user.email)
        .maybeSingle();
      userId = userData?.id;
    }

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "User ID not found" },
        { status: 400 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No file provided" },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { success: false, error: "File size exceeds 5MB limit" },
        { status: 400 }
      );
    }

    const imageTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!imageTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: "Only image files (JPG, PNG, WebP) are allowed" },
        { status: 400 }
      );
    }

    // Upload file to Supabase storage
    const ext = file.name.split(".").pop() || "jpg";
    const fileName = `admin-${userId}-${Date.now()}.${ext}`;
    const buffer = await file.arrayBuffer();

    const { error: uploadError } = await supabaseServer.storage
      .from("admin_avatars")
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: true,
      });

    if (uploadError) {
      return NextResponse.json(
        { success: false, error: uploadError.message },
        { status: 500 }
      );
    }

    // Get public URL
    const { data: publicUrl } = supabaseServer.storage
      .from("admin_avatars")
      .getPublicUrl(fileName);

    // Update admin_settings with new avatar URL
    const { data: updateData, error: updateError } = await supabaseServer
      .from("admin_settings")
      .upsert({
        id: userId,
        avatar_url: publicUrl.publicUrl,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (updateError) {
      return NextResponse.json(
        { success: false, error: updateError.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Avatar uploaded successfully",
        data: updateData,
      },
      { status: 200 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
