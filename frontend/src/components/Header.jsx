import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import '../styles/Header.css'; // 추가

function Header({ isLoggedIn, user, onLogout }) {
  const location = useLocation();
  const isMainPage = location.pathname === "/";
  const navigate = useNavigate();
  const [headerSearchTerm, setHeaderSearchTerm] = React.useState("");
  const [headerFilteredMovies, setHeaderFilteredMovies] = React.useState([]);
  const [allMovies, setAllMovies] = React.useState([]);

  React.useEffect(() => {
    // 전체 영화 목록을 백엔드에서 불러옴 (최초 1회)
    fetch('/api/movie/release')
      .then(res => res.json())
      .then(data => setAllMovies(data.movies || []))
      .catch(() => setAllMovies([]));
  }, []);

  const handleHeaderSearchChange = (e) => {
    const keyword = e.target.value;
    setHeaderSearchTerm(keyword);
    if (keyword.trim() === "") {
      setHeaderFilteredMovies([]);
    } else {
      const results = allMovies.filter((movie) =>
        movie.title && movie.title.toLowerCase().includes(keyword.toLowerCase())
      );
      setHeaderFilteredMovies(results);
    }
  };

  const handleLogout = () => {
    if (onLogout) onLogout();
    navigate('/'); // 로그아웃 후 메인으로 이동
  };


  return (
    <header className="header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <div className='left-menu' style={{ display: 'flex', alignItems: 'center' }}>
        <div className="logo">
          <Link to="/">🎬무비평</Link>
        </div>
        {!isMainPage && (
          <div className="search-box">
            <input
              type="text"
              value={headerSearchTerm}
              onChange={handleHeaderSearchChange}
              placeholder="영화 제목 검색"
              className="search-input"
              style={{ minWidth: 180 }}
            />
            {headerSearchTerm && (
              <div className="search-result-list" style={{ position: 'absolute', top: '110%', left: 0, right: 0, zIndex: 10, background: '#23272f', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.18)' }}>
                {headerFilteredMovies.length > 0 ? (
                  headerFilteredMovies.map((movie) => (
                    <Link key={movie.movie_id} to={`/movie/${movie.movie_id}`} className="search-result-item" style={{ color: '#fff', display: 'block', padding: '8px 12px', textDecoration: 'none' }} onClick={()=>setHeaderSearchTerm("")}>{movie.title}</Link>
                  ))
                ) : (
                  <div className="search-result-item" style={{ color: '#aaa', padding: '8px 12px' }}>
                    검색 결과가 없습니다.
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
      <div className="user-menu">
        {isLoggedIn ? (
          <>
            <span>{user.nickname || user.username} 님</span>
            {user.user_role === 'Admin' && (
              <button
                className="admin-btn"
                style={{ marginLeft: '10px', marginRight: '5px' }}
                onClick={() => navigate('/admin')}
              >
                관리
              </button>
            )}
            <button onClick={handleLogout} className='inLoggedIn' >로그아웃</button>
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
