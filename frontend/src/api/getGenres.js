import axios from "axios";

const API = axios.create({
  baseURL: "https://api.themoviedb.org/3",
  headers: {
    Authorization: `Bearer ${process.env.REACT_APP_TMDB_TOKEN}`,
  },
});

// 장르 목록 가져오기
export const getGenres = async () => {
  try {
    const res = await API.get("/genre/movie/list?language=ko");
    return res.data.genres;
  } catch (error) {
    console.error("TMDB 장르 목록 불러오기 실패:", error);
    return [];
  }
};
