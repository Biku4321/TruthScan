import mongoose from "mongoose";

const QuizQuestionSchema = new mongoose.Schema(
  {
    imageUrl: { type: String, required: true },
    isAi: { type: Boolean, required: true }, // true = Fake, false = Real
    correctAnswer: { type: String, enum: ["real", "fake"], required: true }, // "real" or "fake"
    explanation: { type: String, required: true },
    addedBy: { type: String }, // Admin ID
  },
  { timestamps: true }
);

// Prevent overwrite error
export default mongoose.models.QuizQuestion || mongoose.model("QuizQuestion", QuizQuestionSchema);