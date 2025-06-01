// MovieTag 모델 정의
module.exports = (sequelize, DataTypes) => {
  const MovieTag = sequelize.define('MovieTag', {
    movie_id: { type: DataTypes.INTEGER, allowNull: false, primaryKey: true },
    tag_id: { type: DataTypes.INTEGER, allowNull: false, primaryKey: true }
  }, {
    tableName: 'movietags',
    timestamps: false
  });
  return MovieTag;
};
