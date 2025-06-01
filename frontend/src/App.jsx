import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MainPage from "./commons/Main";
import LoginPage from "./commons/Login";
import RegisterPage from "./commons/Register";
import AdminPage from "./commons/AdminPage";
import { jwtDecode } from 'jwt-decode';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);

  // 로그인 상태 복원
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setIsLoggedIn(true);
        setUser({ username: decoded.username, userId: decoded.userId, user_role: decoded.user_role });
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
      const decoded = jwtDecode(token);
      setIsLoggedIn(true);
      setUser({ username: decoded.username, userId: decoded.userId, user_role: decoded.user_role });
    } catch (e) {
      setIsLoggedIn(false);
      setUser(null);
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
      </Routes>
    </Router>
  );
}

export default App;
