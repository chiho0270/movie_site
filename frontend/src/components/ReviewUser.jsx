import React from 'react';
import '../styles/ReviewPage.css'; 

function Review() {
  return (
    <div className="App">

      {/* ── 제목 ── */}
      <h1>사용자 리뷰</h1>

      {/* ── 리뷰 리스트 ── */}
      <div className="bottom">
        {/* ── 리뷰 카드 1 ── */}
        <div className="Review">
          <div className="UserInfo">
            <img
              className="picture"
              src=""          /* 리뷰 프로필 경로 */
              alt="profile"
            />
            <p>이름</p>
            <p className="point">평점</p>
          </div>

          <div className="Content">
            <p className="text">
              {/* 첫 번째 리뷰 내용 */}
              이곳에 리뷰 내용을 입력하세요.
            </p>
          </div>

          <div className="Heart">
            <button type="button">♥</button>
            <p className="HeartCount">5</p>
          </div>
        </div>

        {/* ── 리뷰 카드 2 ── */}
        <div className="Review">
          <div className="UserInfo">
            <img
              className="picture"
              src=""
              alt="profile"
            />
            <p>이름</p>
            <p className="point">평점</p>
          </div>

          <div className="Content">
            <p className="text">
              {/* 두 번째 리뷰 내용 */}
              여기에 두 번째 리뷰 내용을 입력하세요.
            </p>
          </div>

          <div className="Heart">
            <button type="button">♥</button>
            <p className="HeartCount">5</p>
          </div>
        </div>

        {/* ── 리뷰 카드 3 ── */}
        <div className="Review">
          <div className="UserInfo">
            <img
              className="picture"
              src=""
              alt="profile"
            />
            <p>이름</p>
            <p className="point">평점</p>
          </div>

          <div className="Content">
            <p className="text">
              {/* 세 번째 리뷰 내용 */}
              여기에 세 번째 리뷰 내용을 입력하세요.
            </p>
          </div>

          <div className="Heart">
            <button type="button">♥</button>
            <p className="HeartCount">5</p>
          </div>
        </div>
      </div>

      
    </div>
  );
}

export default Review;