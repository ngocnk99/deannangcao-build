/* jshint indent: 1 */

module.exports = function(sequelize, DataTypes) {
	return sequelize.define('systemsConfigs', {
		id: {
			type: DataTypes.BIGINT,
			allowNull: false,
			primaryKey: true,
			autoIncrement: true,
			field: 'id'
		},
		ftpServer: {
			type: DataTypes.JSON,
			allowNull: false,
			field: 'ftpServer'
        },
        mailServer: {
			type: DataTypes.JSON,
			allowNull: false,
			field: 'mailServer'
        },
        systemcClearTime: {
			type: DataTypes.JSON,
			allowNull: false,
			field: 'systemcClearTime'
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
		tableName: 'systemsConfigs',
		timestamps: false
	});
};
