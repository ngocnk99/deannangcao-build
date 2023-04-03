/* jshint indent: 1 */

module.exports = function(sequelize, DataTypes) {
	return sequelize.define('reportsNews', {
		id: {
			type: DataTypes.BIGINT,
			allowNull: false,
			primaryKey: true,
			autoIncrement: true,
			field: 'id'
		},
        newsId: {
			type: DataTypes.BIGINT,
			allowNull: false,
			field: 'newsId'
		},
		reportsId: {
			type: DataTypes.BIGINT,
			allowNull: false,
			field: 'reportsId'
		},
	}, {
		tableName: 'reportsNews',
		timestamps: false
	});
};
