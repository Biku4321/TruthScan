"use client";
import { useState } from "react";
import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function DeleteButton({ scanId }: { scanId: string }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this scan permanently?")) return;

    setDeleting(true);
    try {
      const res = await fetch("/api/scan/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scanId }),
      });

      if (res.ok) {
        router.push("/history"); // Send back to history
        router.refresh();
      } else {
        alert("Failed to delete.");
      }
    } catch (err) {
      alert("Error deleting.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={deleting}
      suppressHydrationWarning
      className="flex items-center justify-center p-3 border border-red-200 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
      title="Delete Scan"
    >
      <Trash2 size={20} />
    </button>
  );
}