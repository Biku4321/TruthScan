"use client";
import { useState } from "react";
import { Volume2, PlayCircle, Film, Quote } from "lucide-react";

interface ScanThumbnailProps {
  imageUrl: string;
  isText: boolean;
  isAudio: boolean;
  isVideo: boolean;
  isBase64: boolean;
  textSnippet?: string;
  frameCount?: number;
}

export default function ScanThumbnail({
  imageUrl,
  isText,
  isAudio,
  isVideo,
  isBase64,
  textSnippet,
  frameCount,
}: ScanThumbnailProps) {
  const [imgError, setImgError] = useState(false);

  if (isText) {
    return (
      <div className="w-full h-full p-8 flex flex-col items-center justify-center bg-gradient-to-br from-purple-50 via-white to-purple-50 text-center group-hover:scale-105 transition-transform duration-700">
        <Quote className="text-purple-300 mb-3 opacity-50" size={32} />
        <p className="text-gray-600 font-serif italic text-sm leading-relaxed line-clamp-4">
          &ldquo;{textSnippet || "Text content unavailable"}&rdquo;
        </p>
      </div>
    );
  }

  if (isAudio) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-red-50 via-white to-orange-50 group-hover:scale-105 transition-transform duration-700">
        <div className="w-16 h-16 rounded-full bg-white shadow-lg flex items-center justify-center mb-4 text-red-500 relative">
          <Volume2 size={28} />
          <div className="absolute inset-0 rounded-full border-4 border-red-100 animate-ping opacity-20" />
        </div>
        <div className="flex gap-1 h-6 items-end">
          {[40, 70, 55, 85, 45].map((h, i) => (
            <div key={i} className="w-1.5 bg-red-400 rounded-full animate-pulse" style={{ height: `${h}%` }} />
          ))}
        </div>
      </div>
    );
  }

  if (isVideo) {
    return (
      <div className="relative w-full h-full group-hover:scale-105 transition-transform duration-700">
        {!isBase64 && !imgError ? (
          <img
            src={imageUrl}
            alt="Video Frame"
            className="w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0 transition-all"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900" />
        )}
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:bg-black/20 transition-colors">
          <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/40 text-white shadow-2xl group-hover:scale-110 transition-transform">
            <PlayCircle size={32} fill="currentColor" className="opacity-90" />
          </div>
        </div>
        <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur text-white text-[10px] font-bold px-2 py-1 rounded flex items-center gap-1">
          <Film size={10} /> VIDEO FRAME
        </div>
        {frameCount && (
          <div className="absolute top-3 left-3 bg-black/60 backdrop-blur text-white text-[10px] font-bold px-2 py-1 rounded">
            {frameCount} frames
          </div>
        )}
      </div>
    );
  }

  // Regular image
  return (
    <div className="relative w-full h-full bg-gray-100">
      {!imgError ? (
        <img
          src={imageUrl}
          alt="Scan"
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          onError={() => setImgError(true)}
        />
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="1.5">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <polyline points="21 15 16 10 5 21" />
          </svg>
          <span className="text-[10px] text-gray-400 font-semibold">Image unavailable</span>
        </div>
      )}
      {!imgError && (
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
      )}
    </div>
  );
}