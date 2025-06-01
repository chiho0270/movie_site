import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import '../styles/Header.css';

function Header({ isLoggedIn, user, onLogout }) {
  const location = useLocation();
  const isMainPage = location.pathname === "/";
  const navigate = useNavigate();

  // 어드민이 아닌 사용자가 /admin에 접근 시 메인으로 리다이렉트
  React.useEffect(() => {
    if (location.pathname === "/admin" && (!user || user.user_role !== "Admin")) {
      navigate("/", { replace: true });
    }
  }, [location.pathname, user, navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    if (onLogout) onLogout();
    navigate('/login');
  };

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
          <>
            <span>{user?.nickname || user?.username}</span>
            {user.user_role === "Admin" && (
              <button onClick={() => navigate("/admin")}>관리자</button>
            )}
            <button onClick={handleLogout}>로그아웃</button>
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
