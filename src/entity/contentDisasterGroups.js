/* jshint indent: 1 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('contentDisasterGroups', {
    id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
      field: 'id'
    },
    disasterGroupsId: {
      type: DataTypes.BIGINT,
      allowNull: false,
      field: 'disasterGroupsId'
    },
    contentsId: {
      type: DataTypes.BIGINT,
      allowNull: false,
      field: 'contentsId'
    }
  }, {
    tableName: 'contentDisasterGroups',
    timestamps: false
  });
};
