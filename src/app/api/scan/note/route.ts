import { NextResponse } from "next/server";
import connectDB from "../../../../lib/db";
import Scan from "../../../../models/Scan";
import { auth, currentUser } from "@clerk/nextjs/server";
import mongoose from "mongoose";

// POST: Add Note
export async function POST(req: Request) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { scanId, text } = await req.json();
    await connectDB();

    const newNote = {
      _id: new mongoose.Types.ObjectId(), // Manual ID creation for instant UI update
      userId: user.id,
      userName: user.firstName || "Anonymous",
      text,
      createdAt: new Date(),
    };

    await Scan.findByIdAndUpdate(scanId, {
      $push: { notes: newNote }
    });

    return NextResponse.json({ success: true, note: newNote });
  } catch (err) {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

// DELETE: Remove Note
export async function DELETE(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { scanId, noteId } = await req.json();
    await connectDB();

    // Only delete if the note ID exists AND the userId matches the requestor
    await Scan.findByIdAndUpdate(scanId, {
      $pull: { notes: { _id: noteId, userId: userId } }
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

// PATCH: Edit Note
export async function PATCH(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { scanId, noteId, text } = await req.json();
    await connectDB();

    // Find the specific scan and update the note text where note ID & User ID match
    const result = await Scan.updateOne(
      { _id: scanId, "notes._id": noteId, "notes.userId": userId },
      { $set: { "notes.$.text": text } }
    );

    if (result.modifiedCount === 0) return NextResponse.json({ error: "Not found or unauthorized" }, { status: 403 });

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}