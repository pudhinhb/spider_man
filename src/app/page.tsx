import { LandoHeroSection } from "@/components/LandoHeroSection";
import { CustomSpiderCursor } from "@/components/CustomSpiderCursor";

export default function Home() {
  return (
    <main className="w-full h-screen min-h-screen relative bg-black text-white overflow-hidden select-none">
      {/* Spider-Sense Custom Precision Cursor */}
      <CustomSpiderCursor />

      {/* Full-Screen Spider-Man Hero Stage */}
      <LandoHeroSection />
    </main>
  );
}
