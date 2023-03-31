/* jshint indent: 1 */

module.exports = function(sequelize, DataTypes) {
	return sequelize.define('requestDownloads', {
		id: {
			type: DataTypes.BIGINT,
			allowNull: false,
			primaryKey: true,
			autoIncrement: true,
			field: 'id'
		},
		userCreatorsId: {
			type: DataTypes.BIGINT,
			allowNull: false,
			field: 'userCreatorsId'
        },
        reason: {
			type: DataTypes.STRING(500),
			allowNull: true,
			field: 'reason'
        },
        explorersId: {
			type: DataTypes.BIGINT,
			allowNull: false,
			field: 'explorersId'
        },
		dateCreated: {
			type: DataTypes.DATE,
			allowNull: true,
			defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
			field: 'dateCreated'
		},
		dateApproved: {
			type: DataTypes.DATE,
			allowNull: true,
			// defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
			field: 'dateApproved'
		},
		userApprovedsId: {
			type: DataTypes.BIGINT,
			allowNull: true,
			field: 'userApprovedsId'
        },
		status: {
			type: DataTypes.INTEGER,
			allowNull: false,
			field: 'status'
		}
	}, {
		tableName: 'requestDownloads',
		timestamps: false
	});
};
