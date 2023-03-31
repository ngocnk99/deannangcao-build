/* jshint indent: 1 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define(
    'mailsUsers',
    {
      id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
        field: 'id'
      },
      timeRead: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'timeRead'
      },
      timeDownloadFile: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'timeDownloadFile'
      },
      usersId: {
        type: DataTypes.BIGINT,
        allowNull: false,
        field: 'usersId'
      },
      status: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'status'
      },
      mailsId: {
        type: DataTypes.BIGINT,
        allowNull: false,
        field: 'mailsId'
      },
      readStatus: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        field: 'readStatus'
      },
      downloadFileStatus: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        field: 'downloadFileStatus'
      }
    },
    {
      tableName: 'mailsUsers',
      timestamps: false
    }
  );
};
