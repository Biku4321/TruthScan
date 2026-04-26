"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import FileUpload from "../../components/FileUpload";
import TextScanner from "../../components/TextScanner";
import { 
  Loader2, 
  Image as ImageIcon, 
  FileText,
  Mic,
  Video,
  WifiOff
} from "lucide-react";
import ClientSideScanner from "../../components/ClientSideScanner";

export default function ScanPage() {
  const router = useRouter();
  const { isLoaded, isSignedIn } = useAuth();

  // ALL hooks must be at the top — before any early returns
  const [activeTab, setActiveTab] = useState<"image" | "text" | "audio" | "video" | "privacy">("image");
  const [step, setStep] = useState<"upload" | "analyzing">("upload");

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.replace("/sign-in?redirect_url=/scan");
    }
  }, [isLoaded, isSignedIn, router]);

  // Early return AFTER all hooks
  if (!isLoaded || !isSignedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
      </div>
    );
  }

  const handleUploadComplete = async (url: string, metadata: any) => {
    setStep("analyzing");
    try {
      const response = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl: url, metaData: metadata }),
      });
      if (!response.ok) throw new Error("Analysis failed");
      const data = await response.json();
      router.push(`/share/${data.scanId}`);
    } catch (error) {
      console.error(error);
      alert("Analysis failed. Please try again.");
      setStep("upload");
    }
  };

  const handleVideoMultiFrame = (scanId: string) => {
    router.push(`/share/${scanId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex flex-col items-center py-16 px-4">
      <div className="text-center mb-8 max-w-2xl">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">
          Truth Scanner
        </h1>
        <p className="text-lg text-gray-600">
          Verify content authenticity using multi-model AI analysis.
        </p>
      </div>

      {step === "upload" && (
        <div className="flex flex-wrap justify-center bg-gray-100 p-1 rounded-xl mb-8 gap-1">
          <button
            onClick={() => setActiveTab("image")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all ${
              activeTab === "image" ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <ImageIcon size={18} /> Image
          </button>
          <button
            onClick={() => setActiveTab("text")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all ${
              activeTab === "text" ? "bg-white text-purple-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <FileText size={18} /> Text
          </button>
          <button
            onClick={() => setActiveTab("audio")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all ${
              activeTab === "audio" ? "bg-white text-red-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <Mic size={18} /> Audio
          </button>
          <button
            onClick={() => setActiveTab("video")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all ${
              activeTab === "video" ? "bg-white text-orange-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <Video size={18} /> Video
          </button>
          <button
            onClick={() => setActiveTab("privacy")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all ${
              activeTab === "privacy" ? "bg-white text-green-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <WifiOff size={18} /> Privacy
          </button>
        </div>
      )}

      <div className="w-full max-w-3xl">
        {step === "analyzing" ? (
          <div className="bg-white p-12 rounded-2xl shadow-xl border border-gray-100 flex flex-col items-center text-center animate-in fade-in zoom-in duration-300">
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-blue-100 rounded-full animate-ping opacity-75"></div>
              <Loader2 className="relative w-16 h-16 text-blue-600 animate-spin" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Analyzing Content...</h2>
            <p className="text-gray-500 max-w-md">
              Running 3 AI models: <br />
              <span className="font-mono text-xs text-blue-600 font-bold">
                SDXL-Detector • Metadata-Parser • BLIP-Captioner
              </span>
            </p>
          </div>
        ) : (
          <div className="bg-white p-2 rounded-2xl shadow-sm border border-gray-100 min-h-[400px]">
            {activeTab === "privacy" ? (
              <div className="p-4">
                <ClientSideScanner />
              </div>
            ) : activeTab === "text" ? (
              <TextScanner />
            ) : (
              <div className="flex flex-col h-full">
                <div className="p-4 text-center">
                  <h3 className="font-bold text-gray-900 mb-1">
                    {activeTab === "image" ? "Image Verification" :
                     activeTab === "audio" ? "Audio Forensics" :
                     "Video Frame Analysis"}
                  </h3>
                  <p className="text-xs text-gray-500">
                    {activeTab === "video"
                      ? "We extract a key frame from your video and analyze it for AI artifacts."
                      : activeTab === "image"
                        ? "Upload JPG/PNG to check for diffusion artifacts."
                        : "Upload MP3/WAV to analyze spectral patterns."}
                  </p>
                </div>
                <FileUpload onUploadComplete={handleUploadComplete} onVideoMultiFrame={handleVideoMultiFrame} />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}