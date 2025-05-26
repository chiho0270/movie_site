const express = require('express');
const app = express();
const { sequelize, User } = require('./models');
const authRouter = require('./routes/auth');
const { authenticateToken } = require('./auth');

app.use(express.json());
app.use('/api', authRouter);


app.get('/api/me', authenticateToken, async (req, res) => {
    const user = await User.findByPk(req.user.userId);
    if (!user) return res.sendStatus(404);
    res.json({ id: user.id, username: user.username });
});

// DB 동기화 후 서버 시작
sequelize.sync().then(() => {
    app.listen(3000, () => {
        console.log('Server started on http://localhost:3000');
    });
});
