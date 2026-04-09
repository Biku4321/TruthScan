"use client";
import { useState } from "react";
import { Share2, Check } from "lucide-react";

export default function ShareButton({ scanId }: { scanId: string }) {
  const [copied, setCopied] = useState(false);

  const handleShare = () => {
    const url = `${window.location.origin}/share/${scanId}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleShare}
      suppressHydrationWarning 
      className={`flex items-center justify-center gap-2 px-6 py-3 border rounded-lg transition-colors font-medium
        ${copied ? "bg-green-50 text-green-700 border-green-200" : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"}
      `}
    >
      {copied ? <Check size={20} /> : <Share2 size={20} />}
      {copied ? "Copied!" : "Share"}
    </button>
  );
}