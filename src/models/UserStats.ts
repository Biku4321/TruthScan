import mongoose, { Schema, Document } from "mongoose";

export interface IUserStats extends Document {
  userId: string;
  userName: string;
  avatarUrl: string;
  totalScans: number;
  fakesDetected: number;
  truthScore: number;
  weeklyScore: number;        // Resets every Monday via cron
  weeklyResetAt: Date;        // Tracks when last reset happened
  lastActive: Date;
}

const UserStatsSchema = new Schema<IUserStats>({
  userId: { type: String, required: true, unique: true },
  userName: { type: String, required: true },
  avatarUrl: { type: String },
  totalScans: { type: Number, default: 0 },
  fakesDetected: { type: Number, default: 0 },
  truthScore: { type: Number, default: 0 },
  weeklyScore: { type: Number, default: 0 },
  weeklyResetAt: { type: Date, default: Date.now },
  lastActive: { type: Date, default: Date.now }
});

export default mongoose.models.UserStats || mongoose.model<IUserStats>("UserStats", UserStatsSchema);