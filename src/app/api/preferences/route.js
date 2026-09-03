import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import connectMongo from "../../../../lib/mongodb";
import UserPreference from "../../../../models/UserPreference";

export async function GET(req) {
  const session = await getServerSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    await connectMongo();
    let prefs = await UserPreference.findOne({ email: session.user.email });
    
    if (!prefs) {
      prefs = { 
        genre: ["Action", "Sci-Fi", "Thriller", "Horror", "Drama", "Comedy"],
        language: ["English", "Hindi", "Spanish", "Korean", "Japanese"],
        industry: ["Hollywood", "Bollywood", "Korean Cinema", "Anime", "European"],
        releasePeriod: ["Classic (Pre-2000)", "Modern (2000-2019)", "Current (2020+)"]
      };
    }
    return NextResponse.json(prefs, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch parameters" }, { status: 500 });
  }
}

export async function POST(req) {
  const session = await getServerSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const data = await req.json();

  try {
    await connectMongo();
    
    // Fixed: Using $set and returnDocument: 'after' to satisfy Mongoose requirements
    await UserPreference.findOneAndUpdate(
      { email: session.user.email },
      { 
        $set: {
          email: session.user.email,
          name: session.user?.name || "Operative",
          image: session.user?.image || "",
          genre: data.genre,
          language: data.language,
          industry: data.industry,
          releasePeriod: data.releasePeriod,
          lastUpdated: new Date()
        }
      },
      { upsert: true, returnDocument: 'after' } 
    );
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("DB Error:", error);
    return NextResponse.json({ error: "Failed to save parameters" }, { status: 500 });
  }
}