/* jshint indent: 1 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define(
    'newGroups',
    {
      id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
        field: 'id'
      },
      newGroupsName: {
        type: DataTypes.STRING(100),
        allowNull: false,
        field: 'newGroupsName'
      },
      urlSlug: {
        type: DataTypes.STRING(500),
        allowNull: true,
        field: 'urlSlug'
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
        type: DataTypes.INTEGER(1),
        allowNull: true,
        defaultValue: 1,
        field: 'status'
      }
    },
    {
      tableName: 'newGroups',
      timestamps: false
    }
  );
};
