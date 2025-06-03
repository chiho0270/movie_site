import React from "react";
import "../styles/CastSection.css";

function CastSection({ cast = [] }) {
  return (
    <div className="cast-section">
      <h2>출연 / 제작</h2>
      <div className="cast-grid">
        {cast.map((person, index) => (
          <div key={index} className="cast-card">
            <p className="cast-name">{person.name}</p>
            <p className="cast-role">{person.role}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default CastSection;
