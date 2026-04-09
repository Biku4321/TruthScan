"use client";
import { useState } from "react";
import { ThumbsUp, ThumbsDown, Users } from "lucide-react";
import { useUser, SignInButton } from "@clerk/nextjs";

interface CommunityVotingProps {
  scanId: string;
  initialAgree: number;
  initialDisagree: number;
  initialUserVote?: "agree" | "disagree" | null;
  aiVerdict: string;
}

export default function CommunityVoting({
  scanId,
  initialAgree,
  initialDisagree,
  initialUserVote = null,
  aiVerdict,
}: CommunityVotingProps) {
  const { isSignedIn } = useUser();
  const [agreeCount, setAgreeCount] = useState(initialAgree);
  const [disagreeCount, setDisagreeCount] = useState(initialDisagree);
  const [userVote, setUserVote] = useState<"agree" | "disagree" | null>(initialUserVote);
  const [loading, setLoading] = useState(false);

  const total = agreeCount + disagreeCount;
  const agreePercent = total > 0 ? Math.round((agreeCount / total) * 100) : 50;

  const handleVote = async (vote: "agree" | "disagree") => {
    if (!isSignedIn || loading) return;

    // Optimistic update
    const prevVote = userVote;
    const prevAgree = agreeCount;
    const prevDisagree = disagreeCount;

    setUserVote(vote);
    if (prevVote === vote) {
      // Toggle off (not supported by current API — just re-vote)
      return;
    }
    if (prevVote === "agree") setAgreeCount((c) => Math.max(0, c - 1));
    if (prevVote === "disagree") setDisagreeCount((c) => Math.max(0, c - 1));
    if (vote === "agree") setAgreeCount((c) => c + 1);
    if (vote === "disagree") setDisagreeCount((c) => c + 1);

    setLoading(true);
    try {
      const res = await fetch("/api/scan/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scanId, vote }),
      });
      if (!res.ok) throw new Error("Vote failed");
      const data = await res.json();
      setAgreeCount(data.agreeCount);
      setDisagreeCount(data.disagreeCount);
    } catch {
      // Revert on error
      setUserVote(prevVote);
      setAgreeCount(prevAgree);
      setDisagreeCount(prevDisagree);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4 bg-slate-50 border-b border-slate-200">
        <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
          <Users size={16} className="text-purple-600" />
        </div>
        <div>
          <h4 className="font-bold text-slate-900 text-sm">Community Verdict</h4>
          <p className="text-xs text-slate-400">
            {total > 0 ? `${total} vote${total !== 1 ? "s" : ""}` : "Be the first to vote"}
          </p>
        </div>
      </div>

      <div className="px-5 py-5 space-y-4">
        {/* AI verdict label */}
        <p className="text-xs text-slate-500 leading-relaxed">
          AI verdict: <span className="font-bold text-slate-800">{aiVerdict}</span>. Do you agree?
        </p>

        {/* Vote buttons */}
        {isSignedIn ? (
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => handleVote("agree")}
              disabled={loading}
              className={`flex flex-col items-center gap-2 py-4 rounded-xl border-2 font-bold text-sm transition-all duration-200 hover:scale-[1.02]
                ${userVote === "agree"
                  ? "bg-green-50 border-green-400 text-green-700 shadow-md shadow-green-100"
                  : "bg-white border-slate-200 text-slate-600 hover:border-green-300 hover:bg-green-50"
                } disabled:opacity-50`}
            >
              <ThumbsUp size={22} className={userVote === "agree" ? "fill-green-600 text-green-600" : ""} />
              <span>Agree</span>
              <span className="text-lg font-black">{agreeCount}</span>
            </button>

            <button
              onClick={() => handleVote("disagree")}
              disabled={loading}
              className={`flex flex-col items-center gap-2 py-4 rounded-xl border-2 font-bold text-sm transition-all duration-200 hover:scale-[1.02]
                ${userVote === "disagree"
                  ? "bg-red-50 border-red-400 text-red-700 shadow-md shadow-red-100"
                  : "bg-white border-slate-200 text-slate-600 hover:border-red-300 hover:bg-red-50"
                } disabled:opacity-50`}
            >
              <ThumbsDown size={22} className={userVote === "disagree" ? "fill-red-600 text-red-600" : ""} />
              <span>Disagree</span>
              <span className="text-lg font-black">{disagreeCount}</span>
            </button>
          </div>
        ) : (
          <SignInButton mode="modal">
            <button className="w-full py-3 border-2 border-dashed border-slate-200 rounded-xl text-slate-500 text-sm font-medium hover:border-slate-300 hover:bg-slate-50 transition-colors">
              Sign in to vote
            </button>
          </SignInButton>
        )}

        {/* Consensus bar */}
        {total > 0 && (
          <div className="space-y-1.5 pt-1">
            <div className="flex justify-between text-[11px] font-bold text-slate-500">
              <span className="text-green-600">{agreePercent}% agree</span>
              <span className="text-red-500">{100 - agreePercent}% disagree</span>
            </div>
            <div className="h-2 bg-red-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-green-500 rounded-full transition-all duration-500"
                style={{ width: `${agreePercent}%` }}
              />
            </div>
            <p className="text-[10px] text-slate-400 text-center">
              Community consensus based on {total} response{total !== 1 ? "s" : ""}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
