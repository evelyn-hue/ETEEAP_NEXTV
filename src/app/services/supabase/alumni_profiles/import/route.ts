import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

function parseCSV(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (inQuotes) {
      if (char === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += char;
      }
    } else if (char === '"') {
      inQuotes = true;
    } else if (char === ",") {
      row.push(field);
      field = "";
    } else if (char === "\n" || char === "\r") {
      if (char === "\r" && text[i + 1] === "\n") i++;
      row.push(field);
      field = "";
      if (row.some((cell) => cell.trim() !== "")) rows.push(row);
      row = [];
    } else {
      field += char;
    }
  }
  row.push(field);
  if (row.some((cell) => cell.trim() !== "")) rows.push(row);
  return rows;
}

function splitPrograms(value: string | undefined): string[] {
  return String(value ?? "")
    .split(/[;|]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No file uploaded" },
        { status: 400 }
      );
    }

    const text = await file.text();
    const rows = parseCSV(text);
    if (rows.length < 2) {
      return NextResponse.json(
        { success: false, error: "CSV must have a header row and at least one data row" },
        { status: 400 }
      );
    }

    const header = rows[0].map((h) => h.trim().toLowerCase());
    const colIndex = (name: string) => header.indexOf(name);
    const nameCol = colIndex("full_name");
    const emailCol = colIndex("email");
    const yearCol = colIndex("graduation_year");
    const programsCol = colIndex("programs");

    if (nameCol === -1 || emailCol === -1) {
      return NextResponse.json(
        {
          success: false,
          error: 'CSV must include "full_name" and "email" columns (optional: "graduation_year", "programs" separated by ;)',
        },
        { status: 400 }
      );
    }

    const records = rows.slice(1).map((row) => ({
      full_name: String(row[nameCol] ?? "").trim(),
      email: String(row[emailCol] ?? "").trim().toLowerCase(),
      graduation_year: yearCol !== -1 ? String(row[yearCol] ?? "").trim() : "",
      programs: programsCol !== -1 ? splitPrograms(row[programsCol]) : [],
    }));

    const valid = records.filter((record) => record.full_name && record.email);
    if (valid.length === 0) {
      return NextResponse.json(
        { success: false, error: "No valid rows with full_name and email found" },
        { status: 400 }
      );
    }

    let imported = 0;
    let skipped = 0;
    const errors: string[] = [];

    for (const record of valid) {
      const { data: existing } = await supabaseServer
        .from("alumni_profiles")
        .select("id")
        .eq("email", record.email)
        .limit(1);

      if (existing && existing.length > 0) {
        skipped += 1;
        continue;
      }

      const { error: insertError } = await supabaseServer
        .from("alumni_profiles")
        .insert([
          {
            full_name: record.full_name,
            email: record.email,
            graduation_year: record.graduation_year || null,
            programs: record.programs,
            is_graduate: true,
            verification_status: "verified",
            visibility: "public",
          },
        ]);

      if (insertError) {
        errors.push(`${record.email}: ${insertError.message}`);
      } else {
        imported += 1;
      }
    }

    return NextResponse.json(
      {
        success: true,
        data: { imported, skipped, errors },
        message: `Imported ${imported}, skipped ${skipped} (duplicates)${errors.length ? `, ${errors.length} errors` : ""}`,
      },
      { status: 200 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("CSV import error:", message);
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}