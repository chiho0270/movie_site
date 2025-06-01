const express = require('express');
const router = express.Router();
const { User } = require('../models');
const { getPasswordHash, authenticateUser, createAccessToken } = require('../auth');

// 아이디 중복 확인
router.get('/check_id', async (req, res) => {
  const { username } = req.query;
  if (!username) {
    return res.status(400).json({ error: 'Username is required' });
  }
  try {
    const user = await User.findOne({ where: { username } });
    res.json({ isAvailable: !user });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// 회원가입
router.post('/register', async (req, res) => {
  const { username, password, ...extraData } = req.body;
  try {
    const exists = await User.findOne({ where: { username } });
    if (exists) {
      return res.status(409).json({ error: 'Username already exists' });
    }
    const hashed_password = await getPasswordHash(password);
    // User 모델에 맞게 필드 매핑
    await User.create({
      username,
      password: hashed_password,
      full_name: extraData.name,
      email: extraData.email,
      birth_date: extraData.birth,
      gender: extraData.gender,
      user_role: extraData.user_role || 'GeneralReviewer',
      created_at: new Date()
    });
    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Registration failed' + err });
  }
});

// 로그인
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await authenticateUser(username, password);
    if (!user) {
      return res.status(401).json({ error: '존재하지 않은 사용자입니다.' });
    }
    const token = createAccessToken({ userId: user.id, username: user.username, user_role: user.user_role });
    res.json({
      access_token: token,
      user: { id: user.id, username: user.username }
    });
  } catch (err) {
    res.status(500).json({ error: 'Login failed: ' + err });
  }
});

module.exports = router;