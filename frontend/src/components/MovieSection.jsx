import React from "react";
import { useNavigate } from "react-router-dom";
import '../styles/MovieSection.css';

const MovieSection = ({movies}) => {
    const navigate = useNavigate();
    return(
        <section className="movie-section">
            <div className="movie-scroll-container"> 
                {movies.map((item, idx) => {
                    // dbMovie가 있으면 DB 정보, 없으면 기본 박스오피스 정보 사용
                    const movie = item.dbMovie || item;
                    // movie_id가 없으면 idx로 대체
                    const movieId = movie.movie_id || movie.tmdb_id || movie.movieCd || idx;
                    // 포스터 URL 우선순위: dbMovie > item.poster_url > '/img/no-poster.png'
                    const posterUrl = movie.poster_url || item.poster_url || '/img/no-poster.png';
                    // 제목 우선순위: dbMovie > item.movieNm > item.title
                    const title = movie.title || item.movieNm || '';
                    // 개봉일 우선순위: dbMovie > item.openDt > item.release_date
                    const releaseDate = movie.release_date || item.openDt || '';
                    if (!title) return null; // 제목 없는 항목은 스킵
                    return (
                        <div key={movieId} className="movie-poster" onClick={() => movie.movie_id ? navigate(`/movie/${movie.movie_id}`) : null} style={{ cursor: movie.movie_id ? 'pointer' : 'default' }}>
                            <img
                                src={posterUrl}
                                alt={title}
                                className="poster-image"
                                style={{ width: 150, height: 220, objectFit: 'cover', borderRadius: 8 }}
                            />
                            <div style={{ textAlign: 'center', marginTop: 8 }}>
                                <div style={{ color: '#fff', fontSize: '0.95em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 140, margin: '0 auto' }}>{title}</div>
                                <div style={{ fontSize: '0.8em', color: '#888', textAlign: 'left', marginLeft: 8 }}>{releaseDate}</div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </section>
    );
};

export default MovieSection;