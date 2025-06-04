import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import MovieSearchSection from "../components/MovieSearchSection";
import Header from "../components/Header";
import '../App.css';

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

function SearchPage({ isLoggedIn, user, onLogout }) {
  const query = useQuery();
  const navigate = useNavigate();
  const tag = query.get("tag");
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [tagList, setTagList] = useState([]);
  const [sortType, setSortType] = useState('title');

  useEffect(() => {
    // 태그 목록 불러오기
    fetch("/api/tag/tags")
      .then(res => res.json())
      .then(data => setTagList(data.tags || []))
      .catch(() => setTagList([]));
  }, []);

  useEffect(() => {
    if (!tag) return;
    setLoading(true);
    setError("");
    // 1. tag로 영화 id 목록 조회
    fetch(`/api/tag/movie-ids?tag=${encodeURIComponent(tag)}`)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(async (data) => {
        const ids = data.movieIds || [];
        // 2. 각 영화 id별로 상세 정보 요청 (DB 우선, 없으면 TMDB)
        const movieDetails = await Promise.all(ids.map(async (idObj) => {
          const id = idObj.movie_id;
          try {
            // DB에서 먼저 시도
            const dbRes = await fetch(`/api/movie/${id}`);
            if (dbRes.ok) {
              const dbData = await dbRes.json();
              if (dbData && dbData.movie) return dbData.movie;
            }
          } catch (e) {}
          try {
            // TMDB에서 시도
            const tmdbRes = await fetch(`/api/movie/tmdb/${id}`);
            if (tmdbRes.ok) {
              const tmdbData = await tmdbRes.json();
              if (tmdbData && tmdbData.movie) return tmdbData.movie;
            }
          } catch (e) {}
          return null;
        }));
        setMovies(movieDetails.filter(Boolean));
        setLoading(false);
      })
      .catch((err) => {
        setError(`영화 목록을 불러오지 못했습니다. (${err.message})`);
        setLoading(false);
      });
    // eslint-disable-next-line
  }, [tag]);

  // 정렬 함수
  const getSortedMovies = () => {
    let filtered = movies;
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
    <div className="w-full overflow-x-hidden">
      <Header isLoggedIn={isLoggedIn} user={user} onLogout={onLogout} />
      <div className="search-page-container">
        {/* 상단 입력/버튼 영역 */}
        <div className="search-top-area">
          {/* 영화 제목 입력칸과 검색 버튼 제거됨 */}
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ marginRight: 10 }}>       </span>
            <button onClick={() => setSortType('release')} style={{ marginRight: 6, fontWeight: sortType === 'release' ? 'bold' : 'normal' }}>최신순</button>
            <button onClick={() => setSortType('title')} style={{ fontWeight: sortType === 'title' ? 'bold' : 'normal' }}>글자순</button>
          </div>
          <div className="tag-list">
            {tagList.length > 0 ? (
              tagList
                .filter(tag => !["전체관람가", "15세이상관람가", "12세이상관람가", "청소년관람불가"].includes(tag.tag_name))
                .map((tag) => (
                  <button
                    key={tag.tag_id}
                    className="tag-button"
                    onClick={() => navigate(`/search?tag=${encodeURIComponent(tag.tag_name)}`)}
                  >
                    {tag.tag_name}
                  </button>
                ))
            ) : (
              <span style={{ color: '#aaa' }}>태그를 불러오는 중...</span>
            )}
          </div>
        </div>
        {/* 목록 영역 */}
        <div className="search-list-area">
          {tag && <h3 style={{ color: '#fff' }}>&quot;{tag}&quot; 태그로 검색된 영화</h3>}
          {loading && <div style={{ color: '#fff' }}>로딩 중...</div>}
          {error && <div style={{ color: '#ff6464' }}>{error}</div>}
          <MovieSearchSection movies={getSortedMovies()} />
        </div>
      </div>
    </div>
  );
}

export default SearchPage;
