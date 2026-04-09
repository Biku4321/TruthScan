import connectDB from "../../lib/db";
import Scan from "../../models/Scan";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import {
  ImageIcon,
  FileText,
  Calendar,
  Mic,
  Video,
  Filter,
} from "lucide-react";
import ScanThumbnail from "../../components/ScanThumbnail";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{ filter?: string }>;
};

export default async function HistoryPage({ searchParams }: Props) {
  const { userId } = await auth();
  if (!userId) redirect("/");

  const resolvedParams = await searchParams;
  const filter = resolvedParams?.filter || "all";

  await connectDB();

  let query: any = { userId };

  if (filter === "text") {
    query.imageUrl = "TEXT_SCAN";
  } else if (filter === "audio") {
    query.imageUrl = { $regex: /\.(mp3|wav|m4a)$/i };
  } else if (filter === "video") {
    query = {
      userId,
      $or: [
        { imageUrl: { $regex: /\.(mp4|webm|mov)$/i } },
        { "metaData.Source": "Video File" },
      ],
    };
  } else if (filter === "image") {
    query = {
      userId,
      imageUrl: {
        $ne: "TEXT_SCAN",
        $not: { $regex: /\.(mp3|wav|m4a|mp4|webm)$/i },
      },
      "metaData.Source": { $ne: "Video File" },
    };
  }

  const scans = await Scan.find(query).sort({ createdAt: -1 }).limit(50).lean();

  const getFilterStyle = (f: string, colorClass: string) =>
    filter === f
      ? `${colorClass} shadow-md ring-1 ring-black/5`
      : "text-gray-500 hover:bg-gray-100";

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-12 px-4">
      <div className="max-w-7xl mx-auto">

        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
          <div className="space-y-2">
            <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">
              Mission Archive
            </h1>
            <p className="text-gray-500 font-medium max-w-lg">
              A secure record of all verified content. Analyze past forensics and detection results.
            </p>
          </div>

          {/* FILTER BAR */}
          <div className="flex items-center p-1.5 bg-white rounded-2xl shadow-sm border border-gray-200/60 overflow-x-auto max-w-full">
            <Link href="/history?filter=all" className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${getFilterStyle("all", "bg-gray-900 text-white")}`}>
              All Scans
            </Link>
            <div className="w-px h-6 bg-gray-200 mx-1" />
            <Link href="/history?filter=image" className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${getFilterStyle("image", "bg-blue-50 text-blue-600")}`}>
              <ImageIcon size={16} /> Images
            </Link>
            <Link href="/history?filter=video" className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${getFilterStyle("video", "bg-orange-50 text-orange-600")}`}>
              <Video size={16} /> Video
            </Link>
            <Link href="/history?filter=audio" className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${getFilterStyle("audio", "bg-red-50 text-red-600")}`}>
              <Mic size={16} /> Audio
            </Link>
            <Link href="/history?filter=text" className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${getFilterStyle("text", "bg-purple-50 text-purple-600")}`}>
              <FileText size={16} /> Text
            </Link>
          </div>
        </div>

        {/* GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {scans.map((scan: any) => {
            const isText  = scan.imageUrl === "TEXT_SCAN";
            const isAudio = /\.(mp3|wav|m4a)$/i.test(scan.imageUrl);
            const isBase64 = typeof scan.imageUrl === "string" && scan.imageUrl.startsWith("data:");
            const isVideo =
              /\.(mp4|webm)$/i.test(scan.imageUrl) ||
              scan.metaData?.Source === "Video File" ||
              isBase64;

            const isFake  = scan.aiScore > 50;
            const dateStr = new Date(scan.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" });

            return (
              <Link
                href={`/share/${scan._id}`}
                key={scan._id.toString()}
                className={`group relative flex flex-col bg-white rounded-3xl overflow-hidden transition-all duration-500 hover:-translate-y-2 shadow-sm
                  ${isFake
                    ? "hover:shadow-[0_20px_40px_-15px_rgba(239,68,68,0.2)] border border-red-100"
                    : "hover:shadow-[0_20px_40px_-15px_rgba(34,197,94,0.2)] border border-green-100"
                  }`}
              >
                {/* THUMBNAIL — client component handles onError safely */}
                <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
                  <ScanThumbnail
                    imageUrl={scan.imageUrl}
                    isText={isText}
                    isAudio={isAudio}
                    isVideo={isVideo}
                    isBase64={isBase64}
                    textSnippet={scan.modelRawOutput?.text_snippet}
                    frameCount={scan.modelRawOutput?.frameCount}
                  />

                  {/* Date badge */}
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md text-gray-600 text-[10px] font-bold px-2.5 py-1 rounded-lg shadow-sm flex items-center gap-1 z-10">
                    <Calendar size={10} />
                    {dateStr}
                  </div>
                </div>

                {/* CARD FOOTER */}
                <div className="p-5 flex-1 flex flex-col justify-between bg-white relative">
                  <div className={`absolute top-0 left-0 right-0 h-1 ${isFake ? "bg-red-500" : "bg-green-500"}`} />

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-[10px] font-extrabold uppercase tracking-widest px-2 py-1 rounded-md
                        ${isFake ? "bg-red-50 text-red-600" : "bg-green-50 text-green-600"}`}>
                        {isFake ? "⚠️ Fake" : "✅ Real"}
                      </span>
                      <span className="text-xs font-mono font-bold text-gray-400">
                        {scan.aiScore}% AI
                      </span>
                    </div>

                    <h3 className="font-bold text-gray-900 text-base mb-1 truncate">
                      {isText ? "Text Analysis" : isAudio ? "Audio Forensics" : isVideo ? "Video Frame Analysis" : "Visual Scan"}
                    </h3>

                    <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                      {scan.verdict || (isFake ? "High probability of AI manipulation detected." : "No significant anomalies found.")}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-gray-50 flex items-center justify-between text-xs font-medium text-gray-400 group-hover:text-blue-600 transition-colors">
                    <span>View Report</span>
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* EMPTY STATE */}
        {scans.length === 0 && (
          <div className="flex flex-col items-center justify-center py-32 text-center animate-in fade-in slide-in-from-bottom-4">
            <div className="bg-gray-100 p-6 rounded-full mb-6 relative">
              <Filter className="text-gray-400 w-10 h-10" />
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-400 rounded-full animate-pulse" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No scans found</h3>
            <p className="text-gray-500 mb-8 max-w-md mx-auto leading-relaxed">
              We couldn&apos;t find any {filter === "all" ? "" : filter} content in your archive.
              The truth is out there, go find it.
            </p>
            <Link
              href="/scan"
              className="bg-gray-900 text-white px-8 py-3 rounded-xl hover:bg-black font-bold transition-all hover:shadow-xl hover:shadow-gray-300"
            >
              Start New Investigation
            </Link>
          </div>
        )}

      </div>
    </div>
  );
}