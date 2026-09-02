import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import connectMongo from "../../../../lib/mongodb";
import UserMovie from "../../../../models/UserMovie";

export async function POST(req) {
  const session = await getServerSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { imdbID, type } = await req.json();
  if (!imdbID || !type) return NextResponse.json({ error: "Missing data" }, { status: 400 });

  try {
    await connectMongo();
    
    // Secure the movie in the database
    await UserMovie.findOneAndUpdate(
      { email: session.user.email, imdbID, type },
      { email: session.user.email, imdbID, type, addedAt: new Date() }, // Updates time if moved
      { upsert: true, new: true }
    );

    // Maintain only the last 20 movies in Activity
    if (type === "activity") {
      const activities = await UserMovie.find({ email: session.user.email, type: "activity" })
        .sort({ addedAt: -1 })
        .select("_id");
      
      if (activities.length > 20) {
        const idsToDelete = activities.slice(20).map(doc => doc._id);
        await UserMovie.deleteMany({ _id: { $in: idsToDelete } });
      }
    }

    return NextResponse.json({ success: true, message: `Added to ${type}` }, { status: 200 });
  } catch (error) {
    console.error("DB Error:", error);
    return NextResponse.json({ error: "Database failure" }, { status: 500 });
  }
}

export async function GET(req) {
  const session = await getServerSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type"); // 'watchlist' or 'favourite'

  try {
    await connectMongo();
    const savedMovies = await UserMovie.find({ email: session.user.email, type }).sort({ addedAt: -1 });

    // Fetch rich details from OMDB for each saved movie ID
    const apiKey = process.env.OMDB_API_KEY;
    const detailedMovies = await Promise.all(
      savedMovies.map(async (doc) => {
        const res = await fetch(`https://www.omdbapi.com/?apikey=${apiKey}&i=${doc.imdbID}`);
        return await res.json();
      })
    );

    return NextResponse.json(detailedMovies, { status: 200 });
  } catch (error) {
    console.error("Fetch error:", error);
    return NextResponse.json({ error: "Failed to retrieve intel" }, { status: 500 });
  }
}

export async function DELETE(req) {
  const session = await getServerSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { imdbID, type } = await req.json();

  try {
    await connectMongo();
    await UserMovie.findOneAndDelete({ email: session.user.email, imdbID, type });
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to remove target" }, { status: 500 });
  }
}