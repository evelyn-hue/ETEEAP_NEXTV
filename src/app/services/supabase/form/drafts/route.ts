import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");
    const email = String(formData.get("email") ?? "");
    const documentType = String(formData.get("documentType") ?? "");
    const applicantName = String(formData.get("applicantName") ?? "");
    const businessName = String(formData.get("businessName") ?? "");
    const isBusinessOwner = String(formData.get("isBusinessOwner") ?? "No");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { success: false, error: "No file provided" },
        { status: 400 },
      );
    }

    if (!email) {
      return NextResponse.json(
        { success: false, error: "Email is required" },
        { status: 400 },
      );
    }

    if (!documentType) {
      return NextResponse.json(
        { success: false, error: "Document type is required" },
        { status: 400 },
      );
    }

    const bucketName = "Form_Data";
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

    const rowData: Record<string, string> = {
      email,
      applicantName,
      isBusinessOwner,
      businessName,
    };
    rowData[documentType] = filePath;

    const { data: existingRow, error: selectError } = await supabaseServer
      .from("draft")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    if (selectError) {
      return NextResponse.json(
        { success: false, error: selectError.message },
        { status: 500 },
      );
    }

    if (existingRow?.id) {
      const { error: updateError } = await supabaseServer
        .from("draft")
        .update(rowData)
        .eq("id", existingRow.id);

      if (updateError) {
        return NextResponse.json(
          { success: false, error: updateError.message },
          { status: 500 },
        );
      }
    } else {
      const { error: insertError } = await supabaseServer.from("form").insert([
        rowData,
      ]);

      if (insertError) {
        return NextResponse.json(
          { success: false, error: insertError.message },
          { status: 500 },
        );
      }
    }

    return NextResponse.json(
      { success: true, message: "Submitted Successfully", filePath },
      { status: 200 },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
