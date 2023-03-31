/* jshint indent: 1 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define(
    'chatMessages',
    {
      id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
        field: 'id'
      },
      senderId: {
        type: DataTypes.BIGINT,
        allowNull: false,
        field: 'senderId'
      },
      roomChatsId: {
        type: DataTypes.BIGINT,
        allowNull: false,
        field: 'roomChatsId'
      },
      message: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'message'
      },
      attachedFiles: {
        type: DataTypes.JSON,
        allowNull: true,
        field: 'attachedFiles',
        defaultValue: []
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
        field: 'status'
      },
      type: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'type'
      },
      replyId: {
        type: DataTypes.BIGINT,
        allowNull: true,
        field: 'replyId',
        defaultValue: 0
      }
    },
    {
      tableName: 'chatMessages',
      timestamps: false
    }
  );
};
