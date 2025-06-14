/**
 * 주소 : /commons/Review_user.js
 * 설명 : 사용자 리뷰 페이지
 * 작성자 : 신주안
 * 작성일 : 2025.05.20
 * 수정일 : 
 * 기능 : 일반 사용자가 작성한 영화 리뷰를 표시하는 페이지
 *      - 사용자 리뷰 카드 출력
 *          - 사용자 이름 텍스트 출력
 *          - 평균 별점 표시
 *          - 리뷰 텍스트 출력력
 *      - 좋아요 기능
 *          - 좋아요 수 실시간 표시시
 *          - 좋아요 버튼 클릭 시 평론의 좋아요 수 증가 (중복 방지)
 *          - 로그인된 사용자만 좋아요 가능
 * 백 요청 : 
 *      - /api/user-reviews : 전체 사용자 리뷰 목록 조회
 *      - /api/user-reviews/{reviewId}/like : 리뷰 좋아요 요청
 *      - /api/users/{usertId} : 특정 사용자 정보/정보 요청
 */

import React from "react";
import Header from "../components/Header";
import Content from "../components/ReviewUser";
import Footer from "../components/PageUI";

function ReviewUser({ isLoggedIn, user, onLogout }) {
  return (
    <>
      <Header isLoggedIn={isLoggedIn} user={user} onLogout={onLogout} />
      <Content />
      <Footer />
    </>
  );
}

export default ReviewUser;