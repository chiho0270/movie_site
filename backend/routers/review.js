const express = require('express');
const router = express.Router();
const { Review } = require('../models');
const { authenticateToken } = require('../auth');

// 리뷰 전체 조회
router.get('/', async (req, res) => {
  try {
    const reviews = await Review.findAll();
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ error: '리뷰 전체 조회 실패' });
  }
});

// 특정 리뷰 조회
router.get('/:id', async (req, res) => {
  try {
    const review = await Review.findByPk(req.params.id);
    if (!review) return res.status(404).json({ error: '리뷰를 찾을 수 없음' });
    res.json(review);
  } catch (err) {
    res.status(500).json({ error: '리뷰 조회 실패' });
  }
});

// 특정 영화의 리뷰 조회
router.get('/movie/:movie_id', async (req, res) => {
  try {
    const { User } = require('../models');
    const reviews = await Review.findAll({ 
      where: { movie_id: req.params.movie_id },
    });
    // 각 리뷰에 대해 user_id로 User 정보 조회 후 username, user_role만 추가
    const reviewsWithUser = await Promise.all(reviews.map(async r => {
      const reviewObj = r.toJSON();
      const user = await User.findByPk(reviewObj.user_id, { attributes: ['username', 'user_role'] });
      if (user) {
        reviewObj.username = user.username;
        reviewObj.user_role = user.user_role;
      }
      return reviewObj;
    }));
    res.json(reviewsWithUser);
  } catch (err) {
    res.status(500).json({ error: '영화 리뷰 조회 실패' });
  }
});

// 리뷰 생성
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { movie_id, comment, rating, is_pro_review } = req.body;
    const user_id = req.user.userId;
    // 권한 체크 없이 is_pro_review 값 그대로 저장 (구분 역할)
    const review = await Review.create({
      user_id,
      movie_id,
      comment,
      rating,
      is_pro_review: is_pro_review ?? false
    });
    res.status(201).json(review);
  } catch (err) {
    res.status(500).json({ error: '리뷰 생성 실패' });
  }
});

// 리뷰 수정
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const review = await Review.findByPk(req.params.id);
    if (!review) return res.status(404).json({ error: '리뷰를 찾을 수 없음' });
    if (review.user_id !== req.user.userId) return res.status(403).json({ error: '권한 없음' });
    const { comment, rating, is_pro_review } = req.body;
    // 권한 체크 없이 is_pro_review 값 그대로 저장 (구분 역할)
    review.comment = comment ?? review.comment;
    review.rating = rating ?? review.rating;
    review.is_pro_review = is_pro_review ?? review.is_pro_review;
    await review.save();
    res.json(review);
  } catch (err) {
    res.status(500).json({ error: '리뷰 수정 실패' });
  }
});

// 리뷰 삭제
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const review = await Review.findByPk(req.params.id);
    if (!review) return res.status(404).json({ error: '리뷰를 찾을 수 없음' });
    // 작성자 또는 관리자만 삭제 가능
    if (review.user_id !== req.user.userId && req.user.user_role !== 'Admin') {
      return res.status(403).json({ error: '권한 없음' });
    }
    await review.destroy();
    res.json({ message: '리뷰 삭제 완료' });
  } catch (err) {
    res.status(500).json({ error: '리뷰 삭제 실패' + ' ' + err.message});
  }
});

module.exports = router;