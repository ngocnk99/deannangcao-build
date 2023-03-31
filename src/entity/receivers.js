/* jshint indent: 1 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('receivers', {
    id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
      field: 'id'
    },
    mailsId: {
      type: DataTypes.BIGINT,
      allowNull: false,
      field: 'mailsId'
    },
    receiversId: {
      type: DataTypes.BIGINT,
      allowNull: false,
      field: 'receiversId'
    },
    status: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      field: 'status'
    }
  }, {
    tableName: 'receivers',
    timestamps: false
  });
};
