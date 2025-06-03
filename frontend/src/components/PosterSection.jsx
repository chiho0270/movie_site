import React from "react";
import "../styles/PosterSection.css";

function PosterSection({posterUrl}) {
  return (
    <div className="poster-section">
      <img className="poster-image" src={posterUrl} alt="Movie-Poster" />
    </div>
  );
}

export default PosterSection;
