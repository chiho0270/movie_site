const Sequelize = require('sequelize');
const config = require('../config/config.js').development;

const db = {};
const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  config
);

db.sequelize = sequelize;
db.Sequelize = Sequelize;

// 모델 등록
db.User = require('./user')(sequelize, Sequelize.DataTypes);
db.Movie = require('./movie')(sequelize, Sequelize.DataTypes);

module.exports = db;
