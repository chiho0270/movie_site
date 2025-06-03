const express = require('express');
const router = express.Router();
const { Movie, User, Tag, MovieTag } = require('../models');
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
// 영화 저장 (태그ID도 함께 저장)
router.post('/movie', async (req, res) => {
  try {
    const { movieCd, movieNm, openDt, genreAlt, posterUrl, movieNmEn, tagIds } = req.body;
    // 중복 체크
    const exists = await Movie.findOne({ where: { tmdb_id: movieCd } });
    if (exists) return res.status(409).json({ error: '이미 저장된 영화입니다.' });
    let finalPosterUrl = posterUrl;
    // 프론트에서 포스터가 없거나 빈 값이면 백엔드에서 TMDB 검색 시도
    if (!finalPosterUrl) {
      try {
        const cleanTitle = movieNm.replace(/(극장판|완결편|완결판)/g, '').trim();
        const tmdbApiKey = process.env.TMDB_API_KEY || process.env.REACT_APP_TMDB_TOKEN || "b457b7c18d8eb65b1bfc864d4b83ee11";
        const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
        let tmdbRes = await fetch(
          `https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(cleanTitle)}&language=ko&api_key=${tmdbApiKey}`
        );
        let tmdbData = await tmdbRes.json();
        if (tmdbData.results && tmdbData.results[0]?.poster_path) {
          finalPosterUrl = `https://image.tmdb.org/t/p/w780${tmdbData.results[0].poster_path}`;
        } else if (movieNmEn && movieNmEn !== movieNm) {
          tmdbRes = await fetch(
            `https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(movieNmEn)}&language=en&api_key=${tmdbApiKey}`
          );
          tmdbData = await tmdbRes.json();
          if (tmdbData.results && tmdbData.results[0]?.poster_path) {
            finalPosterUrl = `https://image.tmdb.org/t/p/w780${tmdbData.results[0].poster_path}`;
          }
        }
        if (!finalPosterUrl) {
          console.error(`[단일영화 포스터 실패] 제목: ${movieNm} / clean: ${cleanTitle} / 영문: ${movieNmEn || '-'} `);
        }
      } catch (e) {
        console.error('[TMDB 포스터 검색 에러]', movieNm, e);
      }
    }
    const movie = await Movie.create({
      tmdb_id: movieCd,
      title: movieNm,
      release_date: openDt,
      country: null,
      average_rating: 0,
      poster_url: finalPosterUrl,
      overview: null
    });
    // 태그ID가 없고 genreAlt가 있으면 자동 매핑 (콤마, 슬래시 모두 지원)
    let tagIdList = tagIds;
    if ((!Array.isArray(tagIds) || tagIds.length === 0) && genreAlt) {
      // genreAlt: "범죄,드라마,액션,미스터리" 또는 "범죄/드라마/액션/미스터리" 형태 모두 지원
      const genreNames = genreAlt.split(/[\/,]/).map(g => g.trim()).filter(Boolean);
      // DB에서 해당 태그명에 해당하는 tag_id 조회
      const foundTags = await Tag.findAll({ where: { tag_name: genreNames } });
      tagIdList = foundTags.map(t => t.tag_id);
    }
    // 중복 제거
    tagIdList = Array.from(new Set(tagIdList));
    // 태그ID가 있으면 MovieTag에 저장
    if (Array.isArray(tagIdList) && tagIdList.length > 0) {
      const movieTags = tagIdList.map(tag_id => ({ movie_id: movie.movie_id, tag_id }));
      await MovieTag.bulkCreate(movieTags);
    }
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
// 영화 전체 삭제
router.delete('/movie', async (req, res) => {
  try {
    await Movie.destroy({ where: {}, truncate: true, restartIdentity: true });
    await require('../models').MovieTag.destroy({ where: {}, truncate: true });
    res.json({ message: '전체 영화 삭제 및 초기화 성공' });
  } catch (err) {
    res.status(500).json({ error: '전체 영화 삭제 실패' });
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
        } else if (item.posterUrl) {
          // KOBIS에서 받은 posterUrl이 있으면 사용 (프론트와 동일하게)
          posterUrl = item.posterUrl;
        } else if (item.movieNmEn && item.movieNmEn !== item.movieNm) {
          // 2차 시도: 원제(영문)로 재검색 (가능한 경우)
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
      } catch (e) {
        console.error('[TMDB 포스터 검색 에러]', item.movieNm, e);
      }
      // DB에 없으면 저장 (중복 방지)
      const exists = await Movie.findOne({ where: { tmdb_id: item.movieCd } });
      if (!exists) {
        // 1. 영화 저장
        const movie = await Movie.create({
          tmdb_id: item.movieCd,
          title: item.movieNm,
          release_date: item.openDt,
          country: item.nationAlt,
          average_rating: 0,
          poster_url: posterUrl,
          overview: null
        });
        // 2. 태그 연동 (genreAlt에서 태그명 추출)
        if (item.genreAlt) {
          const genreNames = item.genreAlt.split(/[\/,]/).map(g => g.trim()).filter(Boolean);
          const foundTags = await Tag.findAll({ where: { tag_name: genreNames } });
          let tagIdList = foundTags.map(t => t.tag_id);
          tagIdList = Array.from(new Set(tagIdList));
          if (tagIdList.length > 0) {
            const movieTags = tagIdList.map(tag_id => ({ movie_id: movie.movie_id, tag_id }));
            await MovieTag.bulkCreate(movieTags);
          }
        }
        savedCount++;
      }
    }
    res.json({ message: `${targetDt} 주간 박스오피스 ${savedCount}건 저장 완료` });
  } catch (err) {
    res.status(500).json({ error: '박스오피스 저장 실패', detail: err.message });
  }
});

// ===== 태그 관리 =====
// 태그 전체 조회
router.get('/tags', async (req, res) => {
  try {
    const tags = await Tag.findAll();
    res.json({ tags });
  } catch (err) {
    res.status(500).json({ error: '태그 조회 실패' });
  }
});

// 태그 저장
router.post('/tags', async (req, res) => {
  try {
    const { tag_name } = req.body;
    if (!tag_name) return res.status(400).json({ error: '태그명을 입력하세요.' });
    const [tag, created] = await Tag.findOrCreate({ where: { tag_name } });
    if (!created) return res.status(409).json({ error: '이미 존재하는 태그입니다.' });
    res.json({ message: '태그 저장 성공', tag });
  } catch (err) {
    res.status(500).json({ error: '태그 저장 실패' });
  }
});

// 태그 전체 삭제 및 autoIncrement 초기화
router.delete('/tags', async (req, res) => {
  try {
    await Tag.destroy({ where: {}, truncate: true, restartIdentity: true });
    res.json({ message: '전체 태그 삭제 및 초기화 성공' });
  } catch (err) {
    res.status(500).json({ error: '태그 전체 삭제 실패' });
  }
});

module.exports = router;
