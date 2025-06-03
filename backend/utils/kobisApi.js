require('dotenv').config();

const axios = require('axios');

const KOBIS_API_KEY = process.env.KOBIS_API_KEY || 'your-key'; // Kobis API 키
const KOBIS_HOST = 'http://www.kobis.or.kr/kobisopenapi/webservice/rest';

const ENDPOINTS = {
  DAILY_BOXOFFICE: '/boxoffice/searchDailyBoxOfficeList.json',
  WEEKLY_BOXOFFICE: '/boxoffice/searchWeeklyBoxOfficeList.json',
  MOVIE_LIST: '/movie/searchMovieList.json',
  MOVIE_INFO: '/movie/searchMovieInfo.json',
  COMPANY_LIST: '/company/searchCompanyList.json',
  COMPANY_INFO: '/company/searchCompanyInfo.json',
  PEOPLE_LIST: '/people/searchPeopleList.json',
  PEOPLE_INFO: '/people/searchPeopleInfo.json',
  CODE_LIST: '/code/searchCodeList.json',
};

async function kobisGet(endpoint, params = {}) {
  const url = `${KOBIS_HOST}${endpoint}`;
  const query = { key: KOBIS_API_KEY, ...params };
  try {
    const res = await axios.get(url, { params: query });
    return res.data;
  } catch (err) {
    throw new Error(err.response?.data || err.message);
  }
}

module.exports = {
  getDailyBoxOffice: (params) => kobisGet(ENDPOINTS.DAILY_BOXOFFICE, params),
  getWeeklyBoxOffice: (params) => kobisGet(ENDPOINTS.WEEKLY_BOXOFFICE, params),
  getMovieList: (params) => kobisGet(ENDPOINTS.MOVIE_LIST, params),
  getMovieInfo: (params) => kobisGet(ENDPOINTS.MOVIE_INFO, params),
  getCompanyList: (params) => kobisGet(ENDPOINTS.COMPANY_LIST, params),
  getCompanyInfo: (params) => kobisGet(ENDPOINTS.COMPANY_INFO, params),
  getPeopleList: (params) => kobisGet(ENDPOINTS.PEOPLE_LIST, params),
  getPeopleInfo: (params) => kobisGet(ENDPOINTS.PEOPLE_INFO, params),
  getCodeList: (params) => kobisGet(ENDPOINTS.CODE_LIST, params),
};
