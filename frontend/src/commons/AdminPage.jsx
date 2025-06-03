// eslint-disable-next-line no-unused-vars
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";

function AdminPage({ isLoggedIn, user, onLogout }) {
  // 영화 관리 상태
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [savedMovies, setSavedMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const MOVIES_PER_PAGE = 10;

  // 유저 관리 상태
  const [users, setUsers] = useState([]);
  const [userError, setUserError] = useState("");
  const [userPage, setUserPage] = useState(1);
  const USERS_PER_PAGE = 10;

  const navigate = useNavigate();

  // 저장된 영화 목록은 DB에서 가져옴
  const fetchSavedMovies = async () => {
    try {
      const res = await fetch("/api/movie/list");
      const data = await res.json();
      setSavedMovies(data.movies || []);
    } catch {
      setSavedMovies([]);
    }
  };
  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/user");
      const data = await res.json();
      setUsers(data || []);
    } catch {
      setUserError("유저 목록을 불러오지 못했습니다.");
      setUsers([]);
    }
  };

  useEffect(() => {
    if (!user || user.user_role !== 'Admin') {
      navigate('/');
    }
  }, [user, navigate]);

  useEffect(() => {
    fetchSavedMovies();
    fetchUsers();
  }, []);

  // 영화 검색 (Kobis API 연관검색 + TMDB 저장 상세정보 병합)
  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSearchResults([]);
    try {
      // Kobis 연관검색 API 사용
      const res = await fetch(`/api/kobis/movie/list?movieNm=${encodeURIComponent(search)}`);
      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        setError('서버에서 올바른 JSON이 반환되지 않았습니다. (API 경로/서버 상태 확인)');
        setLoading(false);
        return;
      }
      const data = await res.json();
      let kobisMovies = [];
      if (data.related) {
        kobisMovies = data.related;
      } else if (data.movieListResult && data.movieListResult.movieList) {
        kobisMovies = data.movieListResult.movieList;
      } else if (data.movies) {
        kobisMovies = data.movies;
      }
      // 각 영화에 대해 TMDB(내 DB) 저장 여부 및 상세정보 병합
      const mergedResults = await Promise.all(kobisMovies.map(async (m) => {
        let dbMovie = null;
        try {
          const detailRes = await fetch(`/api/movie/detail?title=${encodeURIComponent(m.movieNm)}`);
          if (detailRes.ok) {
            const detailData = await detailRes.json();
            dbMovie = detailData.movie || null;
          }
        } catch {}
        return { ...m, dbMovie };
      }));
      setSearchResults(mergedResults);
    } catch (err) {
      setError("검색 실패: " + err.message);
    }
    setLoading(false);
  };

  // 영화 저장
  const handleSave = async (movie) => {
    try {
      // TMDB id가 있으면 saveByTmdbId로 저장, 없으면 /api/movie/save로 저장
      if (movie.tmdb_id || movie.tmdbId) {
        const res = await fetch("/api/movie/saveByTmdbId", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ tmdb_id: movie.tmdb_id || movie.tmdbId }),
        });
        if (res.ok) {
          alert("TMDB ID로 저장되었습니다.");
          fetchSavedMovies();
        } else {
          alert("TMDB ID 저장 실패");
        }
      } else {
        const res = await fetch("/api/movie/save", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title: movie.movieNm || movie.title }),
        });
        if (res.ok) {
          alert("저장되었습니다.");
          fetchSavedMovies();
        } else {
          alert("저장 실패");
        }
      }
    } catch {
      alert("저장 실패");
    }
  };
  // 영화 삭제
  const handleDelete = async (movie) => {
    const id = movie.movie_id || movie.tmdb_id || movie.movieCd;
    try {
      const res = await fetch(`/api/movie/delete/${id}`, { method: "DELETE" });
      if (res.ok) {
        alert("삭제되었습니다.");
        fetchSavedMovies();
      } else {
        alert("삭제 실패");
      }
    } catch {
      alert("삭제 실패");
    }
  };

  // 유저 권한 변경
  const handleRoleChange = async (userId, newRole) => {
    try {
      const res = await fetch(`/api/user/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_role: newRole })
      });
      if (res.ok) {
        fetchUsers();
      } else {
        alert("권한 변경 실패");
      }
    } catch {
      alert("권한 변경 실패");
    }
  };
  // 유저 삭제
  const handleUserDelete = async (userId) => {
    if (!window.confirm('정말 삭제하시겠습니까?')) return;
    try {
      const res = await fetch(`/api/user/${userId}`, { method: 'DELETE' });
      if (res.ok) {
        fetchUsers();
      } else {
        alert('유저 삭제 실패');
      }
    } catch {
      alert('유저 삭제 실패');
    }
  };

  // 주간 박스오피스 저장
  const handleSaveWeeklyBoxoffice = async () => {
    if (!window.confirm("2주전 주간 박스오피스 데이터를 저장하시겠습니까?")) return;
    try {
      const res = await fetch("/api/kobis/boxoffice/weekly/save", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        alert(`저장 완료: ${data.saved}개, 실패: ${data.failed}개`);
        fetchSavedMovies();
      } else {
        alert("저장 실패: " + (data.error || "알 수 없는 오류"));
      }
    } catch (err) {
      alert("저장 실패: " + err.message);
    }
  };

  // UI 렌더링
  const totalPages = Math.ceil(savedMovies.length / MOVIES_PER_PAGE);
  const paginatedMovies = savedMovies.slice((currentPage - 1) * MOVIES_PER_PAGE, currentPage * MOVIES_PER_PAGE);
  const userTotalPages = Math.ceil(users.length / USERS_PER_PAGE);
  const paginatedUsers = users.slice((userPage - 1) * USERS_PER_PAGE, userPage * USERS_PER_PAGE);

  return (
    <div>
      <Header isLoggedIn={isLoggedIn} user={user} onLogout={onLogout} />
      <div style={{ maxWidth: 900, margin: "2rem auto", padding: 20, color: "white" }}>
        <h2>영화 관리</h2>
        <form onSubmit={handleSearch} style={{ marginBottom: 20 }}>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="영화 제목을 입력하세요"
            style={{ width: 300, padding: 8, fontSize: 16 }}
          />
          <button type="submit" style={{ marginLeft: 10, padding: 8 }}>검색</button>
        </form>
        {loading && <div>검색 중...</div>}
        {error && <div style={{ color: "#ff6464" }}>{error}</div>}
        <div>
          {searchResults.map((movie) => (
            <div key={movie.movieCd} style={{ border: "1px solid #ccc", marginBottom: 10, padding: 10, display: "flex", alignItems: "center", color: "white" }}>
              <div style={{ flex: 1 }}>
                {movie.poster_url && (
                  <img src={movie.poster_url} alt={movie.movieNm} style={{ width: 55, height: 90, objectFit: 'cover', borderRadius: 4, marginRight: 12, background: '#222' }} />
                )}
                <div><b>{movie.movieNm}</b> ({movie.openDt})</div>
                <div>영화코드: {movie.movieCd} / 장르: {movie.genreAlt}</div>
                {movie.isSaved && <div style={{ color: "#4caf50", marginTop: 4 }}>TMDB에 이미 저장됨</div>}
              </div>
              <button onClick={() => handleSave(movie)} style={{ background: "#1976d2", color: "white", padding: 8 }}>저장</button>
            </div>
          ))}
        </div>
        <h2>저장된 영화 목록</h2>
        <ul style={{ color: "white" }}>
          {paginatedMovies.map((movie) => (
            <li key={movie.tmdb_id || movie.movieCd} style={{ display: 'flex', alignItems: 'center', marginBottom: 6 }}>
              <span style={{ flex: 1 }}>{movie.title || movie.movieNm} ({movie.release_date || movie.openDt})</span>
              <button onClick={() => handleDelete(movie)} style={{ background: '#e53935', color: 'white', padding: '4px 10px', marginLeft: 10 }}>삭제</button>
            </li>
          ))}
        </ul>
        {totalPages > 1 && (
          <div style={{ margin: "16px 0", textAlign: "center" }}>
            <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1} style={{ marginRight: 8 }}>이전</button>
            {Array.from({ length: totalPages }, (_, i) => (
              <button key={i + 1} onClick={() => setCurrentPage(i + 1)} style={{ margin: "0 2px", fontWeight: currentPage === i + 1 ? "bold" : "normal", background: currentPage === i + 1 ? "#1976d2" : "#222", color: "white", border: "none", borderRadius: 3, padding: "4px 10px" }}>{i + 1}</button>
            ))}
            <button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} style={{ marginLeft: 8 }}>다음</button>
          </div>
        )}
        <button onClick={handleSaveWeeklyBoxoffice} style={{ background: '#1976d2', color: 'white', padding: '10px 18px', fontWeight: 'bold', marginBottom: 20, marginLeft: 10 }}>주간 박스오피스 저장</button>

        <h2>유저 관리</h2>
        {userError && <div style={{ color: '#ff6464' }}>{userError}</div>}
        <table style={{ width: '100%', color: 'white', background: 'rgba(30,30,30,0.9)', borderCollapse: 'collapse', marginBottom: 40 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #888' }}>
              <th style={{ padding: 8 }}>아이디</th>
              <th style={{ padding: 8 }}>이메일</th>
              <th style={{ padding: 8 }}>생성일</th>
              <th style={{ padding: 8 }}>역할</th>
              <th style={{ padding: 8 }}>권한 변경</th>
              <th style={{ padding: 8 }}>삭제</th>
            </tr>
          </thead>
          <tbody>
            {paginatedUsers.map((u) => (
              <tr key={u.user_id} style={{ borderBottom: '1px solid #444' }}>
                <td style={{ padding: 8 }}>{u.username}</td>
                <td style={{ padding: 8 }}>{u.email}</td>
                <td style={{ padding: 8 }}>{u.created_at ? u.created_at.slice(0,10) : '-'}</td>
                <td style={{ padding: 8 }}>{u.user_role}</td>
                <td style={{ padding: 8 }}>
                  <select value={u.user_role} onChange={e => handleRoleChange(u.user_id, e.target.value)}>
                    <option value="Admin">Admin</option>
                    <option value="ProReviewer">ProReviewer</option>
                    <option value="GeneralReviewer">GeneralReviewer</option>
                  </select>
                </td>
                <td style={{ padding: 8 }}>
                  <button onClick={() => handleUserDelete(u.user_id)} style={{ background: '#e53935', color: 'white', padding: 6 }}>삭제</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {userTotalPages > 1 && (
          <div style={{ margin: "16px 0", textAlign: "center" }}>
            <button onClick={() => setUserPage((p) => Math.max(1, p - 1))} disabled={userPage === 1} style={{ marginRight: 8 }}>이전</button>
            {Array.from({ length: userTotalPages }, (_, i) => (
              <button key={i + 1} onClick={() => setUserPage(i + 1)} style={{ margin: "0 2px", fontWeight: userPage === i + 1 ? "bold" : "normal", background: userPage === i + 1 ? "#1976d2" : "#222", color: "white", border: "none", borderRadius: 3, padding: "4px 10px" }}>{i + 1}</button>
            ))}
            <button onClick={() => setUserPage((p) => Math.min(userTotalPages, p + 1))} disabled={userPage === userTotalPages} style={{ marginLeft: 8 }}>다음</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminPage;
