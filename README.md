# QuantuMania — Complete AI Agent

A full-stack Company Management System powered by Gemini AI. 10 pages, 9 AI-powered features, production-ready.

---

## Features

| Feature | What it does |
|---|---|
| 💬 **Aria Chat** | AI co-worker — draft emails, answer questions, get insights |
| 📊 **HR Dashboard** | Real-time KPIs — headcount, attendance, hiring funnel |
| 📧 **Email Automation** | AI writes & sends professional emails via Gmail |
| 📞 **Call Automation** | Twilio phone number — Aria answers calls like a human receptionist |
| 📝 **Post Automation** | AI writes LinkedIn posts + generates images (DALL-E) |
| 📄 **ATS / Resumes** | Upload CVs — AI scores 0–100, filters automatically |
| 🎤 **AI Interviews** | Live AI interviews with anti-cheat (tab-switch detection) |
| 🕐 **Attendance** | Check-in with webcam / geo-location / manual |
| 🏖️ **Leave Management** | AI analyzes leave patterns and recommends approve/reject |
| ⚙️ **Settings** | Model picker, language config, Supabase status |

---

## Quick Start (Local)

### 1. Clone and install

```bash
git clone https://github.com/waizimran2009/Complete-AI-Agent.git
cd Complete-AI-Agent
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
# Edit .env and fill in your credentials (see below)
```

### 3. Set up the database

- Create a free project at [supabase.com](https://supabase.com)
- Open the SQL editor in your Supabase dashboard
- Paste and run the contents of `database/schema.sql`
- Copy your project URL and keys into `.env`

### 4. Run

```bash
npm start
# Open http://localhost:3000
```

---

## Getting Your Credentials (Step by Step)

### Gemini API Key (FREE — Required for all AI features)
1. Go to [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)
2. Sign in with Google → Click **Create API Key**
3. Copy the key → paste as `GEMINI_API_KEY` in `.env`

### Supabase (FREE — Required for data persistence)
1. Go to [supabase.com](https://supabase.com) → Create account → New project
2. Wait ~2 min for provisioning
3. Go to **Settings → API**
4. Copy **Project URL** → `SUPABASE_URL`
5. Copy **anon public** key → `SUPABASE_ANON_KEY`
6. Copy **service_role** key → `SUPABASE_SERVICE_KEY`
7. Go to **SQL Editor** → paste `database/schema.sql` → Run

### Gmail App Password (for Email Automation)
1. Enable 2-Factor Auth on your Google account
2. Go to [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
3. Select **Mail** + **Other (Custom name)** → **Generate**
4. Copy the 16-char password → `EMAIL_PASS` in `.env`

### Twilio (for Call Automation — free trial: $15 credit)
1. Sign up at [twilio.com](https://twilio.com)
2. Go to Console → copy **Account SID** and **Auth Token**
3. Buy a phone number: **Phone Numbers → Manage → Buy a number**
4. Set the webhook: in your number settings, set **Voice webhook** to:
   `https://YOUR-DOMAIN.com/api/calls/webhook`
5. Add all three values to `.env`

### OpenAI (for DALL-E post images — ~$0.04/image)
1. Sign up at [platform.openai.com](https://platform.openai.com)
2. Go to **API Keys** → Create new key
3. Add credit ($5 minimum) → paste key as `OPENAI_API_KEY`

---

## Deploy to Railway (Recommended — ~$5/month)

1. Push your code to GitHub (already done ✓)
2. Go to [railway.app](https://railway.app) → **New Project → Deploy from GitHub**
3. Select your `Complete-AI-Agent` repository
4. Click **Variables** → add all your `.env` values one by one
5. Railway auto-detects the Dockerfile and deploys
6. Copy your Railway URL and update Twilio webhook to: `https://YOUR-URL.railway.app/api/calls/webhook`

## Deploy to Render (Free tier available)

1. Go to [render.com](https://render.com) → **New Web Service**
2. Connect your GitHub repo
3. Render auto-reads `render.yaml`
4. Add environment variables in the Render dashboard
5. Deploy

---

## Environment Variables Reference

| Variable | Required | Description |
|---|---|---|
| `GEMINI_API_KEY` | ✅ Yes | Powers all AI features |
| `ACCESS_PASSWORD` | Recommended | Password to protect the dashboard |
| `JWT_SECRET` | Recommended | Random string for JWT signing |
| `SUPABASE_URL` | For data | Your Supabase project URL |
| `SUPABASE_ANON_KEY` | For data | Supabase public key |
| `SUPABASE_SERVICE_KEY` | For data | Supabase service role key |
| `EMAIL_USER` | For email | Gmail address |
| `EMAIL_PASS` | For email | Gmail App Password (16 chars) |
| `TWILIO_ACCOUNT_SID` | For calls | From Twilio console |
| `TWILIO_AUTH_TOKEN` | For calls | From Twilio console |
| `TWILIO_PHONE_NUMBER` | For calls | Your Twilio number (+1...) |
| `OPENAI_API_KEY` | For images | DALL-E 3 image generation |
| `COMPANY_NAME` | Optional | Used in AI phone greeting |
| `COMPANY_SERVICES` | Optional | Used in AI phone greeting |

---

## Tech Stack

**Frontend:** React 18 (CDN) + Babel standalone + custom CSS design system  
**Backend:** Node.js + Express 4 + Helmet + JWT auth + rate limiting  
**AI:** Google Gemini 1.5 Flash + OpenAI DALL-E 3  
**Database:** Supabase (PostgreSQL with RLS)  
**Calls:** Twilio Voice API (TwiML webhooks)  
**Email:** Nodemailer + Gmail SMTP  
**Deploy:** Docker + Railway / Render  
