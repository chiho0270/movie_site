import Header from "../components/Header";
import PosterSection from "../components/PosterSection";
import { useParams } from "react-router-dom";
import RatingInput from "../components/RatingInput";
import CommentInput from "../components/CommentInput";
import CastSection from "../components/CastSection";
import "../styles/MoviePage.css"; 
import React, { useEffect, useState } from "react";

function MoviePage() {
    const { id } = useParams();
    const [movieData, setMovieData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        setLoading(true);
        fetch(`/api/movie/${id}`)
            .then(res => {
                if (!res.ok) throw new Error('영화 정보를 불러올 수 없습니다.');
                return res.json();
            })
            .then(data => {
                setMovieData(data.movie || null);
                setLoading(false);
            })
            .catch(err => {
                setError(err.message);
                setLoading(false);
            });
    }, [id]);

    if (loading) return <div>영화 정보를 불러오는 중...</div>;
    if (error || !movieData) return <div>영화를 찾을 수 없습니다.</div>;

    const isLoggedIn = true; // 테스트용
    const userId = 1;

    return (
        <div>
            <Header />
            <div className="movie-detail-container">
                <div className="poster-and-info">
                    <PosterSection posterUrl={movieData.poster_url} />
                    <div className="info-right">
                        <h1 className="movie-title">{movieData.title}</h1>
                        <div className="rating-wrapper">
                            <RatingInput
                                isLoggedIn={isLoggedIn}
                                userId={userId}
                                movieId={movieData.movie_id}
                                averageRating={movieData.average_rating}
                            />
                        </div>
                        <div className="comment-wrapper">
                            <CommentInput
                                isLoggedIn={isLoggedIn}
                                userId={userId}
                                movieId={movieData.movie_id}
                            />
                        </div>
                        <div className="movie-info">
                            <p><strong>개봉일 : </strong> {movieData.release_date}</p>
                            <p><strong>국가 : </strong> {movieData.country}</p>
                            <p><strong>장르 : </strong> {movieData.genre}</p>
                        </div>
                        <div className="movie-description">
                            <h2>줄거리</h2>
                            <p>{movieData.summary}</p>
                        </div>
                    </div>
                </div>
                <CastSection cast={movieData.cast} />
            </div>
        </div>
    );
}

export default MoviePage;
