import React, { useState } from "react";
import "./Auth.css";
import { MdOutlineRemoveRedEye } from "react-icons/md";
import { FaRegEyeSlash } from "react-icons/fa";

function Login({ onLoginSuccess }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);

  // 로그인 요청 함수
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      if (res.ok) {
        const data = await res.json();
        if (onLoginSuccess) onLoginSuccess(data.access_token);
        alert('로그인 성공!');
        window.location.href = '/';
      } else {
        const data = await res.json();
        alert(data.error || '로그인 실패');
      }
    } catch (err) {
      alert('서버 오류');
    }
  };

  return (
    <div className="auth-bg">
      <form className="auth-box" onSubmit={handleLogin}>
        <h2 className="auth-title">로그인</h2>
        <label htmlFor="username" className="auth-label">
          아이디
        </label>
        <input
          id="username"
          className="auth-input"
          type="text"
          placeholder="아이디를 입력하세요"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          autoComplete="username"
        />

        <label htmlFor="password" className="auth-label">
          비밀번호
        </label>
        <div className="pw-wrap">
          <input
            id="password"
            className="auth-input"
            type={showPw ? "text" : "password"}
            placeholder="비밀번호를 입력하세요"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />
          <button
            type="button"
            className="pw-toggle"
            onClick={() => setShowPw((prev) => !prev)}
            tabIndex={-1}
            aria-label="비밀번호 보기/숨기기"
          >
            {showPw ? <FaRegEyeSlash size={22} /> : <MdOutlineRemoveRedEye size={24} />}    
          </button>
        </div>
        <button type="submit" className="auth-btn">
          로그인
        </button>
      </form>
    </div>
  );
}

export default Login;
