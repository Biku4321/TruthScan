import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import connectDB from "../../../../lib/db";
import Scan from "../../../../models/Scan";
import UserStats from "../../../../models/UserStats";
import { randomUUID } from "crypto";

const DETECTOR_URL = "https://router.huggingface.co/hf-inference/models/Organika/sdxl-detector";
const CAPTION_URL = "https://api-inference.huggingface.co/models/Salesforce/blip-image-captioning-base";
const MAX_BATCH = 10;

async function queryHuggingFace(url: string, data: Blob, retries = 2) {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
          "Content-Type": "application/octet-stream",
        },
        body: data,
      });
      if (res.ok) return await res.json();
      if (res.status === 503) {
        await new Promise((r) => setTimeout(r, 3000));
        continue;
      }
      return null;
    } catch {
      // continue on network errors
    }
  }
  return null;
}

async function analyzeSingleImage(imageUrl: string) {
  try {
    const imageRes = await fetch(imageUrl, { signal: AbortSignal.timeout(8000) });
    if (!imageRes.ok) return { imageUrl, error: "Could not fetch image", aiScore: 0, verdict: "Error" };
    const imageBlob = await imageRes.blob();

    let aiScore = 0;
    let verdict = "Likely Real";
    let generatedPrompt = "Unavailable";
    let detectorResult: any[] = [];

    const detectorData = await queryHuggingFace(DETECTOR_URL, imageBlob);
    if (detectorData && Array.isArray(detectorData)) {
      detectorResult = detectorData;
      const fake = detectorData.find((item: any) =>
        ["artificial", "fake", "ai"].includes(item.label.toLowerCase())
      );
      if (fake) aiScore = Math.round(fake.score * 100);
      else {
        const real = detectorData.find((item: any) =>
          ["real", "human"].includes(item.label.toLowerCase())
        );
        if (real) aiScore = 100 - Math.round(real.score * 100);
      }
    }
    if (aiScore > 50) verdict = "Likely AI-Generated";

    const captionData = await queryHuggingFace(CAPTION_URL, imageBlob);
    if (captionData?.[0]?.generated_text) generatedPrompt = captionData[0].generated_text;

    // Build breakdown
    const metadataScore = 30; // unknown for URL-only scans
    const captionScore = /digital art|render|3d|illustration|anime/i.test(generatedPrompt) ? 75 : aiScore > 50 ? 55 : 15;

    return {
      imageUrl,
      aiScore,
      verdict,
      confidenceBreakdown: { detector: aiScore, metadata: metadataScore, captionMismatch: captionScore },
      modelRawOutput: { detector: detectorResult, generated_prompt: generatedPrompt },
    };
  } catch (err: any) {
    return { imageUrl, error: err.message || "Analysis failed", aiScore: 0, verdict: "Error" };
  }
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    const body = await req.json();
    const { urls } = body;

    if (!Array.isArray(urls) || urls.length === 0) {
      return NextResponse.json({ error: "Provide an array of image URLs." }, { status: 400 });
    }
    if (urls.length > MAX_BATCH) {
      return NextResponse.json({ error: `Max ${MAX_BATCH} URLs per batch.` }, { status: 400 });
    }

    // Validate URL format
    const validUrls = urls.filter((u: any) => {
      try { new URL(u); return true; } catch { return false; }
    });
    if (validUrls.length === 0) {
      return NextResponse.json({ error: "No valid URLs provided." }, { status: 400 });
    }

    // Run all analyses in parallel
    const batchId = randomUUID();
    const results = await Promise.all(validUrls.map(analyzeSingleImage));

    // Save all to DB
    await connectDB();
    const savedScans = await Promise.all(
      results.map(async (r) => {
        if (r.error) return { ...r, scanId: null };
        const scan = await Scan.create({
          userId: userId || null,
          imageUrl: r.imageUrl,
          aiScore: r.aiScore,
          verdict: r.verdict,
          modelRawOutput: r.modelRawOutput,
          metaData: {},
          confidenceBreakdown: r.confidenceBreakdown,
          batchId,
        });
        return { ...r, scanId: scan._id.toString() };
      })
    );

    // Update user stats
    if (userId) {
      const successfulScans = savedScans.filter((r) => !r.error);
      const fakesFound = successfulScans.filter((r) => r.aiScore > 50).length;
      const pointsEarned = successfulScans.length * 10 + fakesFound * 50;

      if (pointsEarned > 0) {
        const user = await currentUser();
        await UserStats.findOneAndUpdate(
          { userId },
          {
            $set: {
              userName: user?.firstName || "Agent",
              avatarUrl: user?.imageUrl || "",
              lastActive: new Date(),
            },
            $inc: {
              totalScans: successfulScans.length,
              fakesDetected: fakesFound,
              truthScore: pointsEarned,
              weeklyScore: pointsEarned,
            },
          },
          { upsert: true, returnDocument: "after" }
        );
      }
    }

    const fakesDetected = savedScans.filter((r) => r.aiScore > 50).length;

    return NextResponse.json({
      success: true,
      batchId,
      total: validUrls.length,
      analyzed: savedScans.filter((r) => !r.error).length,
      fakesDetected,
      results: savedScans,
    });
  } catch (error) {
    console.error("Batch scan error:", error);
    return NextResponse.json({ error: "Batch analysis failed." }, { status: 500 });
  }
}
