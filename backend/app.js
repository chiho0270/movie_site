const express = require('express');
const cors = require('cors');
const app = express();
const db = require('./models');
const authRouter = require('./routers/auth');
const kobisRouter = require('./routers/kobis');
const movieRouter = require('./routers/movie');
const userRouter = require('./routers/user');
const reviewRouter = require('./routers/review');
const tagRouter = require('./routers/tag');

// 미들웨어 설정 ( CORS 설정 포함 )
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));

app.use(express.json());
app.use('/api/auth', authRouter);
app.use('/api/kobis', kobisRouter);
app.use('/api/movie', movieRouter);
app.use('/api/user', userRouter);
app.use('/api/review', reviewRouter);
app.use('/api/tag', tagRouter);


db.sequelize.sync().then(() => {
  app.listen(5000, () => {
    console.log('Server running on http://localhost:5000');
  });
});