import connectDB from "../../lib/db";
import Scan from "../../models/Scan";
import Link from "next/link";
import { ShieldAlert, ShieldCheck, Search, Quote, ImageIcon, ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{ q?: string }>;
};

export default async function SearchPage({ searchParams }: Props) {
  const resolvedParams = await searchParams;
  const query = resolvedParams.q || "";

  await connectDB();

  // SEARCH LOGIC:
  // We look for the keyword in:
  // 1. "modelRawOutput.text_snippet" (The headline checked)
  // 2. "notes.text" (Discussion comments)
  // 3. "verdict" (The AI result text)
  const results = await Scan.find({
    $or: [
      { "modelRawOutput.text_snippet": { $regex: query, $options: "i" } },
      { "notes.text": { $regex: query, $options: "i" } },
      { "verdict": { $regex: query, $options: "i" } }
    ]
  }).sort({ createdAt: -1 }).limit(20).lean();

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="mb-8">
          <Link href="/scan" className="text-gray-500 hover:text-gray-900 flex items-center gap-1 text-sm mb-4">
            <ArrowLeft size={16} /> Back to Scanner
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Search className="text-blue-600" />
            Results for "{query}"
          </h1>
          <p className="text-gray-500 mt-2">
            Found {results.length} matches in our database.
          </p>
        </div>

        {/* Results List */}
        <div className="space-y-4">
          {results.map((scan: any) => {
            const isText = scan.imageUrl === "TEXT_SCAN";
            const isFake = scan.aiScore > 50;
            const dateStr = new Date(scan.createdAt).toLocaleDateString("en-US", { month: 'short', day: 'numeric', year: 'numeric' });

            return (
              <Link 
                href={`/share/${scan._id}`} 
                key={scan._id.toString()}
                className="block bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:border-blue-300 transition-all group"
              >
                <div className="flex items-start gap-4">
                  {/* Icon Box */}
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    isText ? "bg-purple-100 text-purple-600" : "bg-blue-100 text-blue-600"
                  }`}>
                    {isText ? <Quote size={20} /> : <ImageIcon size={20} />}
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <h3 className="font-bold text-gray-900 text-lg mb-1 group-hover:text-blue-600 transition-colors">
                        {isText 
                          ? (scan.modelRawOutput?.text_snippet?.substring(0, 80) + "...") 
                          : "Image Verification Scan"
                        }
                      </h3>
                      <span className="text-xs text-gray-400 font-mono whitespace-nowrap ml-2">
                        {dateStr}
                      </span>
                    </div>

                    <p className="text-gray-600 text-sm mb-3">
                      {isText ? "Analyzed Headline/Article" : "Analyzed visual media content for diffusion artifacts."}
                    </p>

                    {/* Verdict Badge */}
                    <div className="flex items-center gap-3">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide border ${
                        isFake ? "bg-red-50 text-red-700 border-red-100" : "bg-green-50 text-green-700 border-green-100"
                      }`}>
                        {isFake ? <ShieldAlert size={12} /> : <ShieldCheck size={12} />}
                        {isFake ? "Likely Fake" : "Likely Real"}
                      </span>
                      
                      <span className="text-xs text-gray-400">
                        Confidence: <span className="font-mono text-gray-600 font-bold">{scan.aiScore}%</span>
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}

          {/* Empty State */}
          {results.length === 0 && (
            <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-300">
              <div className="inline-flex p-4 bg-gray-100 rounded-full text-gray-400 mb-4">
                <Search size={32} />
              </div>
              <h3 className="text-lg font-bold text-gray-900">No results found</h3>
              <p className="text-gray-500 mb-6">
                We couldn't find any verifications matching "{query}".
              </p>
              <Link 
                href="/scan" 
                className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
              >
                Scan it yourself
              </Link>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}