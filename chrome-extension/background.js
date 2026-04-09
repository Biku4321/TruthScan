// ---- CONFIG: Update this to your deployed URL before shipping ----
const API_BASE = "https://your-deployed-domain.com";

// Create Context Menu on install
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "truthscan-verify",
    title: "🔍 Scan with TruthScan",
    contexts: ["image"]
  });
});

// ---- HELPER: safe script injection (handles "Receiving end does not exist") ----
function safeExecuteScript(tabId, options) {
  return new Promise((resolve) => {
    chrome.scripting.executeScript({ target: { tabId }, ...options }, (results) => {
      if (chrome.runtime.lastError) {
        // This error is expected on chrome://, PDF, or extension pages — safe to ignore
        console.warn("TruthScan: Script injection skipped —", chrome.runtime.lastError.message);
        resolve(null);
      } else {
        resolve(results);
      }
    });
  });
}

// ---- Handle Right-Click Context Menu ----
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId !== "truthscan-verify" || !info.srcUrl) return;

  // Show scanning toast
  await safeExecuteScript(tab.id, { function: showScanningToast });

  try {
    const res = await fetch(`${API_BASE}/api/scan`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ imageUrl: info.srcUrl })
    });
    const data = await res.json();

    await safeExecuteScript(tab.id, {
      func: showResultToast,
      args: [data.score, data.verdict, data.scanId, API_BASE]
    });

    saveScanToStorage({
      scanId: data.scanId,
      imageUrl: info.srcUrl,
      score: data.score,
      verdict: data.verdict,
      type: "image"
    });

  } catch (err) {
    console.error("TruthScan scan error:", err);
    await safeExecuteScript(tab.id, { func: showErrorToast });
  }
});

// ---- Save scan result to chrome.storage for popup history ----
function saveScanToStorage(scan) {
  chrome.storage.local.get(["recentScans", "totalScans", "fakesFound"], (data) => {
    const prev = data.recentScans || [];
    const isFake = scan.score > 50;
    chrome.storage.local.set({
      recentScans: [{ ...scan, ts: Date.now() }, ...prev].slice(0, 20),
      totalScans: (data.totalScans || 0) + 1,
      fakesFound: (data.fakesFound || 0) + (isFake ? 1 : 0),
    });
  });
}

// ---- Toast functions (run inside the webpage) ----

function showScanningToast() {
  const old = document.getElementById("truthscan-toast");
  if (old) old.remove();
  const div = document.createElement("div");
  div.id = "truthscan-toast";
  div.style.cssText = [
    "position:fixed", "top:20px", "right:20px",
    "background:#0f172a", "color:#f1f5f9",
    "padding:14px 18px", "border-radius:12px",
    "z-index:2147483647", "font-family:-apple-system,sans-serif",
    "box-shadow:0 20px 40px rgba(0,0,0,0.4)",
    "border:1px solid #1e293b",
    "display:flex", "align-items:center", "gap:10px",
    "font-size:14px", "font-weight:600",
    "animation:ts-slide-in 0.3s ease"
  ].join(";");
  div.innerHTML = [
    '<style>',
    '@keyframes ts-spin{to{transform:rotate(360deg)}}',
    '@keyframes ts-slide-in{from{transform:translateX(120%);opacity:0}to{transform:translateX(0);opacity:1}}',
    '</style>',
    '<div style="width:18px;height:18px;border:2px solid #3b82f6;border-top-color:transparent;',
    'border-radius:50%;animation:ts-spin 0.8s linear infinite;flex-shrink:0"></div>',
    'TruthScan: Analyzing...'
  ].join("");
  document.body.appendChild(div);
}

function showResultToast(score, verdict, scanId, apiBase) {
  const div = document.getElementById("truthscan-toast");
  if (!div) return;
  const isFake = score > 50;
  div.style.background = isFake ? "#450a0a" : "#052e16";
  div.style.borderColor = isFake ? "#991b1b" : "#14532d";
  const color = isFake ? "#fca5a5" : "#86efac";
  const label = isFake ? "⚠️ AI DETECTED" : "✅ LIKELY REAL";
  const link = scanId
    ? `<a href="${apiBase}/share/${scanId}" target="_blank"
        style="font-size:11px;color:#60a5fa;text-decoration:underline;margin-top:4px;display:inline-block">
        View Full Report →</a>`
    : "";
  div.innerHTML = `
    <div style="flex:1">
      <div style="font-weight:800;font-size:15px;color:${color}">${label}</div>
      <div style="font-size:12px;margin-top:3px;color:#94a3b8">Confidence: ${score}% · ${verdict}</div>
      ${link}
    </div>
    <button onclick="this.parentElement.remove()"
      style="background:none;border:none;color:#475569;cursor:pointer;font-size:18px;line-height:1;flex-shrink:0">×</button>
  `;
  setTimeout(() => { if (div.parentElement) div.remove(); }, 8000);
}

function showErrorToast() {
  const div = document.getElementById("truthscan-toast");
  if (!div) return;
  div.style.background = "#431407";
  div.style.borderColor = "#9a3412";
  div.innerHTML = `
    <span>❌ Could not connect to TruthScan server.</span>
    <button onclick="this.parentElement.remove()"
      style="background:none;border:none;color:#475569;cursor:pointer;font-size:18px">×</button>
  `;
  setTimeout(() => { if (div.parentElement) div.remove(); }, 4000);
}
