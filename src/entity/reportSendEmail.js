/* jshint indent: 1 */

module.exports = function(sequelize, DataTypes) {
	return sequelize.define('reportSendEmail', {
		id: {
			type: DataTypes.BIGINT,
			allowNull: false,
			primaryKey: true,
			autoIncrement: true,
			field: 'id'
		},
		mailCc: {
			type: DataTypes.JSON,
			allowNull: false,
			field: 'mailCc'
		},
        mailTo: {
			type: DataTypes.JSON,
			allowNull: true,
			field: 'mailTo'
		},
        mailBcc: {
			type: DataTypes.JSON,
			allowNull: true,
			field: 'mailBcc'
		},
        mailSubject: {
			type: DataTypes.STRING(200),
			allowNull: true,
			field: 'mailSubject'
		},
        mailContent: {
			type: DataTypes.TEXT,
			allowNull: true,
			field: 'mailContent'
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
		}
	}, {
		tableName: 'reportSendEmail',
		timestamps: false
	});
};
