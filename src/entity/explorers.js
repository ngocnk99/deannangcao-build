/* jshint indent: 1 */

module.exports = function(sequelize, DataTypes) {
	return sequelize.define('explorers', {
		id: {
			type: DataTypes.BIGINT,
			allowNull: false,
			primaryKey: true,
			autoIncrement: true,
			field: 'id'
        },
        explorerName: {
			type: DataTypes.STRING(500),
			allowNull: false,
			field: 'explorerName'
        },
        disastersId: {
			type: DataTypes.INTEGER,
			allowNull: false,
			field: 'disastersId'
        },
        explorerImage: {
			type: DataTypes.TEXT,
			allowNull: false,
			field: 'explorerImage'
        },
        explorerSatelliteImages: {
			type: DataTypes.TEXT,
			allowNull: false,
			field: 'explorerSatelliteImages'
        },
        explorerFiles: {
			type: DataTypes.TEXT,
			allowNull: false,
			field: 'explorerFiles'
        },
        explorerVideos: {
			type: DataTypes.TEXT,
			allowNull: false,
			field: 'explorerVideos'
        },
        NWCornerLat:
        {
			type: DataTypes.DOUBLE,
			allowNull: false,
			field: 'NWCornerLat'
        },
        NWCornerLong:
        {
			type: DataTypes.DOUBLE,
			allowNull: false,
			field: 'NWCornerLong'
        },
        NECornerLat:
        {
			type: DataTypes.DOUBLE,
			allowNull: false,
			field: 'NECornerLat'
        },
        NECornerLong:
        {
			type: DataTypes.DOUBLE,
			allowNull: false,
			field: 'NECornerLong'
        },
        SECornerLat:
        {
			type: DataTypes.DOUBLE,
			allowNull: false,
			field: 'SECornerLat'
        },
        SECornerLong:
        {
			type: DataTypes.DOUBLE,
			allowNull: false,
			field: 'SECornerLong'
        },
        SWCornerLat:
        {
			type: DataTypes.DOUBLE,
			allowNull: false,
			field: 'SWCornerLat'
        },
        SWCornerLong:
        {
			type: DataTypes.DOUBLE,
			allowNull: false,
			field: 'SWCornerLong'
        },
        explorerDescriptions:
        {
			type: DataTypes.TEXT,
			allowNull: false,
			field: 'explorerDescriptions'
        },
        explorerSources:
        {
			type: DataTypes.STRING(200),
			allowNull: false,
			field: 'explorerSources'
		},
		explorerGroupsId: {
			type: DataTypes.BIGINT,
			allowNull: false,
			field: 'explorerGroupsId'
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
		tableName: 'explorers',
		timestamps: false
	});
};
