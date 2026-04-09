import connectDB from "../../../lib/db";
import Scan from "../../../models/Scan";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ShieldAlert, ShieldCheck, Quote, Mic, Terminal, Activity, Calendar, Hash, Cpu } from "lucide-react";
import ShareButton from "../../../components/ShareButton";
import CommunityNotes from "../../../components/CommunityNotes";
import CommunityVoting from "../../../components/CommunityVoting";
import ConfidenceBreakdown from "../../../components/ConfidenceBreakdown";
import DownloadButton from "../../../components/DownloadButton";
import { auth } from "@clerk/nextjs/server";
import DeleteButton from "../../../components/DeleteButton";
import ForensicViewer from "../../../components/ForensicViewer";
import ExternalSearch from "../../../components/ExternalSearch";
import AudioVisualizer from "../../../components/AudioVisualizer";

// FIX 1: Update Type definition for Next.js 15
interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function SharePage({ params }: PageProps) {
  const { userId } = await auth();
  const { id } = await params;

  await connectDB();

  // FIX: Wrap in try/catch — invalid ObjectId formats throw a CastError, not a null result
  let scan;
  try {
    scan = await Scan.findById(id).lean();
  } catch (e) {
    return notFound();
  }

  if (!scan) return notFound();

  const scanData = scan as any;
  const isFake = scanData.aiScore > 50;
  
  // Determine Type
  const isTextScan = scanData.imageUrl === "TEXT_SCAN";
  const isAudio = /\.(mp3|wav|m4a)$/i.test(scanData.imageUrl);

  const serializedNotes = (scanData.notes || []).map((note: any) => ({
    userId: note.userId,
    userName: note.userName,
    text: note.text,
    createdAt: new Date(note.createdAt).toISOString(),
    _id: note._id ? note._id.toString() : undefined,
  }));

  // Serialize votes for community voting widget
  const votes = scanData.votes || [];
  const agreeCount = votes.filter((v: any) => v.vote === "agree").length;
  const disagreeCount = votes.filter((v: any) => v.vote === "disagree").length;
  const userVote = userId
    ? (votes.find((v: any) => v.userId === userId)?.vote ?? null)
    : null;

  // Helper for Theme Colors
  const themeColor = isFake ? "red" : "green";
  const themeBg = isFake ? "bg-red-50" : "bg-green-50";
  const themeText = isFake ? "text-red-600" : "text-green-600";
  const themeBorder = isFake ? "border-red-200" : "border-green-200";

  return (
    <div className="min-h-screen bg-[#F1F5F9] flex flex-col items-center justify-center p-4 md:p-8 font-sans">
      
      {/* 1. ADD ID HERE: "certificate-view" */}
      <div
        id="certificate-view"
        className={`bg-white max-w-7xl w-full rounded-3xl overflow-hidden flex flex-col lg:flex-row shadow-2xl transition-all duration-500
          ${isFake ? "shadow-[0_20px_50px_-12px_rgba(239,68,68,0.3)]" : "shadow-[0_20px_50px_-12px_rgba(34,197,94,0.3)]"}
        `}
      >
        
        {/* === LEFT COLUMN (IMMERSIVE VISUAL) === */}
        <div className="lg:w-[45%] bg-slate-900 relative flex flex-col min-h-[500px]">
          
          {/* Content Container */}
          <div className="flex-1 flex items-center justify-center p-8 relative z-10">
            {isTextScan ? (
              // --- TEXT LAYOUT (Editorial Style) ---
              <div className="text-center max-w-md relative">
                <Quote size={80} className="text-slate-700 absolute -top-10 -left-6 opacity-50" />
                <div className="relative z-10">
                  <blockquote className="text-white text-2xl md:text-3xl font-serif italic leading-relaxed tracking-wide">
                    "{scanData.modelRawOutput?.text_snippet || "Content unavailable"}"
                  </blockquote>
                  <div className="mt-8 flex items-center justify-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-[0.2em]">
                    <span className="w-8 h-px bg-slate-600"></span>
                    Text Analysis
                    <span className="w-8 h-px bg-slate-600"></span>
                  </div>
                </div>
              </div>

            ) : isAudio ? (
               // --- AUDIO LAYOUT (Studio Style) ---
               <div className="w-full h-full flex flex-col justify-center items-center">
                  <div className="w-32 h-32 rounded-full border border-slate-700 flex items-center justify-center mb-8 relative">
                     <div className="absolute inset-0 bg-red-500/10 rounded-full animate-ping"></div>
                     <Mic size={48} className="text-red-500 relative z-10" />
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2 tracking-tight">Audio Forensics</h2>
                  <p className="text-slate-400 text-sm mb-8">Spectral Analysis & Waveform Detection</p>
                  
                  <div className="w-full bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                    <AudioVisualizer audioUrl={scanData.imageUrl} />
                  </div>
               </div>

            ) : (
              // --- IMAGE LAYOUT (Detective Mode) ---
              <div className="w-full h-full absolute inset-0 bg-black flex items-center justify-center">
                <div className="w-full h-full opacity-90">
                   <ForensicViewer imageUrl={scanData.imageUrl} />
                </div>
                {/* Overlay Grid Effect */}
                <div className="absolute inset-0 bg-[url('/noise.svg')] opacity-10 pointer-events-none"></div>
              </div>
            )}
          </div>

          {/* Bottom Verdict Bar (Inside Visual) */}
          <div className={`p-5 text-white text-center font-bold text-sm tracking-[0.2em] backdrop-blur-xl border-t relative z-20
             ${isFake ? "bg-red-600/90 border-red-500" : "bg-green-600/90 border-green-500"}
          `}>
             <div className="flex items-center justify-center gap-3">
               {isFake ? <ShieldAlert size={18} /> : <ShieldCheck size={18} />}
               VERIFIED BY TRUTH PLATFORM
             </div>
          </div>
        </div>


        {/* === RIGHT COLUMN (DATA & INTELLIGENCE) === */}
        <div className="lg:w-[55%] p-8 md:p-12 flex flex-col h-full bg-white relative">
          
          {/* Header */}
          <div className="flex justify-between items-start mb-8">
             <div>
                <h2 className="text-slate-400 font-bold text-xs uppercase tracking-widest mb-2 flex items-center gap-2">
                   <Activity size={14} /> Analysis Report
                </h2>
                <h1 className={`text-4xl font-extrabold tracking-tight ${isFake ? "text-gray-900" : "text-gray-900"}`}>
                   {isFake ? "Digital Forgery Detected" : "Authenticity Verified"}
                </h1>
             </div>
             
             {/* Score Badge */}
             <div className={`flex flex-col items-center justify-center w-20 h-20 rounded-2xl border-4 ${isFake ? "border-red-100 bg-red-50 text-red-600" : "border-green-100 bg-green-50 text-green-600"}`}>
                <span className="text-2xl font-black">{scanData.aiScore}%</span>
                <span className="text-[10px] font-bold uppercase">AI Score</span>
             </div>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto space-y-8 pr-2 custom-scrollbar">
            
            {/* 1. Main Verdict Text */}
            <div className="prose prose-slate">
                <p className="text-lg text-slate-600 leading-relaxed">
                   Our multi-modal analysis algorithms have processed this file. 
                   The results indicate a <strong className={themeText}>{scanData.aiScore}% probability</strong> that this content is 
                   {isFake ? " artificially generated or manipulated." : " organic and authentic."}
                </p>
            </div>

            {/* 2. Context Explanation (Blue Box) */}
            {scanData.modelRawOutput?.explanation && (
              <div className="bg-slate-50 border-l-4 border-blue-500 p-5 rounded-r-xl">
                 <h4 className="text-slate-900 font-bold text-sm mb-2 flex items-center gap-2">
                    <Cpu size={16} className="text-blue-500" /> Model Insight
                 </h4>
                 <p className="text-slate-600 text-sm leading-relaxed">
                    {scanData.modelRawOutput.explanation}
                 </p>
              </div>
            )}

            {/* 3. Reverse Prompt Engineering (The Hacker Box) */}
            {!isTextScan && !isAudio && scanData.modelRawOutput?.generated_prompt ? (
               <div className="rounded-xl overflow-hidden border border-slate-200 shadow-sm">
                  <div className="bg-slate-900 px-4 py-2 flex items-center justify-between">
                     <h4 className="text-indigo-400 font-mono text-xs font-bold flex items-center gap-2">
                        <Terminal size={14} /> REVERSE_PROMPT_ENGINEERING.exe
                     </h4>
                     <div className="flex gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-red-500/20"></div>
                        <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/20"></div>
                        <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
                     </div>
                  </div>
                  <div className="bg-slate-800 p-5">
                     <p className="text-slate-400 text-xs font-mono mb-2 border-b border-slate-700 pb-2">
                        // If this image is AI, the prompt was likely:
                     </p>
                     <p className="text-green-400 font-mono text-sm leading-relaxed">
                        &gt; "{scanData.modelRawOutput.generated_prompt}"
                        <span className="animate-pulse inline-block w-2 h-4 bg-green-400 ml-1 align-middle"></span>
                     </p>
                  </div>
               </div>
            ) : null}

            {/* 4. External Search Tools */}
            {!isTextScan && !isAudio && <ExternalSearch imageUrl={scanData.imageUrl} />}

            {/* 5. Metadata Matrix */}
            {!isTextScan && !isAudio && scanData.metaData && Object.keys(scanData.metaData).length > 0 && (
               <div className="grid grid-cols-2 gap-3">
                  {Object.entries(scanData.metaData).slice(0, 6).map(([key, value]) => (
                     <div key={key} className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                        <div className="text-[10px] text-slate-400 uppercase font-bold mb-1 flex items-center gap-1">
                           <Hash size={10} /> {key}
                        </div>
                        <div className="text-slate-700 font-mono text-xs font-medium truncate" title={String(value)}>
                           {String(value)}
                        </div>
                     </div>
                  ))}
               </div>
            )}
            
            {/* 6. Info Footer */}
            <div className="flex gap-6 border-t border-slate-100 pt-4 text-xs text-slate-400 font-medium">
               <div className="flex items-center gap-1.5">
                  <Calendar size={14} />
                  {new Date(scanData.createdAt).toLocaleString()}
               </div>
               <div className="flex items-center gap-1.5">
                  <Hash size={14} />
                  ID: {scanData._id.toString().slice(-8)}
               </div>
            </div>

          </div>

          {/* Action Bar (Fixed at bottom of right col) */}
          <div className="mt-8 pt-6 border-t border-slate-100 flex flex-wrap gap-3" data-html2canvas-ignore="true">
             <Link
                href="/scan"
                className="flex-1 bg-slate-900 hover:bg-black text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-slate-200 text-center text-sm"
             >
                New Scan
             </Link>

             <DownloadButton
                targetId="certificate-view"
                fileName={`truth-scan-${scanData._id.toString().slice(-6)}`}
             />

             <ShareButton scanId={scanData._id.toString()} />
             
             {userId && scanData.userId === userId && (
                <DeleteButton scanId={scanData._id.toString()} />
             )}
          </div>
          
          <div className="mt-6" data-html2canvas-ignore="true">
            <div className="space-y-4">
              {/* Confidence Breakdown Widget */}
              <ConfidenceBreakdown
                aiScore={scanData.aiScore}
                breakdown={scanData.confidenceBreakdown ?? null}
                isTextScan={isTextScan}
                isAudio={isAudio}
              />

              {/* Community Voting Widget */}
              <CommunityVoting
                scanId={scanData._id.toString()}
                initialAgree={agreeCount}
                initialDisagree={disagreeCount}
                initialUserVote={userVote}
                aiVerdict={scanData.verdict}
              />

              {/* Community Notes */}
              <CommunityNotes
                scanId={scanData._id.toString()}
                initialNotes={serializedNotes}
              />
            </div>
          </div>

        </div>
      </div>

      <div className="mt-8 text-slate-400 text-xs font-medium flex items-center gap-2">
         <ShieldCheck size={14} />
         Truth Platform Protocol © 2026
      </div>
    </div>
  );
}