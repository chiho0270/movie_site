import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import '../styles/ReviewPage.css'; 
import Header from '../components/Header';

function Review({ isLoggedIn, user, onLogout }) {
  const location = useLocation();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const params = new URLSearchParams(location.search);
  const movieId = params.get('movieId');

  // 리뷰 상태
  const [proReviews, setProReviews] = useState([]);
  const [userReviews, setUserReviews] = useState([]);
  const [reviewText, setReviewText] = useState("");
  const [reviewType, setReviewType] = useState("user"); // 'pro' or 'user'
  const [reviewLoading, setReviewLoading] = useState(false);

  // 영화 정보 불러오기
  useEffect(() => {
    if (!movieId) return;
    setLoading(true);
    setError(null);
    fetch(`/api/movie/${movieId}`)
      .then(res => {
        if (!res.ok) throw new Error('영화 정보를 불러올 수 없습니다.');
        return res.json();
      })
      .then(data => {
        setMovie(data.movie || null);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [movieId]);

  // 리뷰 목록 불러오기 (배열 반환)
  useEffect(() => {
    if (!movieId) return;
    fetch(`/api/review/movie/${movieId}`)
      .then(res => res.json())
      .then(data => {
        const reviews = Array.isArray(data) ? data : [];
        setProReviews(reviews.filter(r => r.is_pro_review === true || r.is_pro_review === 1));
        setUserReviews(reviews.filter(r => r.is_pro_review === false || r.is_pro_review === 0));
      });
  }, [movieId]);

  // 리뷰 타입 자동 선택
  useEffect(() => {
    if (user && user.userType === '관리자') {
      setReviewType('admin');
    } else if (user && user.userType === '전문가') {
      setReviewType('pro');
    } else {
      setReviewType('user');
    }
  }, [user]);

  // 리뷰 저장 핸들러
  const handleReviewSubmit = async () => {
    if (!reviewText.trim()) return;
    setReviewLoading(true);
    try {
      const is_pro_review = reviewType === 'pro';
      const res = await fetch('/api/review', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(user?.token ? { Authorization: `Bearer ${user.token}` } : {})
        },
        body: JSON.stringify({
          movie_id: movieId,
          comment: reviewText,
          rating: 5, // 임시
          is_pro_review
        })
      });
      if (!res.ok) throw new Error('리뷰 저장 실패');
      setReviewText("");
      // 저장 후 목록 갱신
      const data = await fetch(`/api/review/movie/${movieId}`).then(r => r.json());
      const reviews = Array.isArray(data) ? data : [];
      setProReviews(reviews.filter(r => r.is_pro_review === true || r.is_pro_review === 1));
      setUserReviews(reviews.filter(r => r.is_pro_review === false || r.is_pro_review === 0));
    } catch (e) {
      alert(e.message);
    }
    setReviewLoading(false);
  };

  // 리뷰 삭제 핸들러
  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('정말로 이 리뷰를 삭제하시겠습니까?')) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/review/${reviewId}`, {
        method: 'DELETE',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error('리뷰 삭제 실패: ' + res.status + ' ' + errorText);
      }
      // 삭제 후 목록 갱신
      const data = await fetch(`/api/review/movie/${movieId}`).then(r => r.json());
      const reviews = Array.isArray(data) ? data : [];
      setProReviews(reviews.filter(r => r.is_pro_review === true || r.is_pro_review === 1));
      setUserReviews(reviews.filter(r => r.is_pro_review === false || r.is_pro_review === 0));
    } catch (e) {
      alert(e.message);
    }
  };

  return (
    <div className="App">
      <Header isLoggedIn={isLoggedIn} user={user} onLogout={onLogout} />
      {loading ? (
        <div style={{ color: '#90caf9', textAlign: 'center', margin: 24 }}>영화 정보를 불러오는 중...</div>
      ) : error || !movie ? (
        <div style={{ color: '#ff6464', textAlign: 'center', margin: 24 }}>영화 정보를 불러올 수 없습니다.</div>
      ) : (
        <>
          <h1>{movie.title || movie.movieNm}</h1>
          {/* 리뷰 입력 폼 */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 16, margin: '24px 0' }}>
            <select value={reviewType} onChange={e => setReviewType(e.target.value)} style={{ fontSize: '1em', padding: '4px 8px', color: '#fff', background: '#23272f', border: '1px solid #888' }}>
              {user && user.user_role === 'ProReviewer' && <option value="pro">전문가 평론</option>}
              {user && user.user_role === 'GeneralReviewer' && <option value="user">일반 평론</option>}
            </select>
            <input
              type="text"
              value={reviewText}
              onChange={e => setReviewText(e.target.value)}
              placeholder="영화에 대한 코멘트를 작성해주세요"
              style={{ width: 320, fontSize: '1em', padding: '6px 10px', borderRadius: 6, border: '1px solid #888' }}
              disabled={reviewLoading}
            />
            <button onClick={handleReviewSubmit} disabled={reviewLoading} style={{ fontWeight: 600, background: '#1976d2', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 18px' }}>
              {reviewLoading ? '저장 중...' : '코멘트 남기기'}
            </button>
          </div>
          <div className="review-main-split" style={{ display: 'flex', gap: 32, justifyContent: 'center', alignItems: 'flex-start', marginTop: 32 }}>
            {/* 전문가 평론 */}
            <div className="review-pro" style={{ flex: 1, minWidth: 320 }}>
              <h2 style={{ textAlign: 'center' }}>전문가 평론</h2>
              <div className="bottom">
                {proReviews.length === 0 ? (
                  <div style={{ color: '#888', textAlign: 'center', margin: 16 }}>아직 등록된 전문가 평론이 없습니다.</div>
                ) : (
                  proReviews.map(r => (
                    <div className="Review" key={r.review_id}>
                      <div className="UserInfo">
                        <p>{r.username || '익명'}</p>
                        <p className="point">{r.rating ?? '-'}</p>
                      </div>
                      <div className="Content">
                        <p className="text">{r.comment}</p>
                      </div>
                      <div className="Heart" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div>
                          <button type="button">♥</button>
                          <p className="HeartCount">0</p>
                        </div>
                        {(user && (user.userId === r.user_id || user.user_role === 'Admin')) && (
                          <button
                            className="delete-btn"
                            onClick={() => handleDeleteReview(r.review_id)}
                            style={{ marginLeft: 16, color: '#fff', background: '#e53935', border: 'none', borderRadius: 5, padding: '2px 20px', fontSize: '0.92em', fontWeight: 600, minWidth: 0, whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                          >
                            삭제
                          </button>
                        )}
                      </div>
                    </div>
                  )))
                }
              </div>
            </div>
            {/* 일반 관객 평론 */}
            <div className="review-user" style={{ flex: 1, minWidth: 320 }}>
              <h2 style={{ textAlign: 'center' }}>일반 관객 평론</h2>
              <div className="bottom">
                {userReviews.length === 0 ? (
                  <div style={{ color: '#888', textAlign: 'center', margin: 16 }}>아직 등록된 관객 평론이 없습니다.</div>
                ) : (
                  userReviews.map(r => (
                    <div className="Review" key={r.review_id}>
                      <div className="UserInfo">
                        <p>{r.username || '익명'}</p>
                        <p className="point">{r.rating ?? '-'}</p>
                      </div>
                      <div className="Content">
                        <p className="text">{r.comment}</p>
                      </div>
                      <div className="Heart" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div>
                          <button type="button">♥</button>
                          <p className="HeartCount">0</p>
                        </div>
                        {(user && (user.userId === r.user_id || user.user_role === 'Admin')) && (
                          <button
                            className="delete-btn"
                            onClick={() => handleDeleteReview(r.review_id)}
                            style={{ marginLeft: 16, color: '#fff', background: '#e53935', border: 'none', borderRadius: 5, padding: '2px 20px', fontSize: '0.92em', fontWeight: 600, minWidth: 0, whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                          >
                            삭제
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default Review;