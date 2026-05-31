"use client";

import { Courses } from "@/components/courses";
import {Footer, Header} from "@/components/landpage";

export default function CoursesPage() {
  return (
    <main>
      <Header />
      <Courses />
      <Footer />
    </main>
  );
}