/* jshint indent: 1 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define(
    'photoInterviews',
    {
      // id, photoInterviewsName, images, shortDescription, description, wardsId, points, userCreatorsId, dateCreated, dateUpdated, status, urlSlug
      id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
        field: 'id'
      },

      photoInterviewsName: {
        type: DataTypes.STRING(500),
        allowNull: false,
        field: 'photoInterviewsName'
      },
      files: {
        type: DataTypes.JSON,
        allowNull: true,
        field: 'files'
      },

      shortDescription: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'shortDescription'
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'description'
      },
      points: {
        type: DataTypes.JSON,
        allowNull: true,
        field: 'points'
      },
      wardsId: {
        type: DataTypes.BIGINT(20),
        allowNull: true,
        field: 'wardsId'
      },
      districtsId: {
        type: DataTypes.BIGINT(20),
        allowNull: true,
        field: 'districtsId'
      },
      provincesId: {
        type: DataTypes.BIGINT(20),
        allowNull: true,
        field: 'provincesId'
      },
      zone: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'zone'
      },
      urlSlug: {
        type: DataTypes.STRING(500),
        allowNull: true,
        field: 'urlSlug'
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
        type: DataTypes.INTEGER(1),
        allowNull: true,
        defaultValue: 1,
        field: 'status'
      }
    },
    {
      tableName: 'photoInterviews',
      timestamps: false
    }
  );
};
