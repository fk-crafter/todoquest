"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Hero from "@/components/Hero";
import ProblemSection from "@/components/ProblemSection";
import HowItWorksSection from "@/components/HowItWorksSection";
import SocialProofSection from "@/components/SocialProofSection";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null);

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

  return (
    <main ref={containerRef} className="relative w-full">
      <div className="sticky top-0 h-screen w-full -z-10">
        <Hero />
      </div>

      <div className="relative z-10 bg-gray-900 min-h-screen rounded-t-[3rem] shadow-[0_-20px_50px_rgba(0,0,0,0.7)] border-t-4 border-gray-700 px-6 py-24">
        <div className="max-w-5xl mx-auto flex flex-col gap-32">
          <ProblemSection />
          <HowItWorksSection />
          <SocialProofSection />
        </div>
      </div>
    </main>
  );
}
