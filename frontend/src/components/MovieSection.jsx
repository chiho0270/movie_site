import React from "react";
import MoviePoster from "./MoviePoster";
import '../styles/MovieSection.css';

const MovieSection = ({movies}) => {
    return(
        <section className="movie-section">
            <div className="movie-scroll-container"> 
                {movies.map((movie) => (
                    <MoviePoster
                        key={movie.id}
                        title={movie.title}
                        posterUrl={movie.posterUrl}
                        releaseDate={movie.releaseDate}
                        country={movie.country}
                    />
                ))}
            </div>
        </section>
    );
};

export default MovieSection;