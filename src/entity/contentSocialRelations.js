/* jshint indent: 1 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('contentSocialRelations', {
    contentSocialsId: {
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true,
      field: 'contentSocialsId'
    },
    contentsId: {
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true,
      field: 'contentsId'
    }
  }, {
    tableName: 'contentSocialRelations',
    timestamps: false
  });
};
