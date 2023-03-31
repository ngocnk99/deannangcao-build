/* jshint indent: 1 */

module.exports = function(sequelize, DataTypes) {
    return sequelize.define('reports', {
      id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
        field: 'id'
      },
      reportDay: {
        type: DataTypes.DATE,
        allowNull: false,
        field: 'reportDay'
      },
      reportData: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue:0,
        field: 'reportData'
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
      tableName: 'reports',
      timestamps: false
    });
  };
  