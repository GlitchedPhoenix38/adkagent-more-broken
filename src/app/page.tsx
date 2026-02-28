"use client";

import { useState } from "react";

export default function Home() {

  const [query, setQuery] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);


  /* FULL WIKIPEDIA SEARCH FUNCTION */
  const searchWiki = async () => {

    if (!query.trim()) return;

    setLoading(true);

    try {

      /* Step 1 — find closest page */
      const searchRes = await fetch(
        `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&format=json&origin=*`
      );

      const searchData = await searchRes.json();

      if (!searchData.query.search.length) {

        setResult({
          title: "Not found",
          extract: "No Wikipedia article found.",
        });

        setLoading(false);
        return;
      }

      const bestTitle = searchData.query.search[0].title;


      /* Step 2 — get summary */
      const summaryRes = await fetch(
        `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(bestTitle)}`
      );

      const summaryData = await summaryRes.json();

      setResult(summaryData);

    } catch (err) {
      console.error(err);
    }

    setLoading(false);
  };


  return (
    <main className="min-h-screen flex flex-col items-center justify-center hero-bg">

      {/* HERO CARD */}
      <div className="glass-card p-10 text-center max-w-2xl w-full">

        <h1 className="text-5xl font-bold text-white mb-3">
          WikiAgent AI
        </h1>

        <h2 className="text-2xl text-white/90 mb-2">
          Search Anything Instantly
        </h2>

        <p className="text-white/70 mb-6">
          Explore knowledge with a beautiful AI powered interface
        </p>


        {/* SEARCH */}
        <div className="flex gap-3 justify-center">

          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}

            onKeyDown={(e) => {
              if (e.key === "Enter") {
                searchWiki();
              }
            }}

            placeholder="Search Albert Einstein..."
            className="search-input"
          />

          <button
            onClick={searchWiki}
            className="search-btn"
          >
            Search
          </button>

        </div>

      </div>


      {/* LOADING */}
      {loading && (
        <p className="text-white mt-6 text-xl animate-pulse">
          Searching...
        </p>
      )}


      {/* RESULT CARD */}
      {result && (
        <div className="glass-card mt-6 p-6 max-w-2xl text-white">

          {result.thumbnail && (
            <img
              src={result.thumbnail.source}
              className="rounded mb-4 w-full"
            />
          )}

          <h2 className="text-3xl font-bold mb-2">
            {result.title}
          </h2>

          <p className="mb-3">
            {result.extract}
          </p>

          {result.content_urls && (
            <a
              href={result.content_urls.desktop.page}
              target="_blank"
              className="text-blue-300 underline"
            >
              Read full article →
            </a>
          )}

        </div>
      )}

    </main>
  );
}