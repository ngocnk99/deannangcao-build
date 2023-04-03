/* jshint indent: 1 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define(
    'contentSocialsStatistic',
    {
      id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
        field: 'id'
      },
      contentSocialsId: {
        type: DataTypes.BIGINT,
        allowNull: false,
        field: 'contentSocialsId'
      },
      comment: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'comment'
      },
      like: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'like'
      },
      unlike: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'unlike'
      },
      view: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'view'
      },
      impressionsUnique: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'impressionsUnique'
      },
      share: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'share'
      },
      otherReactions: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'otherReactions'
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
    },
    {
      tableName: 'contentSocialsStatistic',
      timestamps: false
    }
  );
};
