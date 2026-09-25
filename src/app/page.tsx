import { LandoHeroSection } from "@/components/LandoHeroSection";
import { CustomSpiderCursor } from "@/components/CustomSpiderCursor";
import { Chapter2Section } from "@/components/Chapter2Section";
import { CreativeThingsSection } from "@/components/CreativeThingsSection";
import { AboutMeSection } from "@/components/AboutMeSection";
import { SmoothScrollProvider } from "@/components/SmoothScrollProvider";
import { DesignShowcaseSection } from "@/components/DesignShowcaseSection";
// import { SketchbookSection } from "@/components/SketchbookSection";
// import { StickyHeader } from "@/components/StickyHeader";

export default function Home() {
  return (
    <SmoothScrollProvider>
      <main className="w-full relative bg-black select-none">
        {/* Spider-Sense Custom Precision Cursor */}
        <CustomSpiderCursor />

        {/* Full-Screen Spider-Man Hero Stage with Scroll Zoom-Out (Section 1 & 2) */}
        <Chapter2Section>
          <LandoHeroSection />
        </Chapter2Section>

        {/* Unified White Canvas Area for Section 3 + Section 4 */}
        <div id="white-canvas-wrapper" className="relative w-full bg-white overflow-hidden select-none">
          {/* Continuous Dotted Grid Pattern across Section 3 & Section 4 */}
          <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
            <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern
                  id="unified-dotted-grid"
                  width="32"
                  height="32"
                  patternUnits="userSpaceOnUse"
                >
                  <circle cx="16" cy="16" r="1.25" fill="#000000" opacity="0.16" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#unified-dotted-grid)" />
            </svg>
          </div>

          {/* Section 3: Editorial Vision ("We make Creative Things.") */}
          <CreativeThingsSection />

          {/* Section 4: About Me Interactive Scrapbook Stage */}
          <AboutMeSection />
        </div>

        {/* Section 5: The Way Design Should've Been Done (Dark Glassmorphic Cards) */}
        <DesignShowcaseSection />

        {/* Section 6: 3D Interactive Flipbook & Loupe Gallery Stage */}
        {/* <SketchbookSection /> */}
      </main>
    </SmoothScrollProvider>
  );
}
