const express = require('express');
const router = express.Router();
const { Movie } = require('../models');
const jwt = require('jsonwebtoken');

// 박스오피스 순위/검색/로그인 상태 확인
router.get('/boxoffice', async (req, res) => {
  // 로그인 상태 확인
  let isLoggedIn = false;
  let user = null;
  const authHeader = req.headers['authorization'];
  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, process.env.SECRET_KEY);
      isLoggedIn = true;
      user = decoded;
    } catch (e) {
      isLoggedIn = false;
    }
  }

  // 영화 제목 검색(query 파라미터)
  const { query } = req.query;
  let movies;
  try {
    if (query) {
      // 제목에 query가 포함된 영화만 검색 (LIKE 연산)
      movies = await Movie.findAll({
        where: {
          title: { [require('sequelize').Op.like]: `%${query}%` }
        },
        order: [['rank', 'ASC']]
      });
    } else {
      // 전체 박스오피스 리스트 (순위 오름차순)
      movies = await Movie.findAll({
        order: [['rank', 'ASC']]
      });
    }
    res.json({
      isLoggedIn,
      user: isLoggedIn ? user : null,
      movies
    });
  } catch (err) {
    res.status(500).json({ error: 'DB 조회 실패' });
  }
});

module.exports = router;