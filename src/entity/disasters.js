/* jshint indent: 1 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define(
    'disasters',
    {
      id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
        field: 'id'
      },
      disasterName: {
        type: DataTypes.STRING(300),
        allowNull: false,
        field: 'disasterName'
      },
      disasterVndmsId: {
        type: DataTypes.BIGINT,
        allowNull: true,
        field: 'disasterVndmsId'
      },
      disasterGroupsId: {
        type: DataTypes.BIGINT,
        allowNull: false,
        field: 'disasterGroupsId'
      },
      disasterLongitude: {
        type: DataTypes.DOUBLE,
        allowNull: true,
        field: 'disasterLongitude'
      },
      disasterLatitude: {
        type: DataTypes.DOUBLE,
        allowNull: true,
        field: 'disasterLatitude'
      },
      disasterDescriptions: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'disasterDescriptions'
      },
      disasterLevel: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'disasterLevel'
      },
      disasterIsClosed: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        field: 'disasterIsClosed'
      },
      affectedArea: {
        type: DataTypes.STRING(200),
        allowNull: true,
        field: 'affectedArea'
      },
      disasterLevelOfRisk: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'disasterLevelOfRisk'
      },
      disasterTimeStart: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'disasterTimeStart'
      },
      disasterTimeEnd: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'disasterTimeEnd'
      },
      huongDiChuyen: {
        type: DataTypes.STRING(200),
        allowNull: true,
        field: 'huongDiChuyen'
      },
      linkDetail: {
        type: DataTypes.STRING(500),
        allowNull: true,
        field: 'linkDetail'
      },
      disasterKeyword: {
        type: DataTypes.JSON,
        allowNull: true,
        field: 'disasterKeyword'
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
        allowNull: true,
        defaultValue: 1,
        field: 'status'
      },
      sourceType: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0,
        field: 'sourceType'
      },
      isLoad: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'isLoad'
      }
    },
    {
      tableName: 'disasters',
      timestamps: false
    }
  );
};
