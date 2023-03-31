/* jshint indent: 1 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define(
    'typeOfNews',
    {
      id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
        field: 'id'
      },
      typeOfNewName: {
        type: DataTypes.STRING(200),
        allowNull: false,
        field: 'typeOfNewName'
      },
      typeOfNewParentId: {
        type: DataTypes.BIGINT,
        allowNull: true,
        defaultValue: 0,
        field: 'typeOfNewParentId'
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
      keywords: {
        type: DataTypes.JSON,
        allowNull: false,
        defaultValue: [],
        field: 'keywords'
      },
      status: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'status'
      },
      isLoad: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'isLoad'
      },
      witAiIntentName: {
        type: DataTypes.STRING(200),
        allowNull: true,
        field: 'witAiIntentName'
      }
    },
    {
      tableName: 'typeOfNews',
      timestamps: false
    }
  );
};
