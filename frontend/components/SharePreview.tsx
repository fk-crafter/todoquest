"use client";

import { useRef, useState } from "react";
import html2canvas from "html2canvas";
import {
  Download,
  Share2,
  Loader2,
  Trophy,
  Twitter,
  Linkedin,
} from "lucide-react";

interface SharePreviewProps {
  title: string;
  message: string;
  icon: React.ElementType;
  color: string;
  level?: number;
}

export default function SharePreview({
  title,
  message,
  icon: Icon,
  color,
  level,
}: SharePreviewProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const generateBlob = async (): Promise<Blob | null> => {
    if (!cardRef.current) return null;
    const canvas = await html2canvas(cardRef.current, {
      backgroundColor: "#111827",
      scale: 4,
    });
    return new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
  };

  const handleDownload = async () => {
    setIsGenerating(true);
    try {
      const blob = await generateBlob();
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `todoquest-share-${Date.now()}.png`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Erreur download", err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleNativeShare = async () => {
    setIsGenerating(true);
    try {
      const blob = await generateBlob();
      if (!blob) return;

      const file = new File([blob], "todoquest-share.png", {
        type: "image/png",
      });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: "Mon butin TodoQuest",
          text: message + " 🚀",
          url: "https://to-doquest.vercel.app",
        });
      } else {
        alert("Le partage d'image n'est pas supporté, téléchargement lancé !");
        handleDownload();
      }
    } catch (err) {
      console.error("Erreur share", err);
    } finally {
      setIsGenerating(false);
    }
  };

  const shareText = encodeURIComponent(
    `${message} 🚀 Rejoignez l'aventure sur`,
  );
  const shareUrl = encodeURIComponent("https://to-doquest.vercel.app");

  return (
    <div className="flex flex-col items-center gap-3 w-full max-w-[260px] mx-auto">
      <div
        ref={cardRef}
        className="relative w-full aspect-[4/5] bg-gray-900 rounded-lg overflow-hidden border-[3px] border-gray-700 shadow-xl flex flex-col items-center justify-center p-4 text-center"
      >
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-gray-700 via-gray-900 to-black"></div>
        <div
          className="absolute top-0 left-0 w-full h-full opacity-10"
          style={{
            backgroundImage: "radial-gradient(#ffffff 1px, transparent 1px)",
            backgroundSize: "10px 10px",
          }}
        ></div>

        <div
          className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 ${color.replace(
            "text-",
            "bg-",
          )}/20 blur-[40px] rounded-full`}
        ></div>

        <div className="relative z-10 flex flex-col items-center w-full h-full justify-between py-2">
          <div className="text-[10px] uppercase tracking-[0.2em] text-gray-500 font-bold">
            TodoQuest
          </div>

          <div className="flex flex-col items-center gap-2">
            <div
              className={`p-4 rounded-full border-[3px] border-gray-700 bg-gray-800 shadow-lg relative`}
            >
              <div className="absolute inset-0 rounded-full border border-white/10"></div>
              <Icon size={40} className={color} />
            </div>

            <div className="space-y-1 px-1">
              <h2
                className={`text-lg font-bold ${color} uppercase drop-shadow-[0_2px_5px_rgba(0,0,0,0.5)] leading-tight`}
              >
                {title}
              </h2>
              <p className="text-white font-press text-[10px] leading-relaxed mx-auto">
                {message}
              </p>
            </div>
          </div>

          <div className="flex flex-col items-center gap-2 w-full">
            {level && (
              <div className="bg-gray-800/80 px-3 py-1 rounded-full border border-gray-600 flex items-center gap-1 backdrop-blur-sm">
                <Trophy size={12} className="text-yellow-500" />
                <span className="text-yellow-400 font-bold text-[10px]">
                  NIV {level}
                </span>
              </div>
            )}
            <div className="text-[8px] text-gray-500 font-mono bg-black/30 px-2 py-0.5 rounded">
              to-doquest.vercel.app
            </div>
          </div>
        </div>
      </div>

      <div className="w-full space-y-2">
        <button
          onClick={handleNativeShare}
          disabled={isGenerating}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-app-accent hover:opacity-90 text-app-bg font-bold rounded shadow-md transition-transform active:scale-95 w-full text-xs"
        >
          {isGenerating ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Share2 size={16} />
          )}
          {isGenerating ? "..." : "Partager"}
        </button>

        <div className="flex gap-2 justify-center">
          <button
            onClick={handleDownload}
            className="flex-1 bg-gray-700 hover:bg-gray-600 p-1.5 rounded text-[10px] font-bold flex items-center justify-center gap-1 text-gray-300"
          >
            <Download size={12} /> DL
          </button>

          <a
            href={`https://twitter.com/intent/tweet?text=${shareText}&url=${shareUrl}`}
            target="_blank"
            rel="noreferrer"
            className="flex-1 bg-[#1DA1F2]/20 hover:bg-[#1DA1F2]/30 border border-[#1DA1F2]/50 p-1.5 rounded text-[10px] font-bold flex items-center justify-center gap-1 text-[#1DA1F2]"
          >
            <Twitter size={12} /> Tweet
          </a>

          <a
            href={`https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`}
            target="_blank"
            rel="noreferrer"
            className="flex-1 bg-[#0A66C2]/20 hover:bg-[#0A66C2]/30 border border-[#0A66C2]/50 p-1.5 rounded text-[10px] font-bold flex items-center justify-center gap-1 text-[#0A66C2]"
          >
            <Linkedin size={12} /> Post
          </a>
        </div>
      </div>
    </div>
  );
}
