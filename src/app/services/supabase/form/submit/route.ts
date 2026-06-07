import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

type UploadItem = {
  file: File;
  documentType: string;
};

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const email = String(formData.get("email") ?? "");
    const applicantName = String(formData.get("applicantName") ?? "");
    const businessName = String(formData.get("businessName") ?? "");
    const isBusinessOwner = String(formData.get("isBusinessOwner") ?? "No");
    const form_status = String(formData.get("form_status") ?? "draft");

    if (!email) {
      return NextResponse.json(
        { success: false, error: "Email is required" },
        { status: 400 },
      );
    }

    const uploadItems: UploadItem[] = [];

    const singleFile = formData.get("file");
    const singleDocumentType = String(formData.get("documentType") ?? "");
    if (singleFile instanceof File) {
      if (!singleDocumentType) {
        return NextResponse.json(
          { success: false, error: "Document type is required" },
          { status: 400 },
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
          { status: 400 },
        );
      }

      batchFiles.forEach((file, index) => {
        uploadItems.push({ file, documentType: batchDocumentTypes[index] });
      });
    }

    if (uploadItems.length === 0) {
      return NextResponse.json(
        { success: false, error: "No file provided" },
        { status: 400 },
      );
    }

    const bucketName = "Form_Data";
    const rowData: Record<string, string> = {
      email,
      applicantName,
      isBusinessOwner,
      businessName,
      form_status,
    };

    for (const { file, documentType } of uploadItems) {
      if (!documentType) {
        return NextResponse.json(
          { success: false, error: "Document type is required" },
          { status: 400 },
        );
      }

      const filePath = `${email}/${documentType}/${Date.now()}-${file.name}`;

      const { error: uploadError } = await supabaseServer.storage
        .from(bucketName)
        .upload(filePath, file, {
          contentType: file.type || "application/pdf",
          upsert: false,
        });

      if (uploadError) {
        return NextResponse.json(
          { success: false, error: uploadError.message },
          { status: 500 },
        );
      }

      rowData[documentType] = filePath;
    }

    const { error: insertError } = await supabaseServer
    .from("form")
    .insert([rowData]);

    if (insertError) {
    return NextResponse.json(
        { success: false, error: insertError.message },
        { status: 500 },
    );
    }

    return NextResponse.json(
      { success: true, message: "Submitted Successfully" },
      { status: 200 },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 },
    );
  }
}
