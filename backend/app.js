const express = require('express');
const app = express();
const db = require('./models');
const authRouter = require('./routes/auth');
const boxofficeRouter = require('./routes/boxoffice');

app.use(express.json());
app.use('/api', authRouter);
app.use('/api/search', boxofficeRouter);


db.sequelize.sync().then(() => {
  app.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
  });
});