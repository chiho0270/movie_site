// Tag 모델 정의
module.exports = (sequelize, DataTypes) => {
  const Tag = sequelize.define('Tag', {
    tag_id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    tag_name: { type: DataTypes.STRING(50), unique: true, allowNull: false }
  }, {
    tableName: 'tags',
    timestamps: false
  });
  return Tag;
};
