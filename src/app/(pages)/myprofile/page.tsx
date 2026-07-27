"use client";
import InteriorPage from "@/components/shared/InteriorPage";
import { Myprofile } from "@/components/myprofile";

export default function MyProfilePage() {
  return (
    <InteriorPage showFooter={false}>
      <Myprofile />
    </InteriorPage>
  );
}
