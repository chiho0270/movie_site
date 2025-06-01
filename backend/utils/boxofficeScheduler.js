// backend/utils/boxofficeScheduler.js
const cron = require('node-cron');
const { getWeeklyBoxOffice } = require('./kobisApi');
const { Movie } = require('../models');

// 매주 일요일 03:00에 실행
cron.schedule('0 3 * * 0', async () => {
  try {
    // 2주 전 일요일~토요일 날짜 계산
    const today = new Date();
    today.setDate(today.getDate() - 14);
    const twoWeeksAgoSunday = new Date(today.setDate(today.getDate() - today.getDay() || 7));
    const year = twoWeeksAgoSunday.getFullYear();
    const month = (twoWeeksAgoSunday.getMonth() + 1).toString().padStart(2, '0');
    const day = twoWeeksAgoSunday.getDate().toString().padStart(2, '0');
    const targetDt = `${year}${month}${day}`;

    // KOBIS API에서 주간 박스오피스 데이터 가져오기
    const data = await getWeeklyBoxOffice({ targetDt, weekGb: '0' });
    const list = data.boxOfficeResult?.weeklyBoxOfficeList || [];

    for (const item of list) {
      // TMDB 포스터 가져오기 (불필요한 단어 제거, 검색 실패시 로그)
      let posterUrl = null;
      try {
        // 제목 정제: 극장판, 완결편, 완결판 등 모두 제거
        const cleanTitle = item.movieNm.replace(/(극장판|완결편|완결판)/g, '').trim();
        const tmdbApiKey = process.env.TMDB_API_KEY || process.env.REACT_APP_TMDB_TOKEN || "b457b7c18d8eb65b1bfc864d4b83ee11";
        const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
        let tmdbRes = await fetch(
          `https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(cleanTitle)}&language=ko&api_key=${tmdbApiKey}`
        );
        let tmdbData = await tmdbRes.json();
        // 1차 시도: 한글 제목
        if (tmdbData.results && tmdbData.results[0]?.poster_path) {
          posterUrl = `https://image.tmdb.org/t/p/w780${tmdbData.results[0].poster_path}`;
        } else {
          // 2차 시도: 원제(영문)로 재검색 (가능한 경우)
          if (item.movieNmEn && item.movieNmEn !== item.movieNm) {
            tmdbRes = await fetch(
              `https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(item.movieNmEn)}&language=en&api_key=${tmdbApiKey}`
            );
            tmdbData = await tmdbRes.json();
            if (tmdbData.results && tmdbData.results[0]?.poster_path) {
              posterUrl = `https://image.tmdb.org/t/p/w780${tmdbData.results[0].poster_path}`;
            }
          }
          // 실패시 로그
          if (!posterUrl) {
            console.error(`[박스오피스 포스터 실패] 제목: ${item.movieNm} / clean: ${cleanTitle} / 영문: ${item.movieNmEn || '-'} `);
          }
        }
      } catch (e) {
        console.error('[TMDB 포스터 검색 에러]', item.movieNm, e);
      }
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
      }
    }
    console.log(`[BoxOfficeScheduler] ${targetDt} 주간 박스오피스 ${list.length}건 저장 완료`);
  } catch (err) {
    console.error('[BoxOfficeScheduler] 에러:', err);
  }
});

module.exports = {};
