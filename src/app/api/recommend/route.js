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
    const currentYear = new Date().getFullYear();
    let prompt = "";

    // --- BASIS 1: RECENT ACTIVITY (USES IMDB IDs FOR PINPOINT ACCURACY) ---
    if (targetBasis === "activity") {
      // Increased history context from 7 to 10 to give the AI more data
      const activities = await UserMovie.find({ email: session.user.email, type: "activity" })
        .sort({ addedAt: -1 })
        .limit(10);

      if (activities.length === 0) {
        return NextResponse.json({ error: "NO_ACTIVITY" }, { status: 200 });
      }

      const historyData = await Promise.all(
        activities.map(async (doc) => {
          const res = await fetch(`https://www.omdbapi.com/?apikey=${omdbKey}&i=${doc.imdbID}`);
          return await res.json();
        })
      );

      const historyDetails = historyData
        .filter((m) => m.Title && m.Genre)
        .map((m) => `Title: "${m.Title}", Genre: "${m.Genre}"`);

      // Asked for 15 IDs to create a buffer for filtering
      prompt = `
        Provide a raw JSON array of exactly 15 IMDB IDs (starting with "tt") for famous ${targetType}s that closely match the exact genres and themes of these watched titles: [${historyDetails.join(" | ")}].
        CRITICAL: You MUST ONLY return IDs for a ${targetType}. DO NOT return movie IDs if series is requested!
        Prioritize any direct sequels, prequels, or spin-offs to these watched titles first.
        Output ONLY a raw JSON array of 15 string IMDB IDs. No markdown, no backticks, no other text.
        Example format: ["tt0111161", "tt0468569", "tt0068646", "tt1375666", "tt0109830", "tt0407887", "tt0816692", "tt1234567", "tt7654321", "tt1122334", "tt5566778", "tt9988776", "tt4433221", "tt6655443", "tt3322110"]
      `;
    } 
    // --- BASIS 2: UPCOMING (NO THEATRICAL WORDING FOR SERIES) ---
    else if (targetBasis === "upcoming") {
      const upcomingTarget = targetType === "series"
        ? `television and streaming ${targetType} releases or new seasons`
        : `theatrical and blockbuster ${targetType} releases`;

      prompt = `
        Provide a raw JSON array of exactly 15 titles for the most anticipated upcoming ${upcomingTarget} slated for ${currentYear} and ${currentYear + 1}.
        Output ONLY a raw JSON array of title strings, with no markdown, backticks, or other text.
        Example format: ["Title 1", "Title 2", "Title 3", "Title 4", "Title 5", "Title 6", "Title 7", "Title 8", "Title 9", "Title 10", "Title 11", "Title 12", "Title 13", "Title 14", "Title 15"]
      `;
    } 
    // --- BASIS 3: TOP RATED LATEST (FIXED: NEVER RETURNS EMPTY) ---
    else if (targetBasis === "latest") {
      prompt = `
        Provide a raw JSON array of exactly 15 titles for the best, most acclaimed, and globally recognized ${targetType}s released in ${currentYear} or ${currentYear - 1}.
        Include major breakout hits, award contenders, and top-rated titles. You MUST provide exactly 15 real titles. NEVER return an empty array.
        Output ONLY a raw JSON array of title strings, with no markdown, backticks, or other text.
        Example format: ["Title 1", "Title 2", "Title 3", "Title 4", "Title 5", "Title 6", "Title 7", "Title 8", "Title 9", "Title 10", "Title 11", "Title 12", "Title 13", "Title 14", "Title 15"]
      `;
    }

    const model = genAI.getGenerativeModel({
      model: process.env.GEMINI_MODEL || "gemini-3.5-flash-lite",
      generationConfig: { temperature: 0.5 },
    });

    const result = await model.generateContent(prompt);
    let responseText = result.response.text();

    // Data Sanitization
    responseText = responseText.replace(/```json/gi, "").replace(/```/gi, "").trim();

    let recommendedItems;
    try {
      recommendedItems = JSON.parse(responseText);
    } catch (e) {
      console.error("Gemini Parse Error:", responseText);
      return NextResponse.json({ error: "AI interface malfunction. Invalid data received." }, { status: 500 });
    }

    // 🖥️ LOG TO SERVER CONSOLE
    console.log("-----------------------------------------");
    console.log(`🎬 [${targetBasis.toUpperCase()} - ${targetType.toUpperCase()}] Gemini Returned:`, recommendedItems);
    console.log("-----------------------------------------");

    // Universal OMDb Resolver (Handles both IMDb IDs and Title strings seamlessly)
    const finalRecommendations = await Promise.all(
      recommendedItems.map(async (item) => {
        const isImdbId = typeof item === "string" && /^tt\d+$/i.test(item.trim());

        if (isImdbId) {
          const res = await fetch(`https://www.omdbapi.com/?apikey=${omdbKey}&i=${item.trim()}`);
          return await res.json();
        } else {
          // Title lookup
          let res = await fetch(
            `https://www.omdbapi.com/?apikey=${omdbKey}&t=${encodeURIComponent(item)}&type=${targetType}`
          );
          let data = await res.json();

          // Fallback without strict type if necessary
          if (data.Response !== "True") {
            res = await fetch(`https://www.omdbapi.com/?apikey=${omdbKey}&t=${encodeURIComponent(item)}`);
            data = await res.json();
          }
          return data;
        }
      })
    );

    // 👇 BULLETPROOF FILTER: Destroys bad formats (e.g. movies in a series request) and slices exactly 10
    const validMovies = finalRecommendations
      .filter((m) => m.Response === "True" && m.Type && m.Type.toLowerCase() === targetType.toLowerCase())
      .slice(0, 10);

    // 🖥️ LOG OMDB RESOLVED MATCHES
    console.log("✅ OMDb Resolved Matches:");
    console.log(validMovies.map((m) => `${m.Title} (${m.Year}) [imdbID: ${m.imdbID}] [Type: ${m.Type}]`));
    console.log("-----------------------------------------");

    return NextResponse.json({ results: validMovies }, { status: 200 });

  } catch (error) {
    console.error("AI Pipeline Error:", error);

    if (
      error.status === 429 ||
      (error.message && error.message.includes("429")) ||
      (error.message && error.message.includes("quota"))
    ) {
      return NextResponse.json(
        { error: "AI Uplink cooling down. Max bandwidth reached. Please wait a few seconds before requesting new intel." },
        { status: 429 }
      );
    }

    return NextResponse.json({ error: "Failed to establish AI uplink." }, { status: 500 });
  }
}