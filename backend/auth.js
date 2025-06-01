require('dotenv').config();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { User } = require('./models');

const SECRET_KEY = process.env.SECRET_KEY || 'your-secret-key-here';
const ACCESS_TOKEN_EXPIRE_MINUTES = 30;

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
  const valid = await verifyPassword(password, user.password); // 로그인 시 user.password 사용
  if (!valid) return null;
  return user;
}

module.exports = {
  getPasswordHash,
  verifyPassword,
  createAccessToken,
  authenticateUser
};
