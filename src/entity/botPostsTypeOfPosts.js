/* jshint indent: 1 */

module.exports = function (sequelize, DataTypes) {
  return sequelize.define(
    "botPostsTypeOfPosts",
    {
      id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
        field: "id",
      },
      postsId: {
        type: DataTypes.BIGINT,
        allowNull: false,
        field: "postsId",
      },
      typeOfPostsId: {
        type: DataTypes.BIGINT,
        allowNull: true,
        defaultValue: 0,
        field: "typeOfPostsId",
      },
    },
    {
      tableName: "botPostsTypeOfPosts",
      timestamps: false,
    }
  );
};
