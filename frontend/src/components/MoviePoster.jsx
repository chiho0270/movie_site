import React from "react";

const MoviePoster
 = ({ title, posterUrl, releaseDate, country}) => {
    return(
        <div className="w-40 p-2">
            <img src={posterUrl} alt={title} className="w-full h-60 object-cover rounded-lg" />
            <div className="mt-1 text-sm">
                <div className="font-semibold">{title}</div>
                <div className="text-gray-500 text-xs">{releaseDate} · {country}</div>
            </div>
        </div>
    );
};

export default MoviePoster;