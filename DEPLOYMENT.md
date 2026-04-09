# TruthScan — Complete Deployment Guide

Two platforms covered: **Vercel** (recommended) and **Render**.

---

## Before You Deploy — External Services Setup

You need four external accounts configured before deploying anywhere. Do this first.

---

### 1. MongoDB Atlas

1. Go to [mongodb.com/cloud/atlas](https://mongodb.com/cloud/atlas) → **Create a free account**
2. Create a **Free M0 cluster** (512MB, enough for thousands of scans)
3. Go to **Database Access** → Add a database user with username + password → save them
4. Go to **Network Access** → Click **Add IP Address** → Select **Allow Access from Anywhere** (`0.0.0.0/0`)
   > This is required so Vercel/Render serverless IPs can connect
5. Click **Connect** on your cluster → **Drivers** → copy the connection string:
   ```
   mongodb+srv://youruser:yourpassword@cluster0.abc12.mongodb.net/?retryWrites=true&w=majority
   ```
6. Add your database name to the URI:
   ```
   mongodb+srv://youruser:yourpassword@cluster0.abc12.mongodb.net/truthscan?retryWrites=true&w=majority
   ```
   Save this as `MONGODB_URI`

---

### 2. Clerk (Authentication)

1. Go to [clerk.com](https://clerk.com) → Create account → **Create application**
2. Name it "TruthScan", choose **Email + Google** sign-in
3. Go to **API Keys** in your Clerk dashboard:
   - Copy **Publishable Key** → `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - Copy **Secret Key** → `CLERK_SECRET_KEY`
4. Go to **Users** → find your own account → copy your **User ID** (looks like `user_abc123...`)
   - Save this as `ADMIN_USER_ID` (no `NEXT_PUBLIC_` prefix)

---

### 3. Cloudinary (File Storage)

1. Go to [cloudinary.com](https://cloudinary.com) → Create free account
2. From your **Dashboard**, copy your **Cloud Name** → `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`
3. Go to **Settings → Upload** → Scroll to **Upload presets**
4. Click **Add upload preset**:
   - Set **Signing mode** to **Unsigned**
   - Set **Folder** to `truthscan`
   - Click **Save**
5. Copy the preset name → `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET`

---

### 4. HuggingFace (AI Models)

1. Go to [huggingface.co](https://huggingface.co) → Create free account
2. Go to **Settings → Access Tokens** → **New token**
   - Name: `truthscan-prod`
   - Role: **Read**
3. Copy the token → `HUGGINGFACE_API_KEY`

> **Note:** HuggingFace free-tier models cold-start (take 20–40s on first request after idle). This is normal — the retry logic handles it automatically.

---

### 5. Generate CRON_SECRET

Run this in your terminal to generate a secure random secret:

```bash
openssl rand -hex 32
```

Save the output as `CRON_SECRET`.

---

## Option A: Deploy to Vercel (Recommended)

Vercel is the native platform for Next.js — zero configuration needed. Cron jobs work out of the box.

### Step 1: Push code to GitHub

```bash
cd your-project-folder
git init
git add .
git commit -m "feat: initial TruthScan commit"
git branch -M main
git remote add origin https://github.com/your-username/truthscan.git
git push -u origin main
```

### Step 2: Import to Vercel

1. Go to [vercel.com](https://vercel.com) → **Sign up / Log in**
2. Click **Add New → Project**
3. Click **Import Git Repository** → connect your GitHub and select `truthscan`
4. Vercel auto-detects Next.js — **don't change any build settings**
5. Before clicking Deploy, expand **Environment Variables** and add all of these:

| Variable | Value |
|---|---|
| `MONGODB_URI` | Your full Atlas connection string |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | From Clerk dashboard |
| `CLERK_SECRET_KEY` | From Clerk dashboard |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL` | `/sign-in` |
| `NEXT_PUBLIC_CLERK_SIGN_UP_URL` | `/sign-up` |
| `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL` | `/scan` |
| `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL` | `/scan` |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | Your cloud name |
| `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET` | Your unsigned preset name |
| `HUGGINGFACE_API_KEY` | `hf_...` |
| `ADMIN_USER_ID` | Your Clerk user ID |
| `CRON_SECRET` | Your generated secret |
| `NEXT_PUBLIC_APP_URL` | Leave blank for now, fill after first deploy |

6. Click **Deploy** — takes ~2 minutes

### Step 3: Set your app URL

After the first deploy, copy your Vercel URL (e.g. `https://truthscan.vercel.app`):

1. Go to **Project Settings → Environment Variables**
2. Add `NEXT_PUBLIC_APP_URL` = `https://truthscan.vercel.app`
3. Go to **Deployments** → click **Redeploy** on the latest deployment

### Step 4: Configure Clerk redirect URLs

1. Go to your Clerk dashboard → **Paths** (or **Redirect URLs**)
2. Add your Vercel domain to **Allowed redirect origins**:
   ```
   https://truthscan.vercel.app
   ```

### Step 5: Verify Cron Jobs

The weekly leaderboard reset is configured in `vercel.json`:
```json
{
  "crons": [{ "path": "/api/cron/weekly-reset", "schedule": "0 0 * * 1" }]
}
```

1. Go to your Vercel project → **Cron Jobs** tab
2. You should see `weekly-reset` listed with schedule `0 0 * * 1` (Monday midnight UTC)
3. Click **Trigger** to test it manually — it should return `{ "success": true, "usersReset": 0 }`

> **Note:** Cron jobs require Vercel Pro on custom domains, but work on the free `.vercel.app` subdomain.

### Step 6: Configure Custom Domain (optional)

1. Go to **Project Settings → Domains**
2. Add your domain (e.g. `truthscan.io`)
3. Add the DNS records shown in Vercel to your domain registrar
4. Update `NEXT_PUBLIC_APP_URL` to your custom domain
5. Update Clerk allowed origins with your custom domain

### ✅ Vercel Deployment Complete

Your app is live. Test by:
- Visiting your URL
- Uploading an image on `/scan`
- Checking the leaderboard at `/leaderboard`
- Visiting `/developers` and generating an API key

---

## Option B: Deploy to Render

Render supports Next.js as a **Web Service**. Note: Render's free tier spins down after 15 minutes of inactivity (cold starts ~30s). Paid plans avoid this.

> ⚠️ Render does **not** natively support Vercel Cron format. You'll set up a cron job manually using Render's cron service or an external cron (see Step 5).

### Step 1: Push code to GitHub

Same as Vercel Step 1 above.

### Step 2: Create a Web Service on Render

1. Go to [render.com](https://render.com) → **New → Web Service**
2. Connect your GitHub repo
3. Configure:
   | Setting | Value |
   |---|---|
   | **Name** | `truthscan` |
   | **Region** | Closest to your users |
   | **Branch** | `main` |
   | **Runtime** | `Node` |
   | **Build Command** | `npm install && npm run build` |
   | **Start Command** | `npm start` |
   | **Instance Type** | Free (or Starter $7/mo to avoid spin-down) |

4. Click **Advanced** → **Add Environment Variable** → add all the same variables as the Vercel table above

5. Click **Create Web Service** — first build takes ~5 minutes

### Step 3: Set your app URL

After deploy, copy your Render URL (e.g. `https://truthscan.onrender.com`):

1. Go to **Environment** tab
2. Add `NEXT_PUBLIC_APP_URL` = `https://truthscan.onrender.com`
3. Click **Manual Deploy → Deploy latest commit**

### Step 4: Configure Clerk

Same as Vercel Step 4 — add your Render URL to Clerk's allowed origins.

### Step 5: Set up the Weekly Cron Job on Render

Render doesn't read `vercel.json`, so set up the cron manually:

**Option A: Render Cron Job (Paid plan)**
1. Go to **New → Cron Job** on Render
2. **Command:** `curl -H "Authorization: Bearer YOUR_CRON_SECRET" https://truthscan.onrender.com/api/cron/weekly-reset`
3. **Schedule:** `0 0 * * 1`

**Option B: Free external cron (cron-job.org)**
1. Go to [cron-job.org](https://cron-job.org) → Create free account
2. **New cronjob:**
   - URL: `https://truthscan.onrender.com/api/cron/weekly-reset`
   - Method: `GET`
   - Header: `Authorization: Bearer YOUR_CRON_SECRET`
   - Schedule: Every Monday at 00:00 UTC
3. Save

### Step 6: Keep Render from Spinning Down (Free Tier)

On Render free tier, the server spins down after 15 minutes idle. Set up a keep-alive ping:

1. On [cron-job.org](https://cron-job.org), add another cron:
   - URL: `https://truthscan.onrender.com/api/health` (or any valid route)
   - Schedule: Every 14 minutes
   
Or upgrade to Render Starter ($7/mo) to eliminate cold starts entirely.

### ✅ Render Deployment Complete

---

## Chrome Extension — Production Setup

After deploying your app, update the extension to point to your live URL:

### 1. Update API_BASE in both files

**`chrome-extension/background.js`** — line 2:
```js
const API_BASE = "https://your-actual-domain.com"; // ← update this
```

**`chrome-extension/popup.html`** — line ~170:
```js
const API_BASE = "https://your-actual-domain.com"; // ← update this
```

### 2. Load/Reload the extension

```
chrome://extensions → Developer mode → Load unpacked → select chrome-extension/
```

If already loaded, click the **refresh icon** on the TruthScan extension card.

### 3. Optional: Publish to Chrome Web Store

1. Go to [chromewebstore.google.com/devconsole](https://chromewebstore.google.com/devconsole)
2. Pay the one-time $5 developer fee
3. Create a ZIP of the `chrome-extension/` folder:
   ```bash
   cd chrome-extension && zip -r ../truthscan-extension.zip .
   ```
4. Upload the ZIP, fill in store listing, submit for review (takes 1–3 business days)

---

## Post-Deployment Checklist

After deploying, verify everything works end-to-end:

- [ ] Visit homepage — loads correctly, no 404 on `/manifest.json`
- [ ] Sign up / Sign in via Clerk
- [ ] Upload an image on `/scan` — should show result page
- [ ] Upload a video — multi-frame analysis should run
- [ ] Paste article URL on `/scan` (Text tab) — should scrape + analyze
- [ ] Visit `/batch` — paste 2-3 image URLs and scan
- [ ] Visit `/quiz` — game should load (add questions via `/admin` first)
- [ ] Visit `/leaderboard` — check All-Time and Weekly tabs
- [ ] Visit `/developers` — generate an API key and test it with curl
- [ ] Test weekly reset: `curl -H "Authorization: Bearer YOUR_CRON_SECRET" https://your-domain.com/api/cron/weekly-reset`
- [ ] Load Chrome extension with production URL — right-click an image and scan
- [ ] Test popup — click extension icon, verify "Scan This Page" button works

---

## Troubleshooting

### `manifest.json` 404
Next.js serves the manifest via `src/app/manifest.ts` automatically. If you still see 404, ensure your middleware matcher doesn't block `.json` files. The current middleware correctly excludes JSON from protection.

### HuggingFace `socket terminated` errors
This is a HuggingFace free-tier network issue — the model connection drops on large images. The code automatically retries 3 times with exponential backoff. If it persists, try a smaller image or wait a few minutes for the model to warm up.

### HuggingFace 503 (model loading)
Free-tier models go cold after inactivity. The first request after idle takes 20–40s while the model loads — subsequent requests are fast. The retry logic waits for `estimated_time` from the API response.

### Clerk redirect errors after deploy
Ensure your production domain is added to Clerk's **Allowed redirect origins** and **Trusted origins** in the Clerk dashboard.

### MongoDB `ECONNREFUSED` or auth errors
- Check your connection string has the correct username/password
- Ensure Network Access in Atlas allows `0.0.0.0/0`
- Ensure you're using the `?retryWrites=true&w=majority` options

### Render cold start (30s delay)
On Render free tier, the first request after 15 minutes idle is slow. Upgrade to Starter ($7/mo) or use a keep-alive ping cron.

### Admin page redirects to homepage
The `ADMIN_USER_ID` env var must exactly match your Clerk user ID (find it in Clerk dashboard → Users). Make sure there's no `NEXT_PUBLIC_` prefix — it must be server-side only.
