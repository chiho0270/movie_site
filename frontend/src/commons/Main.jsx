import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import MovieSection from "../components/MovieSection";
import Header from "../components/Header";
import BannerSlider from "../components/BannerSlider";

function MainPage({ isLoggedIn, user, onLogout }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredMovies, setFilteredMovies] = useState([]);
  const [tagList, setTagList] = useState([]);
  const [allMovies, setAllMovies] = useState([]);
  const [boxofficeMovies, setBoxofficeMovies] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // 전체 영화 목록을 백엔드에서 불러옴
    fetch('/api/movie/release')
      .then(res => res.json())
      .then(data => {
        setAllMovies(data.movies || []);
      })
      .catch(() => setAllMovies([]));
  }, []);

  useEffect(() => {
    // 태그 목록을 백엔드에서 불러옴
    fetch('/api/tag/tags')
      .then(res => res.json())
      .then(data => setTagList(data.tags || []))
      .catch(() => setTagList([]));
  }, []);

  useEffect(() => {
    // 박스오피스 순위별 영화 목록을 백엔드에서 불러옴 (실시간 Kobis API)
    fetch('/api/kobis/boxoffice')
      .then(res => res.json())
      .then(data => setBoxofficeMovies(data.boxofficeList || []))
      .catch(() => setBoxofficeMovies([]));
  }, []);

  // 검색어 변경 시 필터링
  const handleSearchChange = (e) => {
    const keyword = e.target.value;
    setSearchTerm(keyword);
    if (keyword.trim() === "") {
      setFilteredMovies([]);
    } else {
      const results = allMovies.filter((movie) =>
        movie.title.toLowerCase().includes(keyword.toLowerCase())
      );
      setFilteredMovies(results);
    }
  };

  const bannerImages = allMovies.slice(0, 5).map((movie) => movie.poster_url);

  return (
    <div className="w-full overflow-x-hidden">
      <Header isLoggedIn={isLoggedIn} user={user} onLogout={onLogout} />

      <div>
        <BannerSlider images={bannerImages} />
        <div className="search-overlay">
          <h1 className="search-title">어떤 영화를 찾으십니까?</h1>

          <input
            type="text"
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder="Search"
            className="search-input"
          />

          {searchTerm && (
            <div className="search-result-list">
              {filteredMovies.length > 0 ? (
                filteredMovies.map((movie) => (
                  <Link key={movie.movie_id} to={`/movie/${movie.movie_id}`} className="search-result-item">
                    {movie.title}
                  </Link>
                ))
              ) : (
                <div className="search-result-item" style={{ color: '#aaa' }}>
                  검색 결과가 없습니다.
                </div>
              )}
            </div>
          )}

          <p className="search-subtext">장르 또는 태그로 탐색해보세요.</p>
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
      </div>

      <h2 className="section-title">
        인기 영화{" "}
        <span style={{ fontSize: "0.5em", color: "#888", marginLeft: 8 }}>
          (주간 박스오피스 순위)
        </span>
      </h2>
      <MovieSection movies={boxofficeMovies} />
    </div>
  );
}

export default MainPage;
