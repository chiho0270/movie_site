import React from 'react';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MainPage from "./commons/Main";
import LoginPage from "./commons/Login";
import RegisterPage from "./commons/Register";
import MoviePage from "./commons/Movie";
import ReviewPro from "./commons/Review_pro";
import ReviewUser from "./commons/Review_user";


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/movie/:id" element={<MoviePage />} />
        <Route path="/pro-review" element={<ReviewUser />} />
        <Route path="/user-review" element={<ReviewPro />} />
      </Routes>
    </Router>
  );
}

export default App;
