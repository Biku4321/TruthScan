"use client";
import { useState, useEffect } from "react";
import { useAuth, SignInButton } from "@clerk/nextjs";
import {
  Code2,
  Key,
  Plus,
  Trash2,
  Copy,
  Check,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
  Terminal,
  Zap,
  Lock,
  BarChart3,
} from "lucide-react";

interface ApiKeyRecord {
  keyPrefix: string;
  label: string;
  requestCount: number;
  lastUsed: string | null;
  createdAt: string;
  active: boolean;
}

function CodeBlock({ code, lang = "bash" }: { code: string; lang?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="relative">
      <div className="flex items-center justify-between px-4 py-2 bg-slate-800 rounded-t-xl">
        <span className="text-xs font-mono text-slate-400">{lang}</span>
        <button
          onClick={() => { navigator.clipboard.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
          className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
        >
          {copied ? <><Check size={12} /> Copied</> : <><Copy size={12} /> Copy</>}
        </button>
      </div>
      <pre className="bg-slate-900 px-4 py-4 rounded-b-xl text-sm font-mono text-green-400 overflow-x-auto leading-relaxed whitespace-pre-wrap">
        {code}
      </pre>
    </div>
  );
}

export default function DevelopersPage() {
  const { isSignedIn, isLoaded } = useAuth();
  const [keys, setKeys] = useState<ApiKeyRecord[]>([]);
  const [loadingKeys, setLoadingKeys] = useState(false);
  const [label, setLabel] = useState("");
  const [creating, setCreating] = useState(false);
  const [newKey, setNewKey] = useState<string | null>(null);
  const [showKey, setShowKey] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);
  const [error, setError] = useState("");

  const fetchKeys = async () => {
    setLoadingKeys(true);
    try {
      const res = await fetch("/api/public/keys");
      if (res.ok) setKeys(await res.json());
    } finally {
      setLoadingKeys(false);
    }
  };

  useEffect(() => {
    if (isSignedIn) fetchKeys();
  }, [isSignedIn]);

  const handleCreate = async () => {
    setCreating(true);
    setError("");
    try {
      const res = await fetch("/api/public/keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ label: label || "My API Key" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setNewKey(data.key);
      setLabel("");
      fetchKeys();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  };

  const handleRevoke = async (keyPrefix: string) => {
    if (!confirm("Revoke this API key? It cannot be undone.")) return;
    await fetch("/api/public/keys", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ keyPrefix }),
    });
    fetchKeys();
  };

  const exampleCurl = `curl -X POST https://yourapp.com/api/public/scan \\
  -H "Content-Type: application/json" \\
  -H "X-Api-Key: ts_your_key_here" \\
  -d '{"imageUrl": "https://example.com/photo.jpg"}'`;

  const exampleResponse = `{
  "success": true,
  "scanId": "683abc...",
  "aiScore": 87,
  "verdict": "Likely AI-Generated",
  "isAiGenerated": true,
  "confidence": 87,
  "caption": "digital art render of a person",
  "reportUrl": "https://yourapp.com/share/683abc...",
  "requestsRemaining": 97
}`;

  const exampleJS = `const response = await fetch("https://yourapp.com/api/public/scan", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "X-Api-Key": "ts_your_key_here"
  },
  body: JSON.stringify({
    imageUrl: "https://example.com/photo.jpg"
  })
});

const result = await response.json();
console.log(result.isAiGenerated); // true or false
console.log(result.aiScore);       // 0–100`;

  return (
    <div className="min-h-screen bg-slate-950 text-white">

      {/* Hero */}
      <div className="border-b border-slate-800 px-6 py-16 text-center max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-900/50 border border-indigo-700 rounded-full text-indigo-300 text-sm font-bold mb-6">
          <Terminal size={14} /> Developer API — Public Beta
        </div>
        <h1 className="text-5xl font-extrabold tracking-tight mb-4 bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
          Build on TruthScan
        </h1>
        <p className="text-slate-400 text-xl max-w-2xl mx-auto leading-relaxed">
          Integrate our deepfake detection engine into any app with a simple REST API.
          100 free requests/day per key.
        </p>

        <div className="flex justify-center gap-8 mt-10 text-center">
          {[
            { label: "Free Tier", value: "100 req/day" },
            { label: "Latency", value: "~2–4s" },
            { label: "Auth", value: "API Key" },
          ].map((stat) => (
            <div key={stat.label}>
              <div className="text-2xl font-black text-indigo-400">{stat.value}</div>
              <div className="text-xs text-slate-500 font-bold uppercase tracking-wider mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-16 grid lg:grid-cols-2 gap-12">

        {/* LEFT: API Docs */}
        <div className="space-y-10">
          <div>
            <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
              <Zap size={20} className="text-yellow-400" /> Quick Start
            </h2>
            <p className="text-slate-400 text-sm mb-4">
              Send a <code className="text-indigo-300 bg-slate-800 px-1.5 py-0.5 rounded">POST</code> request
              to <code className="text-indigo-300 bg-slate-800 px-1.5 py-0.5 rounded">/api/public/scan</code> with
              your image URL and API key.
            </p>
            <CodeBlock code={exampleCurl} lang="bash (cURL)" />
          </div>

          <div>
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Code2 size={20} className="text-blue-400" /> JavaScript / Node.js
            </h2>
            <CodeBlock code={exampleJS} lang="javascript" />
          </div>

          <div>
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <BarChart3 size={20} className="text-green-400" /> Response Schema
            </h2>
            <CodeBlock code={exampleResponse} lang="json" />
          </div>

          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-5 space-y-3">
            <h3 className="font-bold flex items-center gap-2 text-slate-200">
              <Lock size={16} className="text-yellow-400" /> Auth & Rate Limits
            </h3>
            <ul className="text-sm text-slate-400 space-y-2">
              <li>• Pass your key as <code className="text-indigo-300">X-Api-Key</code> header or <code className="text-indigo-300">Authorization: Bearer &lt;key&gt;</code></li>
              <li>• 100 requests per day per key (resets at midnight UTC)</li>
              <li>• Max 5 active keys per account</li>
              <li>• Keys are hashed — we never store them in plain text</li>
            </ul>
          </div>
        </div>

        {/* RIGHT: Key Management */}
        <div className="space-y-8">
          <div>
            <h2 className="text-xl font-bold mb-1 flex items-center gap-2">
              <Key size={20} className="text-indigo-400" /> API Keys
            </h2>
            <p className="text-slate-400 text-sm">Keys are shown once. Store them securely.</p>
          </div>

          {!isLoaded ? (
            <div className="flex justify-center py-10">
              <Loader2 className="animate-spin text-slate-400" size={28} />
            </div>
          ) : !isSignedIn ? (
            <div className="bg-slate-900 border border-slate-700 rounded-2xl p-8 text-center">
              <Key size={32} className="text-slate-500 mx-auto mb-3" />
              <p className="text-slate-400 mb-4 text-sm">Sign in to generate and manage your API keys.</p>
              <SignInButton mode="modal">
                <button className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-colors">
                  Sign In
                </button>
              </SignInButton>
            </div>
          ) : (
            <>
              {/* New key reveal */}
              {newKey && (
                <div className="bg-green-950 border border-green-700 rounded-2xl p-5 animate-in slide-in-from-top-2">
                  <p className="text-green-400 font-bold text-sm mb-3 flex items-center gap-2">
                    <Check size={16} /> Key created — copy it now, it won't be shown again
                  </p>
                  <div className="flex items-center gap-2 bg-slate-900 rounded-xl px-4 py-3">
                    <code className="flex-1 text-sm font-mono text-green-300 truncate">
                      {showKey ? newKey : newKey.slice(0, 6) + "•".repeat(newKey.length - 6)}
                    </code>
                    <button onClick={() => setShowKey(!showKey)} className="text-slate-500 hover:text-white transition-colors">
                      {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                    <button
                      onClick={() => { navigator.clipboard.writeText(newKey); setCopiedKey(true); setTimeout(() => setCopiedKey(false), 2000); }}
                      className="text-slate-500 hover:text-white transition-colors"
                    >
                      {copiedKey ? <Check size={16} className="text-green-400" /> : <Copy size={16} />}
                    </button>
                  </div>
                  <button onClick={() => setNewKey(null)} className="text-xs text-slate-500 hover:text-slate-300 mt-3 transition-colors">
                    Dismiss
                  </button>
                </div>
              )}

              {/* Create form */}
              <div className="bg-slate-900 border border-slate-700 rounded-2xl p-5">
                <h3 className="font-bold text-sm text-slate-300 mb-3">Generate New Key</h3>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={label}
                    onChange={(e) => setLabel(e.target.value)}
                    placeholder='Label (e.g. "Production")'
                    className="flex-1 px-4 py-2.5 bg-slate-800 border border-slate-600 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <button
                    onClick={handleCreate}
                    disabled={creating}
                    className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-colors flex items-center gap-2 disabled:opacity-50"
                  >
                    {creating ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                    Create
                  </button>
                </div>
                {error && (
                  <p className="text-red-400 text-xs mt-2 flex items-center gap-1">
                    <AlertCircle size={13} /> {error}
                  </p>
                )}
              </div>

              {/* Key list */}
              <div className="space-y-3">
                {loadingKeys ? (
                  <div className="flex justify-center py-6">
                    <Loader2 size={22} className="animate-spin text-slate-500" />
                  </div>
                ) : keys.length === 0 ? (
                  <div className="text-center py-8 text-slate-500 text-sm border border-dashed border-slate-700 rounded-2xl">
                    No API keys yet. Create one above.
                  </div>
                ) : (
                  keys.map((k) => (
                    <div
                      key={k.keyPrefix}
                      className="bg-slate-900 border border-slate-700 rounded-xl p-4 flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-sm text-white">{k.label}</span>
                          <span className="text-[10px] bg-slate-700 text-slate-400 px-2 py-0.5 rounded font-mono">
                            {k.keyPrefix}••••
                          </span>
                        </div>
                        <div className="flex gap-4 text-xs text-slate-500">
                          <span>{k.requestCount} requests used</span>
                          <span>
                            {k.lastUsed
                              ? `Last used ${new Date(k.lastUsed).toLocaleDateString()}`
                              : "Never used"}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleRevoke(k.keyPrefix)}
                        className="p-2 text-slate-500 hover:text-red-400 transition-colors shrink-0"
                        title="Revoke key"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
