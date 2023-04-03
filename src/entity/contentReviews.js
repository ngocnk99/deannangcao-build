/* jshint indent: 1 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('contentReviews', {
    id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
      field: 'id'
    },
    username: {
      type: DataTypes.STRING(200),
      allowNull: false,
      field: 'username'
    },
    email: {
      type: DataTypes.STRING(200),
      allowNull: false,
      field: 'email'
    },
    comment: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: 'comment'
    },
    contentsId: {
      type: DataTypes.BIGINT,
      allowNull: false,
      field: 'contentsId'
    },
    valueVoted: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'valueVoted'
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
      defaultValue: 0,
      allowNull: false,
      field: 'status'
    }
  }, {
    tableName: 'contentReviews',
    timestamps: false
  });
};
