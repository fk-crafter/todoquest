import type { Metadata, Viewport } from "next";
import { Press_Start_2P } from "next/font/google";
import "./globals.css";
import SessionWrapper from "@/components/SessionWrapper";
import { AudioProvider } from "@/context/AudioContext";
import MusicToggleButton from "@/components/MusicToggleButton";
import QueryProvider from "@/components/QueryProvider";
import OnboardingGuard from "@/components/OnboardingGuard";
import ThemeProvider from "@/components/ThemeProvider";
import RegisterServiceWorker from "@/components/RegisterServiceWorker";

const pressStart = Press_Start_2P({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-press-start",
});

export const viewport: Viewport = {
  themeColor: "#111827",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  metadataBase: new URL("https://to-doquest.vercel.app"),
  title: {
    default: "TodoQuest | Transforme ta vie en RPG",
    template: "%s | TodoQuest",
  },
  description:
    "L'application de productivité gamifiée. Gagne de l'XP, monte de niveau et collectionne des équipements en accomplissant tes tâches quotidiennes.",
  applicationName: "TodoQuest",
  authors: [{ name: "FK-Crafter" }],
  keywords: ["todo list", "rpg", "gamification", "productivité", "jeu", "tâches"],
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.png",
    apple: "/icon-192.png", 
  },
  openGraph: {
    title: "TodoQuest | Transforme ta vie en RPG",
    description: "Arrête de procrastiner. Gagne de l'XP à chaque tâche accomplie !",
    url: "/",
    siteName: "TodoQuest",
    locale: "fr_FR",
    type: "website",
    images: [
      {
        url: "/og-image.png", 
        width: 1200,
        height: 630,
        alt: "TodoQuest Aperçu",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "TodoQuest | Transforme ta vie en RPG",
    description: "Gagne de l'XP en accomplissant tes tâches quotidiennes.",
    images: ["/og-image.png"], 
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "TodoQuest",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body
        className={`${pressStart.variable} bg-gray-900 text-white min-h-screen font-press`}
      >
        <AudioProvider>
          <MusicToggleButton />
          <SessionWrapper>
            <QueryProvider>
              <ThemeProvider>
                <OnboardingGuard>{children}</OnboardingGuard>
              </ThemeProvider>
            </QueryProvider>
          </SessionWrapper>
        </AudioProvider>

        <RegisterServiceWorker />
      </body>
    </html>
  );
}