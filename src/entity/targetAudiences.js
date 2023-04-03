/* jshint indent: 1 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('targetAudiences', {
    id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
      field: 'id'
    },
    targetAudienceName: {
      type: DataTypes.STRING(200),
      allowNull: false,
      field: 'targetAudienceName'
    },
    targetAudienceDescriptions: {
      type: DataTypes.STRING(500),
      allowNull: true,
      field: 'targetAudienceDescriptions'
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
    tableName: 'targetAudiences',
    timestamps: false
  });
};
