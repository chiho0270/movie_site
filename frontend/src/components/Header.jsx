import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import '../styles/Header.css'; // 추가

function Header({ isLoggedIn, user }) {
  const location = useLocation();
  const isMainPage = location.pathname === "/";
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const genres = ["액션", "코미디", "로맨스", "범죄", "SF", "판타지", "드라마", "애니메이션"];

  return (
    <header className="header">
      <div className='left-menu'>
        
        <div className="logo">
          <Link to="/">🎬무비평</Link>
        </div>
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
          <>
            <span>{user.nickname || user.username}</span>
            <button onClick={handleLogout} ></button>
          </>
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
