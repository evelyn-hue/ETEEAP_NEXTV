export const supportedPrograms = [
  "Bachelor of Arts in English Language Studies",
  "Bachelor of Science in Business Administration - Marketing Management",
  "Bachelor of Science in Business Administration - Human Resource Management",
  "Bachelor of Science in Hospitality Management",
] as const;

export function getCourseAbbrev(course: string) {
  const map: Record<string, string> = {
    "Bachelor of Arts in English Language Studies": "BAELS",
    "Bachelor of Science in Business Administration - Marketing Management": "BSBA-MM",
    "Bachelor of Science in Business Administration - Human Resource Management": "BSBA-HRM",
    "Bachelor of Science in Hospitality Management": "BSHM",
  };

  return map[course] ?? course;
}

export function normalizeProgram(program?: string | null) {
  const value = String(program ?? "").trim().toLowerCase();

  if (!value) {
    return null;
  }

  if (value.includes("baels") || value.includes("english language studies")) {
    return supportedPrograms[0];
  }

  if ((value.includes("bsba") || value.includes("marketing")) && (value.includes("marketing") || value.includes("mm"))) {
    return supportedPrograms[1];
  }

  if ((value.includes("bsba") || value.includes("human resource")) && (value.includes("human resource") || value.includes("hrm"))) {
    return supportedPrograms[2];
  }

  if (value.includes("hospitality") || value.includes("bshm")) {
    return supportedPrograms[3];
  }

  return null;
}