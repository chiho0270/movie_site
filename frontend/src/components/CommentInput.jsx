import React, { useState } from "react";
import "../styles/CommentInput.css";

function CommentInput({ isLoggedIn, username, movieId, userType }) {
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

    fetch("/api/comment", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, movieId, comment }),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("코멘트 저장 완료:", data);
        setComment("");
        // 사용자 등급에 따라 review 저장
        if (userType === '일반' || userType === '전문가' || userType === '관리자') {
          fetch("/api/review", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              username,
              movieId,
              comment,
              userType,
              // 필요시 추가 필드
            }),
          })
            .then((res) => res.json())
            .then((reviewData) => {
              console.log("리뷰 저장 완료:", reviewData);
            })
            .catch((err) => console.error("리뷰 저장 실패:", err));
        }
      })
      .catch((err) => console.error("코멘트 저장 실패:", err));
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
          onClick={() => window.location.href = `/review/user?movieId=${movieId}`}
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
