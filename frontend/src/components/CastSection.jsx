import React from "react";
import "./CastSection.css";

function CastSection() {
  return (
    <div className="item3">
      <h1>출연 / 제작 </h1>
      <div className="person-img">
        {Array(6).fill(0).map((_, i) => (
          <div className="person" key={i}>
            <img src="" alt="image" />
            <p>배우 이름</p>
            <p>극중 이름</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default CastSection;
