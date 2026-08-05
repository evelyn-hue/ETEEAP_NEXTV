import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";
import { sendStatusEmail } from "@/lib/resend";

type FormStatus = "Under Review" | "Reject" | "Approve" | "On Hold" | "Defer" | "Draft" | "Delete";
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

const ALL_DOCUMENT_KEYS = [
  ...REQUIRED_DOCUMENT_KEYS,
  "marriageCertificate",
  "businessRegistration",
  "certificates",
] as const;

const DOCUMENT_LABELS: Record<string, string> = {
  letterOfIntent: "Letter of Intent",
  resume: "Resume",
  picture: "Formal Picture",
  applicationForm: "Application Form",
  recommendationLetter: "Recommendation Letter",
  schoolCredentials: "School Credentials",
  highSchoolDiploma: "High School Diploma",
  transcript: "Transcript",
  birthCertificate: "Birth Certificate",
  marriageCertificate: "Marriage Certificate",
  employmentCertificate: "Employment Certificate",
  nbiClearance: "NBI Clearance",
  businessRegistration: "Business Registration",
  certificates: "Certificates",
};

function documentKeyToLabel(key: string) {
  return DOCUMENT_LABELS[key] ?? key;
}

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
  if (value === "On Hold") return "On Hold";
  if (value === "Defer") return "Defer";
  if (value === "Draft") return "Draft";
  if (value === "Delete") return "Delete";

  if (fallback === "Under Review") return "Under Review";
  if (fallback === "Reject") return "Reject";
  if (fallback === "Approve") return "Approve";
  if (fallback === "On Hold") return "On Hold";
  if (fallback === "Defer") return "Defer";
  if (fallback === "Delete") return "Delete";
  return "Draft";
}

async function getApplicantCivilStatus(email?: string | null) {
  const normalizedEmail = String(email ?? "").trim().toLowerCase();
  if (!normalizedEmail) return "";

  const { data, error } = await supabaseServer
    .from("auth")
    .select("civil_status")
    .eq("email", normalizedEmail)
    .maybeSingle();

  if (error) {
    console.error("Failed to fetch civil status:", error.message);
    return "";
  }

  return String(data?.civil_status ?? "");
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

        const statusOrder: Record<string, number> = {
          "Under Review": 0,
          "under review": 0,
          "On Hold": 1,
          "on hold": 1,
          "Defer": 2,
          "defer": 2,
          "Reject": 3,
          "reject": 3,
          "Approve": 4,
          "approve": 4,
          "Draft": 5,
          "draft": 5,
          "Delete": 6,
          "delete": 6,
        };

        const enrichedData = (await Promise.all(
          (data ?? []).map(async (row) => ({
            ...row,
            civil_status: await getApplicantCivilStatus(row.email),
          })),
        )).sort((a, b) => {
          const orderA = statusOrder[String(a.form_status ?? "")] ?? 99;
          const orderB = statusOrder[String(b.form_status ?? "")] ?? 99;
          return orderA - orderB;
        });

        return NextResponse.json(
          {
            success: true,
            message: enrichedData,
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
      .select("id, email, applicantName, form_status, forms_approvals, letterOfIntent, resume, picture, applicationForm, recommendationLetter, schoolCredentials, highSchoolDiploma, transcript, birthCertificate, employmentCertificate, nbiClearance, marriageCertificate, businessRegistration, certificates")
      .eq("id", rowId)
      .single();

    if (readError || !currentRow) {
      return NextResponse.json(
        { success: false, error: readError?.message || "Form not found" },
        { status: 404 },
      );
    }

    const approvals = parseApprovals(currentRow.forms_approvals);
    const requestedStatus = String(form_status ?? "").trim();
    const normalizedRequestedStatus = requestedStatus.toLowerCase();

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
        `Form #${rowId} (${String(currentRow.applicantName ?? currentRow.email ?? "Unknown")}) ${documentKeyToLabel(nextEntry.documentId)} marked as ${nextEntry.status}${nextEntry.remark ? `. Remark: ${nextEntry.remark}` : ""}`,
      );

      if (currentRow.email) {
        await insertActivityLog(
          String(currentRow.email),
          nextEntry.status === "Verified" ? "Verify Document" : nextEntry.status === "Rejected" ? "Reject Document" : "Update Document",
          `Your ${documentKeyToLabel(nextEntry.documentId)} was ${nextEntry.status.toLowerCase()}${String(reviewedBy ?? "") ? ` by ${String(reviewedBy).split('@')[0]}` : ""}${nextEntry.remark ? ` Remark: ${nextEntry.remark}` : ""}`,
        );
      }
    } else if (
      normalizedRequestedStatus === "approve" ||
      normalizedRequestedStatus === "approved" ||
      normalizedRequestedStatus === "reject" ||
      normalizedRequestedStatus === "rejected"
    ) {
      const bulkStatus = normalizedRequestedStatus === "approve" || normalizedRequestedStatus === "approved"
        ? "Verified"
        : "Rejected";

      for (const key of ALL_DOCUMENT_KEYS) {
        if (!currentRow[key]) continue;

        const nextEntry: ApprovalEntry = {
          documentId: key,
          status: bulkStatus,
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
      }

      await insertActivityLog(
        String(reviewedBy ?? ""),
        bulkStatus === "Verified" ? "Verify Document" : "Reject Document",
        `Form #${rowId} (${String(currentRow.applicantName ?? currentRow.email ?? "Unknown")}) all uploaded documents marked as ${bulkStatus}`,
      );

      if (currentRow.email) {
        await insertActivityLog(
          String(currentRow.email),
          bulkStatus === "Verified" ? "Verify Document" : "Reject Document",
          `All uploaded documents for your application were marked as ${bulkStatus}${String(reviewedBy ?? "") ? ` by ${String(reviewedBy).split('@')[0]}` : ""}.`,
        );
      }
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
            : nextStatus === "On Hold"
              ? "On Hold Applicant"
              : nextStatus === "Defer"
                ? "Defer Applicant"
                : nextStatus === "Under Review"
              ? "Under Review Applicant"
              : "Draft Applicant";

      await insertActivityLog(
        String(reviewedBy ?? ""),
        statusAction,
        `Form #${rowId} (${String(currentRow.applicantName ?? currentRow.email ?? "Unknown")}) status updated to ${nextStatus}`,
      );

      if (currentRow.email) {
        await insertActivityLog(
          String(currentRow.email),
          statusAction,
          `Your application status is now ${nextStatus}${String(reviewedBy ?? "") ? ` as processed by ${String(reviewedBy).split('@')[0]}` : ""}.`,
        );
      }

      if (currentRow.email && currentRow.applicantName) {
        try {
          await sendStatusEmail(
            currentRow.email,
            currentRow.applicantName,
            nextStatus,
            `Your application status has been updated to ${nextStatus} by the admin.`,
          );
        } catch {
          console.error("Failed to send status email to", currentRow.email);
        }
      }
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

    if (currentRow.email) {
      const applicantStatusForAuth =
        nextStatus === "Reject"
          ? "rejected"
          : nextStatus === "Approve"
            ? "accepted"
            : nextStatus === "Under Review"
              ? "submitted"
              : nextStatus === "On Hold"
                ? "submitted"
                : nextStatus === "Defer"
                  ? "submitted"
                  : "draft";

      await supabaseServer
        .from("auth")
        .update({ applicant_status: applicantStatusForAuth })
        .eq("email", currentRow.email);
    }

    const civilStatus = await getApplicantCivilStatus(currentRow.email);

    return NextResponse.json(
      {
        success: true,
        message: { ...updatedRow, civil_status: civilStatus },
      },
      { status: 200 },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Something Went Wrong";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
