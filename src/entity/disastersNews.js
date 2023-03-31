/* jshint indent: 1 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define(
    'disastersNews',
    {
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
      newsId: {
        type: DataTypes.BIGINT,
        allowNull: false,
        field: 'newsId'
      }
    },
    {
      tableName: 'disastersNews',
      timestamps: false
    }
  );
};
