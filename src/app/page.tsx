import Link from "next/link";
import { 
  ShieldCheck, 
  ScanFace, 
  Mic, 
  FileText, 
  Video, 
  ArrowRight, 
  Globe, 
  Zap 
} from "lucide-react";
import { auth } from "@clerk/nextjs/server";

export default async function LandingPage() {
  const { userId } = await auth();

  return (
    <div className="min-h-screen bg-black text-white selection:bg-blue-500 selection:text-white overflow-hidden">
      
      {/* --- BACKGROUND EFFECTS --- */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[128px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[128px]" />
        <div className="absolute inset-0 bg-[url('/noise.svg')] opacity-20"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-20 pb-32">
        
        {/* --- HERO SECTION --- */}
        <div className="text-center max-w-4xl mx-auto mb-24 animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-900 border border-gray-800 text-gray-400 text-sm font-mono mb-8 hover:border-gray-700 transition-colors">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            System Online: Multi-Modal Analysis Ready
          </div>
          
          <h1 className="text-6xl md:text-8xl font-extrabold tracking-tight mb-8 leading-tight">
            Trust <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400 animate-gradient">Nothing.</span> <br/>
            Verify <span className="text-white">Everything.</span>
          </h1>
          
          <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            The world's first multi-modal AI detector. We analyze invisible patterns in 
            <span className="text-white font-bold"> Images, Audio, Video, and Text </span> 
            to expose deepfakes and misinformation.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              href={userId ? "/scan" : "/sign-up"}
              className="px-8 py-4 bg-white text-black rounded-full font-bold text-lg hover:scale-105 transition-transform flex items-center gap-2"
            >
              Start Scanning <ArrowRight size={20} />
            </Link>
            <Link 
              href="/hall-of-shame"
              className="px-8 py-4 bg-gray-900 text-white border border-gray-800 rounded-full font-bold text-lg hover:bg-gray-800 transition-colors"
            >
              View Hall of Shame
            </Link>
          </div>
        </div>

        {/* --- FEATURES GRID --- */}
        <div className="grid md:grid-cols-3 gap-6 mb-32">
          {/* Feature 1 */}
          <div className="p-8 rounded-3xl bg-gray-900/50 border border-gray-800 backdrop-blur-sm hover:border-blue-500/50 transition-colors group">
            <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-400 mb-6 group-hover:scale-110 transition-transform">
              <ScanFace size={32} />
            </div>
            <h3 className="text-2xl font-bold mb-3">Visual Forensics</h3>
            <p className="text-gray-400 leading-relaxed">
              Detects diffusion artifacts, GAN patterns, and metadata inconsistencies in AI-generated images (Midjourney, DALL-E 3).
            </p>
          </div>

          {/* Feature 2 */}
          <div className="p-8 rounded-3xl bg-gray-900/50 border border-gray-800 backdrop-blur-sm hover:border-purple-500/50 transition-colors group">
            <div className="w-14 h-14 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-400 mb-6 group-hover:scale-110 transition-transform">
              <Mic size={32} />
            </div>
            <h3 className="text-2xl font-bold mb-3">Audio & Video</h3>
            <p className="text-gray-400 leading-relaxed">
              Analyzes spectral waveforms for voice cloning and extracts keyframes from videos to spot deepfake manipulation.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="p-8 rounded-3xl bg-gray-900/50 border border-gray-800 backdrop-blur-sm hover:border-green-500/50 transition-colors group">
            <div className="w-14 h-14 rounded-2xl bg-green-500/10 flex items-center justify-center text-green-400 mb-6 group-hover:scale-110 transition-transform">
              <FileText size={32} />
            </div>
            <h3 className="text-2xl font-bold mb-3">Text Verification</h3>
            <p className="text-gray-400 leading-relaxed">
              Imports articles via URL and uses NLP to detect sensationalism, clickbait, and propaganda patterns.
            </p>
          </div>
        </div>

        {/* --- LIVE STATS STRIP --- */}
        <div className="border-y border-gray-800 py-12 flex flex-col md:flex-row justify-between items-center gap-8 text-center md:text-left">
          <div>
             <div className="text-4xl font-extrabold text-white mb-1">98.4%</div>
             <div className="text-sm text-gray-500 uppercase font-bold tracking-widest">Accuracy Rate</div>
          </div>
          <div className="h-12 w-px bg-gray-800 hidden md:block"></div>
          <div>
             <div className="text-4xl font-extrabold text-blue-400 mb-1">24/7</div>
             <div className="text-sm text-gray-500 uppercase font-bold tracking-widest">Real-Time Analysis</div>
          </div>
          <div className="h-12 w-px bg-gray-800 hidden md:block"></div>
          <div>
             <div className="text-4xl font-extrabold text-purple-400 mb-1">Global</div>
             <div className="text-sm text-gray-500 uppercase font-bold tracking-widest">Community Verified</div>
          </div>
        </div>

        {/* --- FOOTER --- */}
        <div className="mt-24 text-center border-t border-gray-900 pt-12">
           <div className="flex items-center justify-center gap-2 text-2xl font-bold mb-4">
              <ShieldCheck className="text-blue-500" />
              <span>TruthScan</span>
           </div>
           <p className="text-gray-500 text-sm">
             Built for the future of information integrity. <br/>
             © 2026 TruthScan Protocol.
           </p>
        </div>

      </div>
    </div>
  );
}