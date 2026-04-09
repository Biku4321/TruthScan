"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

export default function SearchBar() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    router.push(`/search?q=${encodeURIComponent(query)}`);
    setQuery(""); 
  };

  return (
    <form onSubmit={handleSearch} className="relative w-full max-w-sm">
      <input
        type="text"
        placeholder="Search verifications..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        suppressHydrationWarning 
        className="w-full pl-10 pr-4 py-2 bg-gray-100 border-none rounded-full text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all outline-none text-gray-800"
      />
      <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
    </form>
  );
}