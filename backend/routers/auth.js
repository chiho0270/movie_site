const express = require('express');
const router = express.Router();
const { getPasswordHash, authenticateUser, createAccessToken } = require('../auth');
const { User } = require('../models');

// 회원가입
router.post('/signup', async (req, res) => {
    const { username, password } = req.body;
    try {
        const exists = await User.findOne({ where: { username } });
        if (exists) {
            return res.status(409).json({ message: 'Username already exists' });
        }
        const hashed_password = await getPasswordHash(password);
        await User.create({ username, hashed_password });
        res.status(201).json({ message: 'User created' });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// 로그인
router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const user = await authenticateUser(username, password);
    if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
    }
    const token = createAccessToken({ userId: user.id, username: user.username });
    res.json({ access_token: token });
});

module.exports = router;
