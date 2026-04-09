"use client";
import { useState } from "react";
import { Send, AlertCircle, Link as LinkIcon, Loader2, FileText } from "lucide-react";
import { useRouter } from "next/navigation";

export default function TextScanner() {
  const router = useRouter();
  const [text, setText] = useState("");
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [scraping, setScraping] = useState(false);
  const [error, setError] = useState("");

  // Function to Fetch content from URL
  const handleImportUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;

    setScraping(true);
    setError("");

    try {
      const res = await fetch("/api/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error);

      setText(`${data.title}\n\n${data.content}`);
      setUrl(""); // Clear input
    } catch (err: any) {
      setError(err.message || "Failed to import URL");
    } finally {
      setScraping(false);
    }
  };

  // Function to Verify the Text
  const handleAnalyze = async () => {
    if (!text.trim()) {
        setError("Please enter some text or import a URL.");
        return;
    }
    if (text.length < 50) {
        setError("Text is too short. Please provide at least 50 characters.");
        return;
    }

    setLoading(true);
    setError("");

    try {
      // The API will detect this string and handle it as text
      const response = await fetch("/api/scan/text", { 
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify({ text }),
      });

      if (!response.ok) throw new Error("Analysis failed");

      const data = await response.json();
      router.push(`/share/${data.scanId}`);

    } catch (err) {
      console.error(err);
      setError("Analysis failed. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      
      {/* URL IMPORT BAR */}
      <div className="mb-6 bg-blue-50 p-4 rounded-xl border border-blue-100">
        <label className="block text-xs font-bold text-blue-800 uppercase tracking-wide mb-2">
           Option 1: Import Article from Web
        </label>
        <form onSubmit={handleImportUrl} className="flex gap-2">
          <div className="relative flex-1">
             <LinkIcon className="absolute left-3 top-3 text-blue-400" size={18} />
             <input
               type="url"
               placeholder="Paste https:// link here..."
               value={url}
               onChange={(e) => setUrl(e.target.value)}
               className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-blue-200 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
             />
          </div>
          <button
            type="submit"
            disabled={scraping || !url}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-bold text-sm hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2 transition-all"
          >
            {scraping ? <Loader2 size={16} className="animate-spin" /> : "Fetch"}
          </button>
        </form>
      </div>

      <div className="flex items-center gap-4 my-6">
         <div className="h-px bg-gray-200 flex-1"></div>
         <span className="text-gray-400 text-xs font-bold uppercase">OR PASTE MANUALLY</span>
         <div className="h-px bg-gray-200 flex-1"></div>
      </div>

      {/* TEXT AREA */}
      <div className="relative">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste news headline, article content, or tweet here..."
          className="w-full h-64 p-5 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none resize-none text-gray-700 leading-relaxed shadow-inner"
        ></textarea>
        <div className="absolute bottom-4 right-4 text-xs text-gray-400 font-mono bg-white/80 px-2 rounded">
          {text.length} chars
        </div>
      </div>

      {/* ACTIONS */}
      {error && (
        <div className="mt-4 flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg text-sm animate-in slide-in-from-top-2">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      <button
        onClick={handleAnalyze}
        disabled={loading || !text}
        className="w-full mt-6 bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-4 rounded-xl font-bold text-lg hover:shadow-lg hover:scale-[1.01] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <>
            <Loader2 className="animate-spin" /> Analyzing Semantics...
          </>
        ) : (
          <>
            <FileText size={20} /> Verify Content
          </>
        )}
      </button>
    </div>
  );
}