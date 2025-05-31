import React from "react";
import "./MovieSummary.css";

function MovieSummary() {
  return (
    <div className="item2">
      <div className="item5">
        <div className="score">
          <div className="star">★★★★★</div>
          <div className="star-shape">☆☆☆☆☆</div>
        </div>
        <h1>평균 평점</h1>
      </div>

      <div className="item6">
        <input type="text" placeholder="리뷰 작성해주세요" />
        <button type="submit">리뷰 등록</button>
      </div>

      <div className="item7">
        <h1>영화 줄거리</h1>
        <p></p>
      </div>
    </div>
  );
}

export default MovieSummary;
