import Header from "../components/Header";
import PosterSection from "../components/PosterSection";
import DummyData from "../DummyData";
import { useParams } from "react-router-dom";
import RatingInput from "../components/RatingInput";
import CommentInput from "../components/CommentInput";
import CastSection from "../components/CastSection";
import "../styles/MoviePage.css"; 

function MoviePage() {
    const { id } = useParams();
    const movieData = DummyData.find(movie => movie.id.toString() === id);
    if (!movieData) return <div>영화를 찾을 수 없습니다.</div>;

    const isLoggedIn = true; // 테스트용
    const userId = 1;

    return (
        <div>
            <Header />
            <div className="movie-detail-container">
                <div className="poster-and-info">
                    <PosterSection posterUrl={movieData.posterUrl} />
                    <div className="info-right">

                        <h1 className="movie-title">{movieData.title}</h1>

                        <div className="rating-wrapper">
                            <RatingInput
                            isLoggedIn={isLoggedIn}
                            userId={userId}
                            movieId={movieData.id}
                            averageRating={movieData.averageRating}
                            />
                        </div>
                        
                        <div className="comment-wrapper">
                            <CommentInput
                                isLoggedIn={isLoggedIn}
                                userId={userId}
                                movieId={movieData.id}
                            />
                        </div>

                        <div className="movie-info">
                            <p><strong>개봉일 : </strong> {movieData.releaseDate}</p>
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
