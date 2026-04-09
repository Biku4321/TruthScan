"use client";
import { useEffect, useRef, useState } from "react";
import WaveSurfer from "wavesurfer.js";
import { Play, Pause, Volume2 } from "lucide-react";

interface AudioVisualizerProps {
  audioUrl: string;
}

export default function AudioVisualizer({ audioUrl }: AudioVisualizerProps) {
  const waveformRef = useRef<HTMLDivElement>(null);
  const wavesurfer = useRef<WaveSurfer | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState("0:00");
  const [currentTime, setCurrentTime] = useState("0:00");

  useEffect(() => {
    if (!waveformRef.current) return;

    // Initialize WaveSurfer with "Sci-Fi" styling
    wavesurfer.current = WaveSurfer.create({
      container: waveformRef.current,
      waveColor: "#4f46e5", // Indigo
      progressColor: "#a855f7", // Purple
      cursorColor: "#ff0000",
      barWidth: 2,
      barGap: 3,
      height: 120,
      normalize: true,
      backend: "WebAudio",
    });

    wavesurfer.current.load(audioUrl);

    wavesurfer.current.on("ready", () => {
      const d = wavesurfer.current?.getDuration() || 0;
      setDuration(formatTime(d));
    });

    wavesurfer.current.on("audioprocess", () => {
      const c = wavesurfer.current?.getCurrentTime() || 0;
      setCurrentTime(formatTime(c));
    });

    wavesurfer.current.on("finish", () => setIsPlaying(false));

    return () => {
      wavesurfer.current?.destroy();
    };
  }, [audioUrl]);

  const handlePlayPause = () => {
    if (wavesurfer.current) {
      wavesurfer.current.playPause();
      setIsPlaying(!isPlaying);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  return (
    <div className="bg-gray-900 rounded-xl p-6 shadow-lg border border-gray-800">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-white">
            <Volume2 className="text-purple-400" size={20} />
            <span className="font-mono text-sm tracking-wider">AUDIO SPECTRUM</span>
        </div>
        <div className="font-mono text-xs text-gray-400">
           {currentTime} / {duration}
        </div>
      </div>

      {/* The Waveform Container */}
      <div ref={waveformRef} className="w-full mb-6" />

      <div className="flex justify-center">
        <button
          onClick={handlePlayPause}
          className="flex items-center gap-2 px-8 py-3 bg-white text-black rounded-full font-bold hover:scale-105 transition-transform"
        >
          {isPlaying ? <Pause size={20} fill="black" /> : <Play size={20} fill="black" />}
          {isPlaying ? "Pause Analysis" : "Play Audio"}
        </button>
      </div>
    </div>
  );
}