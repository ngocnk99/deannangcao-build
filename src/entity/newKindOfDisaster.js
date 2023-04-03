/* jshint indent: 1 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define(
    'newKindOfDisaster',
    {
      id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
        field: 'id'
      },
      newKindOfDisasterName: {
        type: DataTypes.STRING(200),
        allowNull: false,
        field: 'newKindOfDisasterName'
      },
      witAiEntityName: {
        type: DataTypes.STRING(500),
        allowNull: false,
        field: 'witAiEntityName'
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
      witaiKeywords: {
        type: DataTypes.JSON,
        defaultValue: [],
        field: 'witaiKeywords'
      }
    },
    {
      tableName: 'newKindOfDisaster',
      timestamps: false
    }
  );
};
