"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import FileUpload from "../../components/FileUpload";
import TextScanner from "../../components/TextScanner";
import { 
  Loader2, 
  Image as ImageIcon, 
  FileText,
  Mic,
  Video,
  WifiOff // <--- CHANGE 1: Import Icon
} from "lucide-react";
import ClientSideScanner from "../../components/ClientSideScanner";

export default function ScanPage() {
  const router = useRouter();
  
  // <--- CHANGE 2: Add "privacy" to the state type
  const [activeTab, setActiveTab] = useState<"image" | "text" | "audio" | "video" | "privacy">("image");
  
  const [step, setStep] = useState<"upload" | "analyzing">("upload");

  const handleUploadComplete = async (url: string, metadata: any) => {
    setStep("analyzing");

    try {
      const response = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          imageUrl: url, 
          metaData: metadata 
        }),
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

  // Called when multi-frame video analysis completes directly (skips Cloudinary upload)
  const handleVideoMultiFrame = (scanId: string) => {
    router.push(`/share/${scanId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex flex-col items-center py-16 px-4">
      {/* Header Section */}
      <div className="text-center mb-8 max-w-2xl">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">
          Truth Scanner
        </h1>
        <p className="text-lg text-gray-600">
          Verify content authenticity using multi-model AI analysis.
        </p>
      </div>

      {/* TAB SWITCHER */}
      {step === "upload" && (
        <div className="flex flex-wrap justify-center bg-gray-100 p-1 rounded-xl mb-8 gap-1">
          <button
            onClick={() => setActiveTab("image")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all ${
              activeTab === "image" ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <ImageIcon size={18} />
            Image
          </button>
          
          <button
            onClick={() => setActiveTab("text")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all ${
              activeTab === "text" ? "bg-white text-purple-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <FileText size={18} />
            Text
          </button>

          <button
            onClick={() => setActiveTab("audio")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all ${
              activeTab === "audio" ? "bg-white text-red-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <Mic size={18} />
            Audio
          </button>

          <button
            onClick={() => setActiveTab("video")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all ${
              activeTab === "video" ? "bg-white text-orange-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <Video size={18} />
            Video
          </button>

          {/* <--- CHANGE 3: Add Privacy Mode Button */}
          <button
            onClick={() => setActiveTab("privacy")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all ${
              activeTab === "privacy" ? "bg-white text-green-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <WifiOff size={18} />
            Privacy
          </button>
        </div>
      )}

      <div className="w-full max-w-3xl">
        
        {/* === LOADING STATE === */}
        {step === "analyzing" ? (
           <div className="bg-white p-12 rounded-2xl shadow-xl border border-gray-100 flex flex-col items-center text-center animate-in fade-in zoom-in duration-300">
             <div className="relative mb-6">
               <div className="absolute inset-0 bg-blue-100 rounded-full animate-ping opacity-75"></div>
               <Loader2 className="relative w-16 h-16 text-blue-600 animate-spin" />
             </div>
             <h2 className="text-2xl font-bold text-gray-800 mb-2">Analyzing Content...</h2>
             <p className="text-gray-500 max-w-md">
                Running 3 AI models: <br/>
                <span className="font-mono text-xs text-blue-600 font-bold">
                   SDXL-Detector • Metadata-Parser • BLIP-Captioner
                </span>
             </p>
           </div>
        ) : (
           /* === UPLOAD / INPUT STATE === */
           <div className="bg-white p-2 rounded-2xl shadow-sm border border-gray-100 min-h-[400px]">
             
             {/* <--- CHANGE 4: Logic to show ClientSideScanner */}
             {activeTab === "privacy" ? (
                <div className="p-4">
                    <ClientSideScanner />
                </div>
             ) : activeTab === "text" ? (
                <TextScanner />
             ) : (
                // Re-use FileUpload for Image, Audio, and Video
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
// export default function ScanPage() {
//   const router = useRouter();
//   const [activeTab, setActiveTab] = useState<"image" | "text">("image");
//   const [step, setStep] = useState<"upload" | "analyzing" | "result">("upload");
//   const [imageUrl, setImageUrl] = useState("");

//   const handleUploadComplete = async (url: string, metadata: any) => {
//     setImageUrl(url);
//     setStep("analyzing");

//     try {
//       const response = await fetch("/api/scan", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ 
//           imageUrl: url, 
//           metaData: metadata 
//         }),
//       });

//       if (!response.ok) throw new Error("Scan failed");

//       const data = await response.json();
//       router.push(`/share/${data.scanId}`);
//     } catch (error) {
//       console.error(error);
//       alert("Something went wrong. Please try again.");
//       setStep("upload");
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gray-50 py-12 px-4">
//       <div className="max-w-3xl mx-auto">
//         <div className="text-center mb-10">
//           <h1 className="text-4xl font-extrabold text-gray-900 mb-4">
//             Start a New Verification
//           </h1>
//           <p className="text-lg text-gray-500">
//             Select the type of content you want to analyze.
//           </p>
//         </div>

//         {/* --- TOGGLE TABS --- */}
//         <div className="flex bg-gray-200 p-1 rounded-xl mb-8 max-w-md mx-auto">
//           <button
//             onClick={() => setActiveTab("image")}
//             suppressHydrationWarning // <--- FIX 1
//             className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium transition-all flex-1 justify-center
//               ${activeTab === "image" ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-700"}
//             `}
//           >
//             <ImageIcon size={20} />
//             Check Image
//           </button>
          
//           <button
//             onClick={() => setActiveTab("text")}
//             suppressHydrationWarning // <--- FIX 2
//             className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium transition-all flex-1 justify-center
//               ${activeTab === "text" ? "bg-white text-purple-600 shadow-sm" : "text-gray-500 hover:text-gray-700"}
//             `}
//           >
//             <FileText size={20} />
//             Check Text
//           </button>
//         </div>

//         {/* --- MAIN CONTENT AREA --- */}
//         <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100 min-h-[400px]">
//           {step === "analyzing" ? (
//             <div className="flex flex-col items-center justify-center h-64 text-center">
//               <Loader2 className="w-16 h-16 text-blue-600 animate-spin mb-6" />
//               <h3 className="text-2xl font-bold text-gray-900 mb-2">Analyzing Content...</h3>
//               <p className="text-gray-500">
//                 Running 3 AI models: <br/>
//                 <span className="font-mono text-xs text-blue-600">
//                    SDXL-Detector • Metadata-Parser • BLIP-Captioner
//                 </span>
//               </p>
//             </div>
//           ) : (
//             <>
//               {activeTab === "image" ? (
//                 <FileUpload onUploadComplete={handleUploadComplete} />
//               ) : (
//                 <TextScanner />
//               )}
//             </>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }