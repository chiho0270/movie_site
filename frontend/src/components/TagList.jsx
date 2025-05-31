import React, { useEffect, useState } from "react";
import { getGenres } from "../api/getGenres";
import '../styles/TagList.css';

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
    <div className="tag-list">
      {genres.map((genre) => (
        <button
          key={genre.id}
          className="tag-btn"
        >
          #{genre.name}
        </button>
      ))}
    </div>
  );
}

export default TagList;
