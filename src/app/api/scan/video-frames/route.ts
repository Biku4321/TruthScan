import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import connectDB from "../../../../lib/db";
import Scan from "../../../../models/Scan";
import UserStats from "../../../../models/UserStats";

const DETECTOR_URL = "https://router.huggingface.co/hf-inference/models/Organika/sdxl-detector";
const MAX_FRAMES = 8;

async function analyzeFrame(base64DataUrl: string): Promise<number | null> {
  try {
    // Strip the data:image/jpeg;base64, prefix
    const base64Data = base64DataUrl.split(",")[1];
    const buffer = Buffer.from(base64Data, "base64");
    const blob = new Blob([buffer], { type: "image/jpeg" });

    const res = await fetch(DETECTOR_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
        "Content-Type": "application/octet-stream",
      },
      body: blob,
    });

    if (!res.ok) return null;
    const data = await res.json();
    if (!Array.isArray(data)) return null;

    const fake = data.find((item: any) =>
      ["artificial", "fake", "ai"].includes(item.label?.toLowerCase())
    );
    if (fake) return Math.round(fake.score * 100);

    const real = data.find((item: any) =>
      ["real", "human"].includes(item.label?.toLowerCase())
    );
    if (real) return 100 - Math.round(real.score * 100);

    return null;
  } catch {
    return null;
  }
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    const body = await req.json();
    const { frames, originalFileName } = body;

    if (!Array.isArray(frames) || frames.length === 0) {
      return NextResponse.json({ error: "No frames provided." }, { status: 400 });
    }

    // Cap to MAX_FRAMES
    const framesToAnalyze = frames.slice(0, MAX_FRAMES);

    // Analyze all frames in parallel
    const frameScores = await Promise.all(framesToAnalyze.map(analyzeFrame));
    const validScores = frameScores.filter((s): s is number => s !== null);

    if (validScores.length === 0) {
      return NextResponse.json({ error: "Could not analyze any frames." }, { status: 500 });
    }

    // Average score across all frames
    const avgScore = Math.round(validScores.reduce((a, b) => a + b, 0) / validScores.length);
    const maxScore = Math.max(...validScores);
    const minScore = Math.min(...validScores);
    const verdict = avgScore > 50 ? "Likely AI-Generated (Video)" : "Likely Real (Video)";

    // Save to DB using first frame as thumbnail
    await connectDB();
    const newScan = await Scan.create({
      userId: userId || null,
      imageUrl: frames[0], // use first frame as thumbnail
      aiScore: avgScore,
      verdict,
      modelRawOutput: {
        frameCount: framesToAnalyze.length,
        validFrames: validScores.length,
        frameScores: validScores,
        avgScore,
        maxScore,
        minScore,
        originalFileName: originalFileName || "video",
      },
      metaData: { Source: "Video File", FrameAnalysis: `${validScores.length} frames analyzed` },
      confidenceBreakdown: {
        detector: avgScore,
        metadata: 30,
        captionMismatch: avgScore > 50 ? 60 : 20,
      },
    });

    // Update stats
    if (userId) {
      const user = await currentUser();
      const isFake = avgScore > 50;
      const pointsEarned = 10 + (isFake ? 50 : 0);
      await UserStats.findOneAndUpdate(
        { userId },
        {
          $set: {
            userName: user?.firstName || "Agent",
            avatarUrl: user?.imageUrl || "",
            lastActive: new Date(),
          },
          $inc: {
            totalScans: 1,
            fakesDetected: isFake ? 1 : 0,
            truthScore: pointsEarned,
            weeklyScore: pointsEarned,
          },
        },
        { upsert: true, returnDocument: "after" }
      );
    }

    return NextResponse.json({
      success: true,
      scanId: newScan._id,
      avgScore,
      maxScore,
      minScore,
      frameScores: validScores,
      framesAnalyzed: validScores.length,
      verdict,
    });
  } catch (err) {
    console.error("Video frames error:", err);
    return NextResponse.json({ error: "Video analysis failed." }, { status: 500 });
  }
}
