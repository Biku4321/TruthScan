import mongoose, { Schema, Document } from "mongoose";

interface INote {
  userId: string;
  userName: string; 
  text: string;
  createdAt: Date;
}

interface IVote {
  userId: string;
  vote: "agree" | "disagree"; // agrees or disagrees with AI verdict
}

export interface IScan extends Document {
  userId?: string;
  imageUrl: string;
  aiScore: number;
  verdict: string;
  modelRawOutput: any;
  metaData: any;
  createdAt: Date;
  notes: INote[];
  votes: IVote[];           // Community verdict voting
  batchId?: string;         // Groups scans from a batch job
  confidenceBreakdown?: {   // Per-signal breakdown for the widget
    detector: number;
    metadata: number;
    captionMismatch: number;
  };
}

const NoteSchema = new Schema({
  userId: { type: String, required: true },
  userName: { type: String, required: true },
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const VoteSchema = new Schema({
  userId: { type: String, required: true },
  vote: { type: String, enum: ["agree", "disagree"], required: true }
});

const ScanSchema = new Schema<IScan>({
  userId: { type: String, index: true },
  imageUrl: { type: String, required: true },
  aiScore: { type: Number, required: true },
  verdict: { type: String, required: true },
  modelRawOutput: { type: Schema.Types.Mixed },
  metaData: { type: Schema.Types.Mixed, default: {} },
  createdAt: { type: Date, default: Date.now },
  notes: [NoteSchema],
  votes: { type: [VoteSchema], default: [] },
  batchId: { type: String, index: true },
  confidenceBreakdown: {
    detector: { type: Number },
    metadata: { type: Number },
    captionMismatch: { type: Number },
  }
});

export default mongoose.models.Scan || mongoose.model<IScan>("Scan", ScanSchema);