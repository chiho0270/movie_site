// TMDB API 연동 유틸리티
require('dotenv').config();
const axios = require('axios');

const TMDB_API_KEY = process.env.TMDB_API_KEY || 'your-tmdb-key';
const TMDB_HOST = 'https://api.themoviedb.org/3';

async function tmdbGet(endpoint, params = {}) {
  const url = `${TMDB_HOST}${endpoint}`;
  const query = { api_key: TMDB_API_KEY, language: 'ko-KR', ...params };
  try {
    const res = await axios.get(url, { params: query });
    return res.data;
  } catch (err) {
    throw new Error(err.response?.data?.status_message || err.message);
  }
}

module.exports = {
  searchMovie: (query) => tmdbGet('/search/movie', { query }),
  getMovieDetail: (movieId) => tmdbGet(`/movie/${movieId}`),
  getMovieCredits: (movieId) => tmdbGet(`/movie/${movieId}/credits`),
};
