// Review 모델 정의
module.exports = (sequelize, DataTypes) => {
  const Review = sequelize.define('Review', {
    review_id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    user_id: { type: DataTypes.INTEGER, allowNull: false },
    movie_id: { type: DataTypes.INTEGER, allowNull: false },
    comment: { type: DataTypes.TEXT, allowNull: false },
    rating: { type: DataTypes.DECIMAL(3,1), allowNull: false },
    likes: { type: DataTypes.INTEGER, defaultValue: 0 },
    is_pro_review: { type: DataTypes.BOOLEAN, defaultValue: false },
    created_at: { type: DataTypes.DATE, defaultValue: sequelize.literal('CURRENT_TIMESTAMP') },
    updated_at: { type: DataTypes.DATE }
  }, {
    tableName: 'reviews',
    timestamps: false
  });
  return Review;
};
