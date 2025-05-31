module.exports = (sequelize, DataTypes) => {
  const Movie = sequelize.define('Movie', {
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    rank: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
    
  });
  return Movie;
};