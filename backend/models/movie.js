// Movie 모델 정의
module.exports = (sequelize, DataTypes) => {
  const Movie = sequelize.define('Movie', {
    movie_id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    tmdb_id: { type: DataTypes.INTEGER, unique: true, allowNull: false },
    title: { type: DataTypes.STRING(255), allowNull: false },
    release_date: { type: DataTypes.DATEONLY, allowNull: false },
    country: { type: DataTypes.STRING(100) },
    average_rating: { type: DataTypes.DECIMAL(3,1), defaultValue: 0.0 },
    poster_url: { type: DataTypes.STRING(255) },
    overview: { type: DataTypes.TEXT },
    created_at: { type: DataTypes.DATE, defaultValue: sequelize.literal('CURRENT_TIMESTAMP') },
    updated_at: { type: DataTypes.DATE }
  }, {
    tableName: 'movies',
    timestamps: false
  });
  return Movie;
};
