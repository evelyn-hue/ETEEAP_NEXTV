import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

const REQUIRED_DOCUMENTS = [
  "letterOfIntent",
  "resume",
  "picture",
  "applicationForm",
  "schoolCredentials",
  "highSchoolDiploma",
  "transcript",
  "birthCertificate",
  "nbiClearance",
];

async function extractToken(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.slice(7);
  }
  const cookieStore = await cookies();
  return cookieStore.get("token")?.value;
}

export async function POST(req: NextRequest) {
  try {
    const token = await extractToken(req);
    if (!token) {
      return NextResponse.json({ success: false, error: "Authentication required" }, { status: 401 });
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return NextResponse.json({ success: false, error: "Server misconfiguration" }, { status: 500 });
    }

    const decoded = jwt.verify(token, secret) as { final_data?: { data?: Array<{ id?: string; email?: string }> } };
    const userEmail = decoded.final_data?.data?.[0]?.email;
    if (!userEmail) {
      return NextResponse.json({ success: false, error: "Authenticated user not found" }, { status: 401 });
    }

    const { data, error } = await supabaseServer
      .from("form")
      .select("*, id")
      .eq("email", userEmail)
      .limit(1);

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    const application = data?.[0] ?? null;
    if (!application) {
      return NextResponse.json({ success: true, data: null }, { status: 200 });
    }

    const requiredCount = REQUIRED_DOCUMENTS.reduce((count, key) => {
      return count + (application[key] ? 1 : 0);
    }, 0);

    return NextResponse.json(
      {
        success: true,
        data: application,
        meta: {
          requiredDocumentCount: REQUIRED_DOCUMENTS.length,
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
