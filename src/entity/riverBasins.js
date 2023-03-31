/* jshint indent: 1 */

module.exports = function(sequelize, DataTypes) {
	return sequelize.define('riverBasins', {
		id: {
			type: DataTypes.BIGINT,
			allowNull: false,
			primaryKey: true,
			autoIncrement: true,
			field: 'id'
		},
		riverBasinName: {
			type: DataTypes.STRING(500),
			allowNull: false,
			field: 'riverBasinName'
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
			allowNull: true,
			field: 'points'
		},
		status: {
			type: DataTypes.INTEGER,
			allowNull: false,
			field: 'status'
		}
	}, {
		tableName: 'riverBasins',
		timestamps: false
	});
};
