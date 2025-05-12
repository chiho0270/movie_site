import React from "react";
import MovieSection from "../components/MovieSection";
import TagList from "../components/TagList";

function MainPage() {
    return (
        <div>
            <TagList />
            <MovieSection title="추천 영화" />
        </div>
    );
};

export default MainPage;