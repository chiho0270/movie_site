import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/RatingInput.css";

function RatingInput({ isLoggedIn, userId, movieId, averageRating }) {
  const [selectedRating, setSelectedRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoggedIn) {
      fetch(`/api/rating/${movieId}?userId=${userId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data && data.rating) {
            setSelectedRating(data.rating);
          }
        })
        .catch((err) => console.error("별점 불러오기 실패:", err));
    }
  }, [isLoggedIn, userId, movieId]);

  const handleClick = (e, starIndex) => {
    if (!isLoggedIn) {
      navigate("/login");
      return;
    }

    const rect = e.currentTarget.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const rating = offsetX < rect.width / 2 ? starIndex - 0.5 : starIndex;

    setSelectedRating(rating);

    fetch("/api/rating", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, movieId, rating }),
    })
      .then((res) => res.json())
      .then((data) => console.log("별점 저장:", data))
      .catch((err) => console.error("저장 실패:", err));
  };

  const handleMouseMove = (e, starIndex) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const tempRating = offsetX < rect.width / 2 ? starIndex - 0.5 : starIndex;
    setHoverRating(tempRating);
  };

  const displayRating = hoverRating || selectedRating;
  // averageRating이 null, undefined, NaN, 객체, 문자열 등일 때 안전하게 처리
  let safeAverage = 0;
  if (typeof averageRating === 'number' && !isNaN(averageRating)) {
    safeAverage = averageRating;
  } else if (typeof averageRating === 'string' && !isNaN(Number(averageRating))) {
    safeAverage = Number(averageRating);
  }

  return (
    <div className="rating-input">
      {[1, 2, 3, 4, 5].map((starIndex) => (
        <span
          key={starIndex}
          className={`star ${displayRating >= starIndex ? "filled" : displayRating >= starIndex - 0.5 ? "half-filled" : ""}`}
          onClick={(e) => handleClick(e, starIndex)}
          onMouseMove={(e) => handleMouseMove(e, starIndex)}
          onMouseLeave={() => setHoverRating(0)}
        >
          ★
        </span>
      ))}
        <span className="rating-text">
            {displayRating.toFixed(1)} / 5.0
        </span>
        <span className="average-rating">
            평균 ★ {typeof safeAverage === 'number' && !isNaN(safeAverage) ? safeAverage.toFixed(1) : '0.0'}
        </span>
    </div>
  );
}

export default RatingInput;
