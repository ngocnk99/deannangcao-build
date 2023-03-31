/* jshint indent: 1 */

module.exports = function(sequelize, DataTypes) {
    return sequelize.define('newspapers', {
      id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
        field: 'id'
      },
      newspaperName: {
        type: DataTypes.STRING(200),
        allowNull: false,
        field: 'newspaperName'
      },
      newspaperUrl: {
        type: DataTypes.JSON,
        allowNull: false,
        defaultValue: [],
        field: 'newspaperUrl'
      },
      newspaperKeyword: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue:[],
        field: 'newspaperKeyword'
      },
      userCreatorsId: {
        type: DataTypes.BIGINT,
        allowNull: false,
        field: 'userCreatorsId'
      },
      status: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'status'
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
      type: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'type'
      },
    }, {
      tableName: 'newspapers',
      timestamps: false
    });
  };
