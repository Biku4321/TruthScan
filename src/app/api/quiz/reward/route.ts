import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import connectDB from "../../../../lib/db";
import UserStats from "../../../../models/UserStats";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await currentUser();
    await connectDB();

    // Award 5 points for a correct quiz answer
    const POINTS_PER_WIN = 5;

    await UserStats.findOneAndUpdate(
      { userId },
      {
        $set: { 
          userName: user?.firstName || "Agent",
          avatarUrl: user?.imageUrl || "",
          lastActive: new Date() 
        },
        $inc: { 
          truthScore: POINTS_PER_WIN,
          weeklyScore: POINTS_PER_WIN,
        }
      },
      { upsert: true, returnDocument: "after" }
    );

    return NextResponse.json({ success: true, pointsAdded: POINTS_PER_WIN });

  } catch (error) {
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}