/* jshint indent: 1 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define(
    'roomChatsUsers',
    {
      id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
        field: 'id'
      },
      roomChatsId: {
        type: DataTypes.BIGINT,
        allowNull: false,
        field: 'roomChatsId'
      },
      usersId: {
        type: DataTypes.BIGINT,
        allowNull: false,
        field: 'usersId'
      },
      lastReadedMessageId: {
        type: DataTypes.BIGINT,
        allowNull: true,
        field: 'lastReadedMessageId',
        defaultValue: 0
      },
      startReadMessageId: {
        type: DataTypes.BIGINT,
        allowNull: true,
        field: 'startReadMessageId',
        defaultValue: 0
      },
      canReadMessageId: {
        type: DataTypes.BIGINT,
        allowNull: true,
        field: 'canReadMessageId',
        defaultValue: 0
      },
      levelUsers: {
        type: DataTypes.INTEGER(11),
        allowNull: false,
        field: 'levelUsers'
      },
      joinStatus: {
        type: DataTypes.INTEGER(11),
        allowNull: false,
        field: 'joinStatus'
      },
      timeRead: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'timeRead'
      }
    },
    {
      tableName: 'roomChatsUsers',
      timestamps: false
    }
  );
};
