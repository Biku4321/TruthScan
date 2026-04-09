"use client";
import { useState } from "react";
import { Eye, Sun, Moon, Zap, Layers, Activity } from "lucide-react";

interface ForensicViewerProps {
  imageUrl: string;
}

export default function ForensicViewer({ imageUrl }: ForensicViewerProps) {
  const [filter, setFilter] = useState("none");

  // Define Forensic Filters using CSS
  const filters: any = {
    none: "none",
    // Reveals hidden details in dark/light areas
    contrast: "contrast(200%) brightness(110%)", 
    // Helps spot lighting inconsistencies
    invert: "invert(100%) hue-rotate(180deg)", 
    // Simulates "Error Level Analysis" (ELA) roughly by oversaturating artifacts
    ela: "saturate(3000%) contrast(150%) brightness(80%)", 
    // Highlights edges (Simulated via high contrast grayscale)
    edges: "grayscale(100%) contrast(500%) brightness(80%)",
  };

  const buttons = [
    { id: "none", icon: <Eye size={18} />, label: "Original" },
    { id: "contrast", icon: <Sun size={18} />, label: "Lighting" },
    { id: "invert", icon: <Moon size={18} />, label: "Negative" },
    { id: "ela", icon: <Layers size={18} />, label: "Artifacts" },
    { id: "edges", icon: <Activity size={18} />, label: "Edges" },
  ];

  return (
    <div className="flex flex-col w-full h-full">
      {/* TOOLBAR */}
      <div className="flex items-center justify-center gap-2 p-2 bg-gray-900/90 backdrop-blur-md rounded-xl mb-4 border border-gray-700 overflow-x-auto">
        {buttons.map((btn) => (
          <button
            key={btn.id}
            onClick={() => setFilter(btn.id)}
            className={`flex flex-col md:flex-row items-center gap-1 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
              filter === btn.id
                ? "bg-blue-600 text-white shadow-lg shadow-blue-900/50"
                : "text-gray-400 hover:text-white hover:bg-white/10"
            }`}
          >
            {btn.icon}
            <span>{btn.label}</span>
          </button>
        ))}
      </div>

      {/* IMAGE VIEWER */}
      <div className="relative flex-1 flex items-center justify-center bg-gray-950 rounded-xl overflow-hidden border border-gray-800 min-h-[300px]">
        {/* Grid Overlay to help check alignment */}
        {filter !== "none" && (
           <div className="absolute inset-0 z-10 pointer-events-none opacity-20"
                style={{ backgroundImage: 'linear-gradient(#444 1px, transparent 1px), linear-gradient(90deg, #444 1px, transparent 1px)', backgroundSize: '40px 40px' }}
           />
        )}

        <img
          src={imageUrl}
          crossOrigin="anonymous"
          alt="Forensic Analysis"
          className="max-h-full max-w-full object-contain transition-all duration-300"
          style={{ filter: filters[filter] }}
        />

        {/* Filter Label Badge */}
        {filter !== "none" && (
          <div className="absolute top-4 left-4 bg-black/70 text-green-400 text-xs font-mono px-3 py-1 rounded-full border border-green-900/50 backdrop-blur-sm z-20 flex items-center gap-2">
            <Zap size={10} className="animate-pulse" />
            FILTER: {filter.toUpperCase()} ACTIVE
          </div>
        )}
      </div>
      
      <p className="text-center text-xs text-gray-500 mt-2 font-mono">
        Toggle filters to spot inconsistencies in lighting, shadows, or noise patterns.
      </p>
    </div>
  );
}