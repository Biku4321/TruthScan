import mongoose, { Schema, Document } from "mongoose";

export interface IApiKey extends Document {
  userId: string;
  key: string;           // hashed key stored in DB
  keyPrefix: string;     // first 8 chars shown to user (e.g. "ts_abc123")
  label: string;
  requestCount: number;
  lastUsed: Date | null;
  createdAt: Date;
  active: boolean;
}

const ApiKeySchema = new Schema<IApiKey>({
  userId: { type: String, required: true, index: true },
  key: { type: String, required: true, unique: true },
  keyPrefix: { type: String, required: true },
  label: { type: String, default: "My API Key" },
  requestCount: { type: Number, default: 0 },
  lastUsed: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now },
  active: { type: Boolean, default: true },
});

export default mongoose.models.ApiKey || mongoose.model<IApiKey>("ApiKey", ApiKeySchema);
