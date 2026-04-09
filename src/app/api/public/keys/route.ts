import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import connectDB from "../../../../lib/db";
import ApiKey from "../../../../models/ApiKey";
import { createHash, randomBytes } from "crypto";

function hashKey(key: string) {
  return createHash("sha256").update(key).digest("hex");
}

// GET: List user's API keys
export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const keys = await ApiKey.find({ userId }, { key: 0 }) // Never return the hash
    .sort({ createdAt: -1 })
    .lean();

  return NextResponse.json(keys);
}

// POST: Generate a new API key
export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();

  // Limit to 5 keys per user
  const existingCount = await ApiKey.countDocuments({ userId, active: true });
  if (existingCount >= 5) {
    return NextResponse.json({ error: "Maximum of 5 active API keys allowed." }, { status: 400 });
  }

  const { label } = await req.json().catch(() => ({ label: "My API Key" }));

  // Generate key: ts_ prefix + 32 random hex chars
  const rawKey = `ts_${randomBytes(16).toString("hex")}`;
  const hashedKey = hashKey(rawKey);
  const keyPrefix = rawKey.substring(0, 10); // "ts_ab12cd34"

  await ApiKey.create({
    userId,
    key: hashedKey,
    keyPrefix,
    label: label || "My API Key",
  });

  // Return the raw key ONCE — we never store it plain
  return NextResponse.json({
    success: true,
    key: rawKey,         // Show to user one time
    keyPrefix,
    label,
    message: "Copy this key now. It will not be shown again.",
  });
}

// DELETE: Revoke a key
export async function DELETE(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { keyPrefix } = await req.json();
  await connectDB();

  const result = await ApiKey.findOneAndUpdate(
    { userId, keyPrefix },
    { $set: { active: false } }
  );

  if (!result) return NextResponse.json({ error: "Key not found" }, { status: 404 });
  return NextResponse.json({ success: true });
}
