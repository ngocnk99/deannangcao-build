/* jshint indent: 1 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define(
    'mails',
    {
      id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
        field: 'id'
      },
      mailTitle: {
        type: DataTypes.STRING(500),
        allowNull: false,
        field: 'mailTitle'
      },
      mailContent: {
        type: DataTypes.TEXT,
        allowNull: false,
        field: 'mailContent'
      },
      dateCreated: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
        field: 'dateCreated'
      },
      userSendersId: {
        type: DataTypes.BIGINT,
        allowNull: false,
        field: 'userSendersId'
      },
      attachment: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: [],
        field: 'attachment'
      },
      mailReplyId: {
        type: DataTypes.BIGINT,
        allowNull: false,
        defaultValue: 0,
        field: 'mailReplyId'
      },
      status: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        field: 'status'
      },
      roomMailsId: {
        type: DataTypes.BIGINT,
        allowNull: false,
        field: 'roomMailsId'
      }
    },
    {
      tableName: 'mails',
      timestamps: false
    }
  );
};
