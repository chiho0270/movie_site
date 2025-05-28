import React from 'react';
import { Link, useLocation } from 'react-router-dom';

function Header({ isLoggedIn, user }) {
  const location = useLocation();
  const isMainPage = location.pathname === "/";

  return (
    <header className="flex justify-between items-center px-6 py-4 bg-black text-white sticky top-0 z-50">
      
      {/* 좌측: 로고 */}
      <div className="text-2xl font-bold">
        <Link to="/">🎬 MyMovie</Link>
      </div>

      {/* 가운데: 메인페이지가 아닌 경우에만 검색창 */}
      {!isMainPage && (
        <div className="flex-1 mx-6">
          <input
            type="text"
            placeholder="영화 제목 검색"
            className="w-full px-3 py-1 rounded-md text-black"
          />
        </div>
      )}

      {/* 우측: 로그인/회원가입 또는 사용자 아이디 */}
      <div className="text-sm space-x-4">
        {isLoggedIn ? (
          <span>{user.nickname || user.username}</span>
        ) : (
          <>
            <Link to="/login" className="hover:underline">로그인</Link>
            <Link to="/signup" className="hover:underline">회원가입</Link>
          </>
        )}
      </div>
    </header>
  );
}

export default Header;
