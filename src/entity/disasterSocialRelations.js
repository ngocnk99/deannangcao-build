/* jshint indent: 1 */

module.exports = function(sequelize, DataTypes) {
    return sequelize.define('disasterSocialRelations', {
      contentSocialsId: {
        type: DataTypes.BIGINT,
        allowNull: false,
        primaryKey: true,
        field: 'contentSocialsId'
      },
      disastersId: {
        type: DataTypes.BIGINT,
        allowNull: false,
        primaryKey: true,
        field: 'disastersId'
      }
    }, {
      tableName: 'disasterSocialRelations',
      timestamps: false
    });
  };
  