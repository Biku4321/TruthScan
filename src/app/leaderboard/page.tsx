import connectDB from "../../lib/db";
import UserStats from "../../models/UserStats";
import { auth, currentUser } from "@clerk/nextjs/server";
import { Medal, Trophy, Crown, Shield, Search, Zap } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function LeaderboardPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { userId: currentUserId } = await auth();
  const user = await currentUser();
  const { tab } = await searchParams;
  const activeTab = tab === "weekly" ? "weekly" : "alltime";

  await connectDB();

  const sortField = activeTab === "weekly" ? "weeklyScore" : "truthScore";

  const leaderboard = await UserStats.find()
    .sort({ [sortField]: -1 })
    .limit(50)
    .lean();

  const userRankIndex = leaderboard.findIndex((u: any) => u.userId === currentUserId);
  const userStats = leaderboard[userRankIndex] || {
    truthScore: 0,
    weeklyScore: 0,
    fakesDetected: 0,
    totalScans: 0,
    userName: user?.firstName || "You",
  };

  const getBadge = (rank: number) => {
    if (rank === 0) return { color: "text-yellow-500", icon: <Crown size={24} />, bg: "bg-yellow-100", label: "Grandmaster" };
    if (rank === 1) return { color: "text-gray-400", icon: <Medal size={24} />, bg: "bg-gray-100", label: "Master" };
    if (rank === 2) return { color: "text-orange-500", icon: <Medal size={24} />, bg: "bg-orange-100", label: "Elite" };
    return { color: "text-blue-500", icon: <Shield size={20} />, bg: "bg-blue-50", label: "Agent" };
  };

  const displayScore = (agent: any) =>
    activeTab === "weekly" ? (agent.weeklyScore ?? 0) : agent.truthScore;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        
        {/* HEADER */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-4 flex items-center justify-center gap-3">
            <Trophy className="text-yellow-500" size={40} />
            Truth Seekers Leaderboard
          </h1>
          <p className="text-gray-500 text-lg">
            Top agents dedicated to uncovering the truth.
          </p>
        </div>

        {/* TAB SWITCHER */}
        <div className="flex justify-center mb-8">
          <div className="flex bg-gray-100 p-1 rounded-xl gap-1">
            <Link
              href="/leaderboard?tab=alltime"
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-bold text-sm transition-all ${
                activeTab === "alltime"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <Trophy size={16} /> All-Time
            </Link>
            <Link
              href="/leaderboard?tab=weekly"
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-bold text-sm transition-all ${
                activeTab === "weekly"
                  ? "bg-white text-indigo-700 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <Zap size={16} className="text-yellow-500" /> This Week
            </Link>
          </div>
        </div>

        {activeTab === "weekly" && (
          <div className="mb-6 text-center text-xs text-gray-400 font-medium bg-yellow-50 border border-yellow-100 rounded-xl py-2 px-4">
            🔄 Weekly scores reset every Monday at midnight UTC
          </div>
        )}

        {/* CURRENT USER STATS (Floating Card) */}
        {currentUserId && (
          <div className="bg-white rounded-2xl shadow-lg border border-blue-100 p-6 mb-10 flex flex-col md:flex-row items-center justify-between transform hover:scale-[1.01] transition-transform">
            <div className="flex items-center gap-4 mb-4 md:mb-0">
              <div className="w-16 h-16 rounded-full overflow-hidden border-4 border-blue-100">
                <img src={user?.imageUrl || "/placeholder-user.jpg"} alt="You" className="w-full h-full object-cover" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  {user?.firstName || "Agent"} (You)
                </h3>
                <div className="flex gap-2 text-sm text-gray-500">
                  <span className="font-mono text-blue-600 font-bold">#{userRankIndex !== -1 ? userRankIndex + 1 : "Unranked"}</span>
                  <span>•</span>
                  <span>{userStats.totalScans} Scans</span>
                </div>
              </div>
            </div>

            <div className="flex gap-8 text-center">
              <div>
                <div className="text-2xl font-extrabold text-gray-900">{displayScore(userStats)}</div>
                <div className="text-xs text-gray-500 uppercase tracking-wider font-bold">
                  {activeTab === "weekly" ? "Weekly Pts" : "Truth Points"}
                </div>
              </div>
              <div>
                <div className="text-2xl font-extrabold text-green-600">{(userStats as any).fakesDetected ?? 0}</div>
                <div className="text-xs text-gray-500 uppercase tracking-wider font-bold">Fakes Caught</div>
              </div>
            </div>
          </div>
        )}

        {/* LEADERBOARD LIST */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
          {/* Table Header */}
          <div className="grid grid-cols-12 gap-4 p-4 bg-gray-50 border-b border-gray-200 text-xs font-bold text-gray-400 uppercase tracking-wider">
            <div className="col-span-2 text-center">Rank</div>
            <div className="col-span-6">Agent</div>
            <div className="col-span-2 text-center">{activeTab === "weekly" ? "Wkly Pts" : "Points"}</div>
            <div className="col-span-2 text-center hidden md:block">Fakes</div>
          </div>

          {/* Rows */}
          {leaderboard.map((agent: any, index: number) => {
            const badge = getBadge(index);
            const isCurrentUser = agent.userId === currentUserId;

            return (
              <div 
                key={agent.userId} 
                className={`grid grid-cols-12 gap-4 p-4 items-center border-b border-gray-100 transition-colors
                  ${isCurrentUser ? "bg-blue-50/50" : "hover:bg-gray-50"}
                `}
              >
                {/* RANK */}
                <div className="col-span-2 flex justify-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${badge.bg} ${badge.color}`}>
                     {index < 3 ? badge.icon : `#${index + 1}`}
                  </div>
                </div>

                {/* AGENT PROFILE */}
                <div className="col-span-6 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
                    <img 
                      src={agent.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${agent.userId}`} 
                      alt={agent.userName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h4 className={`font-bold text-sm ${isCurrentUser ? "text-blue-700" : "text-gray-900"}`}>
                      {agent.userName}
                      {isCurrentUser && <span className="ml-2 text-[10px] bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded-full">YOU</span>}
                    </h4>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${badge.color} bg-opacity-10 border border-opacity-20`}>
                      {badge.label}
                    </span>
                  </div>
                </div>

                {/* POINTS — uses displayScore for weekly/alltime */}
                <div className="col-span-2 text-center font-mono font-bold text-gray-900">
                  {displayScore(agent).toLocaleString()}
                </div>

                {/* FAKES DETECTED */}
                <div className="col-span-2 text-center hidden md:block">
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-red-600 bg-red-50 px-2 py-1 rounded-lg">
                    <Search size={12} /> {agent.fakesDetected}
                  </span>
                </div>
              </div>
            );
          })}

          {leaderboard.length === 0 && (
             <div className="p-12 text-center text-gray-500">
                No active agents yet. Be the first!
             </div>
          )}
        </div>

      </div>
    </div>
  );
}