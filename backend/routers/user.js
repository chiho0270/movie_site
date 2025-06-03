const express = require('express');
const router = express.Router();
const { User } = require('../models');
const bcrypt = require('bcrypt');

// 전체 사용자 조회 (관리자만)
router.get('/', async (req, res) => {
  try {
    const users = await User.findAll({ attributes: { exclude: ['password'] } });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: '사용자 전체 조회 실패' });
  }
});

// 단일 사용자 조회
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, { attributes: { exclude: ['password'] } });
    if (!user) return res.status(404).json({ error: '사용자를 찾을 수 없음' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: '사용자 조회 실패' });
  }
});

// 사용자 생성 (회원가입)
router.post('/', async (req, res) => {
  try {
    const { username, email, password, full_name, birth_date, gender, user_role } = req.body;
    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({
      username,
      email,
      password: hash,
      full_name,
      birth_date,
      gender,
      user_role: user_role || 'GeneralReviewer'
    });
    res.status(201).json({ ...user.toJSON(), password: undefined });
  } catch (err) {
    res.status(500).json({ error: '사용자 생성 실패' });
  }
});

// 사용자 정보 수정 (비밀번호 변경 포함)
router.put('/:id', async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: '사용자를 찾을 수 없음' });
    const { email, password, full_name, birth_date, gender, user_role } = req.body;
    if (email) user.email = email;
    if (password) user.password = await bcrypt.hash(password, 10);
    if (full_name) user.full_name = full_name;
    if (birth_date) user.birth_date = birth_date;
    if (gender) user.gender = gender;
    if (user_role) user.user_role = user_role;
    await user.save();
    res.json({ ...user.toJSON(), password: undefined });
  } catch (err) {
    res.status(500).json({ error: '사용자 정보 수정 실패' });
  }
});

// 사용자 삭제
router.delete('/:id', async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: '사용자를 찾을 수 없음' });
    await user.destroy();
    res.json({ message: '사용자 삭제 완료' });
  } catch (err) {
    res.status(500).json({ error: '사용자 삭제 실패' });
  }
});

module.exports = router;