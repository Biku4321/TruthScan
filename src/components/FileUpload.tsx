"use client";
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { UploadCloud, Loader2, AlertCircle, Video, Music, FileImage, Layers } from "lucide-react";
import exifr from "exifr";
import { extractMultipleFrames, extractFrameFromVideo } from "../lib/videoUtils";

interface FileUploadProps {
  onUploadComplete: (url: string, metadata: any) => void;
  onVideoMultiFrame?: (scanId: string) => void; // called when multi-frame video scan completes
}

export default function FileUpload({ onUploadComplete, onVideoMultiFrame }: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [statusMsg, setStatusMsg] = useState("");

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setUploading(true);
    setError("");
    setStatusMsg("Preparing file...");

    try {
      let fileToUpload = file;
      let resourceType = "image";
      let metadata: any = {};

      // --- 1. HANDLE VIDEO — multi-frame analysis ---
      if (file.type.startsWith("video/")) {
        setStatusMsg("Extracting frames from video...");
        try {
          // Extract up to 6 frames evenly spaced
          const frames = await extractMultipleFrames(file, 6);
          setStatusMsg(`Analyzing ${frames.length} frames with AI...`);

          const res = await fetch("/api/scan/video-frames", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              frames,
              originalFileName: file.name,
            }),
          });

          if (!res.ok) throw new Error("Video analysis failed");
          const data = await res.json();

          // If caller wants the direct scanId from multi-frame analysis, call it
          if (onVideoMultiFrame && data.scanId) {
            onVideoMultiFrame(data.scanId);
            return; 
          }

          // Fallback: extract single frame and go through normal upload path
          setStatusMsg("Uploading frame to cloud...");
          const frameBase64 = frames[0];
          const fetchRes = await fetch(frameBase64);
          const blob = await fetchRes.blob();
          fileToUpload = new File([blob], "video_frame.jpg", { type: "image/jpeg" });
          resourceType = "image";
          metadata = {
            Source: "Video File",
            OriginalName: file.name,
            FrameCount: frames.length,
            AvgAiScore: data.avgScore,
          };
        } catch (err) {
          console.warn("Multi-frame failed, falling back to single frame:", err);
          // Fallback to single frame extraction
          setStatusMsg("Extracting keyframe...");
          const frameBase64 = await extractFrameFromVideo(file);
          const fetchRes = await fetch(frameBase64);
          const blob = await fetchRes.blob();
          fileToUpload = new File([blob], "video_frame.jpg", { type: "image/jpeg" });
          resourceType = "image";
          metadata = { Source: "Video File", OriginalName: file.name };
        }
      }
      // --- 2. HANDLE AUDIO ---
      else if (file.type.startsWith("audio/")) {
        resourceType = "video"; // Cloudinary treats audio as 'video'
      }
      // --- 3. HANDLE IMAGE — extract EXIF metadata ---
      else if (file.type.startsWith("image/")) {
        setStatusMsg("Extracting metadata...");
        try {
          const output = await exifr.parse(file);
          if (output) {
            metadata = {
              Make: output.Make,
              Model: output.Model,
              Software: output.Software || output.ProcessingSoftware,
              DateTime: output.DateTimeOriginal,
            };
          }
        } catch (e) {
          console.warn("No metadata found");
        }
      }

      // --- 4. UPLOAD TO CLOUDINARY ---
      setStatusMsg("Uploading to secure cloud...");
      const formData = new FormData();
      formData.append("file", fileToUpload);
      formData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!);

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/${resourceType}/upload`,
        { method: "POST", body: formData }
      );

      const data = await response.json();

      if (response.ok && data.secure_url) {
        onUploadComplete(data.secure_url, metadata);
      } else {
        throw new Error(data.error?.message || "Upload failed");
      }

    } catch (err: any) {
      console.error(err);
      setError(err.message || "Upload failed. Check file format.");
    } finally {
      setUploading(false);
      setStatusMsg("");
    }
  }, [onUploadComplete, onVideoMultiFrame]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [],
      "audio/*": [".mp3", ".wav"],
      "video/*": [".mp4", ".mov", ".webm"],
    },
    multiple: false,
  });

  return (
    <div
      {...getRootProps()}
      className={`border-2 border-dashed rounded-xl p-10 flex flex-col items-center justify-center text-center cursor-pointer transition-all h-64
        ${isDragActive ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-blue-400 hover:bg-gray-50"}
      `}
    >
      <input {...getInputProps()} />

      {uploading ? (
        <div className="flex flex-col items-center animate-in fade-in">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
          <p className="text-gray-600 font-medium">{statusMsg || "Processing..."}</p>
        </div>
      ) : (
        <>
          <div className="bg-blue-100 p-4 rounded-full mb-4">
            {isDragActive ? (
              <UploadCloud className="w-8 h-8 text-blue-600" />
            ) : (
              <FileImage className="w-8 h-8 text-blue-600" />
            )}
          </div>

          <p className="text-lg font-semibold text-gray-700 mb-2">
            {isDragActive ? "Drop it here!" : "Click or Drag to Upload"}
          </p>
          <p className="text-sm text-gray-400 max-w-xs mx-auto">
            Supports Images (JPG, PNG), Audio (MP3, WAV), and Video (MP4 — multi-frame analysis)
          </p>

          <div className="flex gap-4 mt-6 text-gray-400">
            <div className="flex items-center gap-1 text-xs"><FileImage size={14} /> Images</div>
            <div className="flex items-center gap-1 text-xs"><Video size={14} /> Video</div>
            <div className="flex items-center gap-1 text-xs"><Music size={14} /> Audio</div>
            <div className="flex items-center gap-1 text-xs text-indigo-400 font-semibold"><Layers size={14} /> Multi-Frame</div>
          </div>
        </>
      )}

      {error && (
        <p className="mt-4 text-sm text-red-500 bg-red-50 px-3 py-1 rounded-full font-bold flex items-center gap-1">
          <AlertCircle size={14} /> {error}
        </p>
      )}
    </div>
  );
}

interface FileUploadProps {
  onUploadComplete: (url: string, metadata: any) => void;
}
