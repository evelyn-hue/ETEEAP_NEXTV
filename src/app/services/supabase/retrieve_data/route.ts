import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

export async function POST(params: NextRequest) {
    try {

        const { email, page = 1, limit = 10 } = await params.json();

        if (!email) return NextResponse.json({ success: false, error: "Email not Exist" }, { status: 404 });

        const currentPage = Math.max(Number(page) || 1, 1);
        const pageLimit = Math.max(Number(limit) || 10, 1);
        const from = (currentPage - 1) * pageLimit;
        const to = from + pageLimit - 1;

        const query = supabaseServer
          .from("form")
          .select("*", { count: "exact" })
          .eq("email", email)
          .order("created_at", { ascending: false })
          .range(from, to);

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
