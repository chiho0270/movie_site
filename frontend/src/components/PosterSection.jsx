import React from "react";
import "../styles/PosterSection.css";

function PosterSection({posterUrl, style}) {
  return (
    <div className="poster-section">
      <img
        className="poster-image"
        src={posterUrl}
        alt="Movie-Poster"
        style={{ width: 525, height: 742, objectFit: 'cover', borderRadius: 8, boxShadow: '0 2px 12px rgba(0,0,0,0.3)', background: '#222', ...style }}
      />
    </div>
  );
}

export default PosterSection;
