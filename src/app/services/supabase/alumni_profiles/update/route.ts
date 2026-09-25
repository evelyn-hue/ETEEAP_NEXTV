import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";
import { requireAdmin } from "@/lib/auth";
import { sendStatusEmail } from "@/lib/resend";

export async function POST(req: NextRequest) {
  try {
    const adminAuth = await requireAdmin(req);
    if (!adminAuth.ok) return adminAuth.response;

    const body = await req.json().catch(() => ({}));
    const { id, is_graduate, verification_status, remarks } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "ID is required" },
        { status: 400 }
      );
    }

    const updates: Record<string, unknown> = {};
    if (is_graduate !== undefined) updates.is_graduate = Boolean(is_graduate);
    if (verification_status !== undefined) {
      const cleanStatus = String(verification_status).trim().toLowerCase();
      if (["verified", "rejected", "pending"].includes(cleanStatus)) {
        updates.verification_status = cleanStatus;
      }
    }
    if (remarks !== undefined) updates.remarks = String(remarks);

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { success: false, error: "No fields to update" },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseServer
      .from("alumni_profiles")
      .update(updates)
      .eq("id", id)
      .select();

    if (error) {
      console.error("Supabase update error:", error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    // Notify user via email if status was updated
    if (data && data.length > 0 && data[0].email && updates.verification_status) {
      const status = String(updates.verification_status);
      const emailAction = status === "verified" ? "Approved" : "Rejected";
      sendStatusEmail(
        data[0].email,
        data[0].full_name || "Alumni Member",
        emailAction,
        updates.remarks
          ? `Your alumni registration status was updated to ${status}. Remark: ${updates.remarks}`
          : `Your alumni registration has been ${status} by the administrator.`
      ).catch((err) => console.error("Failed to send alumni status email:", err));
    }

    return NextResponse.json(
      { success: true, message: "Alumni profile updated successfully", data },
      { status: 200 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Error updating alumni:", message);
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
