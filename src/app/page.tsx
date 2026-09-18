import { LandoHeroSection } from "@/components/LandoHeroSection";
import { CustomSpiderCursor } from "@/components/CustomSpiderCursor";
import { Chapter2Section } from "@/components/Chapter2Section";
import { StickyHeader } from "@/components/StickyHeader";
import { SketchbookSection } from "@/components/SketchbookSection";

export default function Home() {
  return (
    <main className="w-full relative bg-black text-white select-none">
      {/* Spider-Sense Custom Precision Cursor */}
      <CustomSpiderCursor />

      {/* Sticky Global Top Header (Logo + Still Graphic + Sound Toggle) */}
      <StickyHeader />

      {/* Full-Screen Spider-Man Hero Stage with Scroll Zoom-Out (Screens 1 & 2) */}
      <Chapter2Section>
        <LandoHeroSection />
      </Chapter2Section>

      {/* Screen 3: 3D Interactive Sketchbook with LearnRyce PDF Brochure & Screen 2 Ferrofluid Background */}
      <SketchbookSection />
    </main>
  );
}
