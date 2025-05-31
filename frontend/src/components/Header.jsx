import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Header.css'; // 추가

function Header({ isLoggedIn, user }) {
  const location = useLocation();
  const isMainPage = location.pathname === "/";

  return (
    <header className="header">
      <div className="logo">
        <Link to="/">🎬무비평</Link>
      </div>
      {!isMainPage && (
        <div className="search-box">
          <input
            type="text"
            placeholder="영화 제목 검색"
          />
        </div>
      )}
      <div className="user-menu">
        {isLoggedIn ? (
          <span>{user.nickname || user.username}</span>
        ) : (
          <>
            <Link to="/login" className='isLoggedIn'>로그인</Link>
            <Link to="/register" className='isLoggedIn'>회원가입</Link>
          </>
        )}
      </div>
    </header>
  );
}

export default Header;
