/* jshint indent: 1 */

module.exports = function(sequelize, DataTypes) {
	return sequelize.define('maps', {
		id: {
			type: DataTypes.BIGINT,
			allowNull: false,
			primaryKey: true,
			autoIncrement: true,
			field: 'id'
		},
		mapName: {
			type: DataTypes.STRING(200),
			allowNull: false,
			field: 'mapName'
		},
		mapFiles: {
			type: DataTypes.JSON,
			allowNull: true,
			field: 'mapFiles'
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
		},
	}, {
		tableName: 'maps',
		timestamps: false
	});
};
