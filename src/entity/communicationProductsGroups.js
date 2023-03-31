/* jshint indent: 1 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('communicationProductsGroups', {
    id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
      field: 'id'
    },
    communicationProductsGroupName: {
      type: DataTypes.STRING(200),
      allowNull: false,
      field: 'communicationProductsGroupName'
    },
    communicationProductsGroupDescriptions: {
      type: DataTypes.STRING(500),
      allowNull: true,
      field: 'communicationProductsGroupDescriptions'
    },
    userCreatorsId: {
      type: DataTypes.BIGINT,
      allowNull: false,
      field: 'userCreatorsId'
    },
    dateCreated: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
      field: 'dateCreated'
    },
    dateUpdated: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
      field: 'dateUpdated'
    },
    status: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'status'
    }
  }, {
    tableName: 'communicationProductsGroups',
    timestamps: false
  });
};
