import { NextResponse } from "next/server";
import connectDB from "../../../lib/db"; // <--- Import DB Connection
import Scan from "../../../models/Scan";
import { auth, currentUser } from "@clerk/nextjs/server";
import UserStats from "../../../models/UserStats";

// Model 1: Detector (Real vs Fake)
const DETECTOR_URL = "https://router.huggingface.co/hf-inference/models/Organika/sdxl-detector";

// Model 2: Captioner (Reverse Prompting)
const CAPTION_URL = "https://api-inference.huggingface.co/models/Salesforce/blip-image-captioning-base";

// Helper: Check if file is audio
const isAudio = (url: string) => /\.(mp3|wav|m4a)$/i.test(url);

// Helper: Retry logic for AI models
async function queryHuggingFace(url: string, data: Blob, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      // AbortSignal.timeout prevents the socket from hanging indefinitely
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 20000); // 20s timeout

      const response = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
          "Content-Type": "application/octet-stream",
        },
        body: data,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        return await response.json();
      }

      // If model is loading (503), wait and retry
      if (response.status === 503) {
        console.log(`Model at ${url} is loading... attempt ${i + 1}`);
        let waitTime = 3000;
        try {
          const errorData = await response.json();
          waitTime = errorData.estimated_time ? Math.min(errorData.estimated_time * 1000, 10000) : 3000;
        } catch {}
        await new Promise((r) => setTimeout(r, waitTime));
        continue;
      }

      // If 404, return null (don't crash)
      if (response.status === 404) {
        console.warn(`Model URL not found: ${url}`);
        return null;
      }

      const errText = await response.text();
      console.warn(`HF Error ${response.status}: ${errText}`);

    } catch (netErr: any) {
      if (netErr?.name === "AbortError") {
        console.warn(`HF request timed out (attempt ${i + 1}/${retries})`);
      } else {
        console.warn(`Network error contacting HF (attempt ${i + 1}/${retries}):`, netErr?.message ?? netErr);
      }
      // Exponential backoff before retry
      if (i < retries - 1) await new Promise((r) => setTimeout(r, (i + 1) * 1500));
    }
  }
  return null;
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth(); 
    const body = await req.json();
    const { imageUrl, metaData } = body;

    if (!imageUrl) return NextResponse.json({ error: "File URL is required" }, { status: 400 });

    const fileIsAudio = isAudio(imageUrl);
    console.log("Analyzing URL:", imageUrl, "Is Audio:", fileIsAudio);

    let aiScore = 0;
    let verdict = "Likely Human-Made";
    let detectorResult = [];
    let generatedPrompt = "Analysis unavailable";

    // --- LOGIC SPLIT: AUDIO VS IMAGE ---
    if (fileIsAudio) {
       // AUDIO LOGIC: Skip AI models 
       verdict = "Manual Analysis Required"; 
       aiScore = 0; 
       generatedPrompt = "Audio spectral analysis ready for inspection.";
    } else {
       // IMAGE LOGIC: Run AI Models
       
       // 1. Fetch image as blob
       const imageResponse = await fetch(imageUrl);
       const imageBlob = await imageResponse.blob();

       // 2. Run Detector
       const detectorData = await queryHuggingFace(DETECTOR_URL, imageBlob);
       
       if (detectorData && Array.isArray(detectorData)) {
           detectorResult = detectorData;
           const fakePrediction = detectorResult.find((item: any) => 
               ["artificial", "fake", "ai"].includes(item.label.toLowerCase())
           );
           if (fakePrediction) {
               aiScore = Math.round(fakePrediction.score * 100);
           } else {
               const realPrediction = detectorResult.find((item: any) => 
                   ["real", "human"].includes(item.label.toLowerCase())
               );
               if (realPrediction) aiScore = 100 - Math.round(realPrediction.score * 100);
           }
       }
       
       if (aiScore > 50) verdict = "Likely AI-Generated";

       // 3. Run Captioner
       const captionData = await queryHuggingFace(CAPTION_URL, imageBlob, 5);
       
       if (captionData && Array.isArray(captionData) && captionData[0].generated_text) {
           generatedPrompt = captionData[0].generated_text;
       }
    }

    // 4. Save to MongoDB
    await connectDB();
    
    // Build confidence breakdown for each signal
    const detectorScore = aiScore;
    const metadataScore = (() => {
      if (fileIsAudio) return 0;
      const meta = metaData || {};
      // Missing camera make/model on an image is suspicious
      if (!meta.Make && !meta.Model && !meta.Software) return 65;
      // Known AI software tags
      if (meta.Software && /stable diffusion|midjourney|dall-e|firefly|adobe ai/i.test(meta.Software)) return 90;
      return 10;
    })();
    const captionScore = (() => {
      if (fileIsAudio || !generatedPrompt || generatedPrompt === "Analysis unavailable") return 0;
      // If caption mentions clearly synthetic descriptors
      if (/digital art|render|3d|illustration|anime|cartoon/i.test(generatedPrompt)) return 75;
      return aiScore > 50 ? 55 : 15;
    })();

    const confidenceBreakdown = {
      detector: detectorScore,
      metadata: metadataScore,
      captionMismatch: captionScore,
    };

    const fullResult = {
        detector: detectorResult,
        generated_prompt: generatedPrompt 
    };
    
    const newScan = await Scan.create({
      userId: userId || null,
      imageUrl,
      aiScore,
      verdict,
      modelRawOutput: fullResult, 
      metaData: metaData || {},
      confidenceBreakdown,
    });

    // 5. Update Leaderboard
    if (userId) {
      try {
        const user = await currentUser();
        const userName = user?.firstName || "Anonymous Agent";
        const avatarUrl = user?.imageUrl || "";
        const isFakeVerdict = aiScore > 50; 
        
        const pointsEarned = 10 + (isFakeVerdict ? 50 : 0);

        await UserStats.findOneAndUpdate(
          { userId },
          {
            $set: { userName, avatarUrl, lastActive: new Date() },
            $inc: { 
              totalScans: 1, 
              fakesDetected: isFakeVerdict ? 1 : 0,
              truthScore: pointsEarned,
              weeklyScore: pointsEarned,      // Also increment weekly score
            }
          },
          { upsert: true, returnDocument: "after" }
        );
      } catch (err) {
        console.error("Stats update error:", err);
      }
    }

    return NextResponse.json({
      success: true,
      scanId: newScan._id,
      score: aiScore,
      verdict: verdict,
      details: fullResult,
      confidenceBreakdown,
    });

  } catch (error) {
    console.error("Server Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}