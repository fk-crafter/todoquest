import type { Metadata } from "next";
import { Press_Start_2P } from "next/font/google";
import "./globals.css";
import SessionWrapper from "@/components/SessionWrapper";
import { AudioProvider } from "@/context/AudioContext";
import MusicToggleButton from "@/components/MusicToggleButton";

const pressStart = Press_Start_2P({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-press-start",
});

export const metadata: Metadata = {
  title: "TodoQuest",
  description: "Transforme tes tâches en aventure RPG !",
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
          <SessionWrapper>{children}</SessionWrapper>
        </AudioProvider>
      </body>
    </html>
  );
}
