module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    user_id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    username: { type: DataTypes.STRING(50), unique: true, allowNull: false },
    email: { type: DataTypes.STRING(100), unique: true, allowNull: false },
    password: { type: DataTypes.STRING(255), allowNull: false },
    full_name: { type: DataTypes.STRING(100), allowNull: false },
    birth_date: { type: DataTypes.DATEONLY, allowNull: false },
    gender: { type: DataTypes.ENUM('Male', 'Female', 'Other'), allowNull: false },
    user_role: { type: DataTypes.ENUM('Admin', 'ProReviewer', 'GeneralReviewer'), allowNull: false, defaultValue: 'GeneralReviewer' },
    created_at: { type: DataTypes.DATE, defaultValue: sequelize.literal('CURRENT_TIMESTAMP') },
    updated_at: { type: DataTypes.DATE }
  }, {
    tableName: 'users',
    timestamps: false
  });
  return User;
};
