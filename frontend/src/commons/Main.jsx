import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom"; // ⬅️ Link 추가
import MovieSection from "../components/MovieSection";
import exampleMovies from "../DummyData";
import Header from "../components/Header";
import BannerSlider from "../components/BannerSlider";

function MainPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState({ username: "", nickname: "" });

  const [searchTerm, setSearchTerm] = useState("");
  const [filteredMovies, setFilteredMovies] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      fetch("/api/user/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => res.json())
        .then((data) => {
          setIsLoggedIn(true);
          setUser(data);
        })
        .catch(() => {
          setIsLoggedIn(false);
          setUser({});
        });
    }
  }, []);

  const bannerImages = exampleMovies.slice(0, 5).map((movie) => movie.posterUrl);

  // 검색어 변경 시 필터링
  const handleSearchChange = (e) => {
    const keyword = e.target.value;
    setSearchTerm(keyword);
    if (keyword.trim() === "") {
      setFilteredMovies([]);
    } else {
      const results = exampleMovies.filter((movie) =>
        movie.title.toLowerCase().includes(keyword.toLowerCase())
      );
      setFilteredMovies(results);
    }
  };

  return (
    <div className="w-full overflow-x-hidden">
      <Header isLoggedIn={isLoggedIn} user={user} />

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

          {searchTerm && filteredMovies.length > 0 && (
            <div className="search-result-list">
              {filteredMovies.map((movie) => (
                <Link key={movie.id} to={`/movie/${movie.id}`} className="search-result-item">
                  {movie.title}
                </Link>
              ))}
            </div>
          )}

          <p className="search-subtext">장르 또는 태그로 탐색해보세요.</p>
          <div className="tag-list">
            {["액션", "코미디", "로맨스", "범죄", "SF", "판타지", "드라마", "애니메이션"].map((tag) => (
              <button key={tag} className="tag-button">
                {tag}
              </button>
            ))}
          </div>
        </div>
      </div>

      <h2 className="section-title">인기 영화</h2>
      <MovieSection movies={exampleMovies} />
    </div>
  );
}

export default MainPage;
