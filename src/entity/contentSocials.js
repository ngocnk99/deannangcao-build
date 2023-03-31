/* jshint indent: 1 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define(
    'contentSocials',
    {
      id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
        field: 'id'
      },
      contentSocialId: {
        type: DataTypes.STRING(500),
        allowNull: false,
        field: 'contentSocialId'
      },
      contentSocialTitle: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'contentSocialTitle'
      },
      contentSocialDescriptions: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'contentSocialDescriptions'
      },
      contentSocialImages: {
        type: DataTypes.JSON,
        allowNull: true,
        field: 'contentSocialImages'
      },
      contentSocialVideo: {
        type: DataTypes.JSON,
        allowNull: true,
        field: 'contentSocialVideo'
      },
      contentSocialLink: {
        type: DataTypes.STRING(1000),
        allowNull: false,
        field: 'contentSocialLink'
      },
      socialChannelsId: {
        type: DataTypes.STRING(100),
        allowNull: false,
        field: 'socialChannelsId'
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
      },
      categoryId: {
        // chỉ dành cho youtube
        type: DataTypes.BIGINT,
        allowNull: true,
        field: 'categoryId'
      },
      contentSocialAuthor: {
        type: DataTypes.STRING(500),
        // chỉ dành cho zalo
        allowNull: true,
        field: 'contentSocialAuthor'
      },
      contentSocialBody: {
        type: DataTypes.JSON,
        // chỉ dành cho zalo
        allowNull: true,
        field: 'contentSocialBody'
      },
      contentSocialUpdateType: {
        type: DataTypes.JSON,
        allowNull: false,
        field: 'contentSocialUpdateType'
      }
    },
    {
      tableName: 'contentSocials',
      timestamps: false
    }
  );
};
