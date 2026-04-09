import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import connectDB from "../../../../lib/db";
import Scan from "../../../../models/Scan"; // We will reuse the Scan model
import { currentUser } from "@clerk/nextjs/server"; // Need full user details
import UserStats from "../../../../models/UserStats";

const CLASSIFIER_URL = "https://router.huggingface.co/hf-inference/models/facebook/bart-large-mnli";
const GENERATOR_URL = "https://router.huggingface.co/hf-inference/models/google/flan-t5-large";

export async function POST(req: Request) {
  try {
    // 1. Auth & Input Validation
    const { userId } = await auth();
    
    let body;
    try {
      body = await req.json();
    } catch (e) {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const { text } = body;
    if (!text || text.length < 50) {
      return NextResponse.json({ error: "Text is too short. Please provide at least 50 characters." }, { status: 400 });
    }

    console.log("Analyzing Text:", text.substring(0, 50));

    // --- STEP 1: CLASSIFICATION (BART) ---
    let classResult: any = { labels: ["unknown"], scores: [0] };
    try {
        const payloadClassifier = {
          inputs: text.substring(0, 1000), // Limit length
          parameters: {
            candidate_labels: ["objective news", "clickbait", "satire", "misinformation", "opinion"],
            multi_label: false, 
          },
        };

        const classRes = await fetch(CLASSIFIER_URL, {
          method: "POST",
          headers: { Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`, "Content-Type": "application/json" },
          body: JSON.stringify(payloadClassifier),
        });

        if (classRes.ok) {
             classResult = await classRes.json();
        } else {
            console.warn("Classifier failed:", await classRes.text());
        }
    } catch (err) {
        console.error("Classifier Error:", err);
    }
    
    // Parse Classification Results
    let topLabel = "unknown";
    let topScore = 0;

    if (Array.isArray(classResult) && classResult.length > 0) {
      topLabel = classResult[0].label;
      topScore = Math.round(classResult[0].score * 100);
    } else if (classResult.labels && classResult.scores) {
      topLabel = classResult.labels[0];
      topScore = Math.round(classResult.scores[0] * 100);
    }

    // --- STEP 2: GENERATE EXPLANATION (FLAN-T5) ---
    const prompt = `Analyze the tone of this headline: "${text.substring(0, 200)}". Is it sensational or neutral? Explain why in one short sentence.`;

    let explanation = "Analysis currently unavailable.";
    
    // Retry Loop for Explanation
    let retries = 2;
    while (retries > 0) {
        try {
            const genRes = await fetch(GENERATOR_URL, {
              method: "POST",
              headers: { Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`, "Content-Type": "application/json" },
              body: JSON.stringify({ inputs: prompt }),
            });

            if (genRes.ok) {
                const genResult = await genRes.json();
                if (Array.isArray(genResult) && genResult[0].generated_text) {
                    explanation = genResult[0].generated_text;
                } else if (genResult.generated_text) {
                    explanation = genResult.generated_text;
                }
                break; 
            } else {
                if (genRes.status === 503) {
                    await new Promise(r => setTimeout(r, 2000));
                    retries--;
                } else {
                    // Manual Fallback Logic if AI fails
                    if (topLabel === "clickbait") explanation = "This text uses emotional language typical of clickbait.";
                    else if (topLabel === "objective news") explanation = "The writing style appears neutral and informative.";
                    else if (topLabel === "satire") explanation = "The text appears to be humorous or exaggerated.";
                    else explanation = `Detected tone consistent with ${topLabel}.`;
                    break; 
                }
            }
        } catch (e) {
            retries--;
        }
    }

    // --- STEP 3: PREPARE FINAL VERDICT ---
    const isSafe = topLabel === "objective news" || topLabel === "opinion";
    const aiScore = isSafe ? (100 - topScore) : topScore;
    const verdict = `Likely ${topLabel.toUpperCase()}`;

    // *** THIS IS WHERE FACT CHECK LINKS ARE CREATED ***
    const query = encodeURIComponent(text.substring(0, 50));
    const searchLinks = [
      { name: "Google Search", url: `https://www.google.com/search?q=${query}` },
      { name: "Google News", url: `https://news.google.com/search?q=${query}` },
      { name: "FactCheck.org", url: `https://www.factcheck.org/search/#gsc.q=${query}` }
    ];

    // --- STEP 4: SAVE TO DB ---
    await connectDB();
    const newScan = await Scan.create({
      userId: userId || null,
      imageUrl: "TEXT_SCAN",
      aiScore,
      verdict,
      modelRawOutput: { text_snippet: text, full_result: classResult, explanation },
    });

    // --- STEP 5: UPDATE USER STATS ---
    if (userId) {
      try {
        const user = await currentUser();
        const isFakeVerdict = aiScore > 50; 
        const pointsEarned = 10 + (isFakeVerdict ? 50 : 0);

        await UserStats.findOneAndUpdate(
          { userId },
          {
            $set: { 
                userName: user?.firstName || "Anonymous", 
                avatarUrl: user?.imageUrl || "", 
                lastActive: new Date() 
            },
            $inc: { 
              totalScans: 1, 
              fakesDetected: isFakeVerdict ? 1 : 0,
              truthScore: pointsEarned,
              weeklyScore: pointsEarned,
            }
          },
          { upsert: true, returnDocument: "after" }
        );
      } catch (err) {
        console.error("Stats update failed", err);
      }
    }

    // Return everything to the frontend
    return NextResponse.json({
      success: true,
      scanId: newScan._id,
      score: aiScore,
      label: topLabel,
      verdict,
      explanation, 
      searchLinks // <--- Sending links to frontend
    });

  } catch (error) {
    console.error("Server Error:", error);
    return NextResponse.json({ error: "Analysis Failed" }, { status: 500 });
  }
}