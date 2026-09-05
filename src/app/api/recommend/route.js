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

  if (targetBasis !== "activity") {
    return NextResponse.json({ error: "Only Activity basis is currently online." }, { status: 400 });
  }

  try {
    await connectMongo();

    // 1. Fetch the last 7 movies/series from the user's activity
    const activities = await UserMovie.find({ email: session.user.email, type: "activity" })
      .sort({ addedAt: -1 })
      .limit(7);

    if (activities.length === 0) {
      return NextResponse.json({ error: "NO_ACTIVITY" }, { status: 200 });
    }

    const omdbKey = process.env.OMDB_API_KEY;
    const historyData = await Promise.all(
      activities.map(async (doc) => {
        const res = await fetch(`https://www.omdbapi.com/?apikey=${omdbKey}&i=${doc.imdbID}`);
        return await res.json();
      })
    );

    const historyTitles = historyData.filter(m => m.Title).map(m => m.Title);

    // 2. Initialize Gemini with High Temperature for maximum randomness
    const model = genAI.getGenerativeModel({ 
      model: "gemini-3.6-flash",
      generationConfig: { 
        temperature: 1.0 
      } 
    });
    
    const randomSeed = Math.floor(Math.random() * 1000000);

    // 3. Prompt Upgraded: Strict constraint on targetType applied to all rules
    const prompt = `
      You are an elite cinematic intelligence system. 
      The user is looking for exactly 7 strictly ${targetType} recommendations based on their recent watch history: ${historyTitles.join(", ")}.
      
      CRITICAL DIRECTIVES:
      1. STRICT FORMAT RULE: You MUST ONLY recommend a ${targetType}. If the user asked for a 'series', DO NOT output any movies. If they asked for a 'movie', DO NOT output any series.
      2. FRANCHISE PRIORITY: If any of the titles in their watch history have new ${targetType} sequels, prequels, or direct spin-offs, you MUST include them first.
      3. RELEVANCE OVER RATINGS: For the remaining slots, prioritize ${targetType}s with highly similar themes, creators, or specific niche genres to their watch history. Do NOT just give generic top-rated blockbusters.
      4. MAXIMUM VARIANCE: (Internal Random Seed: ${randomSeed}). Ensure this list is highly randomized. Dig deep into the database to provide varied, lesser-known but highly relevant gems. Do not repeat the same generic recommendations.
      5. FORMAT: You must reply ONLY with a raw JSON array of exactly 7 string IMDB IDs. Do not include markdown, backticks, or any other text.
      
      Example format: ["tt0111161", "tt0468569", "tt0068646", "tt1375666", "tt0109830", "tt0407887", "tt0816692"]
    `;

    const result = await model.generateContent(prompt);
    let responseText = result.response.text();

    // 4. Data Sanitization
    responseText = responseText.replace(/```json/gi, '').replace(/```/gi, '').trim();
    
    let recommendedIds;
    try {
      recommendedIds = JSON.parse(responseText);
    } catch (e) {
      console.error("Gemini Parse Error:", responseText);
      return NextResponse.json({ error: "AI interface malfunction. Invalid data received." }, { status: 500 });
    }

    // 5. Fetch rich OMDb data for exactly 7 recommendations
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
    return NextResponse.json({ error: "Failed to establish AI uplink." }, { status: 500 });
  }
}