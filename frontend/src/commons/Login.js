/**
 * 주소 : /commons/Login.js
 * 설명 : 로그인 페이지
 * 작성자 : 
 * 작성일 : 
 * 수정일 : 
 * 기능 : 사용자가 로그인할 수 있는 페이지
 *      - 아이디와 비밀번호를 입력받아 로그인 요청을 보냄
 *      - 로그인 성공 시 메인 페이지로 이동
 *      - 아이디 textarea : 아이디 입력칸
 *      - 비밀번호 textarea : 비밀번호 입력칸, 입력 시 비밀번호 보이기/숨기기 기능
 *      - 로그인 버튼 : 클릭 시 로그인 요청 -> 로그인 성공시 메인 페이지
 * 백 요청 : /api/login
 *      - 로그인 요청 및 성공 여부를 반환
 *      - 성공 시 JWT 토큰을 반환
 */

import React from "react";
import Header from "../components/Header";
import Login from "../components/Login";

function LoginPage({ onLoginSuccess, isLoggedIn, user }) {
  return (
    <>
      <Header isLoggedIn={isLoggedIn} user={user} />
      <Login onLoginSuccess={onLoginSuccess} />
    </>
  );
}

export default LoginPage;
