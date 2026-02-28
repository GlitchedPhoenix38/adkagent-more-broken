"use client";

import { useState } from "react";

export default function ChatContainer() {
  const [query, setQuery] = useState("");
  const [data, setData] = useState<any>(null);

  const searchWiki = async () => {
    if (!query) return;

    const res = await fetch(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${query}`
    );

    const summary = await res.json();
    setData(summary);
  };

  return (
    <div className="flex flex-col items-center">

      <div className="glass flex gap-2 p-2 rounded-full">
        <input
          className="px-4 py-2 rounded-full text-black"
          placeholder="Search..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />

        <button
          onClick={searchWiki}
          className="bg-white text-black px-4 py-2 rounded-full"
        >
          Search
        </button>
      </div>

      {data && (
        <div className="glass mt-6 p-6 rounded-xl max-w-xl text-white">

          {data.thumbnail && (
            <img
              src={data.thumbnail.source}
              className="rounded mb-3"
            />
          )}

          <h2 className="text-2xl font-bold">
            {data.title}
          </h2>

          <p>{data.extract}</p>

        </div>
      )}

    </div>
  );
}