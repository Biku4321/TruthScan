import { NextResponse } from "next/server";
import connectDB from "../../../lib/db";
import UserStats from "../../../models/UserStats";

// This route is called by Vercel Cron every Monday at 00:00 UTC
// Configure in vercel.json:
// {
//   "crons": [{ "path": "/api/cron/weekly-reset", "schedule": "0 0 * * 1" }]
// }

export async function GET(req: Request) {
  // Verify this request comes from Vercel Cron (not a random visitor)
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();

    const result = await UserStats.updateMany(
      {},
      {
        $set: {
          weeklyScore: 0,
          weeklyResetAt: new Date(),
        },
      }
    );

    console.log(`Weekly reset: cleared weeklyScore for ${result.modifiedCount} users`);

    return NextResponse.json({
      success: true,
      usersReset: result.modifiedCount,
      resetAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error("Weekly reset error:", err);
    return NextResponse.json({ error: "Reset failed" }, { status: 500 });
  }
}
