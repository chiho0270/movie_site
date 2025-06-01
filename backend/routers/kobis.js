const express = require('express');
const router = express.Router();
const kobis = require('../utils/kobisApi');

// 일일 박스오피스 (예: /api/kobis/boxoffice/daily?targetDt=20240531)
router.get('/boxoffice/daily', async (req, res) => {
  try {
    const data = await kobis.getDailyBoxOffice(req.query);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 주간 박스오피스
router.get('/boxoffice/weekly', async (req, res) => {
  try {
    const data = await kobis.getWeeklyBoxOffice(req.query);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 영화 검색 (제목 등)
router.get('/movie/list', async (req, res) => {
  try {
    const data = await kobis.getMovieList(req.query);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 영화 상세
router.get('/movie/info', async (req, res) => {
  try {
    const data = await kobis.getMovieInfo(req.query);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 인물 검색
router.get('/people/list', async (req, res) => {
  try {
    const data = await kobis.getPeopleList(req.query);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 인물 상세
router.get('/people/info', async (req, res) => {
  try {
    const data = await kobis.getPeopleInfo(req.query);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 코드 목록
router.get('/code/list', async (req, res) => {
  try {
    const data = await kobis.getCodeList(req.query);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
