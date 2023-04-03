/* jshint indent: 1 */

module.exports = function(sequelize, DataTypes) {
	return sequelize.define('disasterGroups', {
		id: {
			type: DataTypes.BIGINT,
			allowNull: false,
			primaryKey: true,
			autoIncrement: true,
			field: 'id'
        },
		disasterGroupVndmsId: {
			type: DataTypes.BIGINT,
			allowNull: true,
			field: 'disasterGroupVndmsId'
        },
        disasterGroupName: {
			type: DataTypes.STRING(500),
			allowNull: false,
			field: 'disasterGroupName'
        },
        disasterGroupsImages:
        {
			type: DataTypes.TEXT,
			allowNull: true,
			field: 'disasterGroupsImages'
        },
        userCreatorsId: {
			type: DataTypes.BIGINT,
			allowNull: true,
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
			allowNull: true,
			field: 'status'
        },
      
        sourceType: {
			type: DataTypes.INTEGER,
			allowNull: false,
          defaultValue: 0,
			field: 'sourceType'
		}
	}, {
		tableName: 'disasterGroups',
		timestamps: false
	});
};
