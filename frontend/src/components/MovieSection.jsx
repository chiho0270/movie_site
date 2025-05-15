import React from "react";
import MoviePoster from "./MoviePoster";

const MovieSection = ({movies}) => {
    return(
        <section className="my-8">
            <div className="flex space-x-4 overflow-x-scroll">
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