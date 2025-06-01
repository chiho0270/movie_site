// backend/utils/kobisApi.js
const axios = require('axios');

const KOBIS_API_KEY = process.env.KOBIS_API_KEY || 'ab9a00aeaf9f99c8bf2302f022e3e68a';
const KOBIS_HOST = 'http://www.kobis.or.kr';

const ENDPOINTS = {
  DAILY_BOXOFFICE: '/kobisopenapi/webservice/rest/boxoffice/searchDailyBoxOfficeList.json',
  WEEKLY_BOXOFFICE: '/kobisopenapi/webservice/rest/boxoffice/searchWeeklyBoxOfficeList.json',
  MOVIE_LIST: '/kobisopenapi/webservice/rest/movie/searchMovieList.json',
  MOVIE_INFO: '/kobisopenapi/webservice/rest/movie/searchMovieInfo.json',
  COMPANY_LIST: '/kobisopenapi/webservice/rest/company/searchCompanyList.json',
  COMPANY_INFO: '/kobisopenapi/webservice/rest/company/searchCompanyInfo.json',
  PEOPLE_LIST: '/kobisopenapi/webservice/rest/people/searchPeopleList.json',
  PEOPLE_INFO: '/kobisopenapi/webservice/rest/people/searchPeopleInfo.json',
  CODE_LIST: '/kobisopenapi/webservice/rest/code/searchCodeList.json',
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
