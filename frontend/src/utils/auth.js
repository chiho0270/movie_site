// utils/auth.js
// JWT 토큰 만료 여부 확인 함수
export function isTokenExpired(token) {
  if (!token) return true;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    if (!payload.exp) return false;
    // exp는 초 단위, JS는 ms 단위
    return payload.exp * 1000 < Date.now();
  } catch {
    return true;
  }
}
