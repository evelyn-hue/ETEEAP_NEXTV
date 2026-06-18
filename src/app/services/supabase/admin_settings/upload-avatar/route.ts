import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { supabaseServer } from "@/lib/supabase-server";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
  try {
    // Extract user ID from JWT cookie
    const auth = req.headers.get("authorization") || "";
    const bearer = auth.startsWith("Bearer ") ? auth.slice(7) : null;
    const cookieToken = (await cookies()).get("token")?.value;
    const token = bearer || cookieToken;
    
    if (!token) {
      return NextResponse.json(
        { success: false, error: "Not authenticated" },
        { status: 401 }
      );
    }

    let userId: string;
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || "") as { final_data: { data: Array<{ id: string }> } };
      userId = decoded.final_data?.data?.[0]?.id;
      
      if (!userId) {
        return NextResponse.json(
          { success: false, error: "User ID not found in token" },
          { status: 401 }
        );
      }
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid token" },
        { status: 401 }
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

    // Upload file to Supabase storage
    const fileName = `admin-${userId}-${Date.now()}`;
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
      .update({
        avatar_url: publicUrl.publicUrl,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId)
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
    console.error("Error:", message);
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
