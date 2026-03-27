"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { Gamepad2 } from "lucide-react";

import Hero from "@/components/Hero";
import ProblemSection from "@/components/ProblemSection";
import HowItWorksSection from "@/components/HowItWorksSection";
import SocialProofSection from "@/components/SocialProofSection";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { status } = useSession();
  const tLanding = useTranslations("Landing");

  useGSAP(
    () => {
      const sections = gsap.utils.toArray(".reveal-section");

      sections.forEach((section: any) => {
        gsap.from(section, {
          y: 60,
          opacity: 0,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: {
            trigger: section,
            start: "top 85%",
            toggleActions: "play none none reverse",
          },
        });
      });
    },
    { scope: containerRef },
  );

  const handleStart = () => {
    new Audio("/click-sound.wav").play().catch(() => {});
    setTimeout(() => {
      if (status === "authenticated") {
        router.push("/tasks");
      } else {
        router.push("/auth");
      }
    }, 200);
  };

  return (
    <main ref={containerRef} className="relative w-full">
      <div className="sticky top-0 h-screen w-full z-0">
        <Hero />
      </div>

      <div className="relative z-10 bg-gray-900 min-h-screen rounded-t-[3rem] shadow-[0_-20px_50px_rgba(0,0,0,0.7)] border-t-4 border-gray-700 px-6 py-24">
        <div className="max-w-5xl mx-auto flex flex-col gap-32">
          <ProblemSection />
          <HowItWorksSection />
          <SocialProofSection />

          <section className="reveal-section text-center py-12 border-t border-gray-800">
            <h2 className="text-xl md:text-3xl font-bold mb-8 text-white font-press">
              {tLanding("readyTitle")}
            </h2>
            <button
              onClick={handleStart}
              className="px-8 py-4 text-sm md:text-xl cursor-pointer bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-lg border-4 border-black shadow-[6px_6px_0px_black] active:translate-x-[3px] active:translate-y-[3px] active:shadow-[0px_0px_0px_black] transition-all inline-flex items-center gap-3 font-press"
            >
              <Gamepad2 className="w-6 h-6 md:w-8 md:h-8" />
              {tLanding("bottomCta")}
            </button>
          </section>
        </div>
      </div>
    </main>
  );
}
