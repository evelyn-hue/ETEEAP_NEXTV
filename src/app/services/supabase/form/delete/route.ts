import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

export async function POST(req: NextRequest) {
  try {
    const { id, email } = await req.json();

    if (!id || !email) {
      return NextResponse.json(
        { success: false, message: "ID and email are required" },
        { status: 400 },
      );
    }

    // Delete the form submission from the database
    const { error } = await supabaseServer
      .from("form")
      .delete()
      .eq("id", id)
      .eq("email", email);

    if (error) {
      console.error("Delete error:", error);
      return NextResponse.json(
        { success: false, message: error.message || "Failed to delete form" },
        { status: 500 },
      );
    }

    return NextResponse.json(
      { success: true, message: "Form deleted successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Delete handler error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}
