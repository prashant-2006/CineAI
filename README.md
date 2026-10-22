# CINE.AI | Neural Recommendation Engine

[![Live Deployment](https://img.shields.io/badge/Live_Release-Available-emerald?style=for-the-badge&logo=vercel)](https://cine-ai-pearl.vercel.app/)

A classified cinematic intelligence database. **CINE.AI** is a premium, dark-themed movie tracking and recommendation system inspired by the stark, gritty aesthetic of the 2022 *The Batman* film. 

Powered by Google's Gemini AI, this system tracks your active watchlist, secures your cinematic masterpieces, and utilizes a highly-calibrated intelligence engine to predict your next obsession based on your exact viewing patterns and real-time global theatrical data.

**Live Access:** [https://cine-ai-pearl.vercel.app/](https://cine-ai-pearl.vercel.app/)

## 🗄️ Tech Stack

- **Framework:** [Next.js](https://nextjs.org/) (App Router)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **Icons:** [Lucide React](https://lucide.dev/)
- **Data Source:** [OMDb API](https://www.omdbapi.com/)
- **AI Engine:** Google Gemini (`gemini-3.5-flash-lite` & `gemini-3.5-flash`)
- **Database & Auth:** MongoDB, Mongoose, NextAuth.js (Google OAuth)

## 🦇 Core Features

### Neural Recommendation Engine
- **Activity-Based Intel:** Analyzes the exact genres and plots of your recent watch history to generate hyper-personalized, genre-locked recommendations.
- **Upcoming & Theatrical Scans:** Leverages Gemini's real-time knowledge to predict massive upcoming blockbuster releases and highly anticipated TV premieres.
- **Latest Acclaimed Hits:** Filters for the absolute best, highly-rated releases of the current year.

### Bulletproof AI Architecture
- **Dynamic Model Routing:** Intelligently switches between `gemini-3.5-flash-lite` for lightning-fast genre matching and `gemini-3.5-flash` for complex, time-aware theatrical queries to optimize API quotas.
- **Over-Fetch & Destroy Logic:** Generates surplus AI predictions (15 targets) and enforces strict OMDb post-filtering to guarantee 100% format accuracy (preventing movies from appearing in series requests), slicing down to a perfect grid of 10 results.
- **Rate Limit Resiliency:** Graceful API cooldown handling and data sanitization protocols to prevent hallucinatory JSON parsing errors.

### The Cinematic Interface
- **Immersive Hero UI:** A deep black, high-contrast single-screen homepage featuring custom atmospheric particle animations ("cinematic ash") and complex linear/radial gradient spotlighting.
- **Tactical Navigation:** Fully responsive, full-screen mobile routing with precision hover states and glassmorphism elements.
- **Actionable Intelligence:** Tactical hover menus on movie cards to quickly assign titles to your *Target List* (Watchlist) or *Vault* (Favorites), complete with live loading and success states.

---

## 🚀 Getting Started

You can immediately access the live, fully deployed neural engine here: 
**[https://cine-ai-pearl.vercel.app/](https://cine-ai-pearl.vercel.app/)**

If you prefer to configure and run the mainframe locally on your own hardware, follow the initialization sequence below.

### 1. Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed on your machine.

### 2. Installation
Clone the repository and install the dependencies:

```bash
git clone [https://github.com/prashant-2006/CineAI.git](https://github.com/prashant-2006/CineAI.git)
cd CineAI
npm install
```

### 3. Classified Environment Variables
Create a `.env` or `.env.local` file in the root directory and establish your secure uplinks by configuring your API keys:

```env
# NextAuth Variables
NEXTAUTH_URL=http://localhost:3000/
NEXTAUTH_SECRET=

# Google OAuth Credentials
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# OMDB API Key
OMDB_API_KEY=

# MongoDB Connection String
MONGODB_URI=

# Gemini API Key and Model
GEMINI_API_KEY=
GEMINI_MODEL=
```

### 4. Boot Sequence
Run the development server to initialize the mainframe:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to access the local database.