import { LandoHeroSection } from "@/components/LandoHeroSection";
import { CustomSpiderCursor } from "@/components/CustomSpiderCursor";
import { Chapter2Section } from "@/components/Chapter2Section";
import { StickyHeader } from "@/components/StickyHeader";

export default function Home() {
  return (
    <main className="w-full relative bg-black text-white select-none">
      {/* Spider-Sense Custom Precision Cursor */}
      <CustomSpiderCursor />

      {/* Sticky Global Top Header (Logo + Still Graphic + Sound Toggle) */}
      <StickyHeader />

      {/* Full-Screen Spider-Man Hero Stage with Scroll Zoom-Out */}
      <Chapter2Section>
        <LandoHeroSection />
      </Chapter2Section>
    </main>
  );
}
