// This file is kept for backwards compatibility
// Import from the dynamic [id] route instead
import { redirect } from "next/navigation";

export default function ApplicationStatusPage() {
  // Redirect to prevent confusion - this route needs an ID
  redirect("/form");
}

