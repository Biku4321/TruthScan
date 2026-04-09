"use client";
import { useState, useEffect } from "react";
import { useAuth, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import {
  Trash2,
  ShieldAlert,
  LayoutDashboard,
  Gamepad2,
  Loader2,
  CheckCircle,
} from "lucide-react";
import FileUpload from "../../components/FileUpload"; 

export default function AdminDashboard() {
  const { userId, isLoaded } = useAuth();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<"moderation" | "quiz">(
    "moderation",
  );
  const [scans, setScans] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // --- QUIZ FORM STATE ---
  const [quizImage, setQuizImage] = useState("");
  const [isAi, setIsAi] = useState(false);
  const [explanation, setExplanation] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // 1. Security Check — the real gate is the API. This just prevents rendering the UI.
  useEffect(() => {
    if (isLoaded) {
      if (!userId) {
        router.push("/");
      } else {
        fetchScans(); // Load scans — API returns 403 if not admin
      }
    }
  }, [isLoaded, userId]);

  // 2. Fetch Scans for Moderation
  const fetchScans = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin");
      if (res.status === 403) {
        router.push("/");
        return;
      }
      const data = await res.json();
      if (Array.isArray(data)) setScans(data);
    } catch (e) {
      console.error("Failed to fetch scans");
    } finally {
      setLoading(false);
    }
  };

  // 3. Delete Scan (Moderation Action)
  const handleDeleteScan = async (scanId: string) => {
    if (!confirm("Are you sure? This will delete the scan permanently."))
      return;

    // Optimistic UI update
    setScans(scans.filter((s) => s._id !== scanId));

    try {
      await fetch("/api/admin", {
        method: "DELETE",
        body: JSON.stringify({ scanId }),
      });
    } catch (e) {
      alert("Failed to delete from server");
      fetchScans(); // Revert on error
    }
  };

  // 4. Submit Quiz Question
  const handleAddQuiz = async () => {
    if (!quizImage || !explanation)
      return alert("Please upload image and add explanation.");

    setSubmitting(true);
    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageUrl: quizImage, // <--- URL from FileUpload component
          isAi: isAi,
          explanation: explanation,
        }),
      });

      if (res.ok) {
        alert("Question Added Successfully!");
        // Reset Form
        setQuizImage("");
        setExplanation("");
        setIsAi(false);
      } else {
        alert("Failed to add question.");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isLoaded || !userId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-12">
      <div className="max-w-6xl mx-auto">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <ShieldAlert className="text-red-600" size={32} />
            Admin Command Center
          </h1>

          {/* TABS */}
          <div className="flex gap-2 bg-white p-1 rounded-xl border border-gray-200 shadow-sm">
            <button
              onClick={() => setActiveTab("moderation")}
              className={`px-6 py-2 rounded-lg font-bold flex items-center gap-2 transition-all ${activeTab === "moderation" ? "bg-red-50 text-red-600 shadow-sm" : "text-gray-500 hover:text-gray-900"}`}
            >
              <LayoutDashboard size={18} /> Moderation Queue
            </button>
            <button
              onClick={() => setActiveTab("quiz")}
              className={`px-6 py-2 rounded-lg font-bold flex items-center gap-2 transition-all ${activeTab === "quiz" ? "bg-blue-50 text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-900"}`}
            >
              <Gamepad2 size={18} /> Quiz Manager
            </button>
          </div>
        </div>

        {/* ==========================
            TAB 1: MODERATION DASHBOARD
           ========================== */}
        {activeTab === "moderation" && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h2 className="font-bold text-gray-700">Recent Uploads</h2>
              <button
                onClick={fetchScans}
                className="text-sm text-blue-600 hover:underline"
              >
                Refresh List
              </button>
            </div>

            {loading ? (
              <div className="p-12 text-center">
                <Loader2 className="animate-spin mx-auto text-gray-400" />
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6">
                {scans.map((scan) => (
                  <div
                    key={scan._id}
                    className="relative group bg-gray-100 rounded-lg overflow-hidden border border-gray-200"
                  >
                    {/* Thumbnail */}
                    <div className="aspect-square relative">
                      {scan.imageUrl === "TEXT_SCAN" ? (
                        <div className="w-full h-full flex items-center justify-center bg-purple-100 text-purple-600 text-xs p-2 text-center overflow-hidden">
                          {scan.modelRawOutput?.text_snippet}
                        </div>
                      ) : (
                        <img
                          src={scan.imageUrl}
                          className="w-full h-full object-cover"
                          alt="User upload"
                        />
                      )}

                      {/* DELETE BUTTON (Visible on Hover) */}
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleDeleteScan(scan._id)}
                          className="bg-red-600 text-white px-3 py-2 rounded-lg font-bold text-xs flex items-center gap-2 hover:bg-red-700"
                        >
                          <Trash2 size={14} /> DELETE
                        </button>
                      </div>
                    </div>

                    {/* Info Footer */}
                    <div className="p-2 bg-white text-[10px] text-gray-500 flex justify-between">
                      <span>
                        {new Date(scan.createdAt).toLocaleDateString()}
                      </span>
                      <span
                        className={
                          scan.aiScore > 50
                            ? "text-red-500 font-bold"
                            : "text-green-500"
                        }
                      >
                        {scan.aiScore}% AI
                      </span>
                    </div>
                  </div>
                ))}
                {scans.length === 0 && (
                  <div className="col-span-4 text-center py-10 text-gray-400">
                    No scans found.
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ==========================
            TAB 2: QUIZ MANAGER
           ========================== */}
        {activeTab === "quiz" && (
          <div className="grid md:grid-cols-2 gap-8">
            {/* --- FORM --- */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Gamepad2 className="text-blue-600" /> Add New Challenge
              </h2>

              {/* 1. IMAGE UPLOAD */}
              <div className="mb-6">
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  1. Upload Image (Auto-generates URL)
                </label>
                {quizImage ? (
                  <div className="relative rounded-xl overflow-hidden border-2 border-blue-500">
                    <img
                      src={quizImage}
                      className="w-full h-48 object-cover"
                      alt="Preview"
                    />
                    <div className="absolute top-2 right-2 flex gap-2">
                      <span className="bg-green-500 text-white text-xs px-2 py-1 rounded shadow flex items-center gap-1">
                        <CheckCircle size={12} /> Uploaded
                      </span>
                      <button
                        onClick={() => setQuizImage("")}
                        className="bg-red-600 text-white p-1 rounded shadow text-xs hover:bg-red-700"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="h-40">
                    {/* Using your existing FileUpload component */}
                    <FileUpload onUploadComplete={(url) => setQuizImage(url)} />
                  </div>
                )}
                <p className="text-xs text-gray-400 mt-2">
                  * Supports JPG/PNG. Once uploaded, the URL is automatically
                  set.
                </p>
              </div>

              {/* 2. IS FAKE? */}
              <div className="mb-6">
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  2. Is this image AI Generated?
                </label>
                <div className="flex gap-4">
                  <button
                    onClick={() => setIsAi(true)}
                    className={`flex-1 py-3 rounded-xl font-bold border-2 transition-all ${isAi ? "border-red-500 bg-red-50 text-red-700" : "border-gray-200 text-gray-500 hover:border-gray-300"}`}
                  >
                    YES (Fake)
                  </button>
                  <button
                    onClick={() => setIsAi(false)}
                    className={`flex-1 py-3 rounded-xl font-bold border-2 transition-all ${!isAi ? "border-green-500 bg-green-50 text-green-700" : "border-gray-200 text-gray-500 hover:border-gray-300"}`}
                  >
                    NO (Real)
                  </button>
                </div>
              </div>

              {/* 3. EXPLANATION */}
              <div className="mb-8">
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  3. Educational Explanation
                </label>
                <textarea
                  value={explanation}
                  onChange={(e) => setExplanation(e.target.value)}
                  placeholder="e.g. 'Look at the hands, they have 6 fingers. Also the background is blurry in an unnatural way.'"
                  className="w-full p-4 border border-gray-200 rounded-xl h-32 focus:ring-2 focus:ring-blue-500 outline-none resize-none text-sm"
                />
              </div>

              {/* SUBMIT */}
              <button
                onClick={handleAddQuiz}
                disabled={submitting || !quizImage}
                className="w-full py-4 bg-gray-900 text-white font-bold rounded-xl hover:bg-black disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
              >
                {submitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="animate-spin" /> Saving...
                  </span>
                ) : (
                  "Add to Quiz Database"
                )}
              </button>
            </div>

            {/* --- INSTRUCTIONS --- */}
            <div className="space-y-6">
              <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
                <h3 className="font-bold text-blue-900 mb-2">How it works:</h3>
                <ol className="list-decimal ml-4 space-y-2 text-sm text-blue-800">
                  <li>
                    <strong>Upload Image:</strong> Click the box to upload a
                    file from your computer. We handle the Cloudinary hosting.
                  </li>
                  <li>
                    <strong>Set Verification:</strong> Mark it as Real or Fake
                    correctly.
                  </li>
                  <li>
                    <strong>Explain:</strong> Write a helpful tip. This is what
                    users see after they guess.
                  </li>
                  <li>
                    <strong>Publish:</strong> Click "Add". It will instantly
                    appear on the Quiz page for all users.
                  </li>
                </ol>
              </div>

              <div className="bg-yellow-50 p-6 rounded-2xl border border-yellow-100">
                <h3 className="font-bold text-yellow-900 mb-2">
                  Tip for "Real" Images
                </h3>
                <p className="text-sm text-yellow-800">
                  Upload photos that look slightly "too perfect" but are
                  actually real (e.g., high-end fashion or surreal nature). This
                  tricks users and makes the game harder!
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
