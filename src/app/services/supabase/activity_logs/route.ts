import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

type ActivityLogAction =
	| "Deleted Applicant"
	| "Restored Applicant"
	| "Accepted Applicant"
	| "Rejected Applicant"
	| "Under Review Applicant"
	| "Draft Applicant"
	| "Verify Document"
	| "Reject Document"
	| "Update Document"
	| "Login"
	| "Logout"
	| "Update Profile"
	| "Update Profile Picture";

export async function POST(params: NextRequest) {
	try {
		const {
			mode = "list",
			id,
			user,
			actions,
			details,
			search = "",
			action = "All Actions",
			date = "",
			page = 1,
			limit = 10,
		} = await params.json();

		if (mode === "insert") {
			const actor = String(user ?? "").trim();
			const actionValue = String(actions ?? "").trim();
			const detailValue = String(details ?? "").trim();

			if (!actor || !actionValue || !detailValue) {
				return NextResponse.json(
					{ success: false, error: "user, actions, and details are required" },
					{ status: 400 },
				);
			}

			const { data, error } = await supabaseServer
				.from("act_logs")
				.insert([
					{
						user: actor,
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

		if (mode === "delete") {
			const rowId = Number(id);
			if (!rowId) {
				return NextResponse.json(
					{ success: false, error: "Invalid activity log id" },
					{ status: 400 },
				);
			}

			const { error } = await supabaseServer.from("act_logs").delete().eq("id", rowId);
			if (error) {
				return NextResponse.json({ success: false, error: error.message }, { status: 500 });
			}

			return NextResponse.json({ success: true, message: "Deleted" }, { status: 200 });
		}

		const currentPage = Math.max(Number(page) || 1, 1);
		const pageLimit = Math.max(Number(limit) || 10, 1);
		const from = (currentPage - 1) * pageLimit;
		const to = from + pageLimit - 1;

		let query = supabaseServer
			.from("act_logs")
			.select("*", { count: "exact" })
			.order("created_at", { ascending: false });

		const userValue = String(user ?? "").trim();
		if (userValue) {
			query = query.eq("user", userValue);
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

		const dateValue = String(date).trim();
		if (dateValue) {
			query = query
				.gte("created_at", `${dateValue}T00:00:00.000Z`)
				.lt("created_at", `${dateValue}T23:59:59.999Z`);
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
		const message = error instanceof Error ? error.message : "Something Went Wrong";
		return NextResponse.json({ success: false, error: message }, { status: 500 });
	}
}