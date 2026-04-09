"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, Share2, ShieldCheck, AlertCircle } from "lucide-react";
import { Suspense } from "react";

function ShareTargetContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"receiving" | "analyzing" | "error">("receiving");
  const [message, setMessage] = useState("Receiving shared content...");

  useEffect(() => {
    const url = searchParams.get("url") || searchParams.get("text");
    const title = searchParams.get("title");

    if (!url) {
      setStatus("error");
      setMessage("No content received. Please share an image URL or article link.");
      return;
    }

    const isImageUrl = /\.(jpg|jpeg|png|gif|webp|bmp)(\?.*)?$/i.test(url) || url.includes("images") || url.includes("img");
    const isArticleUrl = url.startsWith("http") && !isImageUrl;

    if (isImageUrl) {
      setStatus("analyzing");
      setMessage("Scanning image for AI manipulation...");
      fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl: url, metaData: { sharedFrom: "Web Share API", title } }),
      })
        .then((r) => r.json())
        .then((data) => {
          if (data.scanId) router.push(`/share/${data.scanId}`);
          else throw new Error(data.error);
        })
        .catch((err) => {
          setStatus("error");
          setMessage(err.message || "Analysis failed.");
        });
    } else if (isArticleUrl) {
      // Redirect to scan page with the URL pre-filled in text scanner
      router.push(`/scan?url=${encodeURIComponent(url)}`);
    } else {
      setStatus("error");
      setMessage("Unsupported content type. Share an image URL or article link.");
    }
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl p-10 max-w-sm w-full text-center">
        <div className="w-16 h-16 rounded-2xl bg-blue-900/50 flex items-center justify-center mx-auto mb-6">
          {status === "error" ? (
            <AlertCircle size={32} className="text-red-400" />
          ) : (
            <ShieldCheck size={32} className="text-blue-400" />
          )}
        </div>

        <h1 className="text-xl font-bold text-white mb-2">TruthScan</h1>
        <p className="text-slate-400 text-sm mb-6">{message}</p>

        {status !== "error" && (
          <div className="flex justify-center">
            <Loader2 size={28} className="animate-spin text-blue-400" />
          </div>
        )}

        {status === "error" && (
          <div className="space-y-3 mt-4">
            <button
              onClick={() => router.push("/scan")}
              className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-colors"
            >
              Go to Scanner
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ShareTargetPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-blue-400" />
      </div>
    }>
      <ShareTargetContent />
    </Suspense>
  );
}
