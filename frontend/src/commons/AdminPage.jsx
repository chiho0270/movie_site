import React, { useState, useEffect } from "react";
import Header from "../components/Header";

function AdminPage({ isLoggedIn, user, onLogout }) {
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [savedMovies, setSavedMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // 페이지네이션 상태
  const [currentPage, setCurrentPage] = useState(1);
  const MOVIES_PER_PAGE = 10;

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
              ? `https://image.tmdb.org/t/p/w780${tmdbData.results[0].poster_path}`
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

  // 영화 저장 시 태그 선택 및 연동
  const [selectedTags, setSelectedTags] = useState([]);

  // 태그 선택 토글
  const toggleTag = (tagId) => {
    setSelectedTags((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
    );
  };

  // 2-2. 저장 버튼 클릭 시 DB에 영화 저장
  const handleSave = async (movie) => {
    // genreAlt에서 태그 자동 매핑 (콤마, 슬래시 모두 지원)
    let tagIds = [...selectedTags];
    if (tagIds.length === 0 && movie.genreAlt) {
      // genreAlt: "액션/스릴러/호러" 또는 "액션,스릴러,호러" 형태 모두 지원
      const genreNames = movie.genreAlt.split(/[\/,]/).map((g) => g.trim()).filter(Boolean);
      tagIds = tags
        .filter((t) => genreNames.includes(t.tag_name))
        .map((t) => t.tag_id);
    }
    // 중복 제거
    tagIds = Array.from(new Set(tagIds));
    try {
      const res = await fetch("/api/admin/movie", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...movie, tagIds }),
      });
      if (res.ok) {
        alert("저장되었습니다.");
        fetchSavedMovies();
        setSelectedTags([]);
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

  // 영화 전체 삭제
  const handleDeleteAllMovies = async () => {
    if (!window.confirm("정말 모든 영화를 삭제하시겠습니까?")) return;
    try {
      const res = await fetch("/api/admin/movie", { method: "DELETE" });
      if (res.ok) {
        fetchSavedMovies();
        alert("전체 영화 삭제 완료");
      } else {
        alert("전체 삭제 실패");
      }
    } catch {
      alert("전체 삭제 실패");
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
  const [userPage, setUserPage] = useState(1);
  const USERS_PER_PAGE = 10;
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
  // 태그 관리 상태 및 함수
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState("");
  const fetchTags = async () => {
    try {
      const res = await fetch("/api/admin/tags");
      const data = await res.json();
      setTags(data.tags || []);
    } catch {
      setTags([]);
    }
  };
  const handleTagSave = async () => {
    if (!tagInput.trim()) return;
    try {
      const res = await fetch("/api/admin/tags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tag_name: tagInput.trim() })
      });
      if (res.ok) {
        setTagInput("");
        fetchTags();
      } else {
        const data = await res.json();
        alert(data.error || "저장 실패");
      }
    } catch {
      alert("저장 실패");
    }
  };
  const handleTagDeleteAll = async () => {
    if (!window.confirm("정말 전체 삭제 및 초기화 하시겠습니까?")) return;
    try {
      const res = await fetch("/api/admin/tags", { method: "DELETE" });
      if (res.ok) {
        fetchTags();
      } else {
        alert("전체 삭제 실패");
      }
    } catch {
      alert("전체 삭제 실패");
    }
  };

  // 박스오피스 목록 상태
  const [boxofficeMovies, setBoxofficeMovies] = useState([]);
  const [boxofficeLoading, setBoxofficeLoading] = useState(false);
  const [boxofficeError, setBoxofficeError] = useState("");

  // 박스오피스 목록 불러오기
  const fetchBoxoffice = async () => {
    setBoxofficeLoading(true);
    setBoxofficeError("");
    try {
      const res = await fetch("/api/boxoffice");
      const data = await res.json();
      setBoxofficeMovies(data.movies || []);
    } catch (err) {
      setBoxofficeError("박스오피스 목록을 불러오지 못했습니다.");
      setBoxofficeMovies([]);
    }
    setBoxofficeLoading(false);
  };

  React.useEffect(() => {
    fetchSavedMovies();
    fetchUsers();
    fetchTags();
    fetchBoxoffice();
  }, []);

  // 저장 여부 확인
  const isSaved = (movieCd) => savedMovies.some((m) => m.tmdb_id === movieCd || m.movieCd === movieCd);

  // 페이지네이션 계산
  const totalPages = Math.ceil(savedMovies.length / MOVIES_PER_PAGE);
  const paginatedMovies = savedMovies.slice(
    (currentPage - 1) * MOVIES_PER_PAGE,
    currentPage * MOVIES_PER_PAGE
  );

  // 유저 페이지네이션 계산
  const userTotalPages = Math.ceil(users.length / USERS_PER_PAGE);
  const paginatedUsers = users.slice(
    (userPage - 1) * USERS_PER_PAGE,
    userPage * USERS_PER_PAGE
  );

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
          {paginatedMovies.map((movie) => (
            <li key={movie.tmdb_id || movie.movieCd} style={{ display: 'flex', alignItems: 'center', marginBottom: 6 }}>
              {movie.poster_url && (
                <img src={movie.poster_url} alt={movie.title || movie.movieNm} style={{ width: 40, height: 60, objectFit: 'cover', marginRight: 10, borderRadius: 4 }} />
              )}
              <span style={{ flex: 1 }}>{movie.title || movie.movieNm} ({movie.release_date || movie.openDt})</span>
              <button onClick={() => handleDelete(movie.tmdb_id || movie.movieCd)} style={{ background: '#e53935', color: 'white', padding: '4px 10px', marginLeft: 10 }}>삭제</button>
            </li>
          ))}
        </ul>
        {/* 페이지네이션 UI */}
        {totalPages > 1 && (
          <div style={{ margin: "16px 0", textAlign: "center" }}>
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              style={{ marginRight: 8 }}
            >
              이전
            </button>
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i + 1}
                onClick={() => setCurrentPage(i + 1)}
                style={{
                  margin: "0 2px",
                  fontWeight: currentPage === i + 1 ? "bold" : "normal",
                  background: currentPage === i + 1 ? "#1976d2" : "#222",
                  color: "white",
                  border: "none",
                  borderRadius: 3,
                  padding: "4px 10px"
                }}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              style={{ marginLeft: 8 }}
            >
              다음
            </button>
          </div>
        )}
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
        {/* 유저 페이지네이션 UI */}
        {userTotalPages > 1 && (
          <div style={{ margin: "16px 0", textAlign: "center" }}>
            <button
              onClick={() => setUserPage((p) => Math.max(1, p - 1))}
              disabled={userPage === 1}
              style={{ marginRight: 8 }}
            >
              이전
            </button>
            {Array.from({ length: userTotalPages }, (_, i) => (
              <button
                key={i + 1}
                onClick={() => setUserPage(i + 1)}
                style={{
                  margin: "0 2px",
                  fontWeight: userPage === i + 1 ? "bold" : "normal",
                  background: userPage === i + 1 ? "#1976d2" : "#222",
                  color: "white",
                  border: "none",
                  borderRadius: 3,
                  padding: "4px 10px"
                }}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => setUserPage((p) => Math.min(userTotalPages, p + 1))}
              disabled={userPage === userTotalPages}
              style={{ marginLeft: 8 }}
            >
              다음
            </button>
          </div>
        )}
        <h2>태그(장르) 관리</h2>
        <div style={{ marginBottom: 16 }}>
          <input
            type="text"
            value={tagInput}
            onChange={e => setTagInput(e.target.value)}
            placeholder="새 태그 입력"
            style={{ padding: 8, fontSize: 16, marginRight: 8 }}
          />
          <button onClick={handleTagSave} style={{ padding: '8px 16px', background: '#1976d2', color: 'white', fontWeight: 'bold', marginRight: 8 }}>저장</button>
          <button onClick={handleTagDeleteAll} style={{ padding: '8px 16px', background: '#e53935', color: 'white', fontWeight: 'bold' }}>전체 삭제 및 초기화</button>
        </div>
        <ul style={{ color: 'white', marginBottom: 32 }}>
          {tags.map(tag => (
            <li key={tag.tag_id} style={{ display: 'inline-block', marginRight: 12, marginBottom: 8, background: selectedTags.includes(tag.tag_id) ? '#1976d2' : '#333', padding: '6px 14px', borderRadius: 16, cursor: 'pointer', fontWeight: selectedTags.includes(tag.tag_id) ? 'bold' : 'normal' }}
              onClick={() => toggleTag(tag.tag_id)}>
              #{tag.tag_name}
            </li>
          ))}
        </ul>
        <button
          onClick={handleDeleteAllMovies}
          style={{ background: '#e53935', color: 'white', padding: '10px 18px', fontWeight: 'bold', marginBottom: 20, marginLeft: 10 }}
        >
          전체 영화 삭제
        </button>
        <h2>주간 박스오피스 목록 (저장 X, 개별 저장 가능)</h2>
        {boxofficeLoading && <div>박스오피스 불러오는 중...</div>}
        {boxofficeError && <div style={{ color: '#ff6464' }}>{boxofficeError}</div>}
        <div>
          {boxofficeMovies.map((movie) => (
            <div key={movie.movieCd} style={{ border: "1px solid #888", marginBottom: 10, padding: 10, display: "flex", alignItems: "center", color: "white", background: "#222" }}>
              {movie.posterUrl && <img src={movie.posterUrl} alt={movie.title || movie.movieNm} style={{ width: 60, marginRight: 16 }} />}
              <div style={{ flex: 1 }}>
                <div><b>{movie.title || movie.movieNm}</b> ({movie.openDt})</div>
                <div>영화코드: {movie.movieCd} / 장르: {movie.genreAlt}</div>
              </div>
              <button onClick={() => handleSave(movie)} style={{ background: "#1976d2", color: "white", padding: 8, marginLeft: 10 }}>저장</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default AdminPage;
