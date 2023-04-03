/* jshint indent: 1 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('contentTargetAudiences', {
    id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
      field: 'id'
    },
    targetAudiencesId: {
      type: DataTypes.BIGINT,
      allowNull: false,
      field: 'targetAudiencesId'
    },
    contentsId: {
      type: DataTypes.BIGINT,
      allowNull: false,
      field: 'contentsId'
    }
  }, {
    tableName: 'contentTargetAudiences',
    timestamps: false
  });
};
