import type { Metadata } from "next";
import { Press_Start_2P } from "next/font/google";
import "./globals.css";

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
        {children}
      </body>
    </html>
  );
}
