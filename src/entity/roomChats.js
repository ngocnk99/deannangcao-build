/* jshint indent: 1 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define(
    'roomChats',
    {
      id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
        field: 'id'
      },
      roomChatsName: {
        type: DataTypes.STRING(200),
        allowNull: true,
        field: 'roomChatsName'
      },
      roomChatsType: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'roomChatsType'
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
      }
    },
    {
      tableName: 'roomChats',
      timestamps: false
    }
  );
};
