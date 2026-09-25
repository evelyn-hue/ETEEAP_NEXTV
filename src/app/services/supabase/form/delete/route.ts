import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";
import { requireAuth, isAdminUser } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const authResult = await requireAuth(req);
    if (!authResult.ok) return authResult.response;

    const caller = authResult.user;
    const isCallerAdmin = isAdminUser(caller);

    const body = await req.json().catch(() => ({}));
    const { id, email } = body;

    if (!id || !email) {
      return NextResponse.json(
        { success: false, message: "ID and email are required" },
        { status: 400 }
      );
    }

    const targetEmail = String(email).trim().toLowerCase();

    // Only application owner or an administrator can delete
    if (!isCallerAdmin && caller.email !== targetEmail) {
      return NextResponse.json(
        { success: false, message: "You are not authorized to delete this application" },
        { status: 403 }
      );
    }

    // Delete the form submission from the database
    const { error } = await supabaseServer
      .from("form")
      .delete()
      .eq("id", id)
      .eq("email", targetEmail);

    if (error) {
      console.error("Delete error:", error);
      return NextResponse.json(
        { success: false, message: error.message || "Failed to delete form" },
        { status: 500 }
      );
    }

    // Reset applicant_status so Apply buttons become active again
    await supabaseServer
      .from("auth")
      .update({ applicant_status: "draft" })
      .eq("email", targetEmail);

    return NextResponse.json(
      { success: true, message: "Form deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Delete handler error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
