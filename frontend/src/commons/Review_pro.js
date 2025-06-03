/**
 * 주소 : /commons/Review_pro.js
 * 설명 : 전문가 평론 페이지
 * 작성자 : 신주안
 * 작성일 : 2025.05.20
 * 수정일 : 
 * 기능 : 전문가들이 작성한 영화 평론을 사용자에게 보여주는 페이지
 *      - 전문가 정보 출력
 *          - 전문가 이름 텍스트 출력
 *      - 전문가 평론 카드 출력
 *          - 평론 텍스트 출력
 *          - 평균 별점 표시
 *      - 좋아요 기능
 *          - 좋아요 수 표시
 *          - 좋아요 버튼 클릭 시 평론의 좋아요 수 증가 (중복 방지)
 *          - 로그인된 사용자만 좋아요 가능
 * 백 요청 : 
 *      - /api/expert-reviews : 전체 평론 목록 불러오기
 *      - /api/expert-reviews/{reviewId}/like : 평론 좋아요 요청
 *      - /api/experts/{expertId} : 전문가 정보/정보 요청
 */

import React from "react";
import Header from "../components/Header";
import Content from "../components/ReviewPro";
import Footer from "../components/PageUI";

function ReviewPro({ isLoggedIn, user, onLogout }) {
  return (
    <>
      <Header isLoggedIn={isLoggedIn} user={user} onLogout={onLogout} />
      <Content />
      <Footer />
    </>
  );
}

export default ReviewPro;