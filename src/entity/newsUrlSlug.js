/* jshint indent: 1 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('newsUrlSlugs', {
    id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
      field: 'id'
    },
    newsId: {
      type: DataTypes.BIGINT,
      allowNull: false,
      field: 'newsId'
    },
    urlSlug: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: 'urlSlug'
    },
    status: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'status'
    },
    dateCreated: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
      field: 'dateCreated'
    }
  }, {
    tableName: 'newsUrlSlugs',
    timestamps: false
  });
};
