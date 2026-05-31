"use client";

import ProgramDetails from "@/components/form/programdetails";
import {Footer, Header} from "@/components/landpage";

export default function ProgramDetailsPage() {
  return (
    <main>
      <Header />
      <ProgramDetails programName="Your Program Name" />
      <Footer />
    </main>
  );
}