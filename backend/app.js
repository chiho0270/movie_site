const express = require('express');
const app = express();
const db = require('./models');
const authRouter = require('./routes/auth');

app.use(express.json());
app.use('/api', authRouter);

db.sequelize.sync().then(() => {
  app.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
  });
});
