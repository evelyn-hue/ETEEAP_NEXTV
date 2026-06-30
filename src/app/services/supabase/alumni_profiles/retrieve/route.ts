import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const email = searchParams.get("email");
    const status = searchParams.get("status");
    const limit = searchParams.get("limit") || "50";
    const offset = searchParams.get("offset") || "0";

    let query = supabaseServer
      .from("alumni_profiles")
      .select("*", { count: "exact" });

    if (email) {
      query = query.eq("email", email.trim().toLowerCase());
    }

    if (status) {
      query = query.eq("verification_status", status);
    }

    const { data, error, count } = await query
      .order("created_at", { ascending: false })
      .range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1);

    if (error) {
      console.error("Supabase retrieve error:", error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data,
        count,
        limit: parseInt(limit),
        offset: parseInt(offset),
      },
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

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, verification_status, remarks, email: bodyEmail } = body;

    // Support email-based lookup (used by Fetch_to which always sends POST)
    let lookupEmail = bodyEmail;
    if (!lookupEmail) {
      // Extract from JWT token
      const authHeader = req.headers.get("authorization");
      const cookieStore = await cookies();
      const cookieToken = cookieStore.get("token")?.value;
      const bearerToken = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
      const token = bearerToken || cookieToken;

      if (token) {
        try {
          const decoded = jwt.verify(token, process.env.JWT_SECRET || "") as { final_data?: { data?: Array<{ email?: string }> } };
          lookupEmail = decoded.final_data?.data?.[0]?.email;
        } catch { /* JWT decode failed — use cookie token */ }
      }
    }

    if (lookupEmail && !id) {
      let query = supabaseServer
        .from("alumni_profiles")
        .select("*", { count: "exact" })
        .eq("email", lookupEmail.trim().toLowerCase());

      const { data, error, count } = await query
        .order("created_at", { ascending: false })
        .limit(1);

      if (error) {
        return NextResponse.json(
          { success: false, error: error.message },
          { status: 500 }
        );
      }

      return NextResponse.json(
        { success: true, data, count },
        { status: 200 }
      );
    }

    if (!id || !verification_status) {
      return NextResponse.json(
        { success: false, error: "ID and verification status are required" },
        { status: 400 }
      );
    }

    const updateData: Record<string, unknown> = {
      verification_status,
    };

    if (remarks) {
      updateData.remarks = remarks;
    }

    const { data, error } = await supabaseServer
      .from("alumni_profiles")
      .update(updateData)
      .eq("id", id)
      .select();

    if (error) {
      console.error("Supabase update error:", error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, message: "Profile updated successfully", data },
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

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, verification_status, remarks } = body;

    if (!id || !verification_status) {
      return NextResponse.json(
        { success: false, error: "ID and verification status are required" },
        { status: 400 }
      );
    }

    const updateData: Record<string, unknown> = {
      verification_status,
    };

    if (remarks) {
      updateData.remarks = remarks;
    }

    const { data, error } = await supabaseServer
      .from("alumni_profiles")
      .update(updateData)
      .eq("id", id)
      .select();

    if (error) {
      console.error("Supabase update error:", error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, message: "Profile updated successfully", data },
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
