"use client";
import { useState } from "react";
import { MessageSquare, Send, User, Trash2, Edit2, X, Check } from "lucide-react";
import { useUser } from "@clerk/nextjs";

interface Note {
  _id: string;
  userId: string;
  userName: string;
  text: string;
  createdAt: string;
}

export default function CommunityNotes({ 
  scanId, 
  initialNotes 
}: { 
  scanId: string, 
  initialNotes: Note[] 
}) {
  const { user, isSignedIn } = useUser();
  const [notes, setNotes] = useState<Note[]>(initialNotes || []);
  const [newNote, setNewNote] = useState("");
  const [loading, setLoading] = useState(false);
  
  // Edit State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");

  // --- ADD NOTE ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;

    setLoading(true);
    try {
      const res = await fetch("/api/scan/note", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scanId, text: newNote }),
      });

      const data = await res.json();
      if (data.success) {
        setNotes([...notes, data.note]); 
        setNewNote("");
      }
    } catch (err) {
      alert("Failed to post note");
    } finally {
      setLoading(false);
    }
  };

  // --- DELETE NOTE ---
  const handleDelete = async (noteId: string) => {
    if(!confirm("Are you sure you want to delete this note?")) return;

    const originalNotes = [...notes];
    setNotes(notes.filter(n => n._id !== noteId));

    try {
        const res = await fetch("/api/scan/note", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ scanId, noteId }),
        });
        if(!res.ok) throw new Error("Failed");
    } catch (err) {
        alert("Failed to delete");
        setNotes(originalNotes); // Revert on error
    }
  };

  // --- START EDITING ---
  const startEdit = (note: Note) => {
      setEditingId(note._id);
      setEditText(note.text);
  };

  // --- SAVE EDIT ---
  const handleEditSubmit = async (noteId: string) => {
      if(!editText.trim()) return;
      
      const originalNotes = [...notes];
      setNotes(notes.map(n => n._id === noteId ? { ...n, text: editText } : n));
      setEditingId(null);

      try {
        const res = await fetch("/api/scan/note", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ scanId, noteId, text: editText }),
        });
        if(!res.ok) throw new Error("Failed");
      } catch (err) {
          alert("Failed to update");
          setNotes(originalNotes); // Revert on error
      }
  };

  // Helper to format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short", day: "numeric", hour: "2-digit", minute: "2-digit"
    });
  };

  return (
    <div className="mt-8 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-4 bg-gray-50/50 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
            <MessageSquare size={18} className="text-blue-600" />
            <h3 className="font-bold text-gray-800">Community Intel</h3>
        </div>
        <span className="text-xs font-bold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
          {notes.length} Notes
        </span>
      </div>

      {/* Notes List */}
      <div className="max-h-80 overflow-y-auto p-4 space-y-5 custom-scrollbar">
        {notes.length === 0 ? (
          <div className="text-center py-8">
             <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2 text-gray-400">
                <MessageSquare size={20} />
             </div>
             <p className="text-gray-400 text-sm">No notes yet. Be the first to add context!</p>
          </div>
        ) : (
          notes.map((note) => {
            const isOwner = user?.id === note.userId;
            const isEditing = editingId === note._id;

            return (
              <div key={note._id} className="group flex gap-4 animate-in fade-in slide-in-from-bottom-2">
                {/* Avatar */}
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xs shadow-sm flex-shrink-0">
                  {note.userName.charAt(0).toUpperCase()}
                </div>

                <div className="flex-1">
                  {/* Note Header */}
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-gray-900">{note.userName}</span>
                      <span className="text-[10px] text-gray-400 font-medium">{formatDate(note.createdAt)}</span>
                    </div>
                    
                    {/* Actions (Only show for owner) */}
                    {isOwner && !isEditing && (
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                                onClick={() => startEdit(note)}
                                className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors" title="Edit"
                            >
                                <Edit2 size={12} />
                            </button>
                            <button 
                                onClick={() => handleDelete(note._id)}
                                className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors" title="Delete"
                            >
                                <Trash2 size={12} />
                            </button>
                        </div>
                    )}
                  </div>

                  {/* Content or Edit Form */}
                  {isEditing ? (
                      <div className="flex gap-2 items-start animate-in fade-in">
                          <textarea 
                             value={editText}
                             onChange={(e) => setEditText(e.target.value)}
                             className="flex-1 p-2 text-sm border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-100 outline-none bg-blue-50/20"
                             rows={2}
                          />
                          <div className="flex flex-col gap-1">
                              <button onClick={() => handleEditSubmit(note._id)} className="p-1.5 bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"><Check size={14}/></button>
                              <button onClick={() => setEditingId(null)} className="p-1.5 bg-gray-100 text-gray-600 rounded hover:bg-gray-200 transition-colors"><X size={14}/></button>
                          </div>
                      </div>
                  ) : (
                      <p className="text-sm text-gray-700 leading-relaxed bg-gray-50 p-3 rounded-xl rounded-tl-none border border-gray-100">
                        {note.text}
                      </p>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Input Form */}
      <div className="p-4 bg-gray-50 border-t border-gray-100">
        {isSignedIn ? (
          <form onSubmit={handleSubmit} className="flex gap-3 items-end">
             <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-xs font-bold">
                 {user?.firstName?.charAt(0) || "U"}
             </div>
            <div className="flex-1 relative">
                <input
                type="text"
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Add context or evidence..."
                className="w-full px-4 py-2.5 pr-10 border border-gray-300 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 text-sm transition-all shadow-sm"
                disabled={loading}
                />
            </div>
            <button
              type="submit" 
              disabled={loading || !newNote.trim()}
              className="bg-gray-900 text-white p-2.5 rounded-xl hover:bg-black disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg"
            >
              <Send size={18} />
            </button>
          </form>
        ) : (
          <div className="text-center py-2">
            <p className="text-xs text-gray-500 mb-2">Join the investigation to contribute.</p>
            <a href="/sign-in" className="inline-block text-xs font-bold text-blue-600 border border-blue-200 bg-blue-50 px-3 py-1.5 rounded-full hover:bg-blue-100 transition-colors">
               Sign In to Comment
            </a>
          </div>
        )}
      </div>
    </div>
  );
}