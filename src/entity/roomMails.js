/* jshint indent: 1 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define(
    'roomMails',
    {
      id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
        field: 'id'
      },
      roomMailsContent: {
        type: DataTypes.STRING(500),
        allowNull: true,
        field: 'roomMailsContent'
      }
    },
    {
      tableName: 'roomMails',
      timestamps: false
    }
  );
};
