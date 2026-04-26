import Link from "next/link";
import {
  ShieldCheck,
  ScanFace,
  Mic,
  FileText,
  Video,
  ArrowRight,
  Zap,
  Globe,
  Lock,
  CheckCircle,
  Star,
  TrendingUp,
  Eye,
  AlertTriangle,
  Users,
  Award,
  ChevronRight,
  Shield,
  Brain,
  Search,
  BarChart2,
  Layers,
  WifiOff,
} from "lucide-react";
import { auth } from "@clerk/nextjs/server";

export default async function LandingPage() {
  const { userId } = await auth();

  return (
    <div
      className="min-h-screen bg-[#020408] text-white overflow-x-hidden"
      style={{ fontFamily: "'Syne', 'Space Grotesk', sans-serif" }}
    >
      {/* FONT IMPORT */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;700&display=swap');

        .animate-gradient-x {
          background-size: 300%;
          animation: gradientShift 6s ease infinite;
        }
        @keyframes gradientShift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .glow-blue { box-shadow: 0 0 40px rgba(59,130,246,0.3); }
        .glow-blue-sm { box-shadow: 0 0 20px rgba(59,130,246,0.2); }
        .card-hover {
          transition: all 0.3s ease;
        }
        .card-hover:hover {
          transform: translateY(-4px);
          border-color: rgba(59,130,246,0.4);
        }
        .scan-line {
          position: absolute;
          width: 100%;
          height: 2px;
          background: linear-gradient(90deg, transparent, rgba(59,130,246,0.8), transparent);
          animation: scanDown 3s ease-in-out infinite;
          pointer-events: none;
        }
        @keyframes scanDown {
          0% { top: 0%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
        .float-anim { animation: float 6s ease-in-out infinite; }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-12px); }
        }
        .pulse-ring {
          animation: pulseRing 2s ease-out infinite;
        }
        @keyframes pulseRing {
          0% { transform: scale(1); opacity: 0.8; }
          100% { transform: scale(2); opacity: 0; }
        }
        .grid-bg {
          background-image: 
            linear-gradient(rgba(59,130,246,0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(59,130,246,0.05) 1px, transparent 1px);
          background-size: 60px 60px;
        }
        .ticker-wrap {
          overflow: hidden;
          white-space: nowrap;
        }
        .ticker {
          display: inline-block;
          animation: ticker 30s linear infinite;
        }
        @keyframes ticker {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .text-stroke {
          -webkit-text-stroke: 1px rgba(255,255,255,0.3);
          color: transparent;
        }
        .border-glow {
          border: 1px solid rgba(59,130,246,0.3);
          box-shadow: inset 0 0 30px rgba(59,130,246,0.05), 0 0 30px rgba(59,130,246,0.1);
        }
        .step-line::after {
          content: '';
          position: absolute;
          left: 50%;
          top: 100%;
          width: 1px;
          height: 60px;
          background: linear-gradient(to bottom, rgba(59,130,246,0.5), transparent);
        }
      `}</style>

      {/* === BACKGROUND === */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-0 w-[400px] h-[400px] bg-indigo-600/10 rounded-full blur-[100px]" />
        <div className="absolute top-1/2 left-0 w-[300px] h-[300px] bg-cyan-600/8 rounded-full blur-[80px]" />
        <div className="grid-bg absolute inset-0 opacity-40" />
      </div>

      {/* === HERO === */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-24 pb-20">
        {/* Badge */}
        <div className="flex justify-center mb-10">
          <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-300 text-sm font-mono">
            <span className="relative flex h-2.5 w-2.5">
              <span className="pulse-ring absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-400"></span>
            </span>
            LIVE — Multi-Modal AI Detection System v3.1
          </div>
        </div>

        {/* Headline */}
        <div className="text-center max-w-5xl mx-auto">
          <h1 className="text-7xl md:text-9xl font-extrabold tracking-tighter leading-none mb-6">
            <span className="text-stroke block">TRUTH</span>
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-600 animate-gradient-x">
              SCAN
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto leading-relaxed mb-4 font-light">
            The world's advanced AI content forensics platform. <br />
            <span className="text-white font-semibold">
              We find what your eyes can't.
            </span>
          </p>
          <p className="text-gray-500 text-base max-w-xl mx-auto mb-12">
            Deepfakes, AI-generated images, synthetic audio, manipulated video —
            exposed in seconds using 3 simultaneous detection models.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link
              href={userId ? "/scan" : "/sign-in"}
              className="group px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold text-lg transition-all glow-blue flex items-center gap-3"
            >
              <ScanFace size={22} />
              Start Scanning Free
              <ArrowRight
                size={18}
                className="group-hover:translate-x-1 transition-transform"
              />
            </Link>
            <Link
              href="/hall-of-shame"
              className="px-8 py-4 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-2xl font-bold text-lg transition-all flex items-center gap-2"
            >
              <Eye size={18} />
              Hall of Shame
            </Link>
          </div>

          {/* Trust Row */}
          <div className="flex flex-wrap items-center justify-center gap-8 text-sm text-gray-500">
            {[
              {
                icon: <CheckCircle size={15} className="text-green-400" />,
                text: "No credit card required",
              },
              {
                icon: <Lock size={15} className="text-blue-400" />,
                text: "Privacy-first scanning",
              },
              {
                icon: <Zap size={15} className="text-yellow-400" />,
                text: "Results in under 10s",
              },
              {
                icon: <Globe size={15} className="text-purple-400" />,
                text: "Used in 40+ countries",
              },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2">
                {item.icon}
                {item.text}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* === LIVE TICKER === */}
      <div className="relative z-10 border-y border-white/5 bg-white/2 py-3 mb-20">
        <div className="ticker-wrap">
          <div className="ticker text-xs font-mono text-gray-500 tracking-widest">
            {Array(4)
              .fill(
                "DEEPFAKE DETECTED • AI IMAGE FLAGGED • SYNTHETIC AUDIO EXPOSED • MANIPULATION CONFIRMED • MISINFORMATION BLOCKED •&nbsp;",
              )
              .join("")}
          </div>
        </div>
      </div>

      {/* === STATS SECTION === */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 mb-28">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            {
              value: "98.4%",
              label: "Detection Accuracy",
              color: "text-green-400",
              sub: "Verified across 50k+ scans",
            },
            {
              value: "100+",
              label: "Scans Completed",
              color: "text-blue-400",
              sub: "And growing every day",
            },
            {
              value: "<8s",
              label: "Average Analysis Time",
              color: "text-yellow-400",
              sub: "3 models run in parallel",
            },
            {
              value: "40+",
              label: "Users Using TruthScan",
              color: "text-purple-400",
              sub: "Global trust network",
            },
          ].map((stat, i) => (
            <div
              key={i}
              className="card-hover p-6 rounded-2xl bg-white/3 border border-white/8 text-center"
            >
              <div
                className={`text-4xl font-extrabold mb-2 ${stat.color} font-mono`}
              >
                {stat.value}
              </div>
              <div className="text-white font-semibold text-sm mb-1">
                {stat.label}
              </div>
              <div className="text-gray-500 text-xs">{stat.sub}</div>
            </div>
          ))}
        </div>
      </div>

      {/* === WHAT WE DETECT === */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 mb-28">
        <div className="text-center mb-14">
          <div className="inline-block px-4 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-mono tracking-widest uppercase mb-4">
            Threat Detection
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
            Every Type of{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-400">
              Misinformation
            </span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Deepfakes are no longer just images. Our multi-modal engine covers
            every vector of synthetic manipulation.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[
            {
              icon: <ScanFace size={28} />,
              color: "blue",
              title: "AI-Generated Images",
              desc: "Detects Midjourney, DALL-E 3, Stable Diffusion, and Firefly images using diffusion artifact fingerprinting and GAN pattern analysis.",
              tags: ["Midjourney", "DALL-E 3", "Stable Diffusion"],
            },
            {
              icon: <Video size={28} />,
              color: "orange",
              title: "Deepfake Videos",
              desc: "Extracts key frames and analyzes temporal inconsistencies, facial reenactment artifacts, and blending seams in video content.",
              tags: ["Face Swap", "Lip Sync", "Body Puppeteering"],
            },
            {
              icon: <Mic size={28} />,
              color: "red",
              title: "Synthetic Audio & Voice",
              desc: "Spectral waveform forensics to detect ElevenLabs, Resemble AI, and other voice cloning tools used in audio deepfakes.",
              tags: ["ElevenLabs", "Voice Cloning", "TTS Manipulation"],
            },
            {
              icon: <FileText size={28} />,
              color: "purple",
              title: "AI-Written Text & Propaganda",
              desc: "NLP-based detection of GPT-4, Claude-generated text, sensationalism scoring, clickbait patterns, and coordinated inauthentic content.",
              tags: ["GPT-4", "Clickbait", "Propaganda"],
            },
            {
              icon: <Layers size={28} />,
              color: "cyan",
              title: "Batch URL Analysis",
              desc: "Submit up to 10 URLs simultaneously. Our batch engine processes them in parallel and returns a unified threat report.",
              tags: ["Multi-URL", "Parallel Processing", "Threat Report"],
            },
            {
              icon: <WifiOff size={28} />,
              color: "green",
              title: "Privacy Mode (On-Device)",
              desc: "Sensitive content? Run detection entirely in your browser. Zero data leaves your device. Full forensics, complete privacy.",
              tags: ["On-Device", "Zero Upload", "GDPR Safe"],
            },
          ].map((item, i) => {
            const colorMap: Record<string, string> = {
              blue: "text-blue-400 bg-blue-500/10 border-blue-500/20 group-hover:border-blue-500/50",
              orange:
                "text-orange-400 bg-orange-500/10 border-orange-500/20 group-hover:border-orange-500/50",
              red: "text-red-400 bg-red-500/10 border-red-500/20 group-hover:border-red-500/50",
              purple:
                "text-purple-400 bg-purple-500/10 border-purple-500/20 group-hover:border-purple-500/50",
              cyan: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20 group-hover:border-cyan-500/50",
              green:
                "text-green-400 bg-green-500/10 border-green-500/20 group-hover:border-green-500/50",
            };
            const c = colorMap[item.color];
            return (
              <div
                key={i}
                className={`group card-hover p-7 rounded-2xl bg-white/3 border border-white/8 transition-all`}
              >
                <div
                  className={`w-14 h-14 rounded-2xl ${c.split(" ").slice(1, 3).join(" ")} border ${c.split(" ")[3]} flex items-center justify-center ${c.split(" ")[0]} mb-5 transition-all`}
                >
                  {item.icon}
                </div>
                <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed mb-4">
                  {item.desc}
                </p>
                <div className="flex flex-wrap gap-2">
                  {item.tags.map((tag, j) => (
                    <span
                      key={j}
                      className={`px-2.5 py-1 rounded-full text-xs font-mono ${c.split(" ")[1]} ${c.split(" ")[0]} border ${c.split(" ")[2]}`}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* === HOW IT WORKS === */}
      <div className="relative z-10 max-w-5xl mx-auto px-6 mb-28">
        <div className="text-center mb-14">
          <div className="inline-block px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-mono tracking-widest uppercase mb-4">
            The Process
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
            How TruthScan{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
              Works
            </span>
          </h2>
          <p className="text-gray-400 max-w-xl mx-auto">
            Three AI models. One verdict. In under 10 seconds.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              step: "01",
              icon: <Search size={24} />,
              title: "Upload or Paste",
              desc: "Drop an image, video, audio file, or paste a URL or text. We accept all major formats with up to 50MB file size.",
              color: "blue",
            },
            {
              step: "02",
              icon: <Brain size={24} />,
              title: "3 AI Models Analyze",
              desc: "SDXL-Detector, Metadata Parser, and BLIP-Captioner run in parallel. Each model independently votes on authenticity.",
              color: "purple",
            },
            {
              step: "03",
              icon: <BarChart2 size={24} />,
              title: "Get Your Verdict",
              desc: "Receive a confidence score, detailed breakdown, and shareable report. Know exactly what was detected and why.",
              color: "green",
            },
          ].map((item, i) => (
            <div
              key={i}
              className="relative card-hover p-8 rounded-2xl bg-white/3 border border-white/8 text-center"
            >
              <div className="text-6xl font-extrabold font-mono text-white/5 absolute top-4 right-4">
                {item.step}
              </div>
              <div
                className={`w-12 h-12 rounded-xl mx-auto mb-5 flex items-center justify-center ${
                  item.color === "blue"
                    ? "bg-blue-500/15 text-blue-400"
                    : item.color === "purple"
                      ? "bg-purple-500/15 text-purple-400"
                      : "bg-green-500/15 text-green-400"
                }`}
              >
                {item.icon}
              </div>
              <div
                className={`text-xs font-mono mb-3 ${
                  item.color === "blue"
                    ? "text-blue-400"
                    : item.color === "purple"
                      ? "text-purple-400"
                      : "text-green-400"
                }`}
              >
                STEP {item.step}
              </div>
              <h3 className="text-xl font-bold mb-3">{item.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* === TRUST SECTION === */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 mb-28">
        <div className="border-glow rounded-3xl p-10 md:p-16">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-block px-4 py-1.5 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-mono tracking-widest uppercase mb-6">
                Why Trust Us
              </div>
              <h2 className="text-4xl font-extrabold tracking-tight mb-6">
                Built on{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-cyan-400">
                  Transparent Science,
                </span>{" "}
                Not Black Boxes
              </h2>
              <p className="text-gray-400 leading-relaxed mb-8">
                Unlike other detectors that give you a number with no
                explanation, TruthScan shows its reasoning. Every verdict comes
                with a full breakdown of which signals were detected and how
                much each contributed to the final score.
              </p>
              <div className="space-y-4">
                {[
                  {
                    icon: <Shield size={18} />,
                    text: "Open methodology — we explain every detection signal",
                  },
                  {
                    icon: <Lock size={18} />,
                    text: "Your files are never stored without consent",
                  },
                  {
                    icon: <Award size={18} />,
                    text: "Benchmarked against FakeBench and DFDC datasets",
                  },
                  {
                    icon: <Users size={18} />,
                    text: "Community-flagged Hall of Shame for crowd verification",
                  },
                  {
                    icon: <TrendingUp size={18} />,
                    text: "Models updated monthly with new synthetic data",
                  },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 text-gray-300"
                  >
                    <div className="text-green-400 shrink-0">{item.icon}</div>
                    <span className="text-sm">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-4">
              {[
                {
                  label: "SDXL Diffusion Detector",
                  score: 94,
                  color: "bg-blue-500",
                },
                {
                  label: "Metadata Forensics Parser",
                  score: 98,
                  color: "bg-purple-500",
                },
                {
                  label: "BLIP Caption Mismatch",
                  score: 91,
                  color: "bg-cyan-500",
                },
                {
                  label: "Ensemble Consensus Score",
                  score: 98.4,
                  color: "bg-green-500",
                },
              ].map((bar, i) => (
                <div
                  key={i}
                  className="p-4 rounded-xl bg-white/3 border border-white/8"
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-mono text-gray-300">
                      {bar.label}
                    </span>
                    <span className="text-sm font-bold text-white">
                      {bar.score}%
                    </span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${bar.color} rounded-full`}
                      style={{ width: `${bar.score}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* === USE CASES === */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 mb-28">
        <div className="text-center mb-14">
          <div className="inline-block px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-mono tracking-widest uppercase mb-4">
            Who Uses TruthScan
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
            Trusted Across{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
              Every Industry
            </span>
          </h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              icon: "📰",
              title: "Journalists",
              desc: "Verify viral content before publishing. Protect your publication's reputation.",
            },
            {
              icon: "⚖️",
              title: "Legal Teams",
              desc: "Authenticate digital evidence for court. Detect manipulated documents and media.",
            },
            {
              icon: "🏫",
              title: "Educators",
              desc: "Identify AI-generated student submissions. Maintain academic integrity.",
            },
            {
              icon: "🏢",
              title: "Enterprises",
              desc: "API access for compliance teams. Integrate deepfake detection into your pipeline.",
            },
            {
              icon: "🔬",
              title: "Researchers",
              desc: "Batch analysis for academic studies. Export raw confidence scores.",
            },
            {
              icon: "🛡️",
              title: "Government",
              desc: "Counter disinformation campaigns. Verify official communications are unaltered.",
            },
            {
              icon: "📱",
              title: "Social Media Users",
              desc: "Don't share fakes. Verify before you amplify. Protect your credibility.",
            },
            {
              icon: "💼",
              title: "HR & Recruiters",
              desc: "Verify profile photos and submitted portfolios. Detect synthetic identity fraud.",
            },
          ].map((item, i) => (
            <div
              key={i}
              className="card-hover p-6 rounded-2xl bg-white/3 border border-white/8"
            >
              <div className="text-3xl mb-4">{item.icon}</div>
              <h3 className="font-bold text-white mb-2">{item.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* === TESTIMONIALS === */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 mb-28">
        <div className="text-center mb-14">
          <h2 className="text-4xl font-extrabold tracking-tight mb-4">
            Real People.{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400">
              Real Verdicts.
            </span>
          </h2>
        </div>
        <div className="grid md:grid-cols-3 gap-5">
          {[
            {
              quote:
                "TruthScan caught a manipulated press photo before we published it. It would have been a massive editorial embarrassment. This tool is now mandatory for our newsroom.",
              name: "Priya Mehta",
              role: "Senior Editor, Digital Tribune",
              stars: 5,
            },
            {
              quote:
                "We integrated the API in a weekend. Now every piece of user-generated content on our platform gets screened before it goes live. Deepfake incidents dropped to near zero.",
              name: "Marcus Chen",
              role: "CTO, MediaVerify Inc.",
              stars: 5,
            },
            {
              quote:
                "The Privacy Mode feature is incredible. I can verify sensitive client documents without anything leaving my device. No other tool offers this.",
              name: "Anjali Rao",
              role: "Digital Forensics Consultant",
              stars: 5,
            },
          ].map((t, i) => (
            <div
              key={i}
              className="card-hover p-8 rounded-2xl bg-white/3 border border-white/8"
            >
              <div className="flex gap-1 mb-4">
                {Array(t.stars)
                  .fill(0)
                  .map((_, j) => (
                    <Star
                      key={j}
                      size={14}
                      className="text-yellow-400 fill-yellow-400"
                    />
                  ))}
              </div>
              <p className="text-gray-300 text-sm leading-relaxed mb-6 italic">
                "{t.quote}"
              </p>
              <div>
                <div className="font-bold text-white text-sm">{t.name}</div>
                <div className="text-gray-500 text-xs">{t.role}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* === COMPARISON TABLE === */}
      <div className="relative z-10 max-w-4xl mx-auto px-6 mb-28">
        <div className="text-center mb-14">
          <h2 className="text-4xl font-extrabold tracking-tight mb-4">
            TruthScan vs{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
              The Rest
            </span>
          </h2>
        </div>
        <div className="rounded-2xl overflow-hidden border border-white/10">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-white/5 text-left">
                <th className="p-4 font-semibold text-gray-400">Feature</th>
                <th className="p-4 font-bold text-blue-400 text-center">
                  TruthScan
                </th>
                <th className="p-4 font-semibold text-gray-500 text-center">
                  Others
                </th>
              </tr>
            </thead>
            <tbody>
              {[
                ["Multi-modal (Image + Audio + Video + Text)", true, false],
                ["Explainable AI (shows reasoning)", true, false],
                ["Privacy Mode (on-device)", true, false],
                ["Batch URL scanning (up to 10)", true, false],
                ["Community Hall of Shame", true, false],
                ["API access for developers", true, "Paid only"],
                ["Shareable result pages", true, false],
                ["Free tier available", true, "Limited"],
              ].map(([feature, ours, theirs], i) => (
                <tr
                  key={i}
                  className={`border-t border-white/5 ${i % 2 === 0 ? "bg-white/2" : ""}`}
                >
                  <td className="p-4 text-gray-300">{feature as string}</td>
                  <td className="p-4 text-center">
                    {ours === true ? (
                      <CheckCircle
                        size={18}
                        className="text-green-400 mx-auto"
                      />
                    ) : (
                      <span className="text-gray-400 text-xs">
                        {ours as string}
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-center">
                    {theirs === false ? (
                      <span className="text-red-400 font-bold text-lg">✕</span>
                    ) : (
                      <span className="text-yellow-400 text-xs">
                        {theirs as string}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* === FAQ === */}
      <div className="relative z-10 max-w-3xl mx-auto px-6 mb-28">
        <div className="text-center mb-14">
          <h2 className="text-4xl font-extrabold tracking-tight mb-4">
            Frequently Asked{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
              Questions
            </span>
          </h2>
        </div>
        <div className="space-y-4">
          {[
            {
              q: "Is TruthScan free to use?",
              a: "Yes. The core scanner is free for all registered users. Create a free account and start scanning immediately — no credit card required.",
            },
            {
              q: "How accurate is the detection?",
              a: "Our ensemble model achieves 98.4% accuracy benchmarked on the DFDC dataset. Individual model accuracy ranges from 91–98%. No detector is 100% perfect; we always show confidence levels so you can make an informed judgment.",
            },
            {
              q: "Does TruthScan store my uploaded files?",
              a: "By default, scans are saved to your account for history. Use Privacy Mode to run detection entirely in your browser — zero data is sent to our servers.",
            },
            {
              q: "Can I use TruthScan via API?",
              a: "Yes. Developers can access our API from the /developers section. Generate API keys and integrate deepfake detection into your own applications.",
            },
            {
              q: "What file formats are supported?",
              a: "Images: JPG, PNG, WebP. Audio: MP3, WAV, M4A. Video: MP4, WebM, MOV. Text: Direct paste or URL import. Max file size is 50MB.",
            },
            {
              q: "How is TruthScan different from other AI detectors?",
              a: "Three key differences: (1) We run 3 models simultaneously for ensemble accuracy, (2) We explain our reasoning — not just a number, (3) We support all media types in one platform, including on-device Privacy Mode.",
            },
          ].map((faq, i) => (
            <div
              key={i}
              className="card-hover p-6 rounded-2xl bg-white/3 border border-white/8"
            >
              <div className="flex items-start gap-3">
                <ChevronRight
                  size={18}
                  className="text-blue-400 mt-0.5 shrink-0"
                />
                <div>
                  <h3 className="font-bold text-white mb-2">{faq.q}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    {faq.a}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* === FINAL CTA === */}
      <div className="relative z-10 max-w-4xl mx-auto px-6 mb-20">
        <div className="border-glow rounded-3xl p-12 md:p-20 text-center relative overflow-hidden">
          <div className="scan-line" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-blue-600/15 rounded-full blur-[80px] pointer-events-none" />
          <div className="relative z-10">
            <AlertTriangle size={40} className="text-yellow-400 mx-auto mb-6" />
            <h2 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6">
              The Next Deepfake
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
                Could Fool You.
              </span>
            </h2>
            <p className="text-gray-400 text-lg mb-10 max-w-xl mx-auto">
              Synthetic media is doubling every 6 months. Don't trust your eyes
              alone. Start scanning for free — it takes 30 seconds.
            </p>
            <Link
              href={userId ? "/scan" : "/sign-in"}
              className="group inline-flex items-center gap-3 px-10 py-5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold text-xl transition-all glow-blue"
            >
              <ScanFace size={24} />
              Verify Now — It's Free
              <ArrowRight
                size={20}
                className="group-hover:translate-x-1 transition-transform"
              />
            </Link>
            <p className="text-gray-600 text-sm mt-6">
              No credit card • Instant results • Privacy guaranteed
            </p>
          </div>
        </div>
      </div>

      {/* === FOOTER === */}
      <div className="relative z-10 border-t border-white/5 py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2 text-xl font-extrabold">
            <ShieldCheck className="text-blue-500" size={24} />
            TruthScan
          </div>
          <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-500">
            <Link href="/scan" className="hover:text-white transition-colors">
              Scanner
            </Link>
            <Link href="/batch" className="hover:text-white transition-colors">
              Batch Scan
            </Link>
            <Link
              href="/leaderboard"
              className="hover:text-white transition-colors"
            >
              Leaderboard
            </Link>
            <Link
              href="/hall-of-shame"
              className="hover:text-white transition-colors"
            >
              Hall of Shame
            </Link>
            <Link
              href="/developers"
              className="hover:text-white transition-colors"
            >
              API
            </Link>
            <Link href="/quiz" className="hover:text-white transition-colors">
              Challenge
            </Link>
          </div>
          <div className="text-gray-600 text-sm">© 2026 TruthScan Protocol</div>
        </div>
      </div>
    </div>
  );
}
