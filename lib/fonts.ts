import { Caveat, IBM_Plex_Mono, IBM_Plex_Sans, Lexend } from "next/font/google";

// Note: Futura PT Bold is loaded via Typekit as it's not available on Google Fonts
// The Typekit URL contains this font along with potentially others

export const lexend = Lexend({
  subsets: ["latin"],
  variable: "--font-lexend",
  display: "swap",
  weight: ["100", "200", "300"], // thin, extralight, light
});

export const ibmPlexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  variable: "--font-ibm-plex-sans",
  display: "swap",
  weight: ["400", "500", "600", "700"], // normal, medium, semibold, bold
});

export const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  variable: "--font-ibm-plex-mono",
  display: "swap",
  weight: ["400", "500", "600", "700"], // normal, medium, semibold, bold
});

export const caveat = Caveat({
  subsets: ["latin"],
  variable: "--font-caveat",
  display: "swap",
});
