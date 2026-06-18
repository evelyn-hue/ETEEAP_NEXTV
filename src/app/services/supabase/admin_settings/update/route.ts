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

    const { full_name, avatar_url } = await req.json();

    const { data, error } = await supabaseServer
      .from("admin_settings")
      .update({
        ...(full_name && { full_name }),
        ...(avatar_url && { avatar_url }),
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, message: "Admin settings updated successfully", data },
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
