import React, { useState } from "react";
import "../styles/CommentInput.css";

function CommentInput({ isLoggedIn, movieId, user_role, rating = 5 }) {
  const [comment, setComment] = useState("");

  const handleCommentSubmit = () => {
    if (!isLoggedIn) {
      alert("로그인이 필요합니다.");
      return;
    }

    if (!comment.trim()) {
      alert("코멘트를 입력하세요.");
      return;
    }

    const token = localStorage.getItem('token');
    fetch("/api/review", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: JSON.stringify({
        movie_id: movieId,
        comment,
        rating, // 별점 UI에서 받은 값 사용
        is_pro_review: user_role === 'ProReviewer'
      }),
    })
      .then(async (res) => {
        if (!res.ok) {
          const text = await res.text();
          throw new Error(text);
        }
        return res.json();
      })
      .then((data) => {
        alert("리뷰가 저장되었습니다.");
        setComment("");
      })
      .catch((err) => {
        alert("리뷰 저장에 실패했습니다. " + (err.message || err));
      });
  };

  return (
    <div className="comment-input">
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="영화에 대한 코멘트를 작성해주세요"
        rows={4}
      />
      <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
        <button
          onClick={() => window.location.href = `/review?movieId=${movieId}`}
          style={{ background: '#e3f0ff', color: '#1976d2', border: '1px solid #90caf9', fontWeight: 600 }}
        >
          평론 보러가기
        </button>
        <button onClick={handleCommentSubmit}>코멘트 남기기</button>
      </div>
    </div>
  );
}

export default CommentInput;
