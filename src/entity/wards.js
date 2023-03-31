/* jshint indent: 1 */

module.exports = function(sequelize, DataTypes) {
	return sequelize.define('wards', {
		id: {
			type: DataTypes.BIGINT,
			allowNull: false,
			primaryKey: true,
			autoIncrement: true,
			field: 'id'
		},
		wardName: {
			type: DataTypes.STRING(200),
			allowNull: false,
			field: 'wardName'
		},
		districtsId: {
			type: DataTypes.BIGINT,
			allowNull: false,
			field: 'districtsId'
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
		points: {
			type: DataTypes.JSON,
			allowNull: false,
			field: 'points'
		},
		status: {
			type: DataTypes.INTEGER,
			allowNull: false,
			field: 'status'
		}
	}, {
		tableName: 'wards',
		timestamps: false
	});
};
