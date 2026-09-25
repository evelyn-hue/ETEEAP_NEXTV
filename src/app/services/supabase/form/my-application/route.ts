import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";
import { requireAuth } from "@/lib/auth";
import { getRequiredDocumentKeys } from "@/lib/documents";

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAuth(req);
    if (!auth.ok) {
      return auth.response;
    }
    const userEmail = auth.user.email;

    const { data, error } = await supabaseServer
      .from("form")
      .select("*, id")
      .eq("email", userEmail.toLowerCase().trim())
      .limit(1);

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    const application = data?.[0] ?? null;
    if (!application) {
      return NextResponse.json({ success: true, data: null }, { status: 200 });
    }

    const isMarried = application.civil_status?.toLowerCase() === "married";
    const isBusinessOwner = Boolean(application.businessRegistration);
    const requiredDocs = getRequiredDocumentKeys({ isMarried, isBusinessOwner });

    const requiredCount = requiredDocs.reduce((count, key) => {
      return count + (application[key] ? 1 : 0);
    }, 0);

    const approvals = Array.isArray(application.forms_approvals) ? application.forms_approvals : [];
    const verified: Record<string, boolean> = {};
    const remarks: Record<string, { remark: string }> = {};

    for (const entry of approvals) {
      if (entry && typeof entry === "object" && "documentId" in entry && "status" in entry) {
        verified[`${entry.documentId}_verified`] = entry.status === "Verified";
        if (entry.remark) {
          remarks[entry.documentId] = { remark: String(entry.remark) };
        }
      }
    }

    return NextResponse.json(
      {
        success: true,
        data: application,
        remarks,
        verified,
        meta: {
          requiredDocumentCount: requiredDocs.length,
          requiredUploadedCount: requiredCount,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
