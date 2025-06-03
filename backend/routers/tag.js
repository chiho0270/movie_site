const express = require('express');
const router = express.Router();
const { Movie, Tag } = require('../models');

// 태그명으로 영화 목록 조회 (쿼리 파라미터)
router.get('/', async (req, res) => {
  const { tag } = req.query;
  if (!tag) {
    // 태그 없으면 전체 영화 반환 (혹은 빈 배열)
    return res.json({ movies: [] });
  }
  try {
    const movies = await Movie.findAll({
      include: [{
        model: Tag,
        where: { tag_name: tag },
        through: { attributes: [] }
      }]
    });
    res.json({ movies });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 전체 태그 목록 반환 (최상위 RESTful 경로)
router.get('/tags', async (req, res) => {
  try {
    const tags = await Tag.findAll();
    res.json({ tags });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;