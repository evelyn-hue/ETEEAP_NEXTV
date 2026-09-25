import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";
import { requireAuth, isAdminUser } from "@/lib/auth";

type ActivityLogAction =
  | "Deleted Applicant"
  | "Restored Applicant"
  | "Accepted Applicant"
  | "Rejected Applicant"
  | "On Hold Applicant"
  | "Under Review Applicant"
  | "Draft Applicant"
  | "Verify Document"
  | "Reject Document"
  | "Update Document"
  | "Remind Admin"
  | "Login"
  | "Logout"
  | "Update Profile"
  | "Update Profile Picture"
  | "Verified Alumni"
  | "Rejected Alumni";

export async function POST(params: NextRequest) {
  try {
    const authResult = await requireAuth(params);
    if (!authResult.ok) return authResult.response;

    const caller = authResult.user;
    const isCallerAdmin = isAdminUser(caller);

    const body = await params.json().catch(() => ({}));
    const {
      mode = "list",
      user,
      actions,
      details,
      search = "",
      action = "All Actions",
      date = "",
      page = 1,
      limit = 10,
    } = body;

    // Security: Audit logs are immutable. Delete mode is permanently disabled.
    if (mode === "delete") {
      return NextResponse.json(
        { success: false, error: "Audit logs are immutable and cannot be deleted" },
        { status: 403 }
      );
    }

    if (mode === "insert") {
      const targetUser = !isCallerAdmin || !user ? caller.email : String(user).trim().toLowerCase();
      const actionValue = String(actions ?? "").trim();
      const detailValue = String(details ?? "").trim();

      if (!actionValue || !detailValue) {
        return NextResponse.json(
          { success: false, error: "actions and details are required" },
          { status: 400 }
        );
      }

      const { data, error } = await supabaseServer
        .from("act_logs")
        .insert([
          {
            user: targetUser,
            actions: actionValue as ActivityLogAction,
            details: detailValue,
          },
        ])
        .select("*")
        .single();

      if (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
      }

      return NextResponse.json({ success: true, message: data }, { status: 200 });
    }

    // List mode
    const currentPage = Math.max(Number(page) || 1, 1);
    const pageLimit = Math.max(Number(limit) || 10, 1);
    const from = (currentPage - 1) * pageLimit;
    const to = from + pageLimit - 1;

    let query = supabaseServer
      .from("act_logs")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false });

    // Non-admin can only see notifications/logs for their own account
    if (!isCallerAdmin) {
      query = query.eq("user", caller.email);
    } else {
      const userValue = String(user ?? "").trim().toLowerCase();
      if (userValue) {
        query = query.eq("user", userValue);
      }
    }

    const searchValue = String(search).trim();
    if (searchValue) {
      const pattern = `%${searchValue}%`;
      query = query.or(`user.ilike.${pattern},actions.ilike.${pattern},details.ilike.${pattern}`);
    }

    const actionValue = String(action).trim();
    if (actionValue && actionValue !== "All Actions") {
      query = query.eq("actions", actionValue);
    }

    if (date) {
      const targetDate = new Date(date);
      if (!Number.isNaN(targetDate.getTime())) {
        const nextDay = new Date(targetDate);
        nextDay.setDate(nextDay.getDate() + 1);
        query = query
          .gte("created_at", targetDate.toISOString())
          .lt("created_at", nextDay.toISOString());
      }
    }

    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json(
      {
        success: true,
        message: data || [],
        pagination: {
          page: currentPage,
          limit: pageLimit,
          total: count ?? 0,
          totalPages: Math.max(Math.ceil((count ?? 0) / pageLimit), 1),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Activity log error:", error);
    return NextResponse.json(
      { success: false, error: "Something went wrong in activity logs" },
      { status: 500 }
    );
  }
}