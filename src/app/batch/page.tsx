"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import Link from "next/link";
import {
  Layers,
  Link as LinkIcon,
  Loader2,
  ShieldAlert,
  ShieldCheck,
  AlertCircle,
  ExternalLink,
  Plus,
  Trash2,
  Zap,
  BarChart3,
} from "lucide-react";

interface BatchResult {
  imageUrl: string;
  scanId: string | null;
  aiScore: number;
  verdict: string;
  error?: string;
  confidenceBreakdown?: {
    detector: number;
    metadata: number;
    captionMismatch: number;
  };
}

interface BatchResponse {
  success: boolean;
  batchId: string;
  total: number;
  analyzed: number;
  fakesDetected: number;
  results: BatchResult[];
}

export default function BatchScanPage() {
  const router = useRouter();
  const { isLoaded, isSignedIn } = useAuth();
  const [urls, setUrls] = useState<string[]>(["", ""]);
  const [pasteMode, setPasteMode] = useState(false);
  const [pasteText, setPasteText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [results, setResults] = useState<BatchResponse | null>(null);

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.replace("/sign-in?redirect_url=/batch");
    }
  }, [isLoaded, isSignedIn, router]);

  if (!isLoaded || !isSignedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
      </div>
    );
  }

  const addUrl = () => {
    if (urls.length < 10) setUrls([...urls, ""]);
  };

  const removeUrl = (i: number) => {
    const next = urls.filter((_, idx) => idx !== i);
    setUrls(next.length > 0 ? next : [""]);
  };

  const updateUrl = (i: number, val: string) => {
    const next = [...urls];
    next[i] = val;
    setUrls(next);
  };

  const handlePasteImport = () => {
    const lines = pasteText
      .split(/[\n,\s]+/)
      .map((l) => l.trim())
      .filter((l) => l.startsWith("http"));
    if (lines.length === 0) {
      setError("No valid URLs found in pasted text.");
      return;
    }
    setUrls(lines.slice(0, 10));
    setPasteMode(false);
    setPasteText("");
    setError("");
  };

  const handleScan = async () => {
    const validUrls = urls.map((u) => u.trim()).filter((u) => u.startsWith("http"));
    if (validUrls.length === 0) {
      setError("Add at least one valid image URL.");
      return;
    }
    setError("");
    setLoading(true);
    setResults(null);

    try {
      const res = await fetch("/api/scan/batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ urls: validUrls }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Batch scan failed");
      setResults(data);
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const filledUrls = urls.filter((u) => u.trim().startsWith("http")).length;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-16 px-4">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 border border-indigo-100 rounded-full text-indigo-700 text-sm font-bold mb-6">
            <Layers size={16} /> Batch Scanner
          </div>
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-4">
            Scan Multiple Images at Once
          </h1>
          <p className="text-gray-500 text-lg max-w-xl mx-auto">
            Paste up to 10 image URLs and run them all through our AI detector simultaneously.
          </p>
        </div>

        {/* Input Card */}
        {!results && (
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 mb-6">

            {/* Mode toggle */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-bold text-gray-900 flex items-center gap-2">
                <LinkIcon size={18} className="text-indigo-500" /> Image URLs
                <span className="text-xs font-normal text-gray-400 ml-1">({filledUrls}/10)</span>
              </h2>
              <button
                onClick={() => setPasteMode(!pasteMode)}
                className="text-xs text-indigo-600 font-bold hover:underline"
              >
                {pasteMode ? "↩ Manual entry" : "📋 Paste bulk URLs"}
              </button>
            </div>

            {pasteMode ? (
              <div className="space-y-3">
                <textarea
                  value={pasteText}
                  onChange={(e) => setPasteText(e.target.value)}
                  placeholder={"Paste URLs separated by newlines, commas, or spaces:\nhttps://example.com/image1.jpg\nhttps://example.com/image2.png"}
                  className="w-full h-40 p-4 border border-gray-200 rounded-xl text-sm font-mono resize-none focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
                <button
                  onClick={handlePasteImport}
                  className="w-full py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors"
                >
                  Import URLs
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {urls.map((url, i) => (
                  <div key={i} className="flex gap-2 items-center group">
                    <span className="text-xs font-mono text-gray-300 w-5 text-right shrink-0">{i + 1}</span>
                    <div className="relative flex-1">
                      <LinkIcon
                        size={15}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300"
                      />
                      <input
                        type="url"
                        value={url}
                        onChange={(e) => updateUrl(i, e.target.value)}
                        placeholder="https://example.com/image.jpg"
                        className="w-full pl-8 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all"
                      />
                    </div>
                    {urls.length > 1 && (
                      <button
                        onClick={() => removeUrl(i)}
                        className="p-2 text-gray-300 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                ))}

                {urls.length < 10 && (
                  <button
                    onClick={addUrl}
                    className="w-full py-2.5 border-2 border-dashed border-gray-200 rounded-xl text-sm text-gray-400 font-medium hover:border-indigo-300 hover:text-indigo-500 transition-colors flex items-center justify-center gap-2"
                  >
                    <Plus size={16} /> Add URL ({10 - urls.length} remaining)
                  </button>
                )}
              </div>
            )}

            {error && (
              <div className="mt-4 flex items-center gap-2 text-red-600 bg-red-50 rounded-xl p-3 text-sm">
                <AlertCircle size={16} /> {error}
              </div>
            )}

            <button
              onClick={handleScan}
              disabled={loading || filledUrls === 0}
              className="w-full mt-6 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-extrabold text-lg rounded-xl hover:shadow-xl hover:shadow-indigo-200 hover:scale-[1.01] transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={22} />
                  Analyzing {filledUrls} image{filledUrls !== 1 ? "s" : ""}...
                </>
              ) : (
                <>
                  <Zap size={22} />
                  Scan {filledUrls > 0 ? filledUrls : ""} Image{filledUrls !== 1 ? "s" : ""}
                </>
              )}
            </button>
          </div>
        )}

        {/* Results */}
        {results && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

            {/* Summary Bar */}
            <div className="bg-white rounded-2xl shadow border border-gray-100 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center">
                  <BarChart3 size={26} className="text-indigo-600" />
                </div>
                <div>
                  <h2 className="text-xl font-extrabold text-gray-900">Batch Complete</h2>
                  <p className="text-sm text-gray-500">
                    {results.analyzed} of {results.total} analyzed &mdash; Batch ID:{" "}
                    <span className="font-mono text-xs">{results.batchId.slice(0, 8)}</span>
                  </p>
                </div>
              </div>
              <div className="flex gap-6 text-center">
                <div>
                  <div className="text-3xl font-black text-red-600">{results.fakesDetected}</div>
                  <div className="text-xs text-gray-400 font-bold uppercase tracking-wider">Fakes</div>
                </div>
                <div>
                  <div className="text-3xl font-black text-green-600">
                    {results.analyzed - results.fakesDetected}
                  </div>
                  <div className="text-xs text-gray-400 font-bold uppercase tracking-wider">Real</div>
                </div>
              </div>
            </div>

            {/* Individual results */}
            {results.results.map((r, i) => {
              const isFake = r.aiScore > 50;
              return (
                <div
                  key={i}
                  className={`bg-white rounded-2xl border shadow-sm overflow-hidden transition-all
                    ${r.error
                      ? "border-gray-200"
                      : isFake
                      ? "border-red-100 shadow-red-50"
                      : "border-green-100 shadow-green-50"
                    }`}
                >
                  {/* Top stripe */}
                  {!r.error && (
                    <div className={`h-1 ${isFake ? "bg-red-500" : "bg-green-500"}`} />
                  )}

                  <div className="p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    {/* Thumbnail */}
                    <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                      {!r.error && (
                        <img
                          src={r.imageUrl}
                          alt={`Result ${i + 1}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80'%3E%3Crect fill='%23f1f5f9' width='80' height='80'/%3E%3C/svg%3E";
                          }}
                        />
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-gray-400">#{i + 1}</span>
                        {!r.error && (
                          <span
                            className={`text-[11px] font-extrabold uppercase px-2 py-0.5 rounded-full
                            ${isFake ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}
                          >
                            {isFake ? "⚠ AI Detected" : "✓ Likely Real"}
                          </span>
                        )}
                        {r.error && (
                          <span className="text-[11px] font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                            Error
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-gray-400 font-mono truncate max-w-xs">
                        {r.imageUrl.length > 60 ? r.imageUrl.slice(0, 60) + "…" : r.imageUrl}
                      </p>

                      {r.error && (
                        <p className="text-xs text-red-500 mt-1">{r.error}</p>
                      )}

                      {!r.error && r.confidenceBreakdown && (
                        <div className="flex gap-3 mt-2 text-xs text-gray-500">
                          <span>Detector: <strong>{r.confidenceBreakdown.detector}%</strong></span>
                          <span>Metadata: <strong>{r.confidenceBreakdown.metadata}%</strong></span>
                        </div>
                      )}
                    </div>

                    {/* Score + Link */}
                    <div className="flex items-center gap-4 shrink-0">
                      {!r.error && (
                        <div
                          className={`w-14 h-14 rounded-xl flex flex-col items-center justify-center font-black text-lg border-2
                          ${isFake ? "border-red-200 bg-red-50 text-red-600" : "border-green-200 bg-green-50 text-green-600"}`}
                        >
                          {r.aiScore}
                          <span className="text-[9px] font-bold opacity-60">%</span>
                        </div>
                      )}
                      {r.scanId && (
                        <Link
                          href={`/share/${r.scanId}`}
                          target="_blank"
                          className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors"
                        >
                          <ExternalLink size={16} />
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Scan again */}
            <button
              onClick={() => { setResults(null); setUrls(["", ""]); }}
              className="w-full py-3 border-2 border-dashed border-gray-200 rounded-2xl text-gray-500 font-bold hover:border-indigo-300 hover:text-indigo-600 transition-colors"
            >
              ↩ New Batch Scan
            </button>
          </div>
        )}

      </div>
    </div>
  );
}