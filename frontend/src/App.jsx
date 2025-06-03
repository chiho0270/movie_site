import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MainPage from "./commons/Main";
import LoginPage from "./commons/Login";
import RegisterPage from "./commons/Register";
import AdminPage from "./commons/AdminPage";
import SearchPage from "./commons/Search";
import MoviePage from "./commons/Movie";
import ReviewPage from "./commons/Review";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);

  // 로그인 상태 복원 및 토큰 만료 체크
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (payload.exp * 1000 < Date.now()) {
          setIsLoggedIn(false);
          setUser(null);
          localStorage.removeItem('token');
          return;
        }
        setIsLoggedIn(true);
        setUser({ username: payload.username, userId: payload.userId, user_role: payload.user_role });
      } catch (e) {
        setIsLoggedIn(false);
        setUser(null);
        localStorage.removeItem('token');
      }
    } else {
      setIsLoggedIn(false);
      setUser(null);
    }
  }, []);

  // 로그인 성공 시 호출
  const handleLoginSuccess = (token) => {
    localStorage.setItem('token', token);
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      setIsLoggedIn(true);
      setUser({ username: payload.username, userId: payload.userId, user_role: payload.user_role });
    } catch (e) {
      setIsLoggedIn(false);
      setUser(null);
      localStorage.removeItem('token');
    }
  };

  // 로그아웃
  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    setUser(null);
  };

  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainPage isLoggedIn={isLoggedIn} user={user} onLogout={handleLogout} />} />
        <Route path="/login" element={<LoginPage onLoginSuccess={handleLoginSuccess} isLoggedIn={isLoggedIn} user={user} />} />
        <Route path="/register" element={<RegisterPage isLoggedIn={isLoggedIn} user={user} />} />
        <Route path="/admin" element={<AdminPage isLoggedIn={isLoggedIn} user={user} />} />
        <Route path="/search" element={<SearchPage isLoggedIn={isLoggedIn} user={user} onLogout={handleLogout} />} />
        <Route path="/movie/:id" element={<MoviePage isLoggedIn={isLoggedIn} user={user} onLogout={handleLogout} />} />
        <Route path="/review" element={<ReviewPage isLoggedIn={isLoggedIn} user={user} onLogout={handleLogout} />} />
      </Routes>
    </Router>
  );
}

export default App;
