import connectDB from "../../lib/db";
import Scan from "../../models/Scan";
import Link from "next/link";
import { ShieldAlert, Flame, MessageCircle, AlertTriangle } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function HallOfShamePage() {
  await connectDB();

  // QUERY: Find scans that are highly likely to be fake (>80%)
  // Sort by number of notes (discussion) first, then date
  // This simulates "Virality"
  const fakes = await Scan.find({ aiScore: { $gt: 80 } })
    .sort({ "notes.length": -1, createdAt: -1 }) 
    .limit(20)
    .lean();

  return (
    <div className="min-h-screen bg-black text-white py-12 px-4">
      {/* Dynamic Background Effect */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-red-900/40 via-black to-black z-0 pointer-events-none"></div>
      
      <div className="relative z-10 max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/10 border border-red-500/50 text-red-500 font-bold uppercase tracking-widest mb-6 animate-pulse">
            <AlertTriangle size={16} />
            Restricted Area
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-600">
            The Hall of Shame
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            A gallery of the most convincing deepfakes and manipulated media detected by our community. 
            <span className="text-red-400 font-bold block mt-2">Trust nothing here.</span>
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {fakes.map((scan: any) => {
            const isText = scan.imageUrl === "TEXT_SCAN";
            
            return (
              <Link 
                href={`/share/${scan._id}`} 
                key={scan._id.toString()}
                className="group relative bg-gray-900/50 border border-gray-800 rounded-2xl overflow-hidden hover:border-red-500/50 transition-all duration-300 hover:shadow-[0_0_30px_rgba(220,38,38,0.3)] hover:-translate-y-2"
              >
                {/* Image / Text Preview */}
                <div className="aspect-[4/3] bg-gray-800 relative overflow-hidden">
                  {isText ? (
                    <div className="w-full h-full p-8 flex items-center justify-center text-center bg-gradient-to-br from-gray-900 to-black">
                      <p className="text-gray-300 font-serif italic text-lg line-clamp-4">
                        "{scan.modelRawOutput?.text_snippet || "Content Unavailable"}"
                      </p>
                    </div>
                  ) : (
                    <img 
                      src={scan.imageUrl} 
                      alt="Fake Content" 
                      className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                    />
                  )}
                  
                  {/* Overlay Badge */}
                  <div className="absolute top-4 right-4 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg flex items-center gap-1">
                    <ShieldAlert size={12} />
                    {scan.aiScore}% FAKE
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="font-bold text-lg text-white group-hover:text-red-400 transition-colors line-clamp-1">
                      {isText ? "Viral Misinformation" : "AI Fabrication"}
                    </h3>
                    <div className="flex items-center gap-1 text-gray-500 text-xs font-mono">
                      <Flame size={12} className="text-orange-500" />
                      Viral
                    </div>
                  </div>

                  {/* AI Explanation Snippet */}
                  <p className="text-gray-400 text-sm line-clamp-2 mb-4">
                    {scan.modelRawOutput?.explanation || scan.modelRawOutput?.generated_prompt || "AI patterns detected by multiple models."}
                  </p>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-800">
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <MessageCircle size={14} />
                      {scan.notes?.length || 0} Discussions
                    </div>
                    <span className="text-xs font-bold text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                      EXPOSE IT &rarr;
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Empty State */}
        {fakes.length === 0 && (
          <div className="text-center py-20">
            <div className="inline-block p-6 rounded-full bg-gray-900 mb-4">
              <ShieldAlert size={40} className="text-gray-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-300">The Hall is Empty... for now.</h3>
            <p className="text-gray-500 mt-2">Start scanning content to catch the first big fake!</p>
            <Link href="/scan" className="inline-block mt-6 px-8 py-3 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700">
              Start Hunting
            </Link>
          </div>
        )}

      </div>
    </div>
  );
}