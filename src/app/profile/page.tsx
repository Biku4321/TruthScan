import connectDB from "../../lib/db";
import UserStats from "../../models/UserStats";
import Scan from "../../models/Scan"; // Import Scan model for history
import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { calculateLevel, BADGES } from "../../lib/gamification"; // Using your helper
import Link from "next/link";
import { 
  Calendar, 
  Mail, 
  ShieldCheck, 
  Clock, 
  ChevronRight, 
  Mic, 
  FileText, 
  ImageIcon, 
  Lock 
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const { userId } = await auth();
  const user = await currentUser();

  if (!userId) redirect("/sign-in");

  await connectDB();
  
  // 1. Fetch Stats
  const stats = await UserStats.findOne({ userId }).lean() || {
    truthScore: 0,
    totalScans: 0,
    fakesDetected: 0,
    lastActive: new Date(),
  };

  // 2. Fetch Recent Scans (The "Activity Feed")
  const recentScans = await Scan.find({ userId })
    .sort({ createdAt: -1 })
    .limit(5) // Show last 5
    .lean();

  // 3. Calculate Level & Progress
  const { current: level, next: nextLevel, progress } = calculateLevel(stats.truthScore);

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* --- SECTION 1: THE AGENT ID CARD --- */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 relative group">
          {/* Cover Art */}
          <div className="h-40 bg-gradient-to-r from-gray-900 via-blue-900 to-gray-900 relative overflow-hidden">
             <div className="absolute inset-0 bg-[url('/cubes.svg')] opacity-20"></div>
             <div className="absolute top-4 right-4 bg-white/10 backdrop-blur-md text-white text-xs font-mono px-3 py-1 rounded-full border border-white/20">
                STATUS: ACTIVE
             </div>
          </div>
          
          <div className="px-8 pb-8">
            <div className="relative flex flex-col md:flex-row justify-between items-end -mt-16 mb-6">
              
              {/* Avatar & Name */}
              <div className="flex items-end gap-6">
                <div className="relative">
                    <div className="w-32 h-32 rounded-3xl border-[6px] border-white shadow-lg overflow-hidden bg-white">
                        <img 
                            src={user?.imageUrl} 
                            alt="Agent" 
                            className="w-full h-full object-cover"
                        />
                    </div>
                    {/* Level Badge on Avatar */}
                    <div className="absolute -bottom-2 -right-2 bg-blue-600 text-white w-10 h-10 flex items-center justify-center rounded-full border-4 border-white font-bold text-sm shadow-sm">
                        {level.level}
                    </div>
                </div>
                
                <div className="mb-2">
                  <h1 className="text-3xl font-bold text-gray-900">{user?.fullName}</h1>
                  <div className="flex items-center gap-2 text-gray-500 font-medium">
                    <ShieldCheck size={18} className="text-blue-500" />
                    Rank: <span className="text-blue-700 font-bold">{level.name}</span>
                  </div>
                </div>
              </div>

              {/* Big Stats */}
              <div className="hidden md:flex gap-8 text-center bg-gray-50 p-4 rounded-2xl border border-gray-100 mt-6 md:mt-0">
                <div>
                   <div className="text-2xl font-extrabold text-gray-900">{stats.totalScans}</div>
                   <div className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Scans</div>
                </div>
                <div>
                   <div className="text-2xl font-extrabold text-gray-900">{stats.fakesDetected}</div>
                   <div className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Catches</div>
                </div>
                <div>
                   <div className="text-2xl font-extrabold text-blue-600">{stats.truthScore}</div>
                   <div className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">XP Points</div>
                </div>
              </div>
            </div>

            {/* XP Progress Bar */}
            <div className="mb-2">
                <div className="flex justify-between text-xs font-bold text-gray-500 mb-1">
                    <span>Current XP: {stats.truthScore}</span>
                    <span>Next Rank: {nextLevel ? nextLevel.minScore : "MAX"}</span>
                </div>
                <div className="bg-gray-100 rounded-full h-3 overflow-hidden">
                    <div 
                        className="bg-gradient-to-r from-blue-500 to-indigo-600 h-full rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                        style={{ width: `${progress}%` }}
                    ></div>
                </div>
                <div className="text-right text-[10px] text-gray-400 mt-1">
                    {nextLevel ? `${nextLevel.minScore - stats.truthScore} XP to reach ${nextLevel.name}` : "Maximum Level Achieved"}
                </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* --- LEFT COLUMN: BADGES & CREDENTIALS --- */}
          <div className="lg:col-span-1 space-y-6">
             {/* Credentials Box */}
             <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2 border-b border-gray-100 pb-2">
                  <Mail size={18} className="text-gray-400" /> Agent Details
                </h3>
                <div className="space-y-4 text-sm">
                   <div>
                     <label className="block text-gray-400 text-[10px] uppercase font-bold mb-1">Email Clearance</label>
                     <div className="text-gray-700 truncate font-mono bg-gray-50 p-2 rounded">
                        {user?.primaryEmailAddress?.emailAddress}
                     </div>
                   </div>
                   <div>
                     <label className="block text-gray-400 text-[10px] uppercase font-bold mb-1">Service Start Date</label>
                     <div className="flex items-center gap-2 text-gray-700 font-medium">
                        <Calendar size={14} /> {new Date(user?.createdAt || Date.now()).toLocaleDateString()}
                     </div>
                   </div>
                </div>
             </div>

             {/* Badges Box (Compact) */}
             <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <ShieldCheck size={18} className="text-gray-400" /> Achievements
                </h3>
                <div className="grid grid-cols-2 gap-3">
                    {BADGES.map((badge) => {
                        const isUnlocked = badge.condition(stats);
                        const Icon = badge.icon;
                        return (
                            <div key={badge.id} className={`p-3 rounded-xl border flex flex-col items-center text-center gap-2 transition-all ${
                                isUnlocked ? "bg-white border-blue-100 shadow-sm" : "bg-gray-50 border-gray-100 opacity-50 grayscale"
                            }`}>
                                <div className={`p-2 rounded-full ${isUnlocked ? badge.color : "bg-gray-200"}`}>
                                    <Icon size={16} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold leading-tight">{badge.name}</p>
                                    {!isUnlocked && <Lock size={8} className="inline-block mt-1 text-gray-400"/>}
                                </div>
                            </div>
                        )
                    })}
                </div>
             </div>
          </div>

          {/* --- RIGHT COLUMN: RECENT ACTIVITY --- */}
          <div className="lg:col-span-2">
             <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                    <h3 className="font-bold text-gray-900 flex items-center gap-2">
                        <Clock size={20} className="text-blue-600" />
                        Mission History
                    </h3>
                    <Link href="/dashboard" className="text-xs font-bold text-blue-600 hover:underline">
                        View All
                    </Link>
                </div>

                <div className="divide-y divide-gray-50">
                    {recentScans.length > 0 ? recentScans.map((scan: any) => {
                        const isText = scan.imageUrl === "TEXT_SCAN";
                        const isAudio = /\.(mp3|wav|m4a)$/i.test(scan.imageUrl);
                        const isFake = scan.aiScore > 50;
                        const date = new Date(scan.createdAt).toLocaleDateString();

                        return (
                            <Link 
                                href={`/share/${scan._id}`}
                                key={scan._id}
                                className="block p-4 hover:bg-gray-50 transition-colors group"
                            >
                                <div className="flex items-center gap-4">
                                    {/* Icon Box */}
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                                        isText ? "bg-purple-100 text-purple-600" :
                                        isAudio ? "bg-red-100 text-red-600" :
                                        "bg-blue-100 text-blue-600"
                                    }`}>
                                        {isText ? <FileText size={20} /> : isAudio ? <Mic size={20} /> : <ImageIcon size={20} />}
                                    </div>

                                    {/* Details */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start">
                                            <h4 className="font-bold text-gray-900 text-sm truncate pr-2">
                                                {isText ? "Text Analysis" : isAudio ? "Audio Forensics" : "Image Verification"}
                                            </h4>
                                            <span className="text-[10px] text-gray-400 font-mono whitespace-nowrap">{date}</span>
                                        </div>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${
                                                isFake ? "bg-red-50 text-red-600" : "bg-green-50 text-green-600"
                                            }`}>
                                                {scan.verdict || (isFake ? "Likely Fake" : "Likely Real")}
                                            </span>
                                            <span className="text-xs text-gray-400">• {scan.aiScore}% Confidence</span>
                                        </div>
                                    </div>

                                    <ChevronRight size={16} className="text-gray-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
                                </div>
                            </Link>
                        );
                    }) : (
                        <div className="p-12 text-center">
                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3 text-gray-300">
                                <Clock size={32} />
                            </div>
                            <p className="text-gray-500 font-medium">No missions available.</p>
                            <Link href="/scan" className="text-blue-600 text-sm font-bold hover:underline mt-2 inline-block">
                                Start your first scan
                            </Link>
                        </div>
                    )}
                </div>
             </div>
          </div>

        </div>
      </div>
    </div>
  );
}