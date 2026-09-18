import { LandoHeroSection } from "@/components/LandoHeroSection";
import { CustomSpiderCursor } from "@/components/CustomSpiderCursor";
import { Chapter2Section } from "@/components/Chapter2Section";
import { CreativeThingsSection } from "@/components/CreativeThingsSection";
import { StickyHeader } from "@/components/StickyHeader";
// import { SketchbookSection } from "@/components/SketchbookSection";

export default function Home() {
  return (
    <main className="w-full relative bg-black select-none">
      {/* Spider-Sense Custom Precision Cursor */}
      <CustomSpiderCursor />

      {/* Sticky Global Top Header (Logo + Still Graphic + Sound Toggle) */}
      <StickyHeader />

      {/* Full-Screen Spider-Man Hero Stage with Scroll Zoom-Out (Section 1 & 2) */}
      <Chapter2Section>
        <LandoHeroSection />
      </Chapter2Section>

      {/* Section 3: Editorial Vision ("We make Creative Things.") */}
      <CreativeThingsSection />

      {/* Screen 3: 3D Interactive Sketchbook (Extracted to reusable <SketchbookWidget />) */}
      {/* <SketchbookSection /> */}
    </main>
  );
}
