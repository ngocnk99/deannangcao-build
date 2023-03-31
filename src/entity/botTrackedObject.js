/* jshint indent: 1 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define(
    'botTrackedObject',
    {
      id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
        field: 'id'
      },
      trackedObjectId: {
        type: DataTypes.STRING(50),
        allowNull: true,
        field: 'trackedObjectId'
      },
      trackedObjectUrl: {
        type: DataTypes.STRING(500),
        allowNull: true,
        field: 'trackedObjectUrl'
      },
      isJoin: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'isJoin'
      },
      trackedObjectName: {
        type: DataTypes.STRING(1000),
        allowNull: true,
        field: 'trackedObjectName'
      },
      trackedObjectInfo: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'trackedObjectInfo'
      },
      trackedObjectType: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'trackedObjectType'
      },
      lastTrackTime: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'lastTrackTime'
      },
      dateCreated: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
        field: 'dateCreated'
      },
      userCreatorsId: {
        type: DataTypes.BIGINT,
        allowNull: true,
        field: 'userCreatorsId'
      },
      status: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'status'
      },
      isSpecified: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'isSpecified'
      },
      botAccountsId: {
        type: DataTypes.BIGINT,
        allowNull: true,
        field: 'botAccountsId'
      }
    },
    {
      tableName: 'botTrackedObject',
      timestamps: false
    }
  );
};
