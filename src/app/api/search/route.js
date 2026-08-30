import { NextResponse } from "next/server";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q");

  if (!query) {
    return NextResponse.json({ Error: "Query parameter 'q' is required." }, { status: 400 });
  }

  const apiKey = process.env.OMDB_API_KEY;

  try {
    // 1. Get the basic search results
    const response = await fetch(`https://www.omdbapi.com/?apikey=${apiKey}&s=${query}`);
    const data = await response.json();

    if (data.Response === "True") {
      // 2. Fetch the rich details (Runtime, Genre, Rating) for each movie in parallel
      const detailedResults = await Promise.all(
        data.Search.map(async (movie) => {
          const detailRes = await fetch(`https://www.omdbapi.com/?apikey=${apiKey}&i=${movie.imdbID}`);
          return await detailRes.json();
        })
      );
      
      // 3. Send the detailed data to the frontend
      return NextResponse.json({ Response: "True", Search: detailedResults }, { status: 200 });
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("OMDb fetch error:", error);
    return NextResponse.json({ Error: "Internal Server Error." }, { status: 500 });
  }
}