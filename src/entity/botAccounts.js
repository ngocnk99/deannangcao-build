// /* jshint indent: 1 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define(
    'botAccounts',
    {
      id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
        field: 'id'
      },
      userName: {
        type: DataTypes.STRING(50),
        allowNull: false,
        field: 'userName'
      },
      passWord: {
        type: DataTypes.STRING(50),
        allowNull: false,
        field: 'passWord'
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
      }
    },
    {
      tableName: 'botAccounts',
      timestamps: false
    }
  );
};
/* jshint indent: 1 */
