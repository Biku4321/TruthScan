import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import connectDB from "../../../../lib/db";
import Scan from "../../../../models/Scan";

// POST: Cast or update a vote
export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { scanId, vote } = await req.json();
    if (!scanId || !["agree", "disagree"].includes(vote)) {
      return NextResponse.json({ error: "Invalid vote" }, { status: 400 });
    }

    await connectDB();

    
    await Scan.updateOne(
      { _id: scanId },
      { $pull: { votes: { userId } } }
    );
    await Scan.updateOne(
      { _id: scanId },
      { $push: { votes: { userId, vote } } }
    );

    // Return updated vote counts
    const scan = await Scan.findById(scanId, { votes: 1 }).lean() as any;
    const agreeCount = scan?.votes?.filter((v: any) => v.vote === "agree").length ?? 0;
    const disagreeCount = scan?.votes?.filter((v: any) => v.vote === "disagree").length ?? 0;

    return NextResponse.json({ success: true, agreeCount, disagreeCount, userVote: vote });
  } catch (err) {
    console.error("Vote error:", err);
    return NextResponse.json({ error: "Failed to record vote" }, { status: 500 });
  }
}
