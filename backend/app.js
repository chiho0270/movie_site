const express = require('express');
const app = express();
const db = require('./models');
const authRouter = require('./routers/auth');
const boxofficeRouter = require('./routers/boxoffice');
const kobisRouter = require('./routers/kobis');
const adminRouter = require('./routers/admin');
const cors = require('cors');
require('./utils/boxofficeScheduler');

app.use(cors());
app.use(express.json());
app.use('/api', authRouter);
app.use('/api/search', boxofficeRouter);
app.use('/api/kobis', kobisRouter);
app.use('/api/admin', adminRouter);


db.sequelize.sync().then(() => {
  app.listen(5000, () => {
    console.log('Server running on http://localhost:5000');
  });
});