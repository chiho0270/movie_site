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
      // TMDB 포스터 가져오기 (불필요한 단어 제거)
      let posterUrl = null;
      try {
        const cleanTitle = item.movieNm.replace(/(극장판|완결판)/g, '').trim();
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
      }
    }
    console.log(`[BoxOfficeScheduler] ${targetDt} 주간 박스오피스 ${list.length}건 저장 완료`);
  } catch (err) {
    console.error('[BoxOfficeScheduler] 에러:', err);
  }
});

module.exports = {};
