import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";
import { requireAuth, isAdminUser } from "@/lib/auth";
import { ALLOWED_MIME_TYPES, MAX_FILE_SIZE } from "@/lib/documents";

type UploadItem = {
  file: File;
  documentType: string;
};

export async function POST(req: NextRequest) {
  try {
    const authResult = await requireAuth(req);
    if (!authResult.ok) return authResult.response;

    const caller = authResult.user;
    const isCallerAdmin = isAdminUser(caller);

    const formData = await req.formData();
    const providedEmail = String(formData.get("email") ?? "").trim().toLowerCase();

    // Enforce email ownership: regular users can only submit under their own verified email
    const email = !isCallerAdmin || !providedEmail ? caller.email : providedEmail;
    const applicantName = String(formData.get("applicantName") ?? caller.fullName ?? "");
    const businessName = String(formData.get("businessName") ?? "");
    const isBusinessOwner = String(formData.get("isBusinessOwner") ?? "No");
    const rawStatus = String(formData.get("form_status") ?? "Under Review").trim();
    const programName = String(formData.get("programName") ?? "");

    // Business rule: Regular applicants can only set "Under Review" or "draft", never "Approve"
    const allowedApplicantStatuses = ["Under Review", "draft", "Draft"];
    const form_status =
      !isCallerAdmin && !allowedApplicantStatuses.includes(rawStatus)
        ? "Under Review"
        : rawStatus;

    if (!email) {
      return NextResponse.json(
        { success: false, error: "Email is required" },
        { status: 400 }
      );
    }

    const uploadItems: UploadItem[] = [];

    const singleFile = formData.get("file");
    const singleDocumentType = String(formData.get("documentType") ?? "");
    if (singleFile instanceof File) {
      if (!singleDocumentType) {
        return NextResponse.json(
          { success: false, error: "Document type is required" },
          { status: 400 }
        );
      }
      uploadItems.push({ file: singleFile, documentType: singleDocumentType });
    }

    const batchFiles = formData
      .getAll("files")
      .filter((value): value is File => value instanceof File);
    const batchDocumentTypes = formData
      .getAll("documentTypes")
      .map((value) => String(value));

    if (batchFiles.length > 0) {
      if (batchFiles.length !== batchDocumentTypes.length) {
        return NextResponse.json(
          {
            success: false,
            error: "Each uploaded file must have a matching document type",
          },
          { status: 400 }
        );
      }

      batchFiles.forEach((file, index) => {
        uploadItems.push({ file, documentType: batchDocumentTypes[index] });
      });
    }

    if (uploadItems.length === 0) {
      return NextResponse.json(
        { success: false, error: "No file provided" },
        { status: 400 }
      );
    }

    for (const { file } of uploadItems) {
      if (!ALLOWED_MIME_TYPES.includes(file.type)) {
        return NextResponse.json(
          { success: false, error: `File "${file.name}" is not an accepted type. Please upload PDF, JPG, or PNG only.` },
          { status: 400 }
        );
      }
      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { success: false, error: `File "${file.name}" exceeds the 5MB limit.` },
          { status: 400 }
        );
      }
    }

    const bucketName = "Form_Data";
    const rowData: Record<string, string> = {
      email,
      applicantName,
      isBusinessOwner,
      businessName,
      form_status,
      program: programName,
    };

    for (const { file, documentType } of uploadItems) {
      if (!documentType) {
        return NextResponse.json(
          { success: false, error: "Document type is required" },
          { status: 400 }
        );
      }

      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
      const filePath = `${email}/${documentType}/${Date.now()}-${safeName}`;

      const { error: uploadError } = await supabaseServer.storage
        .from(bucketName)
        .upload(filePath, file, {
          contentType: file.type || "application/pdf",
          upsert: false,
        });

      if (uploadError) {
        return NextResponse.json(
          { success: false, error: uploadError.message },
          { status: 500 }
        );
      }

      const { data: publicUrlData } = supabaseServer.storage
        .from(bucketName)
        .getPublicUrl(filePath);

      if (rowData[documentType]) {
        rowData[documentType] = `${rowData[documentType]}, ${publicUrlData.publicUrl}`;
      } else {
        rowData[documentType] = publicUrlData.publicUrl;
      }
    }

    const { data: existingApplication, error: existingApplicationError } =
      await supabaseServer
        .from("form")
        .select("id, forms_approvals")
        .eq("email", email)
        .maybeSingle();

    if (existingApplicationError) {
      return NextResponse.json(
        { success: false, error: existingApplicationError.message },
        { status: 500 }
      );
    }

    // If re-uploading a previously rejected doc, reset its approval to Pending so admin can re-review
    let approvalUpdate: Record<string, unknown> | null = null;
    if (existingApplication && Array.isArray((existingApplication as { forms_approvals?: unknown }).forms_approvals)) {
      const existingApprovals = (existingApplication as { forms_approvals: unknown[] }).forms_approvals;
      const reuploadedTypes = new Set(uploadItems.map((u) => u.documentType));
      let changed = false;
      const nextApprovals = existingApprovals.map((entry) => {
        if (!entry || typeof entry !== "object") return entry;
        const obj = entry as Record<string, unknown>;
        const docId = String(obj.documentId ?? "");
        if (!reuploadedTypes.has(docId)) return entry;
        if (String(obj.status) !== "Rejected") return entry;
        changed = true;
        return { ...obj, status: "Pending", remark: "", reviewedAt: new Date().toISOString() };
      });
      if (changed) approvalUpdate = { forms_approvals: nextApprovals } as Record<string, unknown>;
    }

    const updateData: Record<string, unknown> = approvalUpdate ? { ...rowData, ...approvalUpdate } : rowData;

    const { error: saveError } = existingApplication
      ? await supabaseServer
          .from("form")
          .update(updateData)
          .eq("id", existingApplication.id)
      : await supabaseServer
          .from("form")
          .insert([rowData]);

    if (saveError) {
      return NextResponse.json(
        { success: false, error: saveError.message },
        { status: 500 }
      );
    }

    const nextApplicantStatus = form_status === "draft" || form_status === "Draft" ? "draft" : "submitted";
    const { error: authUpdateError } = await supabaseServer
      .from("auth")
      .update({ applicant_status: nextApplicantStatus })
      .eq("email", email);

    if (authUpdateError) {
      return NextResponse.json(
        { success: false, error: authUpdateError.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, message: "Submitted Successfully" },
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
