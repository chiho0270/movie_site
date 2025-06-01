const express = require('express');
const router = express.Router();
const { Movie, User } = require('../models');
const { getWeeklyBoxOffice } = require('../utils/kobisApi');

// ===== 영화 관리 =====
// 영화 목록 조회
router.get('/movie', async (req, res) => {
  try {
    const movies = await Movie.findAll();
    res.json({ movies });
  } catch (err) {
    res.status(500).json({ error: 'DB 조회 실패' });
  }
});
// 영화 저장
router.post('/movie', async (req, res) => {
  try {
    const { movieCd, movieNm, openDt, genreAlt, posterUrl } = req.body;
    // 중복 체크
    const exists = await Movie.findOne({ where: { tmdb_id: movieCd } });
    if (exists) return res.status(409).json({ error: '이미 저장된 영화입니다.' });
    await Movie.create({
      tmdb_id: movieCd,
      title: movieNm,
      release_date: openDt,
      country: null,
      average_rating: 0,
      poster_url: posterUrl,
      overview: null
    });
    res.json({ message: '저장 성공' });
  } catch (err) {
    res.status(500).json({ error: 'DB 저장 실패' });
  }
});
// 영화 삭제
router.delete('/movie/:movieCd', async (req, res) => {
  try {
    const { movieCd } = req.params;
    const deleted = await Movie.destroy({ where: { tmdb_id: movieCd } });
    if (deleted) {
      res.json({ message: '삭제 성공' });
    } else {
      res.status(404).json({ error: '영화가 존재하지 않습니다.' });
    }
  } catch (err) {
    res.status(500).json({ error: 'DB 삭제 실패' });
  }
});

// ===== 유저 관리 =====
// 유저 목록 조회
router.get('/users', async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ['user_id', 'username', 'email', 'created_at', 'user_role']
    });
    res.json({ users });
  } catch (err) {
    res.status(500).json({ error: '유저 조회 실패' });
  }
});
// 유저 역할 변경
router.put('/users/:userId/role', async (req, res) => {
  const { userId } = req.params;
  const { role } = req.body;
  if (!['Admin','ProReviewer','GeneralReviewer'].includes(role)) {
    return res.status(400).json({ error: '잘못된 역할' });
  }
  try {
    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ error: '유저 없음' });
    user.user_role = role;
    await user.save();
    res.json({ message: '권한 변경 성공' });
  } catch (err) {
    res.status(500).json({ error: '권한 변경 실패' });
  }
});
// 유저 삭제
router.delete('/users/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const deleted = await User.destroy({ where: { user_id: userId } });
    if (deleted) {
      res.json({ message: '유저 삭제 성공' });
    } else {
      res.status(404).json({ error: '유저가 존재하지 않습니다.' });
    }
  } catch (err) {
    res.status(500).json({ error: '유저 삭제 실패' });
  }
});

// 주간 박스오피스 수동 저장 (어드민)
router.post('/boxoffice/save', async (req, res) => {
  try {
    // 2주 전 일요일~토요일 날짜 계산
    const today = new Date();
    today.setDate(today.getDate() - 14); // 2주 전으로 이동
    const twoWeeksAgoSunday = new Date(today.setDate(today.getDate() - today.getDay() || 7));
    const year = twoWeeksAgoSunday.getFullYear();
    const month = (twoWeeksAgoSunday.getMonth() + 1).toString().padStart(2, '0');
    const day = twoWeeksAgoSunday.getDate().toString().padStart(2, '0');
    const targetDt = `${year}${month}${day}`;

    // KOBIS API에서 주간 박스오피스 데이터 가져오기
    const data = await getWeeklyBoxOffice({ targetDt, weekGb: '0' });
    const list = data.boxOfficeResult?.weeklyBoxOfficeList || [];
    let savedCount = 0;
    for (const item of list) {
      // TMDB 포스터 가져오기 (불필요한 단어 제거)
      let posterUrl = null;
      try {
        const cleanTitle = item.movieNm.replace(/(극장판|완결편)/g, '').trim();
        const tmdbApiKey = process.env.TMDB_API_KEY || process.env.REACT_APP_TMDB_TOKEN || "b457b7c18d8eb65b1bfc864d4b83ee11";
        const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
        const tmdbRes = await fetch(
          `https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(cleanTitle)}&language=ko&api_key=${tmdbApiKey}`
        );
        const tmdbData = await tmdbRes.json();
        posterUrl = tmdbData.results && tmdbData.results[0]?.poster_path
          ? `https://image.tmdb.org/t/p/w200${tmdbData.results[0].poster_path}`
          : null;
      } catch {}
      // DB에 없으면 저장 (중복 방지)
      const exists = await Movie.findOne({ where: { tmdb_id: item.movieCd } });
      if (!exists) {
        await Movie.create({
          tmdb_id: item.movieCd,
          title: item.movieNm,
          release_date: item.openDt,
          country: item.nationAlt,
          average_rating: 0,
          poster_url: posterUrl,
          overview: null
        });
        savedCount++;
      }
    }
    res.json({ message: `${targetDt} 주간 박스오피스 ${savedCount}건 저장 완료` });
  } catch (err) {
    res.status(500).json({ error: '박스오피스 저장 실패', detail: err.message });
  }
});

module.exports = router;
