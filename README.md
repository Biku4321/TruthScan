<div align="center">

# 🛡️ TruthScan

### The Multi-Modal AI Deepfake & Misinformation Detector

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://typescriptlang.org)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-green?logo=mongodb)](https://mongodb.com)
[![Clerk](https://img.shields.io/badge/Auth-Clerk-purple)](https://clerk.com)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38bdf8?logo=tailwindcss)](https://tailwindcss.com)

**Detect AI-generated images, deepfake audio, manipulated video, and misinformation — all in one platform.**

</div>

---

## 🚀 What is TruthScan?

TruthScan is a full-stack web platform + browser extension that uses multiple AI models to detect:

| Content Type | What We Detect | Models Used |
|---|---|---|
| 🖼️ **Images** | GAN artifacts, diffusion patterns, metadata anomalies | SDXL-Detector, BLIP Captioner |
| 🎵 **Audio** | Voice cloning, spectral manipulation | Waveform Visualizer |
| 🎬 **Video** | Deepfake frames (multi-frame analysis) | SDXL-Detector × 6 frames |
| 📝 **Text** | Clickbait, misinformation, sensationalism | BART-MNLI, Flan-T5 |

---

## ✨ Features

### Core Detection
- **Visual Forensics** — CSS filter overlays (ELA, edge detection, lighting) with per-signal AI confidence scores
- **Multi-Frame Video Analysis** — extracts 6 evenly-spaced frames, averages scores across all frames
- **Text Analysis** — imports articles via URL scraping + NLP classification + fact-check links
- **Batch URL Scanner** — scan up to 10 images simultaneously with parallel API calls
- **Confidence Breakdown Widget** — see exactly which signals (detector, metadata, caption) triggered

### Community & Gamification
- 🏆 **Leaderboard** — All-Time AND Weekly rankings (auto-resets every Monday via Vercel Cron)
- 🎖️ **Badges & Levels** — Rookie → Grandmaster progression with unlockable achievements
- 🗳️ **Community Voting** — Agree/Disagree with AI verdicts, live consensus bar
- 💬 **Community Notes** — Add, edit, delete discussion notes on any scan

### Browser Extension (Chrome MV3)
- Right-click any image → "🔍 Scan with TruthScan"
- **Popup UI** — last 5 scans, live stats, direct links to reports
- **"Scan This Page"** — batch-scans all images on the current tab

### Developer API
- `POST /api/public/scan` — scan any image URL with your API key
- Key management: generate, label, revoke (up to 5 per account)
- 100 requests/day free tier, SHA-256 hashed key storage

### PWA / Web Share Target
- Install TruthScan on Android and use **Share → TruthScan** from any app

---

## 🏗️ Tech Stack

```
Frontend     Next.js 16 (App Router) + TypeScript + Tailwind CSS
Auth         Clerk
Database     MongoDB + Mongoose
Storage      Cloudinary
AI           HuggingFace Inference API
Extension    Chrome Manifest V3
Deploy       Vercel + Vercel Cron
```

---

## 📁 Project Structure

```
truthscan/
├── chrome-extension/         # Chrome Extension (MV3)
│   ├── manifest.json
│   ├── background.js         # Service worker + context menu
│   └── popup.html            # Extension popup UI
│
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── scan/         # Image scan + batch + video-frames + vote + note + delete
│   │   │   ├── scan/text/    # Text/article NLP analysis
│   │   │   ├── public/       # Public REST API (API key auth)
│   │   │   ├── quiz/         # Quiz questions + reward points
│   │   │   ├── scrape/       # URL article scraper (Cheerio)
│   │   │   ├── admin/        # Admin moderation dashboard
│   │   │   └── cron/         # Weekly leaderboard reset
│   │   │
│   │   ├── batch/            # Batch URL scanner UI
│   │   ├── developers/       # Developer portal + API keys
│   │   ├── history/          # Personal scan history
│   │   ├── leaderboard/      # All-time + weekly rankings
│   │   ├── quiz/             # Real vs AI image challenge game
│   │   ├── scan/             # Main scanner (image/text/audio/video)
│   │   ├── share/[id]/       # Shareable scan report page
│   │   ├── share-target/     # PWA Web Share API target
│   │   ├── profile/          # User profile, badges, history
│   │   ├── hall-of-shame/    # Community-flagged fakes
│   │   └── manifest.ts       # PWA manifest (Next.js route)
│   │
│   ├── components/
│   │   ├── ConfidenceBreakdown.tsx   # Per-signal AI score breakdown
│   │   ├── CommunityVoting.tsx       # Agree/Disagree voting widget
│   │   ├── CommunityNotes.tsx        # Discussion notes system
│   │   ├── FileUpload.tsx            # Drag-drop + multi-frame video
│   │   ├── TextScanner.tsx           # Text + URL scrape scanner
│   │   ├── ForensicViewer.tsx        # CSS filter forensic inspector
│   │   ├── AudioVisualizer.tsx       # WaveSurfer waveform player
│   │   └── ExternalSearch.tsx        # Google Lens, TinEye, Bing, Yandex
│   │
│   ├── models/
│   │   ├── Scan.ts           # votes[], confidenceBreakdown, batchId
│   │   ├── UserStats.ts      # truthScore + weeklyScore + weeklyResetAt
│   │   ├── QuizQuestion.ts
│   │   └── ApiKey.ts         # Hashed API keys for public API
│   │
│   └── lib/
│       ├── db.ts             # MongoDB connection (cached singleton)
│       ├── gamification.ts   # Level/badge calculation
│       └── videoUtils.ts     # Multi-frame video extraction
│
├── public/
│   ├── noise.svg             # Local grain texture (no CDN dependency)
│   └── cubes.svg             # Local cube pattern
│
├── vercel.json               # Cron: weekly leaderboard reset (Mon 00:00 UTC)
├── .env.local.example        # All required environment variables
└── README.md
```

---

## ⚡ Quick Start

### Prerequisites
- Node.js 18+
- MongoDB Atlas (free tier)
- Cloudinary (free tier)
- Clerk (free tier)
- HuggingFace account + API key (free)

### 1. Clone & Install

```bash
git clone https://github.com/your-username/truthscan.git
cd truthscan
npm install
```

### 2. Configure environment

```bash
cp .env.local.example .env.local
# Fill in all values (see Environment Variables section below)
```

### 3. Run dev server

```bash
npm run dev
# Open http://localhost:3000
```

### 4. Load Chrome Extension (optional)

1. Go to `chrome://extensions`
2. Enable **Developer mode**
3. Click **Load unpacked** → select the `chrome-extension/` folder
4. Edit `API_BASE` in `background.js` and `popup.html` to `http://localhost:3000`

---

## 🔑 Environment Variables

```bash
# MongoDB
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/truthscan

# Clerk Auth
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/scan
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/scan

# Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your_unsigned_preset

# HuggingFace
HUGGINGFACE_API_KEY=hf_...

# Admin (SERVER-SIDE ONLY — no NEXT_PUBLIC_ prefix)
ADMIN_USER_ID=user_clerk_id_of_your_admin_account

# Cron security (generate: openssl rand -hex 32)
CRON_SECRET=your_random_secret_here

# Used in API response reportUrl
NEXT_PUBLIC_APP_URL=https://your-deployed-domain.com
```

> ⚠️ Never commit `.env.local` to git. It is already in `.gitignore`.

---

## 🌐 Public REST API

### Scan an image

```bash
curl -X POST https://your-domain.com/api/public/scan \
  -H "Content-Type: application/json" \
  -H "X-Api-Key: ts_your_key_here" \
  -d '{"imageUrl": "https://example.com/photo.jpg"}'
```

### Response

```json
{
  "success": true,
  "scanId": "683abc...",
  "aiScore": 87,
  "verdict": "Likely AI-Generated",
  "isAiGenerated": true,
  "confidence": 87,
  "caption": "digital art render of a person",
  "reportUrl": "https://your-domain.com/share/683abc...",
  "requestsRemaining": 97
}
```

Get API keys at `/developers` on your deployed app.

---

## 🤝 Contributing

1. Fork the repository
2. Create your branch: `git checkout -b feat/my-feature`
3. Commit: `git commit -m "feat: add my feature"`
4. Push: `git push origin feat/my-feature`
5. Open a Pull Request

---

## 📄 License

MIT — see [LICENSE](LICENSE).

---

<div align="center">
Built for information integrity.<br/>
<strong>TruthScan Protocol © 2026</strong>
</div>
