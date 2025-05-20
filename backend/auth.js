const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { User } = require('./models');

const SECRET_KEY = 'your-secret-key-her';
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
    const valid = await verifyPassword(password, user.hashed_password);
    if (!valid) return null;
    return user;
}

// JWT 인증 미들웨어
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.sendStatus(401);

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
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
