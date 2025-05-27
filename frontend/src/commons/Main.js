/**
 * 주소 : /commons/Main.js
 * 설명 : 메인 페이지
 * 작성자 : 신주안
 * 작성일 : 2025.05.15
 * 수정일 : 
 * 기능 : 영화 사이트의 메인 화면
 *      - 인기 영화 섹션
 *          - 현재 인기 있는 영화 리스트 출력 (포스터, 제목, 출시년도, 제작 국가, 평균 별점)
 *          - 영화 클릭 시 해당 영화의 상세 페이지로 이동
 *      - 검색 기능
 *          - 검색창에 영화 제목 입력 시 관련 영화 리스트 출력
 *          - 검색 결과 클릭 시 해당 영화의 상세 페이지로 이동
 *          - 검색창 백그라운드에 슬라이드형 이미지(최신 영화 포스터) 출력
 *          - 우측 화살표 버튼 : 클릭 시 다음 이미지로 슬라이드
 *          - 좌측 화살표 버튼 : 클릭 시 이전 이미지로 슬라이드
 *      - 태그 기능
 *        - 태그 클릭 시 해당 태그에 맞는 영화 리스트 출력
 *      - 로그인 상태 확인
 *          - 로그인 상태에 따라 상단 메뉴(로그인/로그아웃 버튼) 변경
 *            - 로그인 상태 : 사용자 ID, 로그아웃 버튼
 *                - 로그아웃 버튼 클릭 시 로그아웃 요청
 *                - 로그아웃 성공 시 메인 페이지로 이동
 *            - 비로그인 상태 : 로그인, 회원가입 버튼
 *                - 로그인 버튼 클릭 시 로그인 페이지로 이동
 *                - 회원가입 버튼 클릭 시 회원가입 페이지로 이동
 *                - 
 * 백 요청 :
 *      - /api/movies/popular
 *          - 인기 영화 리스트 요청
 *          - 영화 제목 검색 요청
 *          - 사용자 로그인 상태 확인 요청
 */

import React from "react";
import MovieSection from "../components/MovieSection";
import exampleMovies from "../DummyData";
import Header from "../components/Header";

function MainPage() {
    return (
        <div className="w-full overflow-x-hidden">
            <Header/>
            <h2 className="text-xl font-bold px-4 mt-6">인기 영화</h2>
            <MovieSection movies={exampleMovies}/>
        </div>
    );
};

export default MainPage;