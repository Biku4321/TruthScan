"use client";
import Link from "next/link";
import { ShieldCheck, Github, Globe, Code2, Layers, Brain, History, Trophy, Flame } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-950 text-gray-400 mt-auto">
      {/* Main footer content */}
      <div className="max-w-7xl mx-auto px-6 py-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">

        {/* Brand column */}
        <div className="lg:col-span-1">
          <Link href="/" className="flex items-center gap-2.5 mb-4 group">
            <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-2 rounded-xl text-white shadow-lg shadow-blue-900/30 group-hover:scale-105 transition-transform duration-300">
              <ShieldCheck size={22} strokeWidth={2.5} />
            </div>
            <span className="text-white font-bold text-lg tracking-tight">TruthScan</span>
          </Link>
          <p className="text-sm leading-relaxed text-gray-500 mb-5">
            The multi-modal AI deepfake and misinformation detector. Verify images, audio, video, and text instantly.
          </p>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            <span className="text-xs font-mono text-green-500 font-semibold">System Operational</span>
          </div>
        </div>

        {/* Tools column */}
        <div>
          <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-4">Tools</h4>
          <ul className="space-y-3">
            {[
              { href: "/scan",    icon: <ShieldCheck size={14} />, label: "Scanner" },
              { href: "/batch",   icon: <Layers size={14} />,      label: "Batch Scanner" },
              { href: "/quiz",    icon: <Brain size={14} />,        label: "AI Challenge" },
              { href: "/history", icon: <History size={14} />,      label: "My History" },
            ].map(({ href, icon, label }) => (
              <li key={href}>
                <Link
                  href={href}
                  className="flex items-center gap-2 text-sm hover:text-white transition-colors duration-200"
                >
                  <span className="text-gray-600">{icon}</span>
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Community column */}
        <div>
          <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-4">Community</h4>
          <ul className="space-y-3">
            {[
              { href: "/leaderboard",   icon: <Trophy size={14} />,  label: "Leaderboard" },
              { href: "/hall-of-shame", icon: <Flame size={14} />,   label: "Hall of Shame" },
              { href: "/profile",       icon: <Globe size={14} />,   label: "My Profile" },
            ].map(({ href, icon, label }) => (
              <li key={href}>
                <Link
                  href={href}
                  className="flex items-center gap-2 text-sm hover:text-white transition-colors duration-200"
                >
                  <span className="text-gray-600">{icon}</span>
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Developers column */}
        <div>
          <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-4">Developers</h4>
          <ul className="space-y-3">
            {[
              { href: "/developers", icon: <Code2 size={14} />, label: "Public API" },
              { href: "/developers", icon: <Github size={14} />, label: "API Keys" },
            ].map(({ href, icon, label }, i) => (
              <li key={i}>
                <Link
                  href={href}
                  className="flex items-center gap-2 text-sm hover:text-white transition-colors duration-200"
                >
                  <span className="text-gray-600">{icon}</span>
                  {label}
                </Link>
              </li>
            ))}
          </ul>

          {/* Stats strip */}
          <div className="mt-6 grid grid-cols-2 gap-3">
            {[
              { value: "98.4%", label: "Accuracy" },
              { value: "24/7",  label: "Uptime" },
            ].map(({ value, label }) => (
              <div key={label} className="bg-gray-900 border border-gray-800 rounded-xl p-3 text-center">
                <div className="text-white font-black text-base">{value}</div>
                <div className="text-gray-600 text-[10px] font-bold uppercase tracking-wider mt-0.5">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-gray-900">
        <div className="max-w-7xl mx-auto px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-gray-600">
            © {currentYear} TruthScan Protocol. Built for information integrity.
          </p>
          <div className="flex items-center gap-6 text-xs text-gray-600">
            <span className="flex items-center gap-1.5">
              <span className="font-mono bg-gray-900 border border-gray-800 px-2 py-0.5 rounded text-gray-500">
                v2.0
              </span>
            </span>
            <span>Multi-Modal AI Detection</span>
          </div>
        </div>
      </div>
    </footer>
  );
}