import type { Metadata, Viewport } from "next";
import { Press_Start_2P } from "next/font/google";
import "../globals.css";
import SessionWrapper from "@/components/SessionWrapper";
import { AudioProvider } from "@/context/AudioContext";
import MusicToggleButton from "@/components/MusicToggleButton";
import QueryProvider from "@/components/QueryProvider";
import OnboardingGuard from "@/components/OnboardingGuard";
import ThemeProvider from "@/components/ThemeProvider";
import RegisterServiceWorker from "@/components/RegisterServiceWorker";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations } from "next-intl/server";
import { TutorialProvider } from "@/context/TutorialContext";

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

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Metadata" });

  return {
    metadataBase: new URL("https://to-doquest.vercel.app"),
    title: {
      default: t("title"),
      template: "%s | TodoQuest",
    },
    description: t("description"),
    applicationName: "TodoQuest",
    authors: [{ name: "FK-Crafter" }],
    keywords: [
      "todo list",
      "rpg",
      "gamification",
      "productivité",
      "jeu",
      "tâches",
    ],
    manifest: "/manifest.json",
    icons: {
      icon: "/favicon.png",
      apple: "/icon-192.png",
    },
    openGraph: {
      title: t("title"),
      description: t("ogDescription"),
      url: "/",
      siteName: "TodoQuest",
      locale: locale === "fr" ? "fr_FR" : "en_US",
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
      title: t("title"),
      description: t("twitterDescription"),
      images: ["/og-image.png"],
    },
    appleWebApp: {
      capable: true,
      statusBarStyle: "black-translucent",
      title: "TodoQuest",
    },
  };
}

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body
        className={`${pressStart.variable} bg-gray-900 text-white min-h-screen font-press`}
      >
        <NextIntlClientProvider messages={messages}>
          <AudioProvider>
            <MusicToggleButton />
            <SessionWrapper>
              <QueryProvider>
                <ThemeProvider>
                  <TutorialProvider>
                    <OnboardingGuard>{children}</OnboardingGuard>
                  </TutorialProvider>
                </ThemeProvider>
              </QueryProvider>
            </SessionWrapper>
          </AudioProvider>

          <RegisterServiceWorker />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
