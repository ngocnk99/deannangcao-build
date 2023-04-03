/* jshint indent: 1 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define(
    'contents',
    {
      id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
        field: 'id'
      },
      contentName: {
        type: DataTypes.STRING(200),
        allowNull: false,
        field: 'contentName'
      },
      producersId: {
        type: DataTypes.BIGINT,
        allowNull: true,
        field: 'producersId'
      },
      contentProductionDate: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'contentProductionDate'
      },
      communicationProductsGroupsId: {
        type: DataTypes.BIGINT,
        allowNull: false,
        field: 'communicationProductsGroupsId'
      },
      phasesOfDisastersId: {
        type: DataTypes.BIGINT,
        allowNull: true,
        field: 'phasesOfDisastersId'
      },
      contentShortDescriptions: {
        type: DataTypes.STRING(500),
        allowNull: true,
        field: 'contentShortDescriptions'
      },
      contentDescriptions: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'contentDescriptions'
      },
      contentImages: {
        type: DataTypes.JSON,
        allowNull: false,
        field: 'contentImages',
        defaultValue: '[]'
      },
      contentFiles: {
        type: DataTypes.JSON,
        allowNull: false,
        field: 'contentFiles',
        defaultValue: '[]'
      },
      contentDesignFiles: {
        type: DataTypes.JSON,
        allowNull: false,
        field: 'contentDesignFiles',
        defaultValue: '[]'
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
      },
      views: {
        type: DataTypes.BIGINT,
        allowNull: true,
        defaultValue: 0,
        field: 'views'
      },
      shares: {
        type: DataTypes.BIGINT,
        allowNull: true,
        defaultValue: 0,
        field: 'shares'
      }
    },
    {
      tableName: 'contents',
      timestamps: false
    }
  );
};
