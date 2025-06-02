import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Auth.css";
import { MdOutlineRemoveRedEye } from "react-icons/md";
import { FaRegEyeSlash } from "react-icons/fa";

function Register() {
  const [username, setUsername] = useState("");
  const [isIdChecked, setIsIdChecked] = useState(false);
  const [idMsg, setIdMsg] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [password2, setPassword2] = useState("");
  const [showPw2, setShowPw2] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [birth, setBirth] = useState("");
  const [gender, setGender] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // 아이디 중복 확인
  const checkId = async () => {
    setIdMsg("");
    if (!username.trim()) {
      setIdMsg("아이디를 입력하세요.");
      return;
    }
    try {
      const res = await fetch(`/api/check_id?username=${encodeURIComponent(username)}`);
      const data = await res.json();
      if (data.isAvailable) {
        setIdMsg("사용 가능한 아이디입니다.");
        setIsIdChecked(true);
      } else {
        setIdMsg("이미 사용 중인 아이디입니다.");
        setIsIdChecked(false);
      }
    } catch {
      setIdMsg("서버 오류가 발생했습니다.");
      setIsIdChecked(false);
    }
  };

  // 회원가입 요청
  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    if (!isIdChecked) {
      setError("아이디 중복 확인을 해주세요.");
      return;
    }
    if (!password || !password2) {
      setError("비밀번호를 입력하세요.");
      return;
    }
    if (password !== password2) {
      setError("비밀번호가 일치하지 않습니다.");
      return;
    }
    if (!name.trim() || !email.trim() || !birth || !gender) {
      setError("모든 항목을 입력하세요.");
      return;
    }
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          password,
          name,
          email,
          birth,
          gender,
        }),
      });
      if (res.ok) {
        alert("회원가입이 완료되었습니다. 로그인 해주세요!");
        navigate("/login");
      } else {
        const data = await res.json();
        setError(data.error || "회원가입에 실패했습니다.");
      }
    } catch {
      setError("서버 오류가 발생했습니다.");
    }
  };

  // 취소 버튼
  const handleCancel = () => {
    navigate("/");
  };

  return (
    <div className="auth-bg">
      <form className="auth-box" onSubmit={handleRegister}>
        <h2 className="auth-title">회원가입</h2>

        <label className="auth-label" htmlFor="username">아이디</label>
        <div className="id-row">
            <input
                id="username"
                className="auth-input"
                type="text"
                value={username}
                onChange={(e) => { setUsername(e.target.value); setIsIdChecked(false); setIdMsg(""); }}
                placeholder="아이디를 입력하세요"
                autoComplete="username"
                required
            />
            <button
                type="button"
                className="auth-btn id-check-btn"
                onClick={checkId}
            >
            중복 확인
            </button>
        </div>
        {idMsg && (
          <div style={{ fontSize: "0.95rem", color: isIdChecked ? "#4caf50" : "#ff6464", marginTop: "-0.5rem", marginBottom: "0.5rem", paddingLeft: "0.2rem" }}>
            {idMsg}
          </div>
        )}

        <label className="auth-label" htmlFor="password">비밀번호</label>
        <div className="pw-wrap">
          <input
            id="password"
            className="auth-input"
            type={showPw ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="비밀번호를 입력하세요"
            autoComplete="new-password"
            required
          />
          <button
            type="button"
            className="pw-toggle"
            onClick={() => setShowPw((prev) => !prev)}
            tabIndex={-1}
          >
            {showPw ? <FaRegEyeSlash size={22} /> : <MdOutlineRemoveRedEye size={24} />}
          </button>
        </div>

        <label className="auth-label" htmlFor="password2">비밀번호 확인</label>
        <div className="pw-wrap">
          <input
            id="password2"
            className="auth-input"
            type={showPw2 ? "text" : "password"}
            value={password2}
            onChange={(e) => setPassword2(e.target.value)}
            placeholder="비밀번호를 한 번 더 입력하세요"
            autoComplete="new-password"
            required
          />
          <button
            type="button"
            className="pw-toggle"
            onClick={() => setShowPw2((prev) => !prev)}
            tabIndex={-1}
          >
            {showPw2 ? <FaRegEyeSlash size={22} /> : <MdOutlineRemoveRedEye size={24} />}
          </button>
        </div>
        {password2 && password !== password2 && (
          <div style={{ color: "#ff6464", fontSize: "0.95rem", marginTop: "-0.4rem", marginBottom: "0.5rem", paddingLeft: "0.2rem" }}>
            비밀번호가 일치하지 않습니다.
          </div>
        )}

        <label className="auth-label" htmlFor="name">이름</label>
        <input
          id="name"
          className="auth-input"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="이름을 입력하세요"
          autoComplete="name"
          required
        />

        <label className="auth-label" htmlFor="email">이메일</label>
        <input
          id="email"
          className="auth-input"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="이메일을 입력하세요"
          autoComplete="email"
          required
        />

        <label className="auth-label" htmlFor="birth">생년월일</label>
        <input
          id="birth"
          className="auth-input"
          type="date"
          value={birth}
          onChange={(e) => setBirth(e.target.value)}
          required
        />

        <label className="auth-label">성별</label>
        <div style={{ display: "flex", gap: "1.5rem", marginBottom: "0.5rem", color: "#ccc", fontSize: "1rem" }}>
          <label>
            <input
              type="radio"
              name="gender"
              value="male"
              checked={gender === "male"}
              onChange={() => setGender("male")}
              required
            />
            남자
          </label>
          <label>
            <input
              type="radio"
              name="gender"
              value="female"
              checked={gender === "female"}
              onChange={() => setGender("female")}
              required
            />
            여자
          </label>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <div style={{ display: "flex", gap: "0.7rem", justifyContent: "space-between", marginTop: "1rem" }}>
          <button type="submit" className="auth-btn">회원가입</button>
          <button type="button" className="auth-btn" style={{ background: "#444" }} onClick={handleCancel}>취소</button>
        </div>
      </form>
    </div>
  );
}

export default Register;
