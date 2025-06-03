import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import MovieSection from "../components/MovieSection";
import Header from "../components/Header";

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

function SearchPage({ isLoggedIn, user, onLogout }) {
  const query = useQuery();
  const tag = query.get("tag");
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [tagList, setTagList] = useState([]);
  const [sortType, setSortType] = useState('title'); // 정렬 상태 추가
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    // 태그 목록 불러오기
    fetch("/api/admin/tags")
      .then(res => res.json())
      .then(data => setTagList(data.tags || []))
      .catch(() => setTagList([]));
  }, []);

  useEffect(() => {
    if (!tag) return;
    setLoading(true);
    setError("");
    fetch(`/api/movie?tag=${encodeURIComponent(tag)}`)
      .then(res => res.json())
      .then(data => {
        setMovies(data.movies || []);
        setLoading(false);
      })
      .catch(() => {
        setError("영화 목록을 불러오지 못했습니다.");
        setLoading(false);
      });
  }, [tag]);

  // 정렬 함수
  const getSortedMovies = () => {
    let filtered = movies;
    if (searchTerm.trim() !== "") {
      filtered = movies.filter((movie) =>
        (movie.title || movie.movieNm || "").toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (sortType === 'title') {
      return [...filtered].sort((a, b) => (a.title || a.movieNm || '').localeCompare(b.title || b.movieNm || ''));
    } else if (sortType === 'genre') {
      // 장르(genreAlt, genres, tags 등) 기준 정렬 (첫번째 태그/장르명 기준)
      return [...filtered].sort((a, b) => {
        const ag = (a.genreAlt || a.genres || a.tags?.[0]?.tag_name || '').toString();
        const bg = (b.genreAlt || b.genres || b.tags?.[0]?.tag_name || '').toString();
        return ag.localeCompare(bg);
      });
    } else if (sortType === 'release') {
      // 개봉일 내림차순(최신순)
      return [...filtered].sort((a, b) => {
        const ad = new Date(a.release_date || a.openDt || 0);
        const bd = new Date(b.release_date || b.openDt || 0);
        return bd - ad;
      });
    }
    return filtered;
  };

  return (
    <div style={{ maxWidth: 900, margin: "2rem auto", padding: 20, color: "white" }}>
      <Header isLoggedIn={isLoggedIn} user={user} onLogout={onLogout} />
      <h2>태그별 영화 검색</h2>
      {/* 영화 제목 검색 입력창 */}
      <div style={{ marginBottom: 20 }}>
        <input
          type="text"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          placeholder="영화 제목을 입력하세요"
          style={{ width: 300, padding: 8, fontSize: 16, marginRight: 16 }}
        />
        {/* 정렬 버튼 UI */}
        <span style={{ marginRight: 10 }}>정렬:</span>
        <button onClick={() => setSortType('title')} style={{ marginRight: 6, fontWeight: sortType === 'title' ? 'bold' : 'normal' }}>영화 제목</button>
        <button onClick={() => setSortType('genre')} style={{ marginRight: 6, fontWeight: sortType === 'genre' ? 'bold' : 'normal' }}>장르별</button>
        <button onClick={() => setSortType('release')} style={{ fontWeight: sortType === 'release' ? 'bold' : 'normal' }}>개봉일 순</button>
      </div>
      <div style={{ marginBottom: 20 }}>
        {tagList.map((t) => (
          <button
            key={t.tag_id}
            style={{
              marginRight: 8,
              background: t.tag_name === tag ? "#1976d2" : "#333",
              color: "white",
              padding: "6px 14px",
              borderRadius: 16,
              fontWeight: t.tag_name === tag ? "bold" : "normal"
            }}
            onClick={() => window.location.search = `?tag=${encodeURIComponent(t.tag_name)}`}
          >
            #{t.tag_name}
          </button>
        ))}
      </div>
      {tag && <h3>"{tag}" 태그로 검색된 영화</h3>}
      {loading && <div>로딩 중...</div>}
      {error && <div style={{ color: '#ff6464' }}>{error}</div>}
      <MovieSection movies={getSortedMovies()} />
    </div>
  );
}

export default SearchPage;
