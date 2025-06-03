import React, { useState } from "react";
import "../styles/CommentInput.css";

function CommentInput({ isLoggedIn, username, movieId }) {
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
      <button onClick={handleCommentSubmit}>코멘트 남기기</button>
    </div>
  );
}

export default CommentInput;
