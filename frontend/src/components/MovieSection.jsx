import React from "react";
import { useNavigate } from "react-router-dom";
import '../styles/MovieSection.css';

const MovieSection = ({movies}) => {
    const navigate = useNavigate();
    return(
        <section className="movie-section">
            <div className="movie-scroll-container"> 
                {movies.map((item, idx) => {
                    const movie = item.dbMovie;
                    return movie ? (
                        <div key={movie.movie_id || idx} className="movie-poster" onClick={() => navigate(`/movie/${movie.movie_id}`)} style={{ cursor: 'pointer' }}>
                            <img
                                src={movie.poster_url || '/img/no-poster.png'}
                                alt={movie.title}
                                className="poster-image"
                                style={{ width: 150, height: 220, objectFit: 'cover', borderRadius: 8 }}
                            />
                            <div style={{ textAlign: 'center', marginTop: 8 }}>
                                <div style={{ color: '#fff', fontSize: '0.95em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 140, margin: '0 auto' }}>{movie.title}</div>
                                <div style={{ fontSize: '0.8em', color: '#888', textAlign: 'left', marginLeft: 8 }}>{movie.release_date}</div>
                            </div>
                        </div>
                    ) : null;
                })}
            </div>
        </section>
    );
};

export default MovieSection;