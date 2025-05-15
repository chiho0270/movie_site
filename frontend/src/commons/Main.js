import React from "react";
import MovieSection from "../components/MovieSection";
import TagList from "../components/TagList";

function MainPage() {
    return (
        <div>
            <h2>추천 영화</h2>
            <TagList />
            <MovieSection />
        </div>
    );
};

export default MainPage;