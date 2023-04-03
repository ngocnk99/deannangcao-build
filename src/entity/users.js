/* jshint indent: 1 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define(
    'users',
    {
      id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
        field: 'id'
      },
      username: {
        type: DataTypes.STRING(100),
        allowNull: false,
        field: 'username'
      },
      password: {
        type: DataTypes.STRING(200),
        allowNull: false,
        field: 'password'
      },
      fullname: {
        type: DataTypes.STRING(200),
        allowNull: true,
        field: 'fullname'
      },
      image: {
        type: DataTypes.STRING(500),
        allowNull: true,
        field: 'image'
      },
      email: {
        type: DataTypes.STRING(200),
        allowNull: true,
        field: 'email'
      },
      mobile: {
        type: DataTypes.STRING(15),
        allowNull: true,
        field: 'mobile'
      },
      userGroupsId: {
        type: DataTypes.BIGINT,
        allowNull: false,
        field: 'userGroupsId'
      },
      userCreatorsId: {
        type: DataTypes.BIGINT,
        allowNull: false,
        field: 'userCreatorsId'
      },
      provincesId: {
        type: DataTypes.BIGINT,
        allowNull: true,
        field: 'provincesId'
      },
      workUnit: {
        type: DataTypes.STRING(500),
        allowNull: true,
        field: 'workUnit'
      },
      dateUpdated: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
        field: 'dateUpdated'
      },
      dateCreated: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
        field: 'dateCreated'
      },
      status: {
        type: DataTypes.INTEGER(10),
        allowNull: false,
        field: 'status'
      },
      onlineStatus: {
        type: DataTypes.INTEGER(10),
        allowNull: true,
        field: 'onlineStatus',
        defaultValue: '0'
      },
      lastTimeOnline: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
        field: 'lastTimeOnline'
      }
    },
    {
      tableName: 'users',
      timestamps: false
    }
  );
};
