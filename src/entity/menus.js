/* jshint indent: 1 */

module.exports = function(sequelize, DataTypes) {
	return sequelize.define('menus', {
		id: {
			type: DataTypes.BIGINT,
			allowNull: false,
			primaryKey: true,
			autoIncrement: true,
			field: 'id'
		},
		menuName: {
			type: DataTypes.STRING(500),
			allowNull: false,
			field: 'menuName'
		},
		url: {
			type: DataTypes.STRING(300),
			allowNull: true,
			field: 'url'
		},
		icon: {
			type: DataTypes.STRING(20),
			allowNull: true,
			field: 'icon'
		},
		menuParentId: {
			type: DataTypes.BIGINT,
			allowNull: false,
			field: 'menuParentId'
		},
		orderby: {
			type: DataTypes.BIGINT,
			allowNull: false,
			field: 'orderby'
		},
		status: {
			type: DataTypes.INTEGER,
			allowNull: false,
			field: 'status'
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
	}, {
		tableName: 'menus',
		timestamps: false
	});
};
