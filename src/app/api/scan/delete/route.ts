import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import connectDB from "../../../../lib/db";
import Scan from "../../../../models/Scan";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    const { scanId } = await req.json();

    if (!userId || !scanId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    // Only allow deleting if the user owns the scan
    const result = await Scan.deleteOne({ _id: scanId, userId });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Scan not found or unauthorized" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}