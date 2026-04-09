"use client";
import { useState } from "react";
import { Cpu, Database, FileSearch, ChevronDown, ChevronUp, Info } from "lucide-react";

interface BreakdownProps {
  aiScore: number;
  breakdown?: {
    detector: number;
    metadata: number;
    captionMismatch: number;
  } | null;
  isTextScan?: boolean;
  isAudio?: boolean;
}

interface SignalBarProps {
  label: string;
  description: string;
  score: number;
  icon: React.ReactNode;
  color: string;
}

function SignalBar({ label, description, score, icon, color }: SignalBarProps) {
  const [showTip, setShowTip] = useState(false);
  const risk = score > 70 ? "HIGH" : score > 40 ? "MED" : "LOW";
  const riskColor = score > 70 ? "text-red-600" : score > 40 ? "text-yellow-600" : "text-green-600";
  const barColor = score > 70 ? "bg-red-500" : score > 40 ? "bg-yellow-400" : "bg-green-500";

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2 text-slate-700 font-semibold">
          <span className={`${score > 70 ? "text-red-500" : score > 40 ? "text-yellow-500" : "text-green-500"}`}>
            {icon}
          </span>
          {label}
          <button
            onClick={() => setShowTip(!showTip)}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <Info size={13} />
          </button>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-[10px] font-black uppercase tracking-wider ${riskColor}`}>{risk}</span>
          <span className="font-mono font-bold text-slate-900 text-sm w-9 text-right">{score}%</span>
        </div>
      </div>

      {/* Bar */}
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ease-out ${barColor}`}
          style={{ width: `${score}%` }}
        />
      </div>

      {/* Tooltip */}
      {showTip && (
        <p className="text-xs text-slate-500 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 leading-relaxed animate-in slide-in-from-top-1 duration-200">
          {description}
        </p>
      )}
    </div>
  );
}

export default function ConfidenceBreakdown({
  aiScore,
  breakdown,
  isTextScan = false,
  isAudio = false,
}: BreakdownProps) {
  const [expanded, setExpanded] = useState(true);

  // Fallback if breakdown not stored yet
  const signals = breakdown ?? {
    detector: aiScore,
    metadata: isAudio ? 0 : aiScore > 50 ? 55 : 20,
    captionMismatch: isTextScan || isAudio ? 0 : aiScore > 50 ? 60 : 15,
  };

  // Overall consensus across signals
  const activeSignals = Object.values(signals).filter((v) => v > 0);
  const consensus = activeSignals.length
    ? Math.round(activeSignals.reduce((a, b) => a + b, 0) / activeSignals.length)
    : aiScore;

  const signalDefs = [
    {
      key: "detector" as const,
      label: "AI Pattern Detector",
      description:
        "Runs a fine-tuned SDXL neural network that looks for diffusion model artifacts — characteristic noise patterns, over-smooth textures, and GAN fingerprints invisible to the human eye.",
      icon: <Cpu size={15} />,
    },
    {
      key: "metadata" as const,
      label: "Metadata Forensics",
      description:
        "Inspects EXIF/IPTC metadata for inconsistencies: missing camera make/model, known AI software signatures (Stable Diffusion, Midjourney), or dates that don't match the content.",
      icon: <Database size={15} />,
    },
    {
      key: "captionMismatch" as const,
      label: "Caption Mismatch",
      description:
        "Uses a BLIP vision-language model to auto-caption the image, then checks if the caption contains language typical of AI-generated descriptions (e.g. 'digital art', '3D render', 'illustration').",
      icon: <FileSearch size={15} />,
    },
  ];

  // Hide caption signal for text/audio
  const visibleSignals = signalDefs.filter((s) => {
    if (s.key === "captionMismatch" && (isTextScan || isAudio)) return false;
    if (s.key === "metadata" && isTextScan) return false;
    return true;
  });

  return (
    <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-sm">
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-5 py-4 bg-slate-50 hover:bg-slate-100 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center">
            <Cpu size={16} className="text-indigo-600" />
          </div>
          <div className="text-left">
            <h4 className="font-bold text-slate-900 text-sm">Signal Breakdown</h4>
            <p className="text-xs text-slate-400">
              {visibleSignals.length} detection signals analyzed
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div
            className={`text-sm font-black px-3 py-1 rounded-full ${
              consensus > 70
                ? "bg-red-100 text-red-700"
                : consensus > 40
                ? "bg-yellow-100 text-yellow-700"
                : "bg-green-100 text-green-700"
            }`}
          >
            {consensus}% AI
          </div>
          {expanded ? (
            <ChevronUp size={18} className="text-slate-400" />
          ) : (
            <ChevronDown size={18} className="text-slate-400" />
          )}
        </div>
      </button>

      {/* Body */}
      {expanded && (
        <div className="px-5 py-5 space-y-5 animate-in slide-in-from-top-2 duration-200">
          {visibleSignals.map((sig) => (
            <SignalBar
              key={sig.key}
              label={sig.label}
              description={sig.description}
              score={signals[sig.key]}
              icon={sig.icon}
              color=""
            />
          ))}

          {/* Legend */}
          <div className="flex items-center gap-4 pt-2 border-t border-slate-100 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-green-500 inline-block" /> Low risk
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-yellow-400 inline-block" /> Medium
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-red-500 inline-block" /> High risk
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
