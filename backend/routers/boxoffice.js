const express = require('express');
const router = express.Router();
const { Movie } = require('../models');
const jwt = require('jsonwebtoken');

// 박스오피스 목록만 조회 (DB 저장 X)
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

  // 박스오피스 API에서 순위 리스트 가져오기
  const { getWeeklyBoxOffice } = require('../utils/kobisApi');
  let boxofficeList = [];
  try {
    // 2주 전 일요일~토요일 기준 날짜 계산 (스케줄러와 동일)
    const today = new Date();
    today.setDate(today.getDate() - 14);
    const twoWeeksAgoSunday = new Date(today.setDate(today.getDate() - today.getDay() || 7));
    const year = twoWeeksAgoSunday.getFullYear();
    const month = (twoWeeksAgoSunday.getMonth() + 1).toString().padStart(2, '0');
    const day = twoWeeksAgoSunday.getDate().toString().padStart(2, '0');
    const targetDt = `${year}${month}${day}`;
    const data = await getWeeklyBoxOffice({ targetDt, weekGb: '0' });
    boxofficeList = data.boxOfficeResult?.weeklyBoxOfficeList || [];
  } catch (err) {
    return res.status(500).json({ error: '박스오피스 API 조회 실패' });
  }

  // TMDB 포스터 등 부가 정보 병합 (DB 저장 X)
  try {
    const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
    const cleanTitle = (title) => title.replace(/(극장판|완결편|완결판)/g, '').trim();
    const movies = await Promise.all(boxofficeList.map(async (item) => {
      let poster_url = null;
      const tmdbApiKey = process.env.TMDB_API_KEY || process.env.REACT_APP_TMDB_TOKEN || "b457b7c18d8eb65b1bfc864d4b83ee11";
      try {
        const cleanMovieTitle = cleanTitle(item.movieNm);
        let tmdbRes = await fetch(
          `https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(cleanMovieTitle)}&language=ko&api_key=${tmdbApiKey}`
        );
        let tmdbData = await tmdbRes.json();
        if (tmdbData.results && tmdbData.results[0]?.poster_path) {
          poster_url = `https://image.tmdb.org/t/p/w780${tmdbData.results[0].poster_path}`;
        } else if (item.movieNmEn && item.movieNmEn !== item.movieNm) {
          tmdbRes = await fetch(
            `https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(item.movieNmEn)}&language=en&api_key=${tmdbApiKey}`
          );
          tmdbData = await tmdbRes.json();
          if (tmdbData.results && tmdbData.results[0]?.poster_path) {
            poster_url = `https://image.tmdb.org/t/p/w780${tmdbData.results[0].poster_path}`;
          }
        }
      } catch {}
      return {
        rank: Number(item.rank),
        title: item.movieNm,
        movieCd: item.movieCd,
        openDt: item.openDt,
        genreAlt: item.genreAlt,
        posterUrl: poster_url,
        // 필요시 추가 필드
      };
    }));
    res.json({ isLoggedIn, user: isLoggedIn ? user : null, movies });
  } catch (err) {
    res.status(500).json({ error: '박스오피스 부가정보 병합 실패' });
  }
});

module.exports = router;