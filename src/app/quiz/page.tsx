"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { CheckCircle, XCircle, Trophy, ArrowRight, RefreshCw, Loader2 } from "lucide-react";
import confetti from "canvas-confetti";
import Link from "next/link";

export default function QuizPage() {
  const router = useRouter();
  const { isLoaded, isSignedIn } = useAuth();
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Game State
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<"real" | "fake" | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);

  // Auth redirect
  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.replace("/sign-in?redirect_url=/quiz");
    }
  }, [isLoaded, isSignedIn, router]);

  // FETCH QUESTIONS FROM DB
  useEffect(() => {
    if (!isSignedIn) return;
    async function fetchQuestions() {
        try {
            const res = await fetch("/api/quiz");
            const data = await res.json();
            if (Array.isArray(data) && data.length > 0) {
                setQuestions(data);
            }
        } catch (e) {
            console.error("Failed to load quiz", e);
        } finally {
            setLoading(false);
        }
    }
    fetchQuestions();
  }, [isSignedIn]);

  if (!isLoaded || !isSignedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];

  const handleGuess = async (guess: "real" | "fake") => {
    if (selectedAnswer) return;

    setSelectedAnswer(guess);
    const correct = guess === currentQuestion.correctAnswer;
    setIsCorrect(correct);

    if (correct) {
      setScore((prev) => prev + 1);
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
      
      // Save points (Gamification) — award 5 points per correct answer
      try {
        await fetch("/api/quiz/reward", { method: "POST" });
      } catch (e) {
        console.warn("Could not save quiz reward points:", e);
      }
    }
  };

  const handleNext = () => {
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedAnswer(null);
      setIsCorrect(null);
    } else {
      setQuizFinished(true);
    }
  };

  const restartQuiz = () => {
    setCurrentIndex(0);
    setScore(0);
    setSelectedAnswer(null);
    setIsCorrect(null);
    setQuizFinished(false);
  };

  // LOADING SCREEN
  if (loading) {
      return <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white"><Loader2 className="animate-spin w-10 h-10"/></div>;
  }

  // EMPTY STATE
  if (questions.length === 0) {
      return <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">No questions available. Admin needs to add some!</div>;
  }

  // --- RESULT SCREEN ---
  if (quizFinished) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white max-w-md w-full p-8 rounded-3xl shadow-xl text-center">
          <div className="w-20 h-20 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <Trophy size={40} />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Training Complete!</h1>
          <p className="text-gray-500 mb-6">
            You identified {score} out of {questions.length} images correctly.
          </p>
          
          <div className="bg-gray-50 p-4 rounded-xl mb-8">
            <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">Points Earned</span>
            <div className="text-4xl font-extrabold text-blue-600">+{score * 5}</div>
          </div>

          <div className="flex gap-4">
             <button onClick={restartQuiz} className="flex-1 flex items-center justify-center gap-2 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-colors">
               <RefreshCw size={18} /> Replay
             </button>
             <Link href="/leaderboard" className="flex-1 flex items-center justify-center gap-2 py-3 bg-gray-900 hover:bg-black text-white font-bold rounded-xl transition-colors">
               Rankings <ArrowRight size={18} />
             </Link>
          </div>
        </div>
      </div>
    );
  }

  // --- GAME SCREEN ---
  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div className="relative z-10 w-full max-w-lg">
        {/* Header */}
        <div className="flex justify-between items-center text-white mb-6 px-2">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Trophy className="text-yellow-400" size={20} />
            Score: {score * 5}
          </h2>
          <div className="text-gray-400 text-sm font-mono">
            {currentIndex + 1} / {questions.length}
          </div>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl overflow-hidden shadow-2xl transition-all duration-300 transform">
          <div className="relative aspect-[4/3]">
            <img 
              src={currentQuestion.imageUrl} 
              alt="Quiz" 
              className="w-full h-full object-cover"
            />
            
            {/* Overlay Result */}
            {selectedAnswer && (
              <div className={`absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-300`}>
                {isCorrect ? (
                  <div className="text-green-400 flex flex-col items-center">
                    <CheckCircle size={64} className="mb-2" />
                    <span className="text-2xl font-bold">Correct!</span>
                  </div>
                ) : (
                  <div className="text-red-400 flex flex-col items-center">
                    <XCircle size={64} className="mb-2" />
                    <span className="text-2xl font-bold">Wrong!</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Controls / Explanation */}
          <div className="p-6">
            {!selectedAnswer ? (
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => handleGuess("real")}
                  className="py-4 rounded-xl border-2 border-green-100 bg-green-50 text-green-700 font-bold text-lg hover:bg-green-100 hover:border-green-300 transition-all hover:-translate-y-1 shadow-sm"
                >
                  It's Real
                </button>
                <button
                  onClick={() => handleGuess("fake")}
                  className="py-4 rounded-xl border-2 border-red-100 bg-red-50 text-red-700 font-bold text-lg hover:bg-red-100 hover:border-red-300 transition-all hover:-translate-y-1 shadow-sm"
                >
                  It's AI
                </button>
              </div>
            ) : (
              <div className="animate-in slide-in-from-bottom-4 duration-500">
                <div className={`p-4 rounded-xl mb-6 text-sm leading-relaxed border ${
                  isCorrect ? "bg-green-50 border-green-100 text-green-800" : "bg-red-50 border-red-100 text-red-800"
                }`}>
                  <span className="font-bold block mb-1">
                    {currentQuestion.isAi ? "This image is AI Generated." : "This image is Real."}
                  </span>
                  {currentQuestion.explanation}
                </div>
                
                <button 
                  onClick={handleNext}
                  className="w-full py-3 bg-gray-900 text-white font-bold rounded-xl hover:bg-black transition-colors flex items-center justify-center gap-2"
                >
                  Next Challenge <ArrowRight size={18} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}