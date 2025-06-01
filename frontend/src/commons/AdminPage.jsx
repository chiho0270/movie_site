import React, { useState } from "react";
import Header from "../components/Header";

function AdminPage({ isLoggedIn, user, onLogout }) {
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [savedMovies, setSavedMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Kobis API로 영화 검색 (연관검색어 포함)
  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSearchResults([]);
    try {
      const res = await fetch(`/api/kobis/movie/list?movieNm=${encodeURIComponent(search)}`);
      const data = await res.json();
      if (data.movieListResult && data.movieListResult.movieList) {
        // TMDB 포스터 병합
        const moviesWithPoster = await Promise.all(
          data.movieListResult.movieList.map(async (movie) => {
            const tmdbApiKey = process.env.REACT_APP_TMDB_TOKEN || "b457b7c18d8eb65b1bfc864d4b83ee11";
            const tmdbRes = await fetch(
              `https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(movie.movieNm)}&language=ko&api_key=${tmdbApiKey}`
            );
            const tmdbData = await tmdbRes.json();
            const posterUrl = tmdbData.results && tmdbData.results[0]?.poster_path
              ? `https://image.tmdb.org/t/p/w200${tmdbData.results[0].poster_path}`
              : null;
            // audits(심의정보) 추출, 감독/배우/출연진 추출
            let audits = "-", directors = [], actors = [], cast = [];
            if (movie.movieCd) {
              try {
                const detailRes = await fetch(`/api/kobis/movie/info?movieCd=${movie.movieCd}`);
                const detailData = await detailRes.json();
                const auditInfo = detailData.movieInfoResult?.movieInfo?.audits?.[0];
                audits = auditInfo?.watchGradeNm || "-";
                // 감독
                directors = (detailData.movieInfoResult?.movieInfo?.directors || []).map(d => d.peopleNm);
                // 배우
                actors = (detailData.movieInfoResult?.movieInfo?.actors || []).slice(0, 3).map(a => a.peopleNm);
                // 출연진(감독+배우)
                cast = [...directors, ...actors];
              } catch {}
            }
            return { ...movie, posterUrl, audits, directors, actors, cast };
          })
        );
        setSearchResults(moviesWithPoster);
      } else {
        setError("검색 결과가 없습니다.");
      }
    } catch (err) {
      setError("검색 실패: " + err.message);
    }
    setLoading(false);
  };

  // 2-2. 저장 버튼 클릭 시 DB에 영화 저장
  const handleSave = async (movie) => {
    try {
      const res = await fetch("/api/admin/movie", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(movie),
      });
      if (res.ok) {
        alert("저장되었습니다.");
        fetchSavedMovies();
      } else {
        alert("저장 실패");
      }
    } catch {
      alert("저장 실패");
    }
  };

  // 2-3. 삭제 버튼 클릭 시 DB에서 영화 삭제
  const handleDelete = async (movieCd) => {
    try {
      const res = await fetch(`/api/admin/movie/${movieCd}`, { method: "DELETE" });
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

  // 3. 저장된 영화 목록 불러오기
  const fetchSavedMovies = async () => {
    try {
      const res = await fetch("/api/admin/movie");
      const data = await res.json();
      setSavedMovies(data.movies || []);
    } catch {
      setSavedMovies([]);
    }
  };

  // 유저 목록 관리
  const [users, setUsers] = useState([]);
  const [userError, setUserError] = useState("");
  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/admin/users");
      const data = await res.json();
      setUsers(data.users || []);
    } catch {
      setUserError("유저 목록을 불러오지 못했습니다.");
      setUsers([]);
    }
  };
  const handleRoleChange = async (userId, newRole) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}/role`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole })
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
      const res = await fetch(`/api/admin/users/${userId}`, { method: 'DELETE' });
      if (res.ok) {
        fetchUsers();
      } else {
        alert('유저 삭제 실패');
      }
    } catch {
      alert('유저 삭제 실패');
    }
  };
  React.useEffect(() => {
    fetchSavedMovies();
    fetchUsers();
  }, []);

  // 저장 여부 확인
  const isSaved = (movieCd) => savedMovies.some((m) => m.tmdb_id === movieCd || m.movieCd === movieCd);

  return (
    <div>
      <Header isLoggedIn={isLoggedIn} user={user} onLogout={onLogout} />
      <div style={{ maxWidth: 800, margin: "2rem auto", padding: 20, color: "white" }}>
        <h2>영화 검색 및 등록/삭제 (관리자)</h2>
        {/* 주간 박스오피스 수동 저장 버튼 */}
        <button
          onClick={async () => {
            if (!window.confirm('주간 박스오피스를 저장하시겠습니까?')) return;
            try {
              const res = await fetch('/api/admin/boxoffice/save', { method: 'POST' });
              const data = await res.json();
              if (res.ok) {
                alert(data.message || '저장 성공');
                fetchSavedMovies();
              } else {
                alert(data.error || '저장 실패');
              }
            } catch (err) {
              alert('저장 실패');
            }
          }}
          style={{ background: '#43a047', color: 'white', padding: '10px 18px', fontWeight: 'bold', marginBottom: 20 }}
        >
          주간 박스오피스 저장
        </button>
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
              {movie.posterUrl && <img src={movie.posterUrl} alt={movie.movieNm} style={{ width: 60, marginRight: 16 }} />}
              <div style={{ flex: 1 }}>
                <div><b>{movie.movieNm}</b> ({movie.openDt})</div>
                <div>영화코드: {movie.movieCd} / 장르: {movie.genreAlt} / 시청등급: {movie.audits}</div>
                <div>감독: {movie.directors && movie.directors.length > 0 ? movie.directors.join(', ') : '-'}</div>
                <div>주연: {movie.actors && movie.actors.length > 0 ? movie.actors.join(', ') : '-'}</div>
                <div>출연진: {movie.cast && movie.cast.length > 0 ? movie.cast.join(', ') : '-'}</div>
              </div>
              {isSaved(movie.movieCd) ? (
                <button onClick={() => handleDelete(movie.movieCd)} style={{ background: "#e53935", color: "white", padding: 8 }}>삭제</button>
              ) : (
                <button onClick={() => handleSave(movie)} style={{ background: "#1976d2", color: "white", padding: 8 }}>저장</button>
              )}
            </div>
          ))}
        </div>
        <h3 style={{ marginTop: 40 }}>저장된 영화 목록</h3>
        <ul style={{ color: "white" }}>
          {savedMovies.map((movie) => (
            <li key={movie.tmdb_id || movie.movieCd} style={{ display: 'flex', alignItems: 'center', marginBottom: 6 }}>
              <span style={{ flex: 1 }}>{movie.title || movie.movieNm} ({movie.release_date || movie.openDt})</span>
              <button onClick={() => handleDelete(movie.tmdb_id || movie.movieCd)} style={{ background: '#e53935', color: 'white', padding: '4px 10px', marginLeft: 10 }}>삭제</button>
            </li>
          ))}
        </ul>
        <h3 style={{ marginTop: 40 }}>유저 목록</h3>
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
            {users.map((u) => (
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
      </div>
    </div>
  );
}

export default AdminPage;
