import { NextResponse } from "next/server";
import connectDB from "../../../lib/db";
import QuizQuestion from "../../../models/QuizQuestion";

// GET: Fetch all quiz questions for the game
export async function GET() {
  try {
    await connectDB();
    const questions = await QuizQuestion.find().sort({ createdAt: -1 });
    return NextResponse.json(questions);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch questions" }, { status: 500 });
  }
}