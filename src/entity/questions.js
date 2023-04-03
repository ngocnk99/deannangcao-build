/* jshint indent: 1 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define(
    'questions',
    {
      id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
        field: 'id'
      },
      type: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'type'
      },
      fullname: {
        type: DataTypes.STRING(200),
        allowNull: true,
        field: 'fullname'
      },
      question: {
        type: DataTypes.TEXT,
        allowNull: false,
        field: 'question'
      },
      answer: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'answer'
      },
      email: {
        type: DataTypes.STRING(200),
        allowNull: true,
        field: 'email'
      },
      mobile: {
        type: DataTypes.STRING(50),
        allowNull: true,
        field: 'mobile'
      },
      answerUsersId: {
        type: DataTypes.BIGINT,
        allowNull: true,
        defaultValue: 0,
        field: 'answerUsersId'
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
      tableName: 'questions',
      timestamps: false
    }
  );
};

// id, fullname, question, email, mobile, answerUsersId, dateCreated, dateUpdated, status, answer;
