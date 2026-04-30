"use client";

import { Banner, Footer, Header } from "@/components/landpage";
import imgSrc from "@/config/img_src.json";
import Image from "next/image";

export default function LandPage() {
  return (
    <main> 
      <Image src={imgSrc.logo} alt="logo" width={100} height={100} />
      <Header />
      <Banner />
      <h1>Landpage</h1>
      <Footer />
    </main>
  );
}