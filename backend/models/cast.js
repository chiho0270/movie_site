// Cast 모델 정의
module.exports = (sequelize, DataTypes) => {
  const Cast = sequelize.define('Cast', {
    cast_id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    movie_id: { type: DataTypes.INTEGER, allowNull: false },
    tmdb_person_id: { type: DataTypes.INTEGER, allowNull: false },
    name: { type: DataTypes.STRING(100), allowNull: false },
    role: { type: DataTypes.STRING(100), allowNull: false },
    profile_url: { type: DataTypes.STRING(255) }
  }, {
    tableName: 'casts',
    timestamps: false
  });
  return Cast;
};
