/* jshint indent: 1 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define(
    'botTypeOfTrackedObject',
    {
      id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
        field: 'id'
      },
      botTypeOfTrackedObjectName: {
        type: DataTypes.STRING(200),
        allowNull: false,
        field: 'botTypeOfTrackedObjectName'
      },
      botTypeOfTrackedObjectIcon: {
        type: DataTypes.STRING(1000),
        allowNull: true,
        field: 'botTypeOfTrackedObjectIcon'
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
    },
    {
      tableName: 'botTypeOfTrackedObject',
      timestamps: false
    }
  );
};
