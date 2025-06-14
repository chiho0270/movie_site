/**
 * 주소 : /commons/Register.js
 * 설명 : 회원가입 페이지
 * 작성자 : 신주안
 * 작성일 : 2025.05.16
 * 수정일 : 
 * 기능 : 사용자가 회원가입할 수 있는 페이지
 *      - 아이디를 입력 및 중복 확인
 *          - 아이디 textarea : 아이디 입력칸
 *          - 중복 확인 버튼 클릭 시 서버에 중복 확인 요청
 *      - 비밀번호 입력 및 확인
 *          - 비밀번호 textarea : 비밀번호 입력칸, 입력 시 비밀번호 보이기/숨기기 기능
 *          - 비밀번호 확인 textarea : 비밀번호 입력칸, 입력 시 비밀번호 보이기/숨기기 기능, 입력한 비밀번호가 동일해야함
 *      - 이름 textarea : 이름 입력칸
 *      - 이메일 textarea : 이메일 입력칸
 *      - 생년월일 date : 생년월일 선택
 *      - 성별 선택 radio : 성별 선택
 *      - 회원가입 button : 회원가입 버튼 클릭 시 회원가입 요청 -> 서버에 모든 입력값을 전송
 *      - 취소 button : 취소 버튼 클릭 시 회원가입을 취소하고 홈페이지로 이동
 * 백 요청 : /api/check_id
 *      - 아이디 중복 여부 확인 요청
 *      /api/register
 *      - 회원가입 요청 처리, 모든 사용자 정보를 서버에 전송
 */

import React from "react";
import Header from "../components/Header";
import Register from "../components/Register";

function RegisterPage({ isLoggedIn, user, onLogout }) {
  return (
    <>
      <Header isLoggedIn={isLoggedIn} user={user} onLogout={onLogout} />
      <Register />
    </>
  );
}

export default RegisterPage;
