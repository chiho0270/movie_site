/**
 * 주소 : /commons/Search.jsx
 * 설명 : 검색 페이지
 * 작성자 : 
 * 작성일 : 
 * 수정일 : 
 * 기능 : 사용자가 검색을 통한 영화 목록을 볼 수 있는 페이지
 *      - 비로그인 상태이거나 미성년 사용자일 경우 성인 영화는 제외하고 검색 결과를 보여줌
 *      - 영화 제목을 입력받아 검색 요청을 보냄
 *      - 영화 장르를 입력받거나 선택하여 검색 요청을 보냄
 *      - 최신 개봉일 순으로 정렬할 수 있음
 *      - 검색 결과를 목록으로 보여줌
 *      - 검색 결과 클릭 시 해당 영화 상세 페이지로 이동
 * 백 요청 : /api/search
 *      - 검색 요청 및 결과 반환
 *      - 장르별 영화 목록 요청
 *      - 박스오피스 순위 정렬
 *      - 출시일 순 정렬
 *      - /api/movie/id
 */

import React, { useState } from "react";
import Header from "../components/Header";
import MovieSection from "../components/MovieSection";

function SearchPage({ isLoggedIn, user, onLogout }) {
  const [query, setQuery] = useState("");
  const [genre, setGenre] = useState("");
  const [sort, setSort] = useState("release");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (query) params.append("q", query);
      if (genre) params.append("genre", genre);
      if (sort) params.append("sort", sort);
      const res = await fetch(`/api/search?${params.toString()}`);
      const data = await res.json();
      if (res.ok) {
        setResults(data.movies || []);
      } else {
        setError(data.error || "검색 실패");
      }
    } catch (err) {
      setError("검색 실패: " + err.message);
    }
    setLoading(false);
  };

  const handleResultClick = (movieId) => {
    window.location.href = `/movie/${movieId}`;
  };

  return (
    <div>
      <Header isLoggedIn={isLoggedIn} user={user} onLogout={onLogout} />
      <div style={{ maxWidth: 800, margin: "2rem auto", color: "white" }}>
        <h2>영화 검색</h2>
        <form onSubmit={handleSearch} style={{ marginBottom: 20 }}>
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="영화 제목을 입력하세요"
            style={{ width: 250, padding: 8, fontSize: 16, marginRight: 10 }}
          />
          <input
            type="text"
            value={genre}
            onChange={e => setGenre(e.target.value)}
            placeholder="장르(선택)"
            style={{ width: 120, padding: 8, fontSize: 16, marginRight: 10 }}
          />
          <select value={sort} onChange={e => setSort(e.target.value)} style={{ padding: 8, fontSize: 16, marginRight: 10 }}>
            <option value="release">최신순</option>
            <option value="boxoffice">박스오피스순</option>
          </select>
          <button type="submit" style={{ padding: 8 }}>검색</button>
        </form>
        {loading && <div>검색 중...</div>}
        {error && <div style={{ color: '#ff6464' }}>{error}</div>}
        <div>
          {results.length === 0 && !loading && !error && <div>검색 결과가 없습니다.</div>}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20 }}>
            {results.map(movie => (
              <div key={movie.id || movie.tmdb_id} onClick={() => handleResultClick(movie.id || movie.tmdb_id)}
                style={{ cursor: 'pointer', background: '#222', borderRadius: 8, padding: 12, width: 180 }}>
                {movie.poster_url && <img src={movie.poster_url} alt={movie.title} style={{ width: '100%', borderRadius: 6, marginBottom: 8 }} />}
                <div style={{ fontWeight: 'bold', fontSize: 16 }}>{movie.title}</div>
                <div style={{ fontSize: 14 }}>{movie.release_date}</div>
                <div style={{ fontSize: 13, color: '#aaa' }}>{movie.genre || movie.genreAlt}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default SearchPage;