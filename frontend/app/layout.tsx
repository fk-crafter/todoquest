import type { Metadata } from "next";
import { Press_Start_2P } from "next/font/google";
import "./globals.css";
import SessionWrapper from "@/components/SessionWrapper";
import { AudioProvider } from "@/context/AudioContext";
import MusicToggleButton from "@/components/MusicToggleButton";
import QueryProvider from "@/components/QueryProvider";
import OnboardingGuard from "@/components/OnboardingGuard";
import ThemeProvider from "@/components/ThemeProvider";
// 👇 Import du composant PWA
import RegisterServiceWorker from "@/components/RegisterServiceWorker";

const pressStart = Press_Start_2P({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-press-start",
});

export const metadata: Metadata = {
  title: "TodoQuest",
  description: "Transforme tes tâches en aventure RPG !",
  icons: {
    icon: { url: "/favicon.png", sizes: "any" },
    apple: { url: "/favicon.png" },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <head>
        <link rel="icon" href="/favicon.png" type="image/png" />
        <link rel="manifest" href="/manifest.json" />

        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no"
        />
        <meta name="theme-color" content="#111827" />

        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        />
        <meta name="apple-mobile-web-app-title" content="TodoQuest" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
      </head>

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
