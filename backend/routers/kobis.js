const express = require('express');
const router = express.Router();
const { Movie } = require('../models');
const { getWeeklyBoxOffice } = require('../utils/kobisApi');
const { searchMovie, getMovieDetail, getMovieCredits } = require('../utils/tmdbApi');
const { Tag, MovieTag, Cast } = require('../models');
const { getMovieList } = require('../utils/kobisApi');
const jwt = require('jsonwebtoken');

// 박스오피스 순위/검색
router.get('/boxoffice/search', async (req, res) => {
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
    res.json({ movies });
  } catch (err) {
    res.status(500).json({ error: 'DB 조회 실패' });
  }
});

// 2주전 주간 박스오피스 조회 및 저장
router.post('/boxoffice/weekly/save', async (req, res) => {
  try {
    // 2주 전 일요일 기준 (Kobis는 주간: 월~일)
    const today = new Date();
    const twoWeeksAgo = new Date(today);
    twoWeeksAgo.setDate(today.getDate() - 14);
    const yyyy = twoWeeksAgo.getFullYear();
    const mm = String(twoWeeksAgo.getMonth() + 1).padStart(2, '0');
    const dd = String(twoWeeksAgo.getDate()).padStart(2, '0');
    const targetDt = `${yyyy}${mm}${dd}`;

    // Kobis API에서 주간 박스오피스 조회
    const boxoffice = await getWeeklyBoxOffice({ targetDt, weekGb: '0' });
    const list = boxoffice.boxOfficeResult.weeklyBoxOfficeList;
    if (!list || list.length === 0) return res.status(404).json({ error: '박스오피스 데이터 없음' });

    let saved = 0, failed = 0;
    for (const item of list) {
      try {
        let movie = await Movie.findOne({ where: { title: item.movieNm, release_date: item.openDt } });
        if (!movie) {
          const searchResult = await searchMovie(item.movieNm);
          if (!searchResult.results || searchResult.results.length === 0) throw new Error('TMDB 검색 실패');
          const tmdbMovie = searchResult.results[0];
          const detail = await getMovieDetail(tmdbMovie.id);
          const credits = await getMovieCredits(tmdbMovie.id);

          const genres = (detail.genres || []).map(g => g.name);
          const country = (detail.production_countries && detail.production_countries[0]?.name) || null;
          const poster_url = detail.poster_path ? `https://image.tmdb.org/t/p/w780${detail.poster_path}` : null;
          const average_rating = detail.vote_average;
          const overview = detail.overview;
          const release_date = detail.release_date;

          movie = await Movie.create({
            tmdb_id: tmdbMovie.id,
            title: detail.title,
            release_date,
            country,
            poster_url,
            average_rating,
            overview,
            rank: parseInt(item.rank, 10)
          });

          for (const tagName of genres) {
            let tag = await Tag.findOne({ where: { tag_name: tagName } });
            if (!tag) tag = await Tag.create({ tag_name: tagName });
            await MovieTag.findOrCreate({ where: { movie_id: movie.movie_id, tag_id: tag.tag_id } });
          }

          const directors = credits.crew.filter(c => c.job === 'Director').map(c => ({ name: c.name, role: 'PD' }));
          const actors = credits.cast.map(a => ({ name: a.name, role: a.character }));
          for (const d of directors) {
            await Cast.findOrCreate({
              where: { movie_id: movie.movie_id, name: d.name, role: d.role },
              defaults: { tmdb_person_id: 0, profile_url: null }
            });
          }
          for (const a of actors) {
            await Cast.findOrCreate({
              where: { movie_id: movie.movie_id, name: a.name, role: a.role },
              defaults: { tmdb_person_id: 0, profile_url: null }
            });
          }
        }
        saved++;
      } catch (e) {
        failed++;
      }
    }
    res.json({ message: '2주전 주간 박스오피스 저장 완료', saved, failed });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Kobis 영화명 검색 API (공식 REST 주소 활용, TMDB 포스터 병합)
router.get('/movie/list', async (req, res) => {
  const { movieNm } = req.query;
  if (!movieNm) return res.status(400).json({ error: 'movieNm 파라미터 필요' });
  try {
    const axios = require('axios');
    const url = `http://www.kobis.or.kr/kobisopenapi/webservice/rest/movie/searchMovieList.json?key=ab9a00aeaf9f99c8bf2302f022e3e68a`;
    const params = { movieNm };
    const response = await axios.get(url, { params });
    // 영화명에 movieNm이 포함된 결과만 반환 (대소문자 구분 없이)
    let list = (response.data.movieListResult?.movieList || []).filter(m => m.movieNm && m.movieNm.toLowerCase().includes(movieNm.toLowerCase()));
    // TMDB 포스터 병합 (최대 10개만)
    list = await Promise.all(list.slice(0, 10).map(async m => {
      let poster_url = null;
      try {
        const tmdb = await searchMovie(m.movieNm);
        if (tmdb.results && tmdb.results.length > 0 && tmdb.results[0].poster_path) {
          poster_url = `https://image.tmdb.org/t/p/w780${tmdb.results[0].poster_path}`;
        }
      } catch {}
      return { ...m, poster_url };
    }));
    res.json({ movies: list });
  } catch (err) {
    res.status(500).json({ error: 'Kobis 영화 검색 실패', detail: err.message });
  }
});

// 실시간 2주전 주간 박스오피스 순위 리스트 + DB 영화 정보 매핑
router.get('/boxoffice', async (req, res) => {
  try {
    const today = new Date();
    today.setDate(today.getDate() - 14);
    const twoWeeksAgoSunday = new Date(today.setDate(today.getDate() - today.getDay() || 7));
    const year = twoWeeksAgoSunday.getFullYear();
    const month = (twoWeeksAgoSunday.getMonth() + 1).toString().padStart(2, '0');
    const day = twoWeeksAgoSunday.getDate().toString().padStart(2, '0');
    const targetDt = `${year}${month}${day}`;
    const data = await getWeeklyBoxOffice({ targetDt, weekGb: '0' });
    const boxofficeList = data.boxOfficeResult?.weeklyBoxOfficeList || [];

    // DB에서 영화 정보 매핑 (title+release_date 기준)
    const movieInfos = await Promise.all(
      boxofficeList.map(async (item) => {
        const movie = await Movie.findOne({ where: { title: item.movieNm, release_date: item.openDt } });
        return {
          rank: item.rank,
          movieNm: item.movieNm,
          openDt: item.openDt,
          audiAcc: item.audiAcc,
          ...movie ? { dbMovie: movie } : {}
        };
      })
    );
    res.json({ boxofficeList: movieInfos });
  } catch (err) {
    res.status(500).json({ error: '박스오피스 API/DB 조회 실패' });
  }
});

module.exports = router;