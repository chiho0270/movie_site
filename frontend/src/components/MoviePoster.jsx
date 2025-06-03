import React from "react";
import { Link } from "react-router-dom";
import "../styles/MoviePoster.css";

const MoviePoster = ({ id, title, posterUrl, releaseDate, country }) => {
    return (
        <Link to={`/movie/${id}`} className="movie-poster">
            <img src={posterUrl} alt={title} />
            <div className="poster-info">
                <div className="title">{title}</div>
                <div className="meta">{releaseDate} · {country}</div>
            </div>
        </Link>
    );
};

export default MoviePoster;
