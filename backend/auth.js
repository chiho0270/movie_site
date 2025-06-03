require('dotenv').config();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { User } = require('./models');

const SECRET_KEY = process.env.SECRET_KEY || 'your-secret-key-her';
const ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7; // 7일(1주일)로 연장

// 비밀번호 해시 함수
async function getPasswordHash(password) {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
}

// 비밀번호 검증 함수
async function verifyPassword(plainPassword, hashedPassword) {
  return await bcrypt.compare(plainPassword, hashedPassword);
}

// JWT 토큰 생성 함수
function createAccessToken(payload) {
  return jwt.sign(
    payload,
    SECRET_KEY,
    { expiresIn: `${ACCESS_TOKEN_EXPIRE_MINUTES}m` }
  );
}

// 사용자 인증 함수
async function authenticateUser(username, password) {
  const user = await User.findOne({ where: { username } });
  if (!user) return null;
  // password 컬럼명에 맞게 수정
  const valid = await verifyPassword(password, user.password);
  if (!valid) return null;
  return user;
}

// JWT 인증 미들웨어
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: '토큰이 필요합니다.' });
  jwt.verify(token, SECRET_KEY, (err, payload) => {
    if (err) return res.status(403).json({ error: '유효하지 않은 토큰입니다.' });
    req.user = payload;
    next();
  });
}

module.exports = {
  getPasswordHash,
  verifyPassword,
  createAccessToken,
  authenticateUser,
  authenticateToken
};
