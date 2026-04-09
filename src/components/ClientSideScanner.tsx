"use client";
import { useState, useEffect, useRef } from "react";
import { Loader2, ShieldCheck, WifiOff } from "lucide-react";

export default function ClientSideScanner() {
  const [status, setStatus] = useState("idle"); // idle, loading_model, analyzing, done
  const [result, setResult] = useState<any>(null);
  const [progress, setProgress] = useState(0);
  
  // Worker Reference (Web Workers prevent UI freezing)
  const worker = useRef<Worker | null>(null);

  useEffect(() => {
    if (!worker.current) {
      worker.current = new Worker(new URL("../lib/worker.ts", import.meta.url));
      
      worker.current.onmessage = (event) => {
        const { status, output, progress } = event.data;
        if (status === "progress") setProgress(progress);
        if (status === "done") {
             setResult(output);
             setStatus("done");
        }
      };
    }
    return () => worker.current?.terminate();
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setStatus("loading_model");
    const reader = new FileReader();
    reader.onload = (evt) => {
       // Send image to worker
       worker.current?.postMessage({ 
           image: evt.target?.result 
       });
       setStatus("analyzing");
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="bg-white p-6 rounded-xl border-2 border-dashed border-gray-300">
      <div className="flex items-center gap-2 mb-4 text-gray-900 font-bold">
        <WifiOff className="text-gray-500" /> 
        Privacy Mode (On-Device)
      </div>
      
      <p className="text-xs text-gray-500 mb-4">
        This scan runs 100% in your browser. No data is sent to our servers.
        (Requires downloading ~40MB model once).
      </p>

      {status === "idle" && (
        <input type="file" accept="image/*" onChange={handleImageUpload} />
      )}

      {(status === "loading_model" || status === "analyzing") && (
        <div className="text-center py-4">
          <Loader2 className="animate-spin mx-auto text-blue-600 mb-2" />
          <p className="text-sm font-bold text-gray-600">
             {status === "loading_model" ? `Loading Model (${Math.round(progress)}%)` : "Running Neural Network..."}
          </p>
        </div>
      )}

      {status === "done" && result && (
        <div className="p-4 bg-green-50 rounded-lg text-green-800">
           <div className="font-bold flex items-center gap-2">
              <ShieldCheck size={18} /> Analysis Complete
           </div>
           <pre className="text-xs mt-2 overflow-auto">
             {JSON.stringify(result, null, 2)}
           </pre>
           <button 
             onClick={() => setStatus("idle")} 
             className="mt-2 text-xs underline font-bold"
           >
             Scan Another
           </button>
        </div>
      )}
    </div>
  );
}