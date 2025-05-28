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
    await User.create({ username, hashed_password, ...extraData });
    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Registration failed' });
  }
});

// 로그인
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await authenticateUser(username, password);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = createAccessToken({ userId: user.id, username: user.username });
    res.json({
      access_token: token,
      user: { id: user.id, username: user.username }
    });
  } catch (err) {
    res.status(500).json({ error: 'Login failed' });
  }
});

module.exports = router;