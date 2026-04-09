"use client";
import { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import html2canvas from "html2canvas";

export default function DownloadButton({ targetId, fileName }: { targetId: string, fileName: string }) {
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    const element = document.getElementById(targetId);
    if (!element) return;

    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 100));

      const canvas = await html2canvas(element, {
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
        scale: 2,
      });

      const link = document.createElement("a");
      link.download = `${fileName}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (err) {
      console.error("Certificate generation failed:", err);
      alert("Could not generate image. Please try taking a screenshot manually.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleDownload}
      disabled={loading}
      suppressHydrationWarning 
      className="flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-gray-700 font-medium disabled:opacity-50"
    >
      {loading ? <Loader2 size={20} className="animate-spin" /> : <Download size={20} />}
      {loading ? "Saving..." : "Save Image"}
    </button>
  );
}