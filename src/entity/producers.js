/* jshint indent: 1 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('producers', {
    id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
      field: 'id'
    },
    producerName: {
      type: DataTypes.STRING(200),
      allowNull: false,
      field: 'producerName'
    },
    producerDescriptions: {
      type: DataTypes.STRING(500),
      allowNull: true,
      field: 'producerDescriptions'
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
    tableName: 'producers',
    timestamps: false
  });
};
