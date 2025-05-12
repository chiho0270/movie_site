import React from "react";
import MoviePoster from "./MoviePoster";

const MovieSection = ({ title, movies}) => {
    return(
        <section className="my-8">
            <h2 className="text-xl font-bold mb-4">{title}</h2>
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