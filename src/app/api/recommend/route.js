import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import connectMongo from "../../../../lib/mongodb";
import UserMovie from "../../../../models/UserMovie";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(req) {
  const session = await getServerSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { targetType, targetBasis } = await req.json(); // 'movie' or 'series'

  if (!["activity", "upcoming", "latest"].includes(targetBasis)) {
    return NextResponse.json({ error: "Invalid Directive." }, { status: 400 });
  }

  try {
    await connectMongo();
    const omdbKey = process.env.OMDB_API_KEY;
    
    // --- TIME AWARENESS ---
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentDateString = today.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    
    const randomSeed = Math.floor(Math.random() * 1000000);
    let prompt = "";

    // --- BASIS 1: RECENT ACTIVITY ---
    if (targetBasis === "activity") {
      const activities = await UserMovie.find({ email: session.user.email, type: "activity" })
        .sort({ addedAt: -1 })
        .limit(7);

      if (activities.length === 0) {
        return NextResponse.json({ error: "NO_ACTIVITY" }, { status: 200 });
      }

      const historyData = await Promise.all(
        activities.map(async (doc) => {
          const res = await fetch(`https://www.omdbapi.com/?apikey=${omdbKey}&i=${doc.imdbID}`);
          return await res.json();
        })
      );
      const historyTitles = historyData.filter(m => m.Title).map(m => m.Title);

      prompt = `
        You are an elite cinematic intelligence system. Today's date is ${currentDateString}.
        Recommend exactly 7 strictly ${targetType}s based on this recent watch history: ${historyTitles.join(", ")}.
        
        CRITICAL DIRECTIVES:
        1. STRICT FORMAT: You MUST ONLY recommend a ${targetType}. NO movies if 'series' is requested. NO series if 'movie'.
        2. FRANCHISE PRIORITY: If any title in their history has new, highly-rated ${targetType} sequels, prequels, or direct spin-offs, include them FIRST.
        3. MAINSTREAM & FAMOUS ONLY: For the rest, recommend globally famous, universally known, mainstream blockbuster or critically acclaimed ${targetType}s. DO NOT recommend obscure, niche, indie, or forgotten titles.
        4. BALANCED VARIANCE: (Internal Seed: ${randomSeed}). Provide a diverse selection of POPULAR titles. Do not repeat the exact same list, but keep them very famous.
        5. OUTPUT: Reply ONLY with a raw JSON array of exactly 7 string IMDB IDs. Example: ["tt0111161", "tt0468569", "tt0068646", "tt1375666", "tt0109830", "tt0407887", "tt0816692"]
      `;
    } 
    // --- BASIS 2: UPCOMING & THEATRICAL ---
    else if (targetBasis === "upcoming") {
      prompt = `
        You are an elite cinematic intelligence system. Today's exact date is ${currentDateString}.
        Recommend exactly 7 strictly ${targetType}s that are massive UPCOMING releases.
        
        CRITICAL DIRECTIVES:
        1. STRICT FORMAT: You MUST ONLY recommend a ${targetType}. NO movies if 'series' is requested. NO series if 'movie'.
        2. STRICT TIMEFRAME (CRITICAL): You MUST ONLY pick titles that are releasing STRICTLY AFTER ${currentDateString}. DO NOT include any ${targetType} that has already been released.
        3. MAINSTREAM & FAMOUS ONLY: Only pick massive blockbuster titles, major global hits, or highly anticipated major-studio projects. NO obscure or indie films.
        4. BALANCED VARIANCE: (Internal Seed: ${randomSeed}). Ensure varied genres among the most popular upcoming titles.
        5. OUTPUT: Reply ONLY with a raw JSON array of exactly 7 string IMDB IDs. Example: ["tt0111161", "tt0468569", "tt0068646", "tt1375666", "tt0109830", "tt0407887", "tt0816692"]
      `;
    } 
    // --- BASIS 3: TOP RATED LATEST ---
    else if (targetBasis === "latest") {
      prompt = `
        You are an elite cinematic intelligence system. Today's exact date is ${currentDateString}.
        Recommend exactly 7 strictly ${targetType}s that are incredibly famous, top-rated latest releases strictly from the current year (${currentYear}).
        
        CRITICAL DIRECTIVES:
        1. STRICT FORMAT: You MUST ONLY recommend a ${targetType}. NO movies if 'series' is requested. NO series if 'movie'.
        2. STRICT RECENT TIMEFRAME (CRITICAL): You MUST ONLY pick titles released in ${currentYear} (or very late ${currentYear - 1}). ABSOLUTELY NO OLDER TITLES.
        3. MAINSTREAM & FAMOUS ONLY: Only pick globally famous, mainstream, highly recognizable hits with stellar ratings (IMDb 7.5+). NO obscure or lesser-known titles.
        4. BALANCED VARIANCE: (Internal Seed: ${randomSeed}). Mix up the genres slightly, but keep it strictly popular and strictly new.
        5. OUTPUT: Reply ONLY with a raw JSON array of exactly 7 string IMDB IDs. Example: ["tt0111161", "tt0468569", "tt0068646", "tt1375666", "tt0109830", "tt0407887", "tt0816692"]
      `;
    }

    // Initialize Gemini 3.5 Flash Lite with Lower Temperature for mainstream accuracy
    const model = genAI.getGenerativeModel({ 
      model: "gemini-3.5-flash-lite",
      generationConfig: { temperature: 0.4 } 
    });

    const result = await model.generateContent(prompt);
    let responseText = result.response.text();

    // Data Sanitization
    responseText = responseText.replace(/```json/gi, '').replace(/```/gi, '').trim();
    
    let recommendedIds;
    try {
      recommendedIds = JSON.parse(responseText);
    } catch (e) {
      console.error("Gemini Parse Error:", responseText);
      return NextResponse.json({ error: "AI interface malfunction. Invalid data received." }, { status: 500 });
    }

    // Fetch rich OMDb data for exactly 7 recommendations
    const finalRecommendations = await Promise.all(
      recommendedIds.slice(0, 7).map(async (id) => {
        const res = await fetch(`https://www.omdbapi.com/?apikey=${omdbKey}&i=${id}`);
        return await res.json();
      })
    );

    const validMovies = finalRecommendations.filter(m => m.Response === "True");
    return NextResponse.json({ results: validMovies }, { status: 200 });

  } catch (error) {
    console.error("AI Pipeline Error:", error);
    
    // Graceful handling of Quota/Rate Limits
    if (error.status === 429 || (error.message && error.message.includes("429")) || (error.message && error.message.includes("quota"))) {
      return NextResponse.json({ 
        error: "AI Uplink cooling down. Max bandwidth reached. Please wait a few seconds before requesting new intel." 
      }, { status: 429 });
    }

    return NextResponse.json({ error: "Failed to establish AI uplink." }, { status: 500 });
  }
}