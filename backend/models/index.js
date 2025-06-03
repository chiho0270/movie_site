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
db.Tag = require('./tag')(sequelize, Sequelize.DataTypes);
db.MovieTag = require('./movietag')(sequelize, Sequelize.DataTypes);
db.Review = require('./review')(sequelize, Sequelize.DataTypes);
db.Cast = require('./cast')(sequelize, Sequelize.DataTypes);

// User - Review (1:N)
db.User.hasMany(db.Review, { foreignKey: 'user_id' });
db.Review.belongsTo(db.User, { foreignKey: 'user_id' });

// Movie - Review (1:N)
db.Movie.hasMany(db.Review, { foreignKey: 'movie_id' });
db.Review.belongsTo(db.Movie, { foreignKey: 'movie_id' });

// Movie - Cast (1:N)
db.Movie.hasMany(db.Cast, { foreignKey: 'movie_id' });
db.Cast.belongsTo(db.Movie, { foreignKey: 'movie_id' });

// Movie - Tag (N:M)
db.Movie.belongsToMany(db.Tag, { through: db.MovieTag, foreignKey: 'movie_id', otherKey: 'tag_id' });
db.Tag.belongsToMany(db.Movie, { through: db.MovieTag, foreignKey: 'tag_id', otherKey: 'movie_id' });

module.exports = db;
