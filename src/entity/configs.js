/* jshint indent: 1 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define(
    'configs',
    {
      id: {
        type: DataTypes.BIGINT(20),
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
        field: 'id'
      },
      userCreatorsId: {
        type: DataTypes.BIGINT,
        allowNull: true,
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
      },
      isLoad: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'isLoad'
      },
      mailTo:{
        type: DataTypes.JSON,
        allowNull: true,
        field: 'mailTo',
        defaultValue:[]
      },
      mailBcc:{
        type: DataTypes.JSON,
        allowNull: true,
        field: 'mailBcc',
        defaultValue:[]
      },
      mailCc:{
        type: DataTypes.JSON,
        allowNull: true,
        field: 'mailCc',
        defaultValue:[]
      },
    },
    {
      tableName: 'configs',
      timestamps: false
    }
  );
};
