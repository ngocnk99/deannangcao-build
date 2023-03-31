/* jshint indent: 1 */

module.exports = function(sequelize, DataTypes) {
	return sequelize.define('areasProvinces', {
		id: {
			type: DataTypes.BIGINT,
			allowNull: false,
			primaryKey: true,
			autoIncrement: true,
			field: 'id'
		},
		areasId: {
			type: DataTypes.BIGINT,
			allowNull: false,
			field: 'areasId'
		},
        provincesId: {
			type: DataTypes.BIGINT,
			allowNull: false,
			field: 'provincesId'
		},
	}, {
		tableName: 'areasProvinces',
		timestamps: false
	});
};
