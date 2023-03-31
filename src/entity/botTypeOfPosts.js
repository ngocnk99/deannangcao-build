/* jshint indent: 1 */

module.exports = function (sequelize, DataTypes) {
  return sequelize.define(
    "botTypeOfPosts",
    {
      id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
        field: "id",
      },
      typeOfPostsName: {
        type: DataTypes.STRING(200),
        allowNull: false,
        field: "typeOfPostsName",
      },
      typeOfPostsParentId: {
        type: DataTypes.STRING(500),
        allowNull: true,
        defaultValue: 0,
        field: "typeOfPostsParentId",
      },
      userCreatorsId: {
        type: DataTypes.BIGINT,
        allowNull: false,
        field: "userCreatorsId",
      },
      dateCreated: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: sequelize.literal("CURRENT_TIMESTAMP"),
        field: "dateCreated",
      },
      dateUpdated: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: sequelize.literal("CURRENT_TIMESTAMP"),
        field: "dateUpdated",
      },
      keywords: {
        type: DataTypes.JSON,
        allowNull: false,
        defaultValue: [],
        field: "keywords",
      },
      status: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: "status",
      },
    },
    {
      tableName: "botTypeOfPosts",
      timestamps: false,
    }
  );
};
