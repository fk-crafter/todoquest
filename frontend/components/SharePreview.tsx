"use client";

import { useRef, useState, useCallback } from "react";
import { toBlob } from "html-to-image";
import {
  Download,
  Share2,
  Loader2,
  Trophy,
  Linkedin,
  Check,
  Copy,
  X as CloseIcon,
} from "lucide-react";

const XLogo = ({
  size = 14,
  className = "",
}: {
  size?: number;
  className?: string;
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.45-6.231h0.001zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

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

  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "info";
  } | null>(null);

  const showToast = (message: string, type: "success" | "info" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 5000);
  };

  const generateImageBlob = useCallback(async () => {
    if (!cardRef.current) return null;
    try {
      const blob = await toBlob(cardRef.current, {
        cacheBust: true,
        pixelRatio: 3,
        backgroundColor: "#111827",
        style: {
          fontFamily: "var(--font-press-start), monospace",
        },
      });
      return blob;
    } catch (err) {
      console.error(err);
      return null;
    }
  }, [cardRef]);

  const performNativeShare = async (blob: Blob) => {
    const file = new File([blob], "todoquest-share.png", { type: "image/png" });
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({
        files: [file],
        title: "TodoQuest",
        text: message,
        url: "https://to-doquest.vercel.app",
      });
      return true;
    }
    return false;
  };

  const handleDownload = async () => {
    setIsGenerating(true);
    try {
      const blob = await generateImageBlob();
      if (!blob) throw new Error("Erreur génération");

      const isTouchDevice =
        "ontouchstart" in window || navigator.maxTouchPoints > 0;

      if (isTouchDevice && (await performNativeShare(blob))) {
        setIsGenerating(false);
        return;
      }

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `todoquest-share-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      showToast("Erreur lors du téléchargement", "info");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleNativeShareButton = async () => {
    setIsGenerating(true);
    try {
      const blob = await generateImageBlob();
      if (!blob) return;

      const shared = await performNativeShare(blob);
      if (!shared) {
        handleDownload();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleTwitterShare = async () => {
    setIsGenerating(true);
    try {
      const blob = await generateImageBlob();
      if (!blob) return;

      const isTouchDevice =
        "ontouchstart" in window || navigator.maxTouchPoints > 0;

      if (isTouchDevice) {
        await performNativeShare(blob);
        return;
      }

      try {
        await navigator.clipboard.write([
          new ClipboardItem({ "image/png": blob }),
        ]);
        showToast("Image copiée ! Fais 'Coller' dans ton post.", "success");
      } catch (err) {
        handleDownload();
        showToast("Image téléchargée ! Ajoute-la à ton post.", "info");
      }

      const shareText = encodeURIComponent(
        `${message} ⚔️ Rejoignez la quête sur`
      );
      const shareUrl = encodeURIComponent("https://to-doquest.vercel.app");

      setTimeout(() => {
        window.open(
          `https://x.com/intent/tweet?text=${shareText}&url=${shareUrl}`,
          "_blank"
        );
      }, 1500);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <>
      <div className="flex flex-col items-center gap-4 w-full max-w-[260px] mx-auto">
        <div
          ref={cardRef}
          className="relative w-full aspect-[4/5] bg-gray-900 rounded-xl overflow-hidden border-[3px] border-gray-700 shadow-2xl flex flex-col items-center justify-center p-4 text-center"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-gray-700 via-gray-900 to-black opacity-40"></div>
          <div
            className="absolute top-0 left-0 w-full h-full opacity-10"
            style={{
              backgroundImage: "radial-gradient(#ffffff 1px, transparent 1px)",
              backgroundSize: "10px 10px",
            }}
          ></div>

          <div
            className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 ${color.replace(
              "text-",
              "bg-"
            )}/20 blur-[50px] rounded-full`}
          ></div>

          <div className="relative z-10 flex flex-col items-center w-full h-full justify-between py-2">
            <div className="text-[10px] uppercase tracking-[0.2em] text-gray-500 font-bold mt-1">
              TodoQuest
            </div>

            <div className="flex flex-col items-center gap-3">
              <div className="p-5 rounded-full border-[3px] border-gray-700 bg-gray-800 shadow-xl relative group">
                <div className="absolute inset-0 rounded-full border border-white/10"></div>
                <Icon size={48} className={color} />
              </div>

              <div className="space-y-1 px-1">
                <h2
                  className={`text-xl font-bold ${color} uppercase drop-shadow-md leading-tight`}
                >
                  {title}
                </h2>
                <p className="text-white font-press text-[10px] leading-relaxed mx-auto max-w-[180px]">
                  {message}
                </p>
              </div>
            </div>

            <div className="flex flex-col items-center gap-2 w-full mb-1">
              {level && (
                <div className="bg-gray-800 px-3 py-1 rounded-full border border-gray-600 flex items-center gap-1 shadow-lg">
                  <Trophy size={12} className="text-yellow-500" />
                  <span className="text-yellow-400 font-bold text-[10px]">
                    NIV {level}
                  </span>
                </div>
              )}
              <div className="text-[8px] text-gray-500 font-mono bg-black/40 px-2 py-0.5 rounded">
                to-doquest.vercel.app
              </div>
            </div>
          </div>
        </div>

        <div className="w-full space-y-2">
          <button
            onClick={handleNativeShareButton}
            disabled={isGenerating}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-app-accent hover:opacity-90 text-app-bg font-bold rounded-lg shadow-md transition-transform active:scale-95 w-full text-xs"
          >
            {isGenerating ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Share2 size={16} />
            )}
            {isGenerating ? "Génération..." : "Partager l'image"}
          </button>

          <div className="flex gap-2 justify-center">
            <button
              onClick={handleDownload}
              className="flex-1 bg-gray-700 hover:bg-gray-600 p-2 rounded text-[10px] font-bold flex items-center justify-center gap-1 text-gray-300 transition-colors"
            >
              <Download size={14} /> DL
            </button>

            <button
              onClick={handleTwitterShare}
              className="flex-1 bg-black hover:bg-gray-900 border border-gray-800 p-2 rounded text-[10px] font-bold flex items-center justify-center gap-1 text-white transition-colors"
            >
              <XLogo size={12} /> Post
            </button>

            <a
              href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
                "https://to-doquest.vercel.app"
              )}`}
              target="_blank"
              rel="noreferrer"
              className="flex-1 bg-[#0A66C2]/20 hover:bg-[#0A66C2]/30 border border-[#0A66C2]/50 p-2 rounded text-[10px] font-bold flex items-center justify-center gap-1 text-[#0A66C2] transition-colors"
            >
              <Linkedin size={14} /> Post
            </a>
          </div>
        </div>
      </div>

      {toast && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-[100] w-max max-w-[90%] animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div
            className={`flex items-center gap-3 px-4 py-3 rounded-lg border-2 shadow-2xl ${
              toast.type === "success"
                ? "bg-gray-800 border-green-500 text-green-400"
                : "bg-gray-800 border-blue-500 text-blue-400"
            }`}
          >
            <div
              className={`p-1.5 rounded-full ${
                toast.type === "success" ? "bg-green-500/20" : "bg-blue-500/20"
              }`}
            >
              {toast.type === "success" ? (
                <Check size={16} />
              ) : (
                <Copy size={16} />
              )}
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold font-press uppercase tracking-wide text-white mb-0.5">
                {toast.type === "success" ? "Succès" : "Info"}
              </span>
              <span className="text-xs font-medium text-gray-300">
                {toast.message}
              </span>
            </div>
            <button
              onClick={() => setToast(null)}
              className="ml-2 text-gray-500 hover:text-white transition-colors"
            >
              <CloseIcon size={14} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
