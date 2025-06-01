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

  // DB에서 박스오피스 영화 제목과 일치하는 영화만 가져오기
  try {
    // node-fetch 동적 import (최상단 require 불가 시)
    const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
    // 영화 제목 배열 (불필요한 단어 제거)
    const cleanTitle = (title) => title.replace(/(극장판|완결편)/g, '').trim();
    const titles = boxofficeList.map(item => cleanTitle(item.movieNm));
    // DB에서 제목이 박스오피스에 포함된 영화만 조회
    const dbMovies = await Movie.findAll({
      where: { title: titles },
    });
    // 박스오피스 순위대로 정렬 및 포스터/상세정보 병합 (비동기)
    const movies = await Promise.all(boxofficeList.map(async (item, idx) => {
      // TMDB 검색용 제목 정제
      const searchTitle = cleanTitle(item.movieNm);
      const dbMovie = dbMovies.find(m => m.title === searchTitle);
      let poster_url = dbMovie ? dbMovie.poster_url : null;
      // TMDB에서 포스터 재검색 (DB에 없거나 포스터 없을 때)
      if (!poster_url) {
        const tmdbApiKey = process.env.TMDB_API_KEY || process.env.REACT_APP_TMDB_TOKEN || "b457b7c18d8eb65b1bfc864d4b83ee11";
        try {
          const tmdbRes = await fetch(
            `https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(searchTitle)}&language=ko&api_key=${tmdbApiKey}`
          );
          const tmdbData = await tmdbRes.json();
          poster_url = tmdbData.results && tmdbData.results[0]?.poster_path
            ? `https://image.tmdb.org/t/p/w200${tmdbData.results[0].poster_path}`
            : null;
        } catch {}
      }
      return {
        rank: Number(item.rank),
        title: item.movieNm,
        tmdb_id: dbMovie ? dbMovie.tmdb_id : null,
        poster_url,
        release_date: dbMovie ? dbMovie.release_date : null,
        country: dbMovie ? dbMovie.country : null,
        average_rating: dbMovie ? dbMovie.average_rating : null,
        // 필요시 추가 필드
      };
    }));
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