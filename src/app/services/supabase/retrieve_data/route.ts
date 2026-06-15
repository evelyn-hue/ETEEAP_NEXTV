import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

type FormStatus = "Under Review" | "Reject" | "Approve" | "Draft" | "Delete";
type DocumentApprovalStatus = "Pending" | "Verified" | "Rejected";

type ApprovalEntry = {
  documentId: string;
  status: DocumentApprovalStatus;
  remark?: string;
  reviewedBy?: string;
  reviewedAt: string;
};

async function insertActivityLog(userEmail: string, actions: string, details: string) {
  if (!userEmail) return;

  const { error } = await supabaseServer
    .from("act_logs")
    .insert([
      {
        user: userEmail,
        actions,
        details,
      },
    ]);

  if (error) {
    console.error("Activity log insert failed:", error.message);
  }
}

const REQUIRED_DOCUMENT_KEYS = [
  "letterOfIntent",
  "resume",
  "picture",
  "applicationForm",
  "recommendationLetter",
  "schoolCredentials",
  "highSchoolDiploma",
  "transcript",
  "birthCertificate",
  "employmentCertificate",
  "nbiClearance",
] as const;

function parseApprovals(value: unknown): ApprovalEntry[] {
  if (!Array.isArray(value)) return [];
  const approvals: ApprovalEntry[] = [];

  for (const item of value) {
    if (!item || typeof item !== "object") continue;

    const obj = item as Record<string, unknown>;
    const documentId = String(obj.documentId ?? "").trim();
    const status = String(obj.status ?? "Pending") as DocumentApprovalStatus;
    if (!documentId) continue;

    approvals.push({
      documentId,
      status,
      remark: obj.remark ? String(obj.remark) : "",
      reviewedBy: obj.reviewedBy ? String(obj.reviewedBy) : "",
      reviewedAt: obj.reviewedAt ? String(obj.reviewedAt) : new Date().toISOString(),
    });
  }

  return approvals;
}

function resolveNextStatus(inputStatus: unknown, fallback: string): FormStatus {
  const value = String(inputStatus ?? "").trim();
  if (value === "Under Review") return "Under Review";
  if (value === "Reject") return "Reject";
  if (value === "Approve") return "Approve";
  if (value === "Draft") return "Draft";
  if (value === "Delete") return "Delete";

  if (fallback === "Under Review") return "Under Review";
  if (fallback === "Reject") return "Reject";
  if (fallback === "Approve") return "Approve";
  if (fallback === "Delete") return "Delete";
  return "Draft";
}

export async function POST(params: NextRequest) {
    try {

        const { email, page = 1, limit = 10 } = await params.json();

        if (!email) return NextResponse.json({ success: false, error: "Email not Exist" }, { status: 404 });

        const normalizedEmail = String(email).toLowerCase().trim();
        const isAdmin = normalizedEmail.includes("admin@admin.com");

        const currentPage = Math.max(Number(page) || 1, 1);
        const pageLimit = Math.max(Number(limit) || 10, 1);
        const from = (currentPage - 1) * pageLimit;
        const to = from + pageLimit - 1;

        let query = supabaseServer
          .from("form")
          .select("*", { count: "exact" })
          .order("created_at", { ascending: false });

        if (!isAdmin) {
          query = query.eq("email", email);
        }

        query = query.range(from, to);

        const { data, error, count } = await query;

        if (error) {
            return NextResponse.json({ success: false, error: error.message }, { status: 500 });
        }

        return NextResponse.json(
          {
            success: true,
            message: data,
            pagination: {
              page: currentPage,
              limit: pageLimit,
              total: count ?? 0,
              totalPages: Math.max(Math.ceil((count ?? 0) / pageLimit), 1),
            },
          },
          { status: 200 },
        );

    } catch (error) {
        console.error("Internal Server Error: " + error);
        return NextResponse.json({ success: false, error: error || "Something Went Wrong" }, { status: 500 });
    }
}

export async function PATCH(params: NextRequest) {
  try {
    const {
      id,
      form_status,
      documentId,
      documentStatus,
      remark,
      reviewedBy,
    } = await params.json();

    const rowId = Number(id);
    if (!rowId) {
      return NextResponse.json(
        { success: false, error: "Invalid form id" },
        { status: 400 },
      );
    }

    const { data: currentRow, error: readError } = await supabaseServer
      .from("form")
      .select("id, email, applicantName, form_status, forms_approvals, letterOfIntent, resume, picture, applicationForm, recommendationLetter, schoolCredentials, highSchoolDiploma, transcript, birthCertificate, employmentCertificate, nbiClearance")
      .eq("id", rowId)
      .single();

    if (readError || !currentRow) {
      return NextResponse.json(
        { success: false, error: readError?.message || "Form not found" },
        { status: 404 },
      );
    }

    const approvals = parseApprovals(currentRow.forms_approvals);

    if (documentId) {
      const nextEntry: ApprovalEntry = {
        documentId: String(documentId),
        status:
          String(documentStatus ?? "Pending") === "Verified"
            ? "Verified"
            : String(documentStatus ?? "Pending") === "Rejected"
              ? "Rejected"
              : "Pending",
        remark: String(remark ?? ""),
        reviewedBy: String(reviewedBy ?? ""),
        reviewedAt: new Date().toISOString(),
      };

      const existingIndex = approvals.findIndex(
        (entry) => entry.documentId === nextEntry.documentId,
      );
      if (existingIndex >= 0) {
        approvals[existingIndex] = nextEntry;
      } else {
        approvals.push(nextEntry);
      }

      await insertActivityLog(
        String(reviewedBy ?? ""),
        nextEntry.status === "Verified" ? "Verify Document" : nextEntry.status === "Rejected" ? "Reject Document" : "Update Document",
        `Form #${rowId} (${String(currentRow.applicantName ?? currentRow.email ?? "Unknown")}) document ${nextEntry.documentId} marked as ${nextEntry.status}${nextEntry.remark ? `. Remark: ${nextEntry.remark}` : ""}`,
      );
    }

    const approvalMap = new Map(
      approvals.map((entry) => [entry.documentId, entry.status]),
    );

    const allRequiredVerified = REQUIRED_DOCUMENT_KEYS.every((key) => {
      const hasFile = Boolean(currentRow[key]);
      const status = approvalMap.get(key);
      return hasFile && status === "Verified";
    });

    const fallbackStatus = String(currentRow.form_status ?? "Draft");
    let nextStatus = resolveNextStatus(form_status, fallbackStatus);
    if (allRequiredVerified && nextStatus !== "Delete") {
      nextStatus = "Approve";
    }

    if (String(form_status ?? "").trim() !== "" || allRequiredVerified) {
      const previousStatus = String(currentRow.form_status ?? "Draft").trim();
      const statusAction =
        nextStatus === "Delete"
          ? "Deleted Applicant"
          : previousStatus === "Delete"
            ? "Restored Applicant"
            : nextStatus === "Approve"
          ? "Accepted Applicant"
          : nextStatus === "Reject"
            ? "Rejected Applicant"
            : nextStatus === "Under Review"
              ? "Under Review Applicant"
              : "Draft Applicant";

      await insertActivityLog(
        String(reviewedBy ?? ""),
        statusAction,
        `Form #${rowId} (${String(currentRow.applicantName ?? currentRow.email ?? "Unknown")}) status updated to ${nextStatus}`,
      );
    }

    const { data: updatedRow, error: updateError } = await supabaseServer
      .from("form")
      .update({
        form_status: nextStatus,
        forms_approvals: approvals,
      })
      .eq("id", rowId)
      .select("*")
      .single();

    if (updateError) {
      return NextResponse.json(
        { success: false, error: updateError.message },
        { status: 500 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: updatedRow,
      },
      { status: 200 },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Something Went Wrong";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
