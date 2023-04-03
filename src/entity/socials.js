/* jshint indent: 1 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('socials', {
    id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
      field: 'id'
    },
    socialName: {
      type: DataTypes.STRING(200),
      allowNull: false,
      field: 'socialName'
    },
    socialImages: {
      type: DataTypes.JSON,
      allowNull: false,
      field: 'socialImages'
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
    }
  }, {
    tableName: 'socials',
    timestamps: false
  });
};
