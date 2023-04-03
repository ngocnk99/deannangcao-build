/* jshint indent: 1 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define(
    'news',
    {
      id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
        field: 'id'
      },
      newsTitle: {
        type: DataTypes.STRING(300),
        allowNull: false,
        field: 'newsTitle'
      },
      newsShortDescription: {
        type: DataTypes.STRING(300),
        allowNull: true,
        field: 'newsShortDescription'
      },
      newsDescription: {
        type: DataTypes.TEXT,
        allowNull: false,
        field: 'newsDescription'
      },
      type: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'type'
      },
      newsAuthor: {
        type: DataTypes.STRING(300),
        allowNull: true,
        field: 'newsAuthor'
      },
      // newsSource: {
      //   type: DataTypes.TEXT,
      //   allowNull: true,
      //   field: 'newsSource'
      // },
      status: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 1,
        field: 'status'
      },
      image: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: [],
        field: 'image'
      },
      url: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'url'
      },
      userCreatorsId: {
        type: DataTypes.BIGINT,
        allowNull: true,
        field: 'userCreatorsId'
      },
      newspapersId: {
        type: DataTypes.BIGINT,
        allowNull: true,
        field: 'newspapersId'
      },
      newGroupsId: {
        type: DataTypes.BIGINT,
        allowNull: false,
        field: 'newGroupsId'
      },
      userApprovedId: {
        type: DataTypes.BIGINT,
        allowNull: true,
        field: 'userApprovedId'
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
      }
      // manualUpdate: {
      //   type: DataTypes.INTEGER,
      //   allowNull: true,
      //   defaultValue: 0,
      //   field: 'manualUpdate'
      // }
    },
    {
      tableName: 'news',
      timestamps: false
    }
  );
};
