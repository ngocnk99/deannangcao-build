/* jshint indent: 1 */

module.exports = function(sequelize, DataTypes) {
    return sequelize.define('newsTypeOfNews', {
      id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
        field: 'id'
      },
      newsId: {
        type: DataTypes.BIGINT,
        allowNull: false,
        field: 'newsId'
      },
      typeOfNewsId: {
        type: DataTypes.BIGINT,
        allowNull: true,
        defaultValue:0,
        field: 'typeOfNewsId'
      }
    }, {
      tableName: 'newsTypeOfNews',
      timestamps: false
    });
  };
  