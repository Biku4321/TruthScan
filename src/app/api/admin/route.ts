import { NextResponse } from "next/server";
import connectDB from "../../../lib/db";
import Scan from "../../../models/Scan";
import QuizQuestion from "../../../models/QuizQuestion";
import { auth } from "@clerk/nextjs/server";

const ADMIN_ID = process.env.ADMIN_USER_ID; 

// 1. GET ALL SCANS (For Moderation Dashboard)
export async function GET(req: Request) {
  const { userId } = await auth();
  if (userId !== ADMIN_ID) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  try {
    await connectDB();
    // Fetch last 50 scans, sorted by newest first
    const scans = await Scan.find().sort({ createdAt: -1 }).limit(50);
    return NextResponse.json(scans);
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch scans" }, { status: 500 });
  }
}

// 2.QUIZ QUESTION (Admin uploads image -> Gets URL -> Saves here)
export async function POST(req: Request) {
  const { userId } = await auth();
  if (userId !== ADMIN_ID) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  try {
    const body = await req.json();
    await connectDB();
    
    // Create new question in DB
    const newQuestion = await QuizQuestion.create({ 
        imageUrl: body.imageUrl,
        isAi: body.isAi,
        correctAnswer: body.isAi ? "fake" : "real",
        explanation: body.explanation,
        addedBy: userId 
    });
    
    return NextResponse.json({ success: true, data: newQuestion });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to add question" }, { status: 500 });
  }
}

// 3. DELETE CONTENT (Moderation)
export async function DELETE(req: Request) {
  const { userId } = await auth();
  if (userId !== ADMIN_ID) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  try {
    const { scanId } = await req.json();
    await connectDB();
    await Scan.findByIdAndDelete(scanId);
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}