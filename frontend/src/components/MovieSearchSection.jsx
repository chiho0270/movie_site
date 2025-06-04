import React from "react";
import { useNavigate } from "react-router-dom";
import '../styles/MovieSearchSection.css';

const MovieSearchSection = ({movies}) => {
    const navigate = useNavigate();
    return(
        <section className="movie-section">
            <div className="movie-grid-container">
                {Array.isArray(movies) && movies.length > 0 ? (
                  movies.reduce((rows, item, idx) => {
                    if (idx % 6 === 0) rows.push([]);
                    rows[rows.length - 1].push(item);
                    return rows;
                  }, []).map((row, rowIdx) => (
                    <div key={rowIdx} className="movie-row">
                      {row.map((item, idx) => {
                        const movie = item.dbMovie || item;
                        const movieId = movie.movie_id || movie.tmdb_id || movie.movieCd || `${rowIdx}-${idx}`;
                        const posterUrl = movie.poster_url || item.poster_url || '/img/no-poster.png';
                        const title = movie.title || item.movieNm || '';
                        const releaseDate = movie.release_date || item.openDt || '';
                        if (!title) return null;
                        let linkId = movie.movie_id || movie.tmdb_id || movie.movieCd;
                        const handleClick = () => {
                          if (linkId) navigate(`/movie/${linkId}`);
                        };
                        return (
                          <div key={movieId} className="movie-poster" onClick={handleClick} style={{ cursor: linkId ? 'pointer' : 'default' }}>
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
                  ))
                ) : (
                  <div style={{ color: '#fff', fontSize: '1.1em', padding: '2rem 0', textAlign: 'center' }}>로딩중..</div>
                )}
            </div>
        </section>
    );
};

export default MovieSearchSection;