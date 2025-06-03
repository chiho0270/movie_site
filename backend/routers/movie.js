const express = require('express');
const router = express.Router();
const { Movie, Tag, MovieTag, Cast } = require('../models');
const { searchMovie, getMovieDetail, getMovieCredits } = require('../utils/tmdbApi');
const { Op } = require('sequelize');

// 영화 저장: 제목 검색 → TMDB 정보 저장
router.post('/save', async (req, res) => {
  const { title } = req.body;
  if (!title) return res.status(400).json({ error: '영화 제목이 필요합니다.' });
  try {
    // 1. TMDB에서 영화 검색
    const cleanTitle = title.replace(/(극장판|완결편)/g, '').trim();
    const searchResult = await searchMovie(cleanTitle);
    if (!searchResult.results || searchResult.results.length === 0) {
      return res.status(404).json({ error: 'TMDB에서 영화를 찾을 수 없습니다.' });
    }
    const movieData = searchResult.results[0];
    const tmdb_id = movieData.id;

    // 2. 상세 정보/크레딧
    const [detail, credits] = await Promise.all([
      getMovieDetail(tmdb_id),
      getMovieCredits(tmdb_id)
    ]);

    // 3. 주요 정보 추출
    const genres = (detail.genres || []).map(g => g.name);
    const release_date = detail.release_date;
    const country = (detail.production_countries && detail.production_countries[0]?.name) || null;
    const poster_url = detail.poster_path ? `https://image.tmdb.org/t/p/w780${detail.poster_path}` : null;
    const average_rating = detail.vote_average;
    const overview = detail.overview;
    const certification = (detail.release_dates?.results?.find(r => r.iso_3166_1 === 'KR')?.release_dates[0]?.certification) || null;

    // 4. 감독/출연진
    const directors = credits.crew.filter(c => c.job === 'Director').map(c => ({ name: c.name, role: 'PD' }));
    const actors = credits.cast.map(a => ({ name: a.name, role: a.character }));

    // 5. DB 저장 (중복 방지)
    let movie = await Movie.findOne({ where: { tmdb_id } });
    if (!movie) {
      movie = await Movie.create({
        tmdb_id,
        title: detail.title,
        release_date,
        country,
        poster_url,
        average_rating,
        overview
      });
    }

    // 6. 장르/심의등급 태그 저장 및 연결
    const tagNames = [...genres, certification].filter(Boolean);
    for (const tagName of tagNames) {
      let tag = await Tag.findOne({ where: { tag_name: tagName } });
      if (!tag) tag = await Tag.create({ tag_name: tagName });
      await MovieTag.findOrCreate({ where: { movie_id: movie.movie_id, tag_id: tag.tag_id } });
    }

    // 7. 감독/출연진 저장
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

    res.json({ message: '영화 저장 완료', movie_id: movie.movie_id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 영화 저장: TMDB 고유 ID로 저장
router.post('/saveByTmdbId', async (req, res) => {
  const { tmdb_id } = req.body;
  if (!tmdb_id) return res.status(400).json({ error: 'tmdb_id가 필요합니다.' });
  try {
    // 1. TMDB에서 상세 정보/크레딧
    const [detail, credits] = await Promise.all([
      getMovieDetail(tmdb_id),
      getMovieCredits(tmdb_id)
    ]);

    // 2. 주요 정보 추출
    const genres = (detail.genres || []).map(g => g.name);
    const release_date = detail.release_date;
    const country = (detail.production_countries && detail.production_countries[0]?.name) || null;
    const poster_url = detail.poster_path ? `https://image.tmdb.org/t/p/w780${detail.poster_path}` : null;
    const average_rating = detail.vote_average;
    const overview = detail.overview;
    const certification = (detail.release_dates?.results?.find(r => r.iso_3166_1 === 'KR')?.release_dates[0]?.certification) || null;

    // 3. 감독/출연진
    const directors = credits.crew.filter(c => c.job === 'Director').map(c => ({ name: c.name, role: 'PD' }));
    const actors = credits.cast.map(a => ({ name: a.name, role: a.character }));

    // 4. DB 저장 (중복 방지)
    let movie = await Movie.findOne({ where: { tmdb_id } });
    if (!movie) {
      movie = await Movie.create({
        tmdb_id,
        title: detail.title,
        release_date,
        country,
        poster_url,
        average_rating,
        overview
      });
    }

    // 5. 장르/심의등급 태그 저장 및 연결
    const tagNames = [...genres, certification].filter(Boolean);
    for (const tagName of tagNames) {
      let tag = await Tag.findOne({ where: { tag_name: tagName } });
      if (!tag) tag = await Tag.create({ tag_name: tagName });
      await MovieTag.findOrCreate({ where: { movie_id: movie.movie_id, tag_id: tag.tag_id } });
    }

    // 6. 감독/출연진 저장
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

    res.json({ message: '영화 저장 완료', movie_id: movie.movie_id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 영화 삭제: movie_id, tmdb_id로만 삭제 지원, 'all' 방지
router.delete('/delete/:id', async (req, res) => {
  const { id } = req.params;
  if (id === 'all') {
    return res.status(400).json({ error: '잘못된 요청입니다.' });
  }
  let movie = null;
  // 숫자면 movie_id, 아니면 tmdb_id로 검색
  if (!isNaN(Number(id))) {
    movie = await Movie.findOne({ where: { movie_id: id } });
  }
  if (!movie) {
    movie = await Movie.findOne({ where: { tmdb_id: id } });
  }
  if (!movie) return res.status(404).json({ error: '영화를 찾을 수 없습니다.' });
  await movie.destroy();
  res.json({ message: '영화 삭제 완료', movie_id: movie.movie_id });
});

// 모든 영화 삭제 (연관된 태그, 출연진 등도 cascade)
router.delete('/delete/all', async (req, res) => {
  try {
    await Cast.destroy({ where: {} });
    await MovieTag.destroy({ where: {} });
    await Movie.destroy({ where: {} });
    res.json({ message: '모든 영화 삭제 완료' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 영화 개봉일 순 목록 조회
router.get('/release', async (req, res) => {
  try {
    const movies = await Movie.findAll({ order: [['release_date', 'DESC']] });
    res.json({ movies });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 장르별 목록 조회 (tag_name으로 필터)
router.get('/genre/:genre', async (req, res) => {
  const { genre } = req.params;
  try {
    const movies = await Movie.findAll({
      include: [{
        model: Tag,
        where: { tag_name: genre },
        through: { attributes: [] }
      }]
    });
    res.json({ movies });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 박스오피스 순위별 목록 조회 (rank 오름차순)
router.get('/boxoffice', async (req, res) => {
  try {
    const movies = await Movie.findAll({ order: [['rank', 'ASC']] });
    res.json({ movies });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 영화 목록 조회
router.get('/list', async (req, res) => {
  try {
    const movies = await Movie.findAll({
      include: [
        { model: Cast },
        { model: Tag, through: { attributes: [] } }
      ],
      order: [['release_date', 'DESC']]
    });
    res.json({ movies });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 영화 id로 상세 정보 조회
router.get('/:movie_id', async (req, res) => {
  const { movie_id } = req.params;
  try {
    const movie = await Movie.findOne({
      where: { movie_id },
      include: [
        { model: Cast },
        { model: Tag, through: { attributes: [] } }
      ]
    });
    if (!movie) return res.status(404).json({ error: '영화를 찾을 수 없습니다.' });
    res.json({ movie });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 영화 id 또는 제목으로 상세 정보 조회
router.get('/detail', async (req, res) => {
  const { movie_id, title } = req.query;
  try {
    let where = {};
    if (movie_id) where.movie_id = movie_id;
    if (title) where.title = title;
    if (!movie_id && !title) return res.status(400).json({ error: 'movie_id 또는 title 파라미터 필요' });
    const movie = await Movie.findOne({
      where,
      include: [
        { model: Cast },
        { model: Tag, through: { attributes: [] } }
      ]
    });
    if (!movie) return res.status(404).json({ error: '영화를 찾을 수 없습니다.' });
    res.json({ movie });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// TMDB id로 상세 정보 조회 (DB에 없을 때)
router.get('/tmdb/:id', async (req, res) => {
  const { id } = req.params;
  const { getMovieDetail, getMovieCredits } = require('../utils/tmdbApi');
  try {
    const detail = await getMovieDetail(id);
    if (!detail) return res.status(404).json({ error: 'TMDB에서 영화를 찾을 수 없습니다.' });
    const credits = await getMovieCredits(id);
    // 최소한의 정보만 반환
    res.json({
      movie: {
        title: detail.title,
        release_date: detail.release_date,
        poster_url: detail.poster_path ? `https://image.tmdb.org/t/p/w780${detail.poster_path}` : null,
        average_rating: detail.vote_average,
        overview: detail.overview,
        country: (detail.production_countries && detail.production_countries[0]?.name) || null,
        Casts: credits ? credits.cast.map(a => ({ name: a.name, role: a.character })) : []
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
