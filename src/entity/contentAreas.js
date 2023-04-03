/* jshint indent: 1 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('contentAreas', {
    id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
      field: 'id'
    },
    areasId: {
      type: DataTypes.BIGINT,
      allowNull: false,
      field: 'areasId'
    },
    contentsId: {
      type: DataTypes.BIGINT,
      allowNull: false,
      field: 'contentsId'
    }
  }, {
    tableName: 'contentAreas',
    timestamps: false
  });
};
