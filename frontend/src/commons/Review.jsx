import React from 'react';
import '../styles/ReviewPage.css'; 
import Header from '../components/Header';

function Review({ isLoggedIn, user, onLogout }) {
  return (
    <div className="App">
      <Header isLoggedIn={isLoggedIn} user={user} onLogout={onLogout} />
      <h1>평론</h1>
      <div className="review-main-split" style={{ display: 'flex', gap: 32, justifyContent: 'center', alignItems: 'flex-start', marginTop: 32 }}>
        {/* 전문가 평론 */}
        <div className="review-pro" style={{ flex: 1, minWidth: 320 }}>
          <h2 style={{ textAlign: 'center' }}>전문가 평론</h2>
          <div className="bottom">
            {/* 전문가 리뷰 카드 예시 */}
            <div className="Review">
              <div className="UserInfo">
                <p>이름</p>
                <p className="point">평점</p>
              </div>
              <div className="Content">
                <p className="text">이곳에 전문가 평론 내용을 입력하세요.</p>
              </div>
              <div className="Heart">
                <button type="button">♥</button>
                <p className="HeartCount">5</p>
              </div>
            </div>
          </div>
        </div>
        {/* 일반 관객 평론 */}
        <div className="review-user" style={{ flex: 1, minWidth: 320 }}>
          <h2 style={{ textAlign: 'center' }}>일반 관객 평론</h2>
          <div className="bottom">
            {/* 일반 리뷰 카드 예시 */}
            <div className="Review">
              <div className="UserInfo">
                <p>이름</p>
                <p className="point">평점</p>
              </div>
              <div className="Content">
                <p className="text">이곳에 일반 관객 평론 내용을 입력하세요.</p>
              </div>
              <div className="Heart">
                <button type="button">♥</button>
                <p className="HeartCount">3</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Review;