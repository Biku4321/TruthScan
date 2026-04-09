"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShieldCheck, History, Menu, X, Trophy, Brain, ScanFace, Flame, Layers, Code2 } from "lucide-react";
import { useState } from "react";
import { UserButton, SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import SearchBar from "./SearchBar";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  // Helper to check active state
  const isActive = (path: string) => pathname === path;

  // Navigation Data to keep code clean and remove duplicates
  const navLinks = [
    { name: "Scanner", href: "/scan", icon: <ScanFace size={18} /> },
    { name: "Batch", href: "/batch", icon: <Layers size={18} /> },
    { name: "Challenge", href: "/quiz", icon: <Brain size={18} /> },
    { name: "History", href: "/history", icon: <History size={18} /> },
    { name: "Ranking", href: "/leaderboard", icon: <Trophy size={18} /> },
    { name: "API", href: "/developers", icon: <Code2 size={18} /> },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-200/50 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          
          {/* --- LEFT: LOGO & SEARCH --- */}
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-2 rounded-xl text-white shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform duration-300">
                <ShieldCheck size={26} strokeWidth={2.5} />
              </div>
              <span className="font-bold text-xl text-gray-900 tracking-tight group-hover:text-blue-600 transition-colors">
                TruthPlatform
              </span>
            </Link>
            
            <div className="hidden lg:block w-64 xl:w-80 transition-all duration-300 focus-within:w-96">
              <SearchBar />
            </div>
          </div>

          {/* --- CENTER: DESKTOP NAVIGATION --- */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const active = isActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative group px-4 py-2 flex items-center gap-2 font-medium text-sm transition-colors duration-300
                    ${active ? "text-blue-600" : "text-gray-600 hover:text-gray-900"}
                  `}
                >
                  {/* Icon (Optional: Hide on smaller screens if crowded) */}
                  <span className={`transition-colors duration-300 ${active ? "text-blue-600" : "text-gray-400 group-hover:text-gray-600"}`}>
                    {link.icon}
                  </span>
                  
                  {link.name}

                  {/* MODERN UNDERLINE ANIMATION */}
                  <span className={`absolute bottom-0 left-0 h-[2px] bg-blue-600 transition-all duration-300 ease-out rounded-full
                    ${active ? "w-full" : "w-0 group-hover:w-full"}
                  `}></span>
                </Link>
              );
            })}

            {/* Special Link: Hall of Shame */}
            <Link 
              href="/hall-of-shame"
              className={`ml-2 flex items-center gap-2 px-4 py-2 rounded-full font-bold text-sm transition-all duration-300 border
                ${isActive("/hall-of-shame") 
                  ? "bg-red-50 border-red-200 text-red-600 shadow-sm" 
                  : "bg-transparent border-transparent text-gray-500 hover:bg-red-50 hover:text-red-600"
                }
              `}
            >
              <Flame size={18} className={isActive("/hall-of-shame") ? "fill-red-600 text-red-600" : ""} />
              Hall of Shame
            </Link>
          </div>

          {/* --- RIGHT: AUTHENTICATION --- */}
          <div className="flex items-center gap-4">
            <SignedOut>
              <SignInButton mode="modal">
                <button className="relative overflow-hidden bg-gray-900 text-white px-6 py-2.5 rounded-xl font-semibold text-sm hover:shadow-lg hover:shadow-gray-500/20 transition-all duration-300 group">
                  <span className="relative z-10">Sign In</span>
                  <div className="absolute inset-0 h-full w-full scale-0 rounded-xl transition-all duration-300 group-hover:scale-100 group-hover:bg-gray-800/50"></div>
                </button>
              </SignInButton>
            </SignedOut>

            <SignedIn>
              <div className="flex items-center gap-4">
                <Link 
                    href="/profile" 
                    className="hidden lg:block text-sm font-semibold text-gray-600 hover:text-blue-600 transition-colors"
                >
                    My Profile
                </Link>
                <div className="p-0.5 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500">
                    <div className="bg-white rounded-full p-0.5">
                        <UserButton afterSignOutUrl="/" />
                    </div>
                </div>
              </div>
            </SignedIn>

            {/* Mobile Menu Toggle */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                {isOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* --- MOBILE MENU DROPDOWN --- */}
      <div 
        className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out bg-white border-b border-gray-100 ${
          isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="px-4 py-4 space-y-2">
           <div className="mb-4">
             <SearchBar />
           </div>

          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setIsOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium transition-colors
                ${isActive(link.href) 
                  ? "bg-blue-50 text-blue-700" 
                  : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"}
              `}
            >
              <span className={isActive(link.href) ? "text-blue-600" : "text-gray-400"}>
                {link.icon}
              </span>
              {link.name}
            </Link>
          ))}

          <Link
            href="/hall-of-shame"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium text-red-600 hover:bg-red-50 transition-colors"
          >
            <Flame size={18} />
            Hall of Shame
          </Link>
          
          <SignedIn>
             <Link
                href="/profile"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium text-gray-700 hover:bg-gray-50"
             >
                <div className="w-[18px]" /> {/* Spacer for alignment */}
                My Profile
             </Link>
          </SignedIn>

          <SignedOut>
            <div className="pt-2">
                <SignInButton mode="modal">
                <button className="w-full bg-gray-900 text-white py-3 rounded-xl font-bold">
                    Sign In
                </button>
                </SignInButton>
            </div>
          </SignedOut>
        </div>
      </div>
    </nav>
  );
}