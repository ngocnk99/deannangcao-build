/* jshint indent: 1 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define(
    'socialChannels',
    {
      id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
        field: 'id'
      },
      socialsId: {
        type: DataTypes.BIGINT,
        allowNull: false,
        field: 'socialsId'
      },
      socialChannelName: {
        type: DataTypes.STRING(200),
        allowNull: true,
        field: 'socialChannelName'
      },
      socialChannelType: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'socialChannelType'
      },
      socialChannelImages: {
        type: DataTypes.JSON,
        allowNull: true,
        field: 'socialChannelImages'
      },
      socialChannelUrl: {
        type: DataTypes.STRING(1000),
        allowNull: true,
        field: 'socialChannelUrl'
      },
      socialChannelToken: {
        type: DataTypes.STRING(1000),
        allowNull: false,
        field: 'socialChannelToken'
      },
      socialChannelTokenExpired: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'socialChannelTokenExpired'
      },
      userCreatorsId: {
        type: DataTypes.BIGINT,
        allowNull: false,
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
      tableName: 'socialChannels',
      timestamps: false
    }
  );
};
