/* jshint indent: 1 */

module.exports = function(sequelize, DataTypes) {
    return sequelize.define('disastersContents', {
      id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
        field: 'id'
      },
      disastersId: {
        type: DataTypes.BIGINT,
        allowNull: false,
        field: 'disastersId'
      },
      contentsId: {
        type: DataTypes.BIGINT,
        allowNull: false,
        field: 'contentsId'
      }
    }, {
      tableName: 'disastersContents',
      timestamps: false
    });
  };
  