import React, { useEffect, useState } from "react";
import { getGenres } from "../api/getGenres";

function TagList() {
  const [genres, setGenres] = useState([]);

  useEffect(() => {
    const fetchGenres = async () => {
      const data = await getGenres();
      setGenres(data);
    };

    fetchGenres();
  }, []);

  return (
    <div className="flex flex-wrap gap-2 p-4">
      {genres.map((genre) => (
        <button
          key={genre.id}
          className="px-3 py-1 rounded-full bg-gray-200 hover:bg-gray-300 text-sm"
        >
          #{genre.name}
        </button>
      ))}
    </div>
  );
}

export default TagList;
