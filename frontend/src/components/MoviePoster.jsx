import React from "react";
import "./MoviePoster.css";

const MoviePoster = ({ title, posterUrl, releaseDate, country}) => {
    return(
        <div className="movie-poster">
            <img src={posterUrl} alt={title} />
            <div className="poster-info">
                <div className="title">{title}</div>
                <div className="meta">{releaseDate} · {country}</div>
            </div>
        </div>
    );
};

export default MoviePoster;