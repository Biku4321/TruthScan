import { auth } from "@clerk/nextjs/server";
import connectDB from "../../lib/db";
import Scan from "../../models/Scan";
import UserStats from "../../models/UserStats"; // FIX: Import UserStats for accurate score
import Link from "next/link";
import { redirect } from "next/navigation";
import { Shield, ShieldAlert, ShieldCheck, Clock, Calendar } from "lucide-react";

export default async function DashboardPage() {
  // 1. Get the current Logged In User
  const { userId } = await auth();

  // If not logged in, kick them out (Middleware usually handles this, but safety first)
  if (!userId) {
    redirect("/");
  }

  await connectDB();

  // 2. Fetch ONLY this user's scans
  const scans = await Scan.find({ userId }).sort({ createdAt: -1 }).lean();

  // 3. Calculate Stats
  const totalScans = scans.length;
  const fakeScans = scans.filter((s: any) => s.aiScore > 50).length;
  const realScans = totalScans - fakeScans;
  

  // Fallback to local calculation if UserStats doesn't exist yet
  const userStats = await UserStats.findOne({ userId }).lean() as any;
  const truthScore = userStats?.truthScore ?? (totalScans * 10) + (fakeScans * 50);

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        
        {/* Header Section */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-gray-900">My Dashboard</h1>
          <p className="text-gray-500 mt-1">Track your verification history and impact.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* Card 1: Total Points */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
              <Shield size={32} />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Truth Score</p>
              <h3 className="text-3xl font-bold text-gray-900">{truthScore}</h3>
            </div>
          </div>

          {/* Card 2: Fakes Caught */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="p-3 bg-red-100 text-red-600 rounded-xl">
              <ShieldAlert size={32} />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Fakes Detected</p>
              <h3 className="text-3xl font-bold text-gray-900">{fakeScans}</h3>
            </div>
          </div>

          {/* Card 3: Real Content */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="p-3 bg-green-100 text-green-600 rounded-xl">
              <ShieldCheck size={32} />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Verified Authentic</p>
              <h3 className="text-3xl font-bold text-gray-900">{realScans}</h3>
            </div>
          </div>
        </div>

        {/* Recent Scans Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <h2 className="text-lg font-bold text-gray-900">Your Recent Scans</h2>
            <Link href="/scan" className="text-sm text-blue-600 hover:underline font-medium">
              + New Scan
            </Link>
          </div>

          {scans.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {scans.map((scan: any) => (
                <div key={scan._id} className="p-4 flex items-center gap-4 hover:bg-gray-50 transition-colors">
                  {/* Thumbnail */}
                  <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0 border border-gray-200">
                    <img 
                      src={scan.imageUrl} 
                      alt="Scan thumbnail" 
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full border
                        ${scan.aiScore > 50 
                          ? "bg-red-50 text-red-700 border-red-100" 
                          : "bg-green-50 text-green-700 border-green-100"
                        }`}
                      >
                        {scan.aiScore > 50 ? "AI FAKE" : "REAL"}
                      </span>
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <Calendar size={12} />
                        {new Date(scan.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 truncate">
                      Detection Score: <span className="font-medium text-gray-900">{scan.aiScore}%</span>
                    </p>
                  </div>

                  {/* Action */}
                  <Link 
                    href={`/share/${scan._id}`}
                    className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200"
                  >
                    View Report
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center">
              <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                <Clock size={32} />
              </div>
              <h3 className="text-lg font-medium text-gray-900">No scans yet</h3>
              <p className="text-gray-500 mb-6">Upload your first image to start tracking stats.</p>
              <Link 
                href="/scan" 
                className="inline-flex bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-medium"
              >
                Scan Now
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}