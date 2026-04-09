import { NextResponse } from "next/server";
import connectDB from "../../../../lib/db";
import Scan from "../../../../models/Scan";
import ApiKey from "../../../../models/ApiKey";
import { createHash } from "crypto";

const DETECTOR_URL = "https://router.huggingface.co/hf-inference/models/Organika/sdxl-detector";
const CAPTION_URL = "https://api-inference.huggingface.co/models/Salesforce/blip-image-captioning-base";
const RATE_LIMIT = 100; // requests per key per day (tracked via requestCount)

function hashKey(key: string) {
  return createHash("sha256").update(key).digest("hex");
}

async function queryHF(url: string, data: Blob, retries = 2) {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`, "Content-Type": "application/octet-stream" },
        body: data,
      });
      if (res.ok) return await res.json();
      if (res.status === 503) { await new Promise(r => setTimeout(r, 3000)); continue; }
      return null;
    } catch { }
  }
  return null;
}

export async function POST(req: Request) {
  // --- API Key Auth ---
  const apiKey = req.headers.get("x-api-key") || req.headers.get("authorization")?.replace("Bearer ", "");
  if (!apiKey) {
    return NextResponse.json(
      { error: "Missing API key. Pass it as X-Api-Key header or Authorization: Bearer <key>" },
      { status: 401 }
    );
  }

  await connectDB();

  const hashedKey = hashKey(apiKey);
  const keyDoc = await ApiKey.findOne({ key: hashedKey, active: true });
  if (!keyDoc) {
    return NextResponse.json({ error: "Invalid or revoked API key." }, { status: 403 });
  }
  if (keyDoc.requestCount >= RATE_LIMIT) {
    return NextResponse.json({ error: `Daily rate limit of ${RATE_LIMIT} requests exceeded.` }, { status: 429 });
  }

  // Increment usage
  await ApiKey.updateOne({ _id: keyDoc._id }, { $inc: { requestCount: 1 }, $set: { lastUsed: new Date() } });

  // --- Parse request ---
  let body: any;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  const { imageUrl } = body;
  if (!imageUrl) return NextResponse.json({ error: "imageUrl is required" }, { status: 400 });

  try {
    new URL(imageUrl);
  } catch {
    return NextResponse.json({ error: "imageUrl must be a valid URL" }, { status: 400 });
  }

  // --- Analyze ---
  let aiScore = 0;
  let verdict = "Likely Real";
  let detectorResult: any[] = [];
  let generatedPrompt = "Unavailable";

  const imageRes = await fetch(imageUrl, { signal: AbortSignal.timeout(8000) }).catch(() => null);
  if (!imageRes?.ok) return NextResponse.json({ error: "Could not fetch the provided imageUrl" }, { status: 400 });

  const imageBlob = await imageRes.blob();

  const detectorData = await queryHF(DETECTOR_URL, imageBlob);
  if (detectorData && Array.isArray(detectorData)) {
    detectorResult = detectorData;
    const fake = detectorData.find((item: any) => ["artificial", "fake", "ai"].includes(item.label.toLowerCase()));
    if (fake) aiScore = Math.round(fake.score * 100);
    else {
      const real = detectorData.find((item: any) => ["real", "human"].includes(item.label.toLowerCase()));
      if (real) aiScore = 100 - Math.round(real.score * 100);
    }
  }
  if (aiScore > 50) verdict = "Likely AI-Generated";

  const captionData = await queryHF(CAPTION_URL, imageBlob);
  if (captionData?.[0]?.generated_text) generatedPrompt = captionData[0].generated_text;

  // Save scan attributed to the key owner
  const scan = await Scan.create({
    userId: keyDoc.userId,
    imageUrl,
    aiScore,
    verdict,
    modelRawOutput: { detector: detectorResult, generated_prompt: generatedPrompt },
    metaData: { source: "public_api", keyPrefix: keyDoc.keyPrefix },
  });

  return NextResponse.json({
    success: true,
    scanId: scan._id.toString(),
    imageUrl,
    aiScore,
    verdict,
    isAiGenerated: aiScore > 50,
    confidence: aiScore > 50 ? aiScore : 100 - aiScore,
    caption: generatedPrompt,
    reportUrl: `${process.env.NEXT_PUBLIC_APP_URL}/share/${scan._id}`,
    requestsRemaining: RATE_LIMIT - keyDoc.requestCount - 1,
  });
}
