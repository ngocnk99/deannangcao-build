/* jshint indent: 1 */

module.exports = function (sequelize, DataTypes) {
  return sequelize.define(
    "botPosts",
    {
      id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
        field: "id",
      },
      postsId: {
        type: DataTypes.STRING(50),
        allowNull: false,
        field: "postsId",
      },
      postContent: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: "postContent",
      },
      poster: {
        type: DataTypes.STRING(50),
        allowNull: false,
        field: "poster",
      },
      placeofPost: {
        type: DataTypes.STRING(50),
        allowNull: false,
        field: "placeofPost",
      },
      status: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: "status",
      },
      image: {
        type: DataTypes.STRING(200),
        allowNull: true,
        field: "image",
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
    },
    {
      tableName: "botPosts",
      timestamps: false,
    }
  );
};
