import type { Metadata } from "next";
import {
  Geist,
  Geist_Mono,
  Space_Grotesk,
  Syne,
  Playfair_Display,
  Sora,
  Marvel,
  Bebas_Neue,
  Permanent_Marker,
  Cabin_Sketch,
  Caveat,
  Pacifico,
  Cinzel,
  Righteous,
  Silkscreen,
  Orbitron,
  Anek_Tamil,
} from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
  weight: ["300", "400", "600", "700", "800"],
});

const marvelFont = Marvel({
  variable: "--font-marvel",
  subsets: ["latin"],
  weight: ["400", "700"],
});

const bebasNeue = Bebas_Neue({
  variable: "--font-bebas",
  subsets: ["latin"],
  weight: "400",
});

const permanentMarker = Permanent_Marker({
  variable: "--font-handwritten",
  subsets: ["latin"],
  weight: "400",
});

const cabinSketch = Cabin_Sketch({
  variable: "--font-sketch",
  subsets: ["latin"],
  weight: ["400", "700"],
});

const caveat = Caveat({
  variable: "--font-caveat",
  subsets: ["latin"],
  weight: ["400", "700"],
});

const pacifico = Pacifico({
  variable: "--font-pacifico",
  subsets: ["latin"],
  weight: "400",
});

const cinzel = Cinzel({
  variable: "--font-cinzel",
  subsets: ["latin"],
  weight: ["400", "700"],
});

const righteous = Righteous({
  variable: "--font-righteous",
  subsets: ["latin"],
  weight: "400",
});

const silkscreen = Silkscreen({
  variable: "--font-silkscreen",
  subsets: ["latin"],
  weight: ["400", "700"],
});

const orbitron = Orbitron({
  variable: "--font-orbitron",
  subsets: ["latin"],
  weight: ["400", "700", "900"],
});

const anekTamil = Anek_Tamil({
  variable: "--font-anek-tamil",
  subsets: ["latin", "tamil"],
  weight: ["400", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "GG. — Full-Stack Architect & Spider-Man Portfolio",
  description:
    "High-end editorial creative developer portfolio inspired by Spider-Man and cinematic 3D wireframe kinetics.",
  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.png",
    apple: "/favicon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${spaceGrotesk.variable} ${syne.variable} ${playfair.variable} ${sora.variable} ${marvelFont.variable} ${bebasNeue.variable} ${permanentMarker.variable} ${cabinSketch.variable} ${caveat.variable} ${pacifico.variable} ${cinzel.variable} ${righteous.variable} ${silkscreen.variable} ${orbitron.variable} ${anekTamil.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans bg-black text-white overflow-x-hidden selection:bg-red-600 selection:text-white">
        {children}
      </body>
    </html>
  );
}
